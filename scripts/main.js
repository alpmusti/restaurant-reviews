import DBHelper from './dbhelper';
import idb from 'idb';

let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = () => {  
  DBHelper.fetchNeighborhoods((error, data) => {
    if (error != null) { // Got an error
      console.error(error);
    } else {
      neighborhoods = data;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = (data = neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');

  data.forEach((neighborhood , i) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    option.setAttribute("role","option");
    option.setAttribute("aria-posinset", i+1);
    option.setAttribute("aria-setsize" ,data.length);
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = () => {
  DBHelper.fetchCuisines((error, data) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      cuisines = data;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = (data = cuisines) => {
  const select = document.getElementById('cuisines-select');

  data.forEach((cuisine,i) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    option.setAttribute("role","option");
    option.setAttribute("aria-posinset", i+1);
    option.setAttribute("aria-setsize" ,cuisines.length);
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = (data) => {
  // Remove all restaurants
  restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
  restaurants = data;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = (data = restaurants) => {
  const ul = document.getElementById('restaurants-list');
  data.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.setAttribute("role" , "listitem");

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name + " restaurant's photo.";
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  name.tabIndex = 0;
  name.setAttribute('aria-label' , `${restaurant.name} , ${restaurant.neighborhood}`);
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute("aria-label" , `View details of ${restaurant.name}'s restaurant`);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = (data = restaurants) => {
  data.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    markers.push(marker);
  });
}
