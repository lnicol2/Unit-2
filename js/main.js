/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
var minValue;

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>Country:</b> " + this.properties.Country + "</p><p><b>Intentional Homicide Victims Per 100,000 in " + this.year + ":</b> " + this.population + "</p>";
};

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [30, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
    
    }).addTo(map);

    //call getData function
    getData();
};

function calculateMinValue(data){
    var allValues = [];
    for(var city of data.features){
        for(var year = 2014; year <= 2020; year+=1){
            var value = city.properties["Rate_"+ String(year)];
            allValues.push(value);
        }
    }
    var minValue = Math.min(...allValues)
    return minValue;
}

function calcPropRadius(attValue) {
    var minRadius = 5;
    var radius = 0.55 * Math.pow(attValue/minValue,0.5) * minRadius

    

    return radius;
}

function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0];

    console.log(attribute)

    var options = {
        radius: 5,
        fillColor: "red",
        color: "purple",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    var attValue = Number(feature.properties[attribute]);

    options.radius = calcPropRadius(attValue);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    var popup = new PopupContent(feature.properties, attribute)
    console.log(popup)

//build popup content string
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country

    var year = attribute.split("_")[1];
    popupContent += "<p><b>Intentional Homicide Victims Per 100,000 in " + year + ":</b> " + feature.properties[attribute];

    layer.bindPopup(popup.formatted, {
    offset: new L.Point(0,-options.radius)
    });
    return layer;
};



//Step 3: Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes)
        }      

    }).addTo(map);
};

function getCircleValues(attribute) {
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
      max = -Infinity;
  
    map.eachLayer(function (layer) {
      //get the attribute value
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);
  
        //test for min
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //test for max
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //set mean
    var mean = (max + min) / 2;
  
    //return values as an object
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }
  
  function updateLegend(attribute) {
    //create content for legend
    var year = attribute.split("_")[1];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(attribute);
  
    for (var key in circleValues) {
      //get the radius
      var radius = calcPropRadius(circleValues[key]);
  
      document.querySelector("#" + key).setAttribute("cy", 59 - radius);
      document.querySelector("#" + key).setAttribute("r", radius)
  
      document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100) / 100 + "Victims per 100,000";
  
      /*$("#" + key).attr({
        cy: 59 - radius,
        r: radius,
      });
      $("#" + key + "-text").text(
        Math.round(circleValues[key] * 100) / 100 + " million"
      );*/
    }
  }

function processData(data){
    var attributes = [];
    var properties = data.features[0].properties;


    for (var attribute in properties){
        if (attribute.indexOf("Rate") > -1){
            attributes.push(attribute);
        };
    };
    console.log(attributes);
    return attributes;
};





function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
  
        onAdd: function () {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
  
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
  
            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="assets/reverse.png.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="assets/forward.png.png"></button>'); 
  
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
  
  
            return container;
  
        }
    });
  
    map.addControl(new SequenceControl());

    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    var steps = document.querySelectorAll('.step');

    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //Step 6: increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };
  
            //Step 8: update slider
            document.querySelector('.range-slider').value = index;
  
            //Step 9: pass new attribute to update symbols
            updatePropSymbols(attributes[index]);
        })
    })
  
    //Step 5: input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //Step 6: get the new index value
        var index = this.value;
  
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
    });
  
  };

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;


            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

             //add city to popup content string
             var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

             //add formatted attribute to panel content string
             var year = attribute.split("_")[1];
             popupContent += "<p><b>Intentional Homicide Victims Per 100,000 in " + year + ":</b> " + props[attribute] + "</p>";
 
             //update popup content            
             popup = layer.getPopup();            
             popup.setContent(popupContent).update();
         
        };
    });
    updateLegend(attribute)
};

function createLegend(attributes) {
    var LegendControl = L.Control.extend({
      options: {
        position: "bottomright",
      },
  
      onAdd: function () {
        // create the control container with a particular class name
        var container = L.DomUtil.create("div", "legend-control-container");
  
        container.innerHTML = '<p class="temporalLegend">Victims in <span class="year">1980</span></p>';
  
        //Step 1: start attribute legend svg string
        var svg = '<svg id="attribute-legend" width="160px" height="60px">';
  
        //array of circle names to base loop on
        var circles = ["max", "mean", "min"];
  
        //Step 2: loop to add each circle and text to svg string
        for (var i = 0; i < circles.length; i++) {
          //calculate r and cy
          var radius = calcPropRadius(dataStats[circles[i]]);
          console.log(radius);
          var cy = 59 - radius;
          console.log(cy);
  
          //circle string
          svg +=
            '<circle class="legend-circle" id="' +
            circles[i] +
            '" r="' +
            radius +
            '"cy="' +
            cy +
            '" fill="red" fill-opacity="0.8" stroke="purple" cx="30"/>';
  
          //evenly space out labels
          var textY = i * 20 + 20;
  
          //text string
          svg +=
            '<text id="' +
            circles[i] +
            '-text" x="65" y="' +
            textY +
            '">' +
            Math.round(dataStats[circles[i]] * 100) / 100 +
            " victims" +
            "</text>";
        }
  
        //close svg string
        svg += "</svg>";
  
        //add attribute legend svg to container
        container.insertAdjacentHTML('beforeend',svg);
  
        return container;
      },
    });

    updatePropSymbols(attributes)
  
    map.addControl(new LegendControl());
  }

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/CrimeRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var attributes = processData(json);
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
        })
};




    
       
    
    

  
        




document.addEventListener('DOMContentLoaded',createMap)