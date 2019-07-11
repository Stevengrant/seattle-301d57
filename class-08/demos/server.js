'use strict';

// ===== APP dependencies =====
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

// ===== Global vars =====
const PORT = process.env.PORT;
// postgres://ncarignan:password@localhost:5432/city_explorer
// TODO: deploy to heroku
// add db to heroku
// heroku pg:push <name of your db> DATABASE_URL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error',
  error => {
    console.error(error);
  })


// ===== server instantiation and load middleware =====
const app = express();
app.use(cors());

// ===== Routes =====
app.get('/location', searchToLatLng);
app.get('/weather', getWeather);


app.use('*', (request, response) => {
  response.send('you got to the wrong place');
})

// ===== Server Start =====
app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`)
})

// ===== Constructors and Helper Functions =====

function Location(locationName, result){
  this.search_query = locationName;
  this.formatted_query = result.body.results[0].formatted_address;
  this.latitude = result.body.results[0].geometry.location.lat;
  this.longitude = result.body.results[0].geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function searchToLatLng(request, response) {

  const locationName = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;

  // if is in database
  // go get it from db
  client.query(`SELECT * FROM locations WHERE search_query=$1`, [locationName])
    .then(sqlResult => {

      if(sqlResult.rowCount === 0){
        console.log('getting new data from googles');
        superagent.get(url)
          .then(result => {

            let location = new Location(locationName, result)

            // Save the data to postgres
            // client.query takes two arguments: a sql command, and an array ov values
            client.query(
              `INSERT INTO locations (
          search_query,
          formatted_query,
          latitude,
          longitude
        ) VALUES ($1, $2, $3, $4)`,
              [location.search_query, location.formatted_query, location.latitude, location.longitude]
            )

            response.send(location);

          }).catch(e => {
            console.error(e);
            response.status(500).send('Status 500: So sorry i broke');
          })
      } else {
        console.log('sending from db');
        // send the frontend what was in the db
        response.send(sqlResult.rows[0]);
      }
    });

  // else do everything normal


}

function getWeather(request, response) {

  const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  return superagent.get(_URL)
    .then(result => {

      const weatherSummaries = [];

      result.body.daily.data.forEach(day => {
        const summary = new Weather(day);
        weatherSummaries.push(summary);
      });

      response.send(weatherSummaries);

    })
    .catch(e => {
      console.error(e);
      response.status(500).send('Status 500: So sorry i broke');
    });
}
