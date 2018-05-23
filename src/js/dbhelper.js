/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(response => {
        if (response.status === 200) {
          // Got a success response from server!
          return response.json();
        } else {
          // Got an error from server.
          const error = `Request failed. Returned status of ${response.status}`;
          return Promise.reject(error);
        }
      })
      .then(restaurants => {
        for (let restaurant of restaurants) {
          idbKeyval.set(restaurant.id, restaurant);
        }
        idbKeyval.set('all', restaurants);
        callback(null, restaurants);
      })
      .catch(error => {
        idbKeyval
          .get('all')
          .then(restaurants => {
            callback(null, restaurants);
          })
          .catch(error => {
            callback(error, null);
          });
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    idbKeyval
      .get(id)
      .then(restaurant => {
        if (restaurant) {
          callback(null, restaurant);
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              const restaurant = restaurants.find(r => r.id == id);
              if (restaurant) {
                // Got the restaurant
                callback(null, restaurant);
              } else {
                // Restaurant does not exist in the database
                callback('Restaurant does not exist', null);
              }
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    idbKeyval
      .get('all')
      .then(restaurants => {
        if (restaurants) {
          callback(null, restaurants.filter(r => r.cuisine_type == cuisine));
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              // Filter restaurants to have only given cuisine type
              const results = restaurants.filter(
                r => r.cuisine_type == cuisine
              );
              callback(null, results);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants  with proper error handling
    idbKeyval
      .get('all')
      .then(restaurants => {
        if (restaurants) {
          callback(
            null,
            restaurants.filter(r => r.neighborhood == neighborhood)
          );
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              // Filter restaurants to have only given neighborhood
              const results = restaurants.filter(
                r => r.neighborhood == neighborhood
              );
              callback(null, results);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants  with proper error handling
    idbKeyval
      .get('all')
      .then(restaurants => {
        if (restaurants) {
          let results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          callback(null, results);
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              let results = restaurants;
              if (cuisine != 'all') {
                // filter by cuisine
                results = results.filter(r => r.cuisine_type == cuisine);
              }
              if (neighborhood != 'all') {
                // filter by neighborhood
                results = results.filter(r => r.neighborhood == neighborhood);
              }
              callback(null, results);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    idbKeyval
      .get('all')
      .then(restaurants => {
        if (restaurants) {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map(
            (v, i) => restaurants[i].neighborhood
          );
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter(
            (v, i) => neighborhoods.indexOf(v) == i
          );
          callback(null, uniqueNeighborhoods);
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              // Get all neighborhoods from all restaurants
              const neighborhoods = restaurants.map(
                (v, i) => restaurants[i].neighborhood
              );
              // Remove duplicates from neighborhoods
              const uniqueNeighborhoods = neighborhoods.filter(
                (v, i) => neighborhoods.indexOf(v) == i
              );
              callback(null, uniqueNeighborhoods);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    idbKeyval
      .get('all')
      .then(restaurants => {
        if (restaurants) {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map(
            (v, i) => restaurants[i].cuisine_type
          );
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter(
            (v, i) => cuisines.indexOf(v) == i
          );
          callback(null, uniqueCuisines);
        } else {
          DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
              callback(error, null);
            } else {
              // Get all cuisines from all restaurants
              const cuisines = restaurants.map(
                (v, i) => restaurants[i].cuisine_type
              );
              // Remove duplicates from cuisines
              const uniqueCuisines = cuisines.filter(
                (v, i) => cuisines.indexOf(v) == i
              );
              callback(null, uniqueCuisines);
            }
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}.webp`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
