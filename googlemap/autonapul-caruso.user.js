// ==UserScript==
// @name        Autonapul - Caruso reservation modifications
// @namespace   https://zemtu.com/
// @updateURL   https://github.com/autonapul/caruso/raw/master/googlemap/autonapul-caruso.meta.js
// @downloadURL https://github.com/autonapul/caruso/raw/master/googlemap/autonapul-caruso.user.js
// @description Autonapul - Caruso reservation modifications
// @include     https://caruso.zemtu.com/reservation/*
// @include     https://autonapul.zemtu.com/reservation/*
// @version     20160130.1
// @author      Michael Mraka <mraka@autonapul.cz>
// @grant       none
// ==/UserScript==

// global variables
var MAP;
var CAR_MARKERS = [];

// map div
$('<div id="globalMap"></div>').insertAfter('article > section > div > div#box_header');
$('style').append("#globalMap { \
        height: 580px; \
        border: 1px solid black; \
}");

function filterCars() {
//        console.log("filterCars()");
        var visibleCars = {};
        var containers = document.getElementsByClassName('calendarContainer');
        for (var i=0,imax=containers.length; i<imax; i++) {
                var name = containers[i].getElementsByTagName('h2')[0].innerHTML;
                var mapLink = containers[i].getElementsByTagName('a')[2];
                if (mapLink != null) {
                    visibleCars[name]=1;
                }
//           console.log(name);
        }        
//        console.log("visibleCars: " + visibleCars);
        showCars(visibleCars);
};

//
// map functions
//
jQuery(loadMapAPI);
function loadMapAPI() {
//    console.log("loadMapAPI()");
    // Asynchronously Load the map API
    add_script('', "function emptyMapCallback() {return 0;}");
    add_script('https://maps.googleapis.com/maps/api/js?callback=emptyMapCallback', '');
    waitForMapAPI();
//    add_script('https://www.autonapul.org/schedule_it/zones/zones.js', '');
//    add_script('https://www.autonapul.org/schedule_it/zones/zone.js', '');
}

function add_script(url, text) {
    var script = document.createElement('script');
    if (url) { script.src = url;}
    if (text) { script.text = text;}
    document.body.appendChild(script);
//    console.log("add_script("+url+", "+text+")");
}

function waitForMapAPI() {
    var waitIntervalId;
    var checkMapAPI = function() {
        try {
             var haveGoogle = google;
             clearInterval(waitIntervalId);
             mapInitialize();
        }
        catch (err) {
            // still not initialized, wait for next check
        }
    };
    waitIntervalId = setInterval(checkMapAPI, 250);
}

//var A2_CAR_POINTER = 'https://www.autonapul.cz/misc/a2-car-pointer.png';
var A2_CAR_POINTER = 'data:image/png;base64,' +
'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';


function mapInitialize() {
//        console.log("mapInitialize()");

    var mapOptions = {
        mapTypeId: 'roadmap',
        center: { lat: 49.194891, lng: 16.606285},
        zoom: 12,
    };

//    console.log("MAP = ...");
    // Display a map on the page
    MAP = new google.maps.Map(document.getElementById("globalMap"), mapOptions);
    MAP.setTilt(45);

//    console.log("zone_init()");
    zone_init();
    var zones = [ZoneA,ZoneB,ZoneC,ZoneD,ZoneE,ZoneF,ZoneG];
    for (var i=0;i<zones.length;i++) {
         var zonedata=zones[i];
         drawZonePrivate(MAP, zonedata.path, zonedata.color, zonedata.name, zonedata.center);
//    console.log("Zone "+zones[i].name);
    }

//    console.log("CAR_MARKERS=");
    CAR_MARKERS = carMarkers();

    filterCars();
}

    function drawZonePrivate(map, path, clr, name, center) {
        // Construct the polygon.
        var zone = new google.maps.Polygon({
          paths: path,
          strokeColor: clr,
          strokeOpacity: 0.35,
          strokeWeight: 2,
          fillColor: clr,
          fillOpacity: 0.10,
        });

        zone.setMap(map);

//        var homeLatLng = new google.maps.LatLng(49.196057, 16.607790);
        var marker = new google.maps.Marker({
          position: center,
          draggable: true,
          map: map,
          icon: new google.maps.MarkerImage(
            "https://chart.googleapis.com/chart?chst=d_bubble_text_small&chld=bb|" + name + "|FF8080|000000",
            null, null, new google.maps.Point(0, 42)),
        });
    }

