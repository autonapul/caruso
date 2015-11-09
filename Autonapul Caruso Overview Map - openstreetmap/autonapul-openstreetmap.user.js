// ==UserScript==
// @name         Autonapul overview map
// @namespace    https://github.com/autonapul/caruso
// @version      20151109.1
// @description  Displays overview of all cars. Parts copied from http://harrywood.co.uk/maps/examples/openlayers/marker-popups.view.html
// @author       Zenon Kuder
// @include      https://autonapul.zemtu.com/reservation/
// @grant        none
// @require http://www.openlayers.org/api/OpenLayers.js
// ==/UserScript==

var olImgs = "http://openlayers.org/api/img/";
OpenLayers.Util.getImagesLocation=function(){return olImgs;};
markerURL = OpenLayers.Util.getImageLocation("marker.png");
$boxHeight = 600;
defaultZoom = 13;
defaultlon = 16.60; // Brno - longitude
defaultlat = 49.19; // Brno - latitude
hardwiredDefaultCenter = 0; // this will make the map load at the above coordinates instead of the coords of the first car.


links = $( ".buttonInfoPosition > a" )
var newdiv = $("<div id=#overviewDivMain> \
               <button id='showBut'>Show/Hide</button> \
               <button id='useCarToCenter'>Center on the first car</button> \
               <button id='goToCity'>Go to:</button> \
               <select id='citySelect'> \
<option selected>Brno \
<option>Praha \
<option>Ostrava \
<option>Plzeň \
<option>Liberec \
</select></div>");
$("#reservation_gui").before(newdiv); // add a box above all the cars
//newdiv.css("height", $boxHeight+"px")
//$newdiv.css("overflow", "scroll")
newdiv.append("<div id='mapdiv'></div>");
$("#mapdiv").css("border","1px solid #666");
$("#mapdiv").css("margin-bottom","10px");
$("#mapdiv").css("height",$boxHeight+"px");

$("#showBut").click(function (){
    $("#mapdiv").slideToggle();
})
$("#useCarToCenter").click(useCarToCenterEvent);
$("#goToCity").click(goToCityEvent);

map = new OpenLayers.Map("mapdiv");
map.addLayer(new OpenLayers.Layer.OSM(
    "OpenStreetMap",
    [ // Official OSM tileset as protocol-independent URLs
        '//a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        '//b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        '//c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ],
    null));
    
epsg4326 =  new OpenLayers.Projection("EPSG:4326"); //WGS 1984 projection
projectTo = map.getProjectionObject(); //The map projection (Spherical Mercator)

var vectorLayer = new OpenLayers.Layer.Vector("Overlay");
map.addLayer(vectorLayer);
    
    //Add a selector control to the vectorLayer with popup functions
    var controls = {
      selector: new OpenLayers.Control.SelectFeature(vectorLayer, { onSelect: createPopup, onUnselect: destroyPopup })
    };
    
    map.addControl(controls['selector']);
    controls['selector'].activate();

refreshMap();

 /////////////////// Define Functions          /////////////////////////////////////   
    function refreshMap()
{
 links.each(function (index){ // loop through all available cars
   
    osmhref=$(this).attr('href');
    mlat = osmhref.match (/[\?\&]mlat=([^\&\#]+)[\&\#]/i) [1]
    mlon = osmhref.match (/[\?\&]mlon=([^\&\#]+)[\&\#]/i) [1]
    //mmap = osmhref.match (/[\?\&]map=([^\&\#]+)[\&\#]/i) [1]
    addr = $(this).text();
    car = $(this).parents(".calInputRight").children(".calDesc").children("h2").text()
   // $tmpel = $("<div>"+$car + "XX"+$addr+"X" + $mlat+" X  "+$mlon+"</div>")

    vectorLayer.addFeatures(myCreateMarker(car + "<br>"+addr, mlon, mlat));
    if(hardwiredDefaultCenter) {
        mySetCenter(defaultlon, defaultlat, defaultZoom)
    }
    else if (index==0){ // Sets the center of the map to the position of the first available car.
        mySetCenter(mlon, mlat, defaultZoom)
    }
    //$newdiv.append($tmpel)
});
}

// Define markers as "features" of the vector layer:
function myCreateMarker(desc, lon, lat)
{
    var feature = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lon, lat).transform(epsg4326, projectTo),
            {description:desc} ,
            {externalGraphic: markerURL, graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
        );    
    return feature;
}

function mySetCenter (lon, lat, zoom)
{
    var lonLat = new OpenLayers.LonLat( lon ,lat).transform(epsg4326, projectTo);
    map.setCenter (lonLat, zoom);
}
function createPopup(feature) {
      feature.popup = new OpenLayers.Popup.FramedCloud("pop",
          feature.geometry.getBounds().getCenterLonLat(),
          null,
          '<div>'+feature.attributes.description+'</div>',
          null,
          true,
          function() { controls['selector'].unselectAll(); }
      );
      //feature.popup.closeOnMove = true;
      map.addPopup(feature.popup);
    }

    function destroyPopup(feature) {
      feature.popup.destroy();
      feature.popup = null;
    }

function showHide()
{
    $("#mapdiv").css("visibility", "hidden")
    $("#mapdiv").css("height","50px")
}

function useCarToCenterEvent()
{
    hardwiredDefaultCenter = 0;
    refreshMap();
}
function goToCityEvent()
{
   cityval = $("#citySelect").children(":selected").text()
   /// $("#citySelect").after("<span>"+cityval+"</span>")
   
    switch($.trim(cityval))
    {
        case "Brno":
            defaultlon = 16.60; // Brno - longitude
            defaultlat = 49.19; // Brno - latitude
            break;
        case "Praha":
            defaultlon = 14.4;
            defaultlat = 50.1;
            break;
        case "Ostrava":
            defaultlon = 18.3;
            defaultlat = 49.8;
            break;
        case "Plzeň":
            defaultlon = 13.4;
            defaultlat = 49.7;
            break;
        case "Liberec":
            defaultlon = 15.0;
            defaultlat = 50.76;
            break;
        default: 
            defaultlon = 16.60; // Brno - longitude
            defaultlat = 49.19; // Brno - latitude
            break;
        }
    hardwiredDefaultCenter = 1;
    refreshMap();
}
