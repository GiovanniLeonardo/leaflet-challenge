// Store our API endpoint inside quakeUrl
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// console.log (quakeUrl)

// Store our API endpoint inside plateUrl = 
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// console.log (platesURL)

// Create function to return earthquake magnitude
function magnitude(mag) {
    return mag * 5;
};

// Create function for identifying eathquake based on magnitude, set color
function setColor(mag) {
    if (mag > 5) {
        return 'red'
    } else if (mag > 4) {
        return 'darkorange'
    } else if (mag > 3) {
        return 'orange'
    } else if (mag > 2) {
        return 'yellow'
    } else if (mag > 1) {
        return 'green'
    } else {
        return 'lightgreen'
    }
};
//create variable to hold earthquakes
var earthquakes = new L.LayerGroup();

// Perform a GET request to the query the quakeUrl
d3.json(quakeUrl, function (geoJson) {
    // Create a GeoJSON layer containing the features array
    L.geoJSON(geoJson.features, {
        // create function for identify latitude and longitude
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: magnitude(geoJsonPoint.properties.mag) });
        },
        // create style for magnitude 
        style: function (geoJsonFeature) {
            return {
                fillColor: setColor(geoJsonFeature.properties.mag),
                fillOpacity: 0.9,
                weight: 0.3,
                color: 'black'
            }
        },
        // function to run once to render each feature for each earthquake data
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3>" + new Date(feature.properties.time) +
                "</h3> <hr> <h4>" + feature.properties.title + "</h4>");
        }
    }).addTo(earthquakes); // Add the layer control to the map
    
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
})



//create variable to hold plate layer
var plates = new L.LayerGroup();

// Perform a GET request to the query the platesURL
d3.json(platesURL, function (geoJson) {
    L.geoJSON(geoJson.features, {
        // create style for the plates
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'orange'
            }
        },
    }).addTo(plates);
});


function createMap() {

    // Create layers for the satellite, grayscale & outdoor layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.gray",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> Quan SHUANG, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoor",
    accessToken: API_KEY
  });


    // Create baseMaps ojbects to hold the base layers
    var baseMaps = {
         "Satellite": satellitemap,
        "Grayscale": graymap,
        "Outdoors": outdoormap 
    };
    // create overlay objects to hold the overlay layer
    var overlayMaps = {
        "Fault Lines": plates,
        "Earthquakes": earthquakes
    };

    // Create our map, giving it the satellite and earthquake layers to display on load
    var mymap = L.map('map', {
        center: [37.09, -95.71],
        layers: [satellitemap, earthquakes, plates],
        zoom: 4.3
    });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(mymap);

 // create variable to hold the legend
 // create for loop for each magnitude length
    var magLegend = L.control({ position: 'bottomleft' });

    magLegend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            mag = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4>Magnitude</h4>"
        // Loop through each magnitude and generate a label with color for each
        for (var i = 0; i < mag.length; i++) {
            div.innerHTML +=
                '<i style="background:' + setColor(mag[i] + 1) + '"></i> ' +
                mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
        }

        return div;
    };
    magLegend.addTo(mymap);
}