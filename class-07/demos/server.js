'use strict';

// first run npm init from the terminal to create "package.json"
// `npm install dotenv` installs the dotenv module into the node module folder
// loads our environment from a secret .env file

// APP dependencies
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Global vars
const PORT = process.env.PORT;

// Make my server
const app = express();
app.use(cors());
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
//   searchToLatLng(request, response);
// })

// This is the major refactor
app.get('/location', searchToLatLng);

  

app.use('*', (request, response) => {
  response.send('you got to the wrong place');
})

//gross callback function. Can we refactor?
function searchToLatLng (request, response){
  const locationName = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;
   superagent.get(url)
    .then( result => {
      let location = {
    search_query: locationName,
    formatted_query: result.body.results[0].formatted_address,
    latitude: result.body.results[0].geometry.location.lat,
    longitude: result.body.results[0].geometry.location.lng,
  }
  response.send(location);

}).catch(e => {
  console.error(e);
  response.status(500).send('Status 500: So sorry i broke');
})
}

// Start the server
app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`)
})


