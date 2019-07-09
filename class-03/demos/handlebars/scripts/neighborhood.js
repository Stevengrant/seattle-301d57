'use strict';

const dogs = [
  {
    name: 'Ginger',
    hobbies: 'chews things',
    image_url: 'ginger.jpeg'
  },
  {
    name: 'Ginger',
    hobbies: 'loving students',
    image_url: 'ginger.jpeg'
  },
  {
    name: 'Valkyrie',
    hobbies: 'shedding worlds',
    image_url: 'ginger.jpeg'
  }
];

dogs.forEach(dogObj => {
  const source = $('#ginger-template').html();
  const template = Handlebars.compile(source);
  const newHtml = template(dogObj);

  $('#dogs').append(newHtml);
});














let neighborhoods = [];

// REVIEW: This is another way to use a constructor to duplicate an array of raw data objects
function Neighborhood (rawDataObject) {
  for (let key in rawDataObject) {
    this[key] = rawDataObject[key];
  }
}

Neighborhood.prototype.renderWithJquery = function(){
  const newDiv = $('<div></div>');
  const neigborHtml = $('#jquery-template').html();
  newDiv.html(neigborHtml);

  newDiv.prepend('Created with Jquery');
  newDiv.find('h2').text(`${this.name}`);
  newDiv.find('p:nth-child(2)').text(`Part of ${this.city}`);
  newDiv.find('p:nth-child(3)').text(`Current Population : ${this.population}`);
  newDiv.find('p:nth-child(4)').text(`Founded on : ${this.founded}`);

  newDiv.append(this.body);

  $('#neighborhoods').append(newDiv);

};

Neighborhood.prototype.renderWithHandleBars = function(){
  // source, context, template, html

  const source = $('#neighborhood-template').html();
  // my context is simple contextual "this"
  // Boilerplate on every template
  const template = Handlebars.compile(source);
  // boilerplate code (pass an object to the template)
  const newHtml = template(this);
  //Choose where it goes
  $('#neighborhoods').append(newHtml);
};


neighborhoodDataSet.forEach(neighborhoodObject => {
  neighborhoods.push(new Neighborhood(neighborhoodObject));
});

neighborhoods.forEach(ourNewNeighborhoodObject => {
  // ourNewNeighborhoodObject.renderWithJquery();
  // ourNewNeighborhoodObject.renderWithHandleBars();
});



