## Restaurant Reviews App
This is the restaurant reviews application which is working offline too.
### Usage
1. In order to use this project go to [here](https://github.com/udacity/mws-restaurant-stage-3) and clone the backend server and run it.
2. Install dependencies by running `npm install --save` command.
3. Build application by running `gulp build` command.
4. Start application by running `gulp prod` command.

### Little Warning

I've changed backend server's `localdiskDb.db` because of 10th restaurant missing the `photograph` attribute like below .

```
...

  "name": "Casa Enrique",
  "neighborhood": "Queens",
  "photograph": 10,
  "address": "5-48 49th Ave, Queens, NY 11101",
  "latlng": {
    "lat": 40.743394,
    "lng": -73.954235
  },
  
...
```
