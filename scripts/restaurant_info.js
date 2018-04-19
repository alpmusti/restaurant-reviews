import DBHelper from './dbhelper';

var restaurant;
var map;
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, data) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: data.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(restaurant, map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = (callback) => {
  if (restaurant) { // restaurant already fetched!
    callback(null, restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, data) => {      
      restaurant = data;
      if (!data) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, data)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = (data = restaurant) => {  
  const favContainer = document.getElementById('fav-container');
  const name = document.getElementById('restaurant-name');
  name.innerHTML = data.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = data.address;

  const favorite = document.createElement('button');
  let buttonTitle , ariaText, className;  
  if(!data.is_favorite ||data.is_favorite == 'false'){    
    buttonTitle = 'Add Favorite'
    ariaText = `Add ${data.name}'s restaurant to your favorites.`;
    className = 'add-favorite';
  }else{
    buttonTitle = 'Unfavorite';
    ariaText = `Remove ${data.name}'s restaurant from your favorites.`;
    className = 'un-favorite';
  }
  favorite.innerHTML = buttonTitle;
  favorite.setAttribute('aria-label',  ariaText);
  favorite.className = className;
  favorite.addEventListener('click' , () => {
    handleFavorite(data , favorite); 
  });
  favContainer.appendChild(favorite);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = data.name + " restaurant's photo."

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = data.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Handle favorite button
 */
var handleFavorite = (data , fav) => {
  DBHelper.setFavorite(data.id , data.is_favorite)
  .then((data) => {     
    let message;
    document.getElementById('star').classList.toggle('show');
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
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = restaurant.operating_hours) => {
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
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = (reviews = restaurant.reviews) => {  
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  //add comment section bottom
  createCommentSection(container,restaurant);
}

/**
 * Create a comment section bottom of the reviews.
 */
var createCommentSection = (container,restaurant) => {
  const form = document.createElement('form');
  const textArea = document.createElement('textarea');
  const sendButton = document.createElement('button');

  textArea.id = 'comment-text';
  textArea.placeholder = 'Post a review about this restaurant';
  textArea.setAttribute('aria-label' , 'Post a review about this restaurant.');
  
  sendButton.setAttribute('aria-label' , 'Post a review');  
  sendButton.innerHTML = 'Send';
  sendButton.type = 'submit';
  
  form.id = 'comment-container';  
  form.append(textArea);
  form.append(createRatingBars());
  form.append(sendButton);  

  setFormListener(form,restaurant.id);

  container.appendChild(form);
}

/**
 * Set a form listener to submit
 */
var setFormListener = (form,id) => {
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    const rating = parseInt(document.querySelector('input[name="rating"]:checked').value);    
    const commentText = stripHtmlTags(document.getElementById('comment-text').value);      
    console.log(commentText);
    
  }, false);
}

/**
 * Strip html tags
 */

 var stripHtmlTags = (string) => {
  return string.replace(/(<([^>]+)>)/ig,"");  
 }

/**
 * Create rating radio buttons
 */

 var createRatingBars = () => {
  const ratingDiv = document.createElement('div');
  ratingDiv.classList.add('rating-container');
  for(var i = 0; i < 5 ;i++){
    const input = document.createElement('input');
    const label = document.createElement('label');
    label.htmlFor = `rating-${i+1}`;
    label.innerHTML = `${i+1}`;    

    input.type = 'radio';
    input.id = `rating-${i+1}`;
    input.name = 'rating';
    input.value = i+1;
    ratingDiv.appendChild(label);
    ratingDiv.appendChild(input);
  }

  return ratingDiv;
 }

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.tabIndex = 0;
  const name = document.createElement('h4');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('h6');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('h5');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (data = restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = data.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
