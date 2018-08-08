let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }

      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `${restaurant.name}'s atmosphere`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  if (!restaurant.reviews) {
    fetch(`http://localhost:1337/reviews?restaurant_id=${restaurant.id}`)
      .then(response => {
        return response.json().then(data => {
          fillReviewsHTML(data);
          self.restaurant.reviews = data;
          idbKeyval.set(self.restaurant.id, self.restaurant);
        });
      })
      .catch(error => console.error(error));
  } else {
    fillReviewsHTML();
  }
  document.getElementById('id').value = restaurant.id;
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');
  const title = document.createElement('h3');
  title.textContent = 'Reviews';
  if (reviews) {
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
  }
  container.insertBefore(ul, container.firstChild);
  container.insertBefore(title, container.firstChild);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML =
    (review.date? review.date.toLocaleString(): undefined) || new Date(review.createdAt).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = `<a href="${window.location.href}" aria-current="page">${
    restaurant.name
  }</a>`;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Write review from form.
 */
document.getElementById('writeReview').onsubmit = e => {
  if (e.preventDefault) e.preventDefault();
  let data = {
    restaurant_id: document.getElementById('id').value,
    name: document.getElementById('name').value,
    rating: document.getElementById('rating').value,
    comments: document.getElementById('review').value
  };
  sendReview(data);
};

/**
 * Send pending reviews.
 */
window.addEventListener('online', event => {
  console.log('Back online, sending pending reviews...');
  idbKeyval.get('pendingReviews').then(pendingReviews => {
    for (let review of pendingReviews) {
      sendReview(review, false);
    }
  });
  const container = document.getElementById('reviews-container');
  container.removeChild(container.lastChild);  
});

/**
 * Send review to API.
 */
function sendReview(data, shouldAdd = true) {
  let url = 'http://localhost:1337/reviews/';
  const ul = document.getElementById('reviews-list');

  fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .catch(error => {
      console.log('Not online');
      data.date = new Date();
      const container = document.getElementById('reviews-container');
      if (!container.lastChild.textContent.includes('offline')) {
        const message = document.createElement('p');
        message.textContent =
          'You are offline, the server will update when you go online.';
        container.appendChild(message);
      }
      idbKeyval.get('pendingReviews').then(response => {
        if (!response) {
          idbKeyval.set('pendingReviews', [data]);
        } else {
          response.push(data);
          idbKeyval.set('pendingReviews', response);
        }
        ul.appendChild(createReviewHTML(data));
      });
    })
    .then(response => {
      if (!response) return;
      if (shouldAdd) {
        ul.appendChild(createReviewHTML(response));
      }
      idbKeyval
        .get(Number(response.restaurant_id))
        .then(restaurant => {
          if (!restaurant.reviews) {
            restaurant.reviews = [response];
          } else {
            restaurant.reviews.push(response);
          }
          idbKeyval.set(restaurant.id, restaurant);
        })
        .catch(error => console.error(error));
    });
}
