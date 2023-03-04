/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    map = L.map('map', {
        center: [30, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
    }).addTo(map);

    //call getData function
    getData();
};

function calculateMinValue(data){
    //create empty array to store all data values
    var allValues = [];
    //loop through each city
    for(var city of data.features){
        //loop through each year
        for(var year = 2014; year <= 2020; year+=5){
              //get population for current year
              var value = city.properties["Pop_"+ String(year)];
              //add value to array
              allValues.push(value);
        }
    }
    //get minimum value of our array
    var minValue = Math.min(...allValues)

    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5) * minRadius

    return radius;
};


       
        //Step 3: Add circle markers for point features to the map
function createPropSymbols(data){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;

    //create a Leaflet GeoJSON layer and add it to the map

    //build popup content string starting with city...Example 2.1 line 24
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";

    //add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

     L.geoJson(json, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
   
};
//Example 1.2 line 1...Step 3: Add circle markers for point features to the map
function createPropSymbols(data){

    //Step 4. Determine the attribute for scaling the proportional symbols
    var attribute = "Rate_2014";

L.geoJson(data, {
    pointToLayer: function (feature, latlng, attributes) {
        //Step 5: For each feature, determine its value for the selected attribute
        var attValue = Number(feature.properties[attribute]);

        //examine the attribute value to check that it is correct
        console.log(feature.properties, attValue);

        //create circle markers
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
};

//Step 1: Create new sequence controls
function createSequenceControls(){
    //create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
}

//Example 3.5...create range input element (slider)
var slider = "<input class='range-slider' type='range'></input>";
document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);

//set slider attributes
document.querySelector(".range-slider").max = 6;
document.querySelector(".range-slider").min = 0;
document.querySelector(".range-slider").value = 0;
document.querySelector(".range-slider").step = 1;

//below Example 3.6...add step buttons
document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    fetch("data/CrimeRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(json).addTo(map);
            //pointtolayer not working here*
        })
        //Step 2: Import GeoJSON data
function getData(map){
    //load the data
    fetch("data/CrimeRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //call function to create proportional symbols
            createPropSymbols(json);
            createSequenceControls();
        })
};
function getData(map){
    //load the data
    fetch("data/CrimeRates.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
             //create an attributes array
            var attributes = processData(json);
            minValue = calcMinValue(json);
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
        //Above Example 3.10...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};
};
};
document.querySelectorAll('.step').forEach(function(step){
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
          //Called in both step button and slider event listener handlers
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(attributes[index]);
        //Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
        };
    });
};
   //Example 3.18 line 4
   if (layer.feature && layer.feature.properties[attribute]){
    //access feature properties
    var props = layer.feature.properties;

    //update each feature's radius based on new attribute values
    var radius = calcPropRadius(props[attribute]);
    layer.setRadius(radius);

    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + props.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";

    //update popup content            
    popup = layer.getPopup();            
    popup.setContent(popupContent).update();
};
    })
})

        




document.addEventListener('DOMContentLoaded',createMap)