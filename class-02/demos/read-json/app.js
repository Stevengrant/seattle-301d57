'use strict';


const allDogs = [];

const Dog = function(name, image_url, hobbies){
  this.name = name;
  this.image_url = image_url;
  this.hobbies = hobbies;
  allDogs.push(this);
};

Dog.prototype.renderWithJquery = function() {
  // const otherDog = document.createElement('section');
  // console.log(otherDog.html());

  // Things referenced or created by jquery that ARE jquery objects should be named with the "$" so we know they are jquery
  // returns a jquery obj
  const $newDog = $('<section></section>');

  // uses the "$" function as a getter and gets the jquery version of the element on the page
  // the .html method is being used as a getter, and gets the inner html
  //$('#dog-template') returns jquery obj of that section
  // .html returns the html as text
  // there is no dollar sign here since it isn't jquery
  const dogTemplateHtml = $('#dog-template').html();

  // If i pass in html to the .html method, it is used like a setter and inserts html into the element
  //returns the $newDog jquery obj
  $newDog.html(dogTemplateHtml);

  // find is a getter, text is a setter
  // returns the h2 jquery obj
  $newDog.find('h2').text(this.name);
  $newDog.find('img').attr('src', this.image_url);
  $newDog.find('p').text(this.hobbies);

  // append is a setter
  // jquery obj of the "main" element
  $('main').append($newDog);


};




Dog.getAllDogsFromFile = function(){
  //get takes two parameters: path to the destination, data type
  // eventually returns the json
  const filePath = './data.json';
  const fileType = 'json';
  $.get(filePath, fileType).then( myDogJSON => {

    myDogJSON.forEach(dog => {
      // TODO: maybe make this easier
      new Dog(dog.name, dog.image_url, dog.hobbies);
    });

    allDogs.forEach(dog => {
      dog.renderWithJquery();
    });

  });
};

Dog.getAllDogsFromFile();
