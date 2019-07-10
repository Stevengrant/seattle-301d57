'use strict';
//***************************************** */
//1 add superagent
//2 talk about superagent
//3 comment out searchToLatLng
//4 refactor the method
//5 type getwether with foreach, 
//6 refactor to .map()

//***************************************** */

// first run npm init from the terminal to create "package.json"
// `npm install dotenv` installs the dotenv module into the node module folder
// loads our environment from a secret .env file

// APP dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Global vars
const PORT = process.env.PORT || 3000;

// Make my server
const app = express();
app.use(cors());
//-------------add superagent
const superagent = require('superagent');


/*
$.ajax({
    url: `localhost:3000/location`,
    method: 'GET',
    data: { data: searchQuery }
  })
*/

// app.get('/location') is a route
// app.get('/location', (request, response) => {
//   // response.send('hello world you are on the location path');
//   console.log('req data',request.query);
//   try {
//     const locationData = searchToLatLng(request.query.data, response);
//     response.send(locationData);
//   } catch(e){
//     response.status(500).send('Status 500: So sorry i broke')
//   }
// })
app.get('/location', searchToLatLng);

app.use('*', (request, response) => {
  response.send('you got to the wrong place');
})

//comment this out and refactor
// function searchToLatLng (locationName){
//   const geoData = require('./data/geo.json');
//   const location = {
//     search_query: locationName,
//     formatted_query: geoData.results[0].formatted_address,
//     latitude: geoData.results[0].geometry.location.lat,
//     longitude: geoData.results[0].geometry.location.lng,
//   }
//   return location;
// }




function searchToLatLng(req, res) {
  //now we need a url becuase we are no longer grabbing from our local json file
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${req.query.data}&key=AIzaSyCeGzM7CqJ8i1vrfLqeu0UNQVmgx8m8mHI`;
  //this is a function that requres a return.  what should we return?
  console.log('latlong url', url)
  return superagent.get(url)
  .then(result => {
    //log out result.body
    console.log('result body',result.body);
    res.send( new Location(req.query.data, result));
  })
  // what is this?? we need a new Location object?
  //.catch(error => console.error(error));    
}

//next lets add the getWeather function, object, and call it below latlng
// function getWeather(req, res){
//   const url = 'darsky.net/forcast/....';
//   console.log('url', url);

//   return superagent.get(url)
//     .then(result => {
//       result.body.daily.data.forEach(day => {
//         const summary = new Weather(day);
//         weatherSummaries.push(summary);
//       })
//     })
// }

//consolelog this very heavy
function Location(query, res) {
  this.search_query = query;
  this.formatted_querry = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
}



// Start the server
app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`)
})