function carMarkers() {
//        console.log("carMarkers()");
        var markers = [];
        var containers = document.getElementsByClassName('calendarContainer');

        for (var i=0,imax=containers.length; i<imax; i++) {
                var header = containers[i].getElementsByTagName('h2')[0];
                var name = header.innerHTML;
                header.id = name;

                var mapLink = containers[i].getElementsByTagName('a')[2];
                var pos = mapLink.href.match(/^https?:\/\/www.openstreetmap.org\/\?mlat=([0-9\.]+)&mlon=([0-9\.]+)#.*/i);
                var descr = mapLink.innerHTML.replace("Stav: ","");
                if (pos != null) {
                      // change link to google maps
                      mapLink.href = "https://maps.google.com/?ie=UTF8&q=Autonapul@" + pos[1] + "," + pos[2];
//                        console.log("car = { name: " + name + ", pos: " + pos + ", descr: " + descr);
                      marker = new google.maps.Marker({
                          position: new google.maps.LatLng(pos[1], pos[2]),
                          title: name,
                        icon: A2_CAR_POINTER,
                      });
                      markers.push(marker);

                      var infoWindow = new google.maps.InfoWindow(), marker, i;
                      // Allow each marker to have an info window    
                      google.maps.event.addListener(marker, 'click', (function(marker, name, descr) {
                          return function() {
                              infoWindow.setContent('<a href="#' + name + '">' + name + '</a><br>' + descr);
                              infoWindow.open(MAP, marker);
                              }
                          })(marker, name, descr));
                
                }
         }    
        return markers;
}

function showCars(cars) {
//    console.log("showCars() " + cars);
    var bounds = new google.maps.LatLngBounds();

    // Loop through cars & place / hide each one
    for( i = 0; i < CAR_MARKERS.length; i++ ) {
        var name = CAR_MARKERS[i].title;
//            console.log("name: " + name);
        if (name in cars) {
           bounds.extend(CAR_MARKERS[i].position);
            CAR_MARKERS[i].setMap(MAP);
//            console.log("show " + name);
        } else {
            CAR_MARKERS[i].setMap(null);
//            console.log("hide " + name);
        }
    }
    // Automatically center the map fitting all markers on the screen
    MAP.fitBounds(bounds);

    var boundsListener = google.maps.event.addListener((MAP), 'bounds_changed', function(event) {
        //this.setZoom(12);
        google.maps.event.removeListener(boundsListener);
    });
//    console.log("showCars() end");

}


var ZoneA;
var ZoneB;
var ZoneC;
var ZoneD;
var ZoneE;
var ZoneF;
var ZoneG;

function zone_init() {
//---  http://www.autonapul.org/sites/all/libraries/js_zones/zones.js -----

ZoneA = (function() {
  return {
    path: [
          new google.maps.LatLng(49.189662, 16.568908), // Pisárky
          new google.maps.LatLng(49.203011, 16.567449), // okruh
          new google.maps.LatLng(49.210357, 16.571483), // Žabovřeská
          new google.maps.LatLng(49.214726, 16.569806), // Horova
		  new google.maps.LatLng(49.219225, 16.575256), // Rubín
		  new google.maps.LatLng(49.220597, 16.582723), // Skácelova
		  new google.maps.LatLng(49.224102, 16.594568), // Palackého
          new google.maps.LatLng(49.229399, 16.595984), // tunel
          new google.maps.LatLng(49.222883, 16.622828), // Okružní
          new google.maps.LatLng(49.221762, 16.628686), // Okružní
          new google.maps.LatLng(49.211782, 16.643031), // Tomkovo náměstí
          new google.maps.LatLng(49.191537, 16.647409), // Ostravská
          new google.maps.LatLng(49.190448, 16.633625), // Křenová
          new google.maps.LatLng(49.183660, 16.607618), // Rondo
          new google.maps.LatLng(49.186913, 16.594314), // Poříčí
          new google.maps.LatLng(49.183289, 16.578832), // výstaviště
          new google.maps.LatLng(49.189662, 16.568908) // Pisárky
        ],
    color: "#0000FF",
    name: "A",
    center: new google.maps.LatLng(49.196057, 16.607790)
  }
})();

ZoneB = (function() {
  return {
    path: [
          // Lesna + Divisova ctvrt
          new google.maps.LatLng(49.216469, 16.603970), // Reissigova
          new google.maps.LatLng(49.215419, 16.599688), // Domazlicka

          new google.maps.LatLng(49.212895, 16.601233), // Sumavska
          new google.maps.LatLng(49.209587, 16.589346), // Veveri

          new google.maps.LatLng(49.211366, 16.583457), // Minska
          new google.maps.LatLng(49.210944, 16.572467), // krizovatka
          new google.maps.LatLng(49.213257, 16.559271), // Kninicska
          new google.maps.LatLng(49.217560, 16.560580), // kruhac
          new google.maps.LatLng(49.215684, 16.565432), // Štursova
          new google.maps.LatLng(49.227288, 16.569037),
          new google.maps.LatLng(49.247799, 16.556592),
          new google.maps.LatLng(49.256539, 16.572385), // Žilkova
          new google.maps.LatLng(49.253962, 16.586718), // Hradecká
          new google.maps.LatLng(49.237376, 16.603884), // Kociánka

          new google.maps.LatLng(49.216469, 16.603970), // Reissigova
        ],
    color: "#CC0000",
    name: "B",
    center: new google.maps.LatLng(49.230707, 16.585946)
  }
})();

ZoneC = (function() {
  return {
    path: [
          // Lesna + Divisova ctvrt
          new google.maps.LatLng(49.201949, 16.613682), // zacatek ulice Drobneho
          new google.maps.LatLng(49.209464, 16.608789),
		  new google.maps.LatLng(49.211073, 16.610019), // parkoviste Billa
          new google.maps.LatLng(49.212828, 16.617115),
          new google.maps.LatLng(49.216416, 16.615227),
          new google.maps.LatLng(49.221910, 16.621836),
          new google.maps.LatLng(49.226223, 16.610966),
          new google.maps.LatLng(49.231520, 16.613025),
          new google.maps.LatLng(49.236199, 16.620407),
          new google.maps.LatLng(49.238665, 16.626630),
          new google.maps.LatLng(49.237064, 16.633032), // Kupkova
          new google.maps.LatLng(49.212680, 16.640199), // u Svitavy

          // Obrany
          new google.maps.LatLng(49.211955, 16.642465),

          // Cerna Pole
          new google.maps.LatLng(49.204161, 16.628904),
          new google.maps.LatLng(49.204553, 16.623754),
          new google.maps.LatLng(49.201132, 16.614227),

          new google.maps.LatLng(49.201949, 16.613682)
        ],
    color: "#009900",
    name: "C",
    center: new google.maps.LatLng(49.228325, 16.625471)
  }
})();

ZoneD = (function() {
  return {
    path: [
          // Židenice
          new google.maps.LatLng(49.191373, 16.633754), // Životského
          new google.maps.LatLng(49.197795, 16.632466), // Krokova
          new google.maps.LatLng(49.210581, 16.642337), // Karlova

          //Vinohrady
          new google.maps.LatLng(49.210974, 16.660361), // Žarošická

          //Líšeň
          new google.maps.LatLng(49.214282, 16.679673), // Jedovnická
          new google.maps.LatLng(49.213535, 16.686612), // Novolíšeňská
          new google.maps.LatLng(49.209413, 16.688114), // Jírova
          new google.maps.LatLng(49.208557, 16.695602), // Klajdovská
          new google.maps.LatLng(49.198568, 16.695152), // Holzova
          new google.maps.LatLng(49.200908, 16.670232), // Trnkova

          // Juliánov
          new google.maps.LatLng(49.187054, 16.660275), // Ostravská

          new google.maps.LatLng(49.191373, 16.633754), // Životského
        ],
    color: "#CC0000",
    name: "D",
    center: new google.maps.LatLng(49.200600, 16.665768)
  }
})();

ZoneE = (function() {
  return {
    path: [
          new google.maps.LatLng(49.183632, 16.604142), // Poříčí
          new google.maps.LatLng(49.160119, 16.598906), // dálnice
          new google.maps.LatLng(49.160961, 16.569123), // dálnice
          new google.maps.LatLng(49.167528, 16.545262), // dálnice
          new google.maps.LatLng(49.173813, 16.561398), // přivaděč
          new google.maps.LatLng(49.182678, 16.566376), // přivaděč
          new google.maps.LatLng(49.181163, 16.577534), // Kamenná čtvrť
          new google.maps.LatLng(49.188671, 16.587736), // výstaviště
          new google.maps.LatLng(49.189989, 16.593873), // Mendlák
          new google.maps.LatLng(49.183632, 16.604142), // Poříčí
        ],
    color: "#009900",
    name: "E",
    center: new google.maps.LatLng(49.173308, 16.583457)
  }
})();

ZoneF = (function() {
  return {
    path: [
          new google.maps.LatLng(49.185090, 16.565861), // Pisárky
          new google.maps.LatLng(49.173813, 16.561484), // přivaděč
          new google.maps.LatLng(49.170446, 16.554189), // přivaděč
          new google.maps.LatLng(49.178807, 16.539426), // Křivánky

          // Kohoutovice
          new google.maps.LatLng(49.190532, 16.524920), // Pavlovská
          new google.maps.LatLng(49.201076, 16.533246), // Voříškova
          new google.maps.LatLng(49.192719, 16.563802), // nad Pisárkami
          new google.maps.LatLng(49.189989, 16.593873), // Mendlák
          new google.maps.LatLng(49.183425, 16.578767), // Riviéra
          new google.maps.LatLng(49.185090, 16.565861), // Pisárky
        ],
    color: "#CC0000",
    name: "F",
    center: new google.maps.LatLng(49.185371, 16.540885)
  }
})();

ZoneG = (function() {
  return {
    path: [
          new google.maps.LatLng(49.213581, 16.558823), // Kníničská
          new google.maps.LatLng(49.218851, 16.551013), // Kníničská
          new google.maps.LatLng(49.221038, 16.535992), // Kníničská
          new google.maps.LatLng(49.213020, 16.521487), // stará dálnice
          new google.maps.LatLng(49.214366, 16.493506), // Hostislavova
          new google.maps.LatLng(49.228045, 16.500716), // Rakovec
          new google.maps.LatLng(49.232304, 16.518912), // hráz
          new google.maps.LatLng(49.240430, 16.521659), // Kníničky
          new google.maps.LatLng(49.240094, 16.530242), // Ondrova
          new google.maps.LatLng(49.227204, 16.534533), // ZOO
          new google.maps.LatLng(49.227204, 16.561398), // Komín
          new google.maps.LatLng(49.215477, 16.565592), // kruháč v Komíně
          new google.maps.LatLng(49.214748, 16.569626), // Rubín
          new google.maps.LatLng(49.212674, 16.562030), // Kníničská
          new google.maps.LatLng(49.213581, 16.558823) // Kníničská
        ],
    color: "#009900",
    name: "G",
    center: new google.maps.LatLng(49.221262, 16.536336)
  }
})();

//----------------------------------------------------
    return 0;
}
