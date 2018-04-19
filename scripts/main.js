import DBHelper from './dbhelper';

let restaurants,
  neighborhoods,
  cuisines;
let map;
let markers = [];
let observer , mapObserver;
let numSteps = 20.0;
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
    setIntersectObservers();
    setEventListeners();
    fetchNeighborhoods();
    fetchCuisines(); 
});
/**
 * Set event listeners for filter changing
 */
var setEventListeners = () => {
  var neighborHoodSelect = document.getElementById('neighborhoods-select');
  neighborHoodSelect.addEventListener('change' , function(){
    updateRestaurants();
  });

  var cuisineSelect = document.getElementById('cuisines-select');
  cuisineSelect.addEventListener('change' , function(){
    updateRestaurants();
  });
}

var setIntersectObservers = () => {
  var options = {
    root: document.querySelector('#scrollArea'),
    rootMargin: '0px',
    threshold: buildThresholdList()
  }

  observer = new IntersectionObserver(handleIntersect, options);
}

var buildThresholdList = () => {
  var thresholds = [];

  for (var i=1.0; i<=numSteps; i++) {
    var ratio = i/numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}

function handleMap(entries , observer){
  entries.forEach((entry) => {
    let map = document.getElementById('map');    
    if(entry.intersectionRatio > 0.25){
      map.classList.add('show-map');
    }else{
      map.classList.remove('show-map');
    }
  });
}

var handleIntersect = (entries , observer) => {
  entries.forEach((entry) => {
    const image = entry.target.firstChild;    
    if(entry.intersectionRatio > 0.25){       
      const imageSrc = image.getAttribute('data-src');      
      
      image.src = (imageSrc) ? imageSrc : image.src;
      image.removeAttribute('data-src');
      
      entry.target.classList.remove('hidden');
      entry.target.classList.add('show');
    }
  });
}

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
  
  var options = {
    root: document.querySelector('#scrollArea'),
    rootMargin: '0px',
    threshold: buildThresholdList()
  }
  mapObserver = new IntersectionObserver(handleMap, options);
  mapObserver.observe(document.getElementById('map-container'));
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = "post";
  li.setAttribute("role" , "listitem");

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('data-src' , DBHelper.imageUrlForRestaurant(restaurant));
  //image.src = DBHelper.imageUrlForRestaurant(restaurant);
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
  const fav = document.createElement('button');

  // extra OR statement here because of server side problem
  if(!restaurant.is_favorite || restaurant.is_favorite == 'false') { 
    fav.innerHTML = 'Add Favorite';
    fav.className = 'add-favorite';
    fav.setAttribute('aria-label' , `Add favorite to ${restaurant.name}'s resturant.`)
  }else{
    li.classList.add('favorite');
    fav.innerHTML = 'Unfavorite';
    fav.className = 'un-favorite';
    fav.setAttribute('aria-label' , `Remove ${restaurant.name}'s resturant from your favorite.`)
  }
  fav.addEventListener('click' , function(){
    handleFavorite(restaurant.id , li , fav);    
  });

  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute("aria-label" , `View details of ${restaurant.name}'s restaurant`);
  li.append(more);
  li.append(fav);
  li.classList.add('hidden');

  observer.observe(li);
  return li
}

/**
 * Handle favorite logic
 */
var handleFavorite = (restaurantId , li , fav) => {
  let isFavorite = restaurants[restaurantId - 1].is_favorite;
  
  DBHelper.setFavorite(restaurantId , isFavorite)
  .then((data) => {
    restaurants[data.id - 1] = data;
    li.classList.toggle('favorite');
    let message;
    if(fav.classList.contains('add-favorite')){
      fav.classList.replace('add-favorite' , 'un-favorite');
      fav.innerHTML = 'Unfavorite';
      message = 'This restaurant successfully added to your favorites';
    }else{
      fav.classList.replace('un-favorite' , 'add-favorite');
      fav.innerHTML = 'Add Favorite';
      message = 'This restaurant successfully removed from your favorites';
    }
    DBHelper.showMessage(message);    
  })
  .catch((err) => {
    console.error(err);
  });
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
