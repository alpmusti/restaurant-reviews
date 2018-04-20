import idb from 'idb';
/**
 * Common database helper functions.
 */
var dbPromise;
class DBHelper {
  /**
   * Open a IDB Database
   */
  static openDatabase() {
    return idb.open('restaurants' , 3 , function(upgradeDb) {
      switch(upgradeDb.oldVersion) {
        case 0:
        upgradeDb.createObjectStore('restaurants' ,{keyPath: 'id'});
        case 1:
        upgradeDb.createObjectStore('reviews' ,{keyPath: 'restaurant_id'});
        case 2:
        upgradeDb.createObjectStore('comments' ,{keyPath: 'restaurant_id'});

      }
    });
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Show cached restaurants stored in IDB
   */
  static getCachedRestaurants(){
    if(!dbPromise){
      dbPromise = DBHelper.openDatabase();    
    }
    return dbPromise.then(function(db){

      //if we showing posts or very first time of the page loading. 
      //we don't need to go to idb
      if(!db) return;      

      var tx = db.transaction('restaurants');
      var store = tx.objectStore('restaurants');

      return store.getAll();
    });
  }

  /**
   * Get cached restaurant by id
   */
  static getCachedRestaurantById(id){
    if(!dbPromise){
      dbPromise = DBHelper.openDatabase();
    }

    return dbPromise.then(function(db){
      if(!db) return db;

      var tx = db.transaction('restaurants');
      var store = tx.objectStore('restaurants');

      return store.get(parseInt(id));
    })
  }

  /**
   * Show cached reviews stored in IDB
   */
  static getCachedReviews(){
    if(!dbPromise){
      dbPromise = this.openDatabase();
    }
    return dbPromise.then(function(db){
      if(!db) return db;

      var tx = db.transaction('reviews');
      var store = tx.objectStore('reviews');

      return store.getAll();
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) { 
    DBHelper.getCachedRestaurants().then(function(data){      
      // if we have data to show then we pass it immediately.
      if(data.length > 0 && !navigator.onLine){              
        return callback(null , data);
      } 
      
      // After passing the cached messages. 
      // We need to update the cache with fetching restaurants from network.
      fetch(`${DBHelper.DATABASE_URL}/restaurants` , {credentials:'same-origin'})
      .then(res => res.json())
      .then(data => {              
        dbPromise.then(function(db){
          if(!db) return;

          var tx = db.transaction('restaurants' , 'readwrite');
          var store = tx.objectStore('restaurants');
  
          data.forEach(restaurant => store.put(restaurant));
  
          // limit the data for 30
          store.openCursor(null , 'prev').then(function(cursor){
            return cursor.advance(30);
          })
          .then(function deleteRest(cursor){
            if(!cursor) return;
            cursor.delete();
            return cursor.continue().then(deleteRest);
          });
        });
        return callback(null,data);
      })
      .catch(err => {                 
        return callback(err , null)
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Update a single restaurant's review
   */
  static updateSingleRestaurantsReview(reviews){
    dbPromise.then(function(db){
      if(!db) return db;

      var tx = db.transaction('reviews' , 'readwrite');
      var store = tx.objectStore('reviews');

      
      if(reviews.length > 0){
        reviews.restaurant_id = parseInt(reviews[0].restaurant_id);
        store.put(reviews);
      }

      return tx.complete;
    })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
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
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  //GET Request to http://localhost:1337/reviews/?restaurant_id=<id>
  static getReviewsById(id){
    return new Promise((resolve,reject) => {
      DBHelper.getCachedReviews().then(function(data){        
        // if we have data to show then we pass it immediately.
        if(data.length > 0 && !navigator.onLine){
          resolve(data[0]);
        }         
        
        fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
        .then(response => {
          if(response.ok){
            return response.json();
          }
          reject(new Error(`Request failed with status code : ${response.status}`));
        })
        .then(data =>{          
          DBHelper.updateSingleRestaurantsReview(data);
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
      });
    });
  }

  //Send PUT Request to http://localhost:1337/restaurants/<restaurant_id>/?is_favorite={isFavorite}
  static setFavorite(restaurantId , isFavorite) {
    // This is required for server-side issue
    // Server turn boolean values to string values while saving to db.  
    if(typeof(isFavorite) == 'string'){    
      isFavorite = (isFavorite == 'false') ? true : false;
    }else{
      isFavorite = !isFavorite;
    }      

    return new Promise((resolve , reject) => {
      fetch(`${DBHelper.DATABASE_URL}/restaurants/${restaurantId}/?is_favorite=${isFavorite}` , {
        method: 'PUT'
      })
      .then((res) => {
        if(res.ok){ 
          //If response is successful
          return res.json();
        }else{
          reject(new Error(`Request is not successful. Status code is :  ${res.status}`));
        }
      }).then((data) => {
        resolve(data);     
      });
    });
  }

  //Send POST Request to http://localhost:1337/reviews
  static postReview(resId , name , rating ,comment , reviews){
  // Example:
  //   {
  //     "restaurant_id": <restaurant_id>,
  //     "name": <reviewer_name>,
  //     "rating": <rating>,
  //     "comments": <comment_text>
  // }
  const post = {restaurant_id: resId , name: name , rating: rating , comments: comment };
    return new Promise((resolve , reject) => {
      fetch(`${DBHelper.DATABASE_URL}/reviews` , {
        method: 'POST',
        body: JSON.stringify(post)
      }).then(function(response){
        if(response.ok){
          return response.json();
        }
        reject(new Error(`Request failed with status code : ${response.status}`));
      }).then(data => {
        reviews.push(data);
        DBHelper.updateSingleRestaurantsReview(reviews);
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  }

  static storeOfflineReview(resId , name , rating , comment){
    const post = {restaurant_id: resId , name: name , rating: rating , comments: comment };
    if(!dbPromise){
      dbPromise = DBHelper.openDatabase();
    }

    dbPromise.then(function(db){
      if(!db) return;

      var tx = db.transaction('comments' , 'readwrite' );
      var store = tx.objectStore('comments');

      store.put(post);

      return tx.complete;
    })
  }

  static postStoredReview(id , reviews){
    return new Promise((resolve,reject) => {
      if(!dbPromise){
        dbPromise = DBHelper.openDatabase
      }
      dbPromise.then(function(db){
          if(!db) return;
  
          var tx = db.transaction('comments');
          var store = tx.objectStore('comments');
  
          return store.get(id);
      }).then(function(review){
        DBHelper.postReview(review.restaurant_id , review.name , review.rating , review.comments , reviews)
        .then(data => {
          dbPromise.then(function(db){
          var tx = db.transaction('comments',  'readwrite');
          var store = tx.objectStore('comments');

          store.delete(id);
  
          return tx.complete;
          });
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      });
    });
  }

  static showMessage(text,  duration = 3000){    
    var snackBar = document.getElementById('snackbar');    
    snackBar.innerHTML = text;
    snackBar.classList.add("show");
    setTimeout(function(){
      snackBar.classList.remove("show");
    }, duration);
  }

}

module.exports = DBHelper;