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


const SQL_INSERTS = {
  locations: `INSERT INTO locations(
    latitude,
    longitude,
    search_query,
    formatted_query
    
  ) VALUES($1, $2, $3, $4)
                RETURNING *`,
  weathers: ``
}

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

function cacheMiss(url, locationName) {

  return superagent.get(url)
    .then(result => {

      let location = new Location(locationName, result)

      // Save the data to postgres
      // client.query takes two arguments: a sql command, and an array ov values
      return client.query(
        SQL_INSERTS[tableName],
        [location.search_query, location.formatted_query, location.latitude, location.longitude]
      ).then(sqlResult => {
        return sqlResult.rows[0]
      })

      // return location;

    })
}

function cacheHit(sqlResult){ // get the thing in the db up a level
  console.log('sending from db');
  // send the frontend what was in the db

  // Weather data is old after an hour
  // if someone asks for more data, check how old it is
  return sqlResult.rows[0];
}
// checkDb('search_query', 'boston', 'locations', 'url, response)
function checkDb(searchyThingName, searchyThing, tableName, url, response){

  return client.query(`SELECT * FROM ${tableName} WHERE ${searchyThingName}=$1`, [searchyThing])
    .then(sqlResult => {

      if (sqlResult.rowCount === 0) {
        // is not in database
        return cacheMiss(url, searchyThing, response);
      } else {
        // is in database
        return cacheHit(sqlResult);
      }
    });
}

function searchToLatLng(request, response) {

  const locationName = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${process.env.GEOCODE_API_KEY}`;

  checkDb('search_query', locationName, 'locations', url)
    .then(locationData => {
      response.send(locationData);
    })
    .catch(e => {
      console.error('searchtolatlong', e);
      response.status(500).send('Status 500: So sorry i broke');
    })
}

function getWeather(request, response) {
  console.log(request.query);

  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

  const locationID = request.query.data.id;

  checkDb(locationID, 'weathers', url)
    .then(locationData => {
      response.send(locationData);
    })
    .catch(e => {
      console.error('getWeather', e);
      response.status(500).send('Status 500: So sorry i broke');
    })

  // return superagent.get(_URL)
  //   .then(result => {

  //     const weatherSummaries = [];

  //     result.body.daily.data.forEach(day => {
  //       const summary = new Weather(day);
  //       weatherSummaries.push(summary);
  //     });

  //     response.send(weatherSummaries);

  //   })
  //   .catch(e => {
  //     console.error(e);
  //     response.status(500).send('Status 500: So sorry i broke');
  //   });
}
