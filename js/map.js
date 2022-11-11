/**
 * Logic to handle drawing the map and the markers.
 */

//  Feel free to modify this to use your own key - see the ReadMe for more information
const GOOGLE_MAP_KEY = 'ENTER YOUR KEY HERE'
var map = null

const truck_svg = "M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM208 416c0 26.5-21.5 48-48 48s-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48zm272 48c-26.5 0-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48s-21.5 48-48 48z"
const taxi_svg = "M192 0c-17.7 0-32 14.3-32 32V64c0 .1 0 .1 0 .2c-38.6 2.2-72.3 27.3-85.2 64.1L39.6 228.8C16.4 238.4 0 261.3 0 288V432v48c0 17.7 14.3 32 32 32H64c17.7 0 32-14.3 32-32V432H416v48c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V432 288c0-26.7-16.4-49.6-39.6-59.2L437.2 128.3c-12.9-36.8-46.6-62-85.2-64.1c0-.1 0-.1 0-.2V32c0-17.7-14.3-32-32-32H192zM165.4 128H346.6c13.6 0 25.7 8.6 30.2 21.4L402.9 224H109.1l26.1-74.6c4.5-12.8 16.6-21.4 30.2-21.4zM96 352c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32zm352-32c0 17.7-14.3 32-32 32s-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32z"
const bike_svg = "M312 32c-13.3 0-24 10.7-24 24s10.7 24 24 24h25.7l34.6 64H222.9l-27.4-38C191 99.7 183.7 96 176 96H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h43.7l22.1 30.7-26.6 53.1c-10-2.5-20.5-3.8-31.2-3.8C57.3 224 0 281.3 0 352s57.3 128 128 128c65.3 0 119.1-48.9 127-112h49c8.5 0 16.3-4.5 20.7-11.8l84.8-143.5 21.7 40.1C402.4 276.3 384 312 384 352c0 70.7 57.3 128 128 128s128-57.3 128-128s-57.3-128-128-128c-13.5 0-26.5 2.1-38.7 6L375.4 48.8C369.8 38.4 359 32 347.2 32H312zM458.6 303.7l32.3 59.7c6.3 11.7 20.9 16 32.5 9.7s16-20.9 9.7-32.5l-32.3-59.7c3.6-.6 7.4-.9 11.2-.9c39.8 0 72 32.2 72 72s-32.2 72-72 72s-72-32.2-72-72c0-18.6 7-35.5 18.6-48.3zM133.2 368h65c-7.3 32.1-36 56-70.2 56c-39.8 0-72-32.2-72-72s32.2-72 72-72c1.7 0 3.4 .1 5.1 .2l-24.2 48.5c-9 18.1 4.1 39.4 24.3 39.4zm33.7-48l50.7-101.3 72.9 101.2-.1 .1H166.8zm90.6-128H365.9L317 274.8 257.4 192z"

var markerIcons = [
  truck_svg,
  taxi_svg,
  bike_svg
]

var initialize = function () {
  var myLatlng = new google.maps.LatLng(37.7749, 0.0)
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 2,
    minZoom: 2,
    center: myLatlng,
    streetViewControl: false
  })

}

function toggleBounce (deviceId, shouldBounce) {
  if (!shouldBounce) {
    if (vehicles[deviceId].marker.getAnimation() !== null)
    {
      vehicles[deviceId].marker.setAnimation(null)
    }
  } else {
    if (vehicles[deviceId].marker.getAnimation() === null)
    {
      vehicles[deviceId].marker.setAnimation(google.maps.Animation.BOUNCE)
    }
  }
}

function focusOnMarker (deviceId) {
  if (vehicles[deviceId].marker != null) {
    map.setZoom(13)
    map.setCenter(vehicles[deviceId].marker.getPosition())
  }

  populateVehicleInformationTable(deviceId)

}

function focusOnLatLong (latitude, longitude) {
  map.setZoom(13)
  map.setCenter({ lat: latitude, lng: longitude })
}

function moveMapMarker (deviceId, populateVehicleInformationTable) {
  
  var icon = {
    path: markerIcons[theme],
    fillColor: '#000000',
    fillOpacity: 0.9,
    strokeWeight: 0,
    scale:0.05,
    anchor: new google.maps.Point(250, 200)
  }
  var theAnimation = null
  if (vehicles[deviceId].marker == null)
    theAnimation = google.maps.Animation.DROP

  if (vehicles[deviceId].marker == null) {
    vehicles[deviceId].marker = new google.maps.Marker({
      map,
      custom_id: '123',
      draggable: false,
      animation: theAnimation,
      position: {
        lat: vehicles[deviceId].lat,
        lng: vehicles[deviceId].long
      },
      icon: icon,
      //label: {
      //  text: "Hello world!",
      //  color: "White",
      //  fontWeight: "bold",
      //  fontSize: "16px"
      //},
    })
    vehicles[deviceId].marker.addListener('click', () => {
      map.setZoom(13)
      map.setCenter(vehicles[deviceId].marker.getPosition())
      populateVehicleInformationTable(deviceId)
    })
  } else {
    //  Move the existing marker
    vehicles[deviceId].marker.setPosition({
      lat: vehicles[deviceId].lat,
      lng: vehicles[deviceId].long
    })
    //map.setCenter(vehicles[deviceId].marker.getPosition());
  }
}

function setMapIcons()
{
  var icon = {
    path: markerIcons[theme],
    fillColor: '#000000',
    fillOpacity: 0.9,
    strokeWeight: 0,
    scale:0.05,
    anchor: new google.maps.Point(250, 200)
  }
  for (var vehicle in vehicles) {
    vehicles[vehicle].marker.setIcon(icon);
  }
}

function setNextDestinationMarker(deviceId, deliveryPathCoords) {
  if (vehicles[deviceId].nextDestinationMarker == null) {
    vehicles[deviceId].nextDestinationMarker = new google.maps.Marker({
      map,
      draggable: false,
      position: {
        lat: deliveryPathCoords[deliveryPathCoords.length - 1].lat,
        lng: deliveryPathCoords[deliveryPathCoords.length - 1].lng      
      },
      //icon: nextDestinationIcon
    })
    vehicles[deviceId].nextDestinationMarker.addListener('click', () => {
      map.setZoom(13)
      map.setCenter(vehicles[deviceId].marker.getPosition())
      populateVehicleInformationTable(deviceId)
    })
  } else {
    //  Move existing next destination marker
    vehicles[deviceId].nextDestinationMarker.setPosition({
      lat: deliveryPathCoords[deliveryPathCoords.length - 1].lat,
      lng: deliveryPathCoords[deliveryPathCoords.length - 1].lng
    })
  }

}

function drawNextDeliveryPath(deviceId, deliveryPathCoords) {
  if (vehicles[deviceId].deliveryPath != null)
    vehicles[deviceId].deliveryPath.setMap(null);

    vehicles[deviceId].deliveryPath = new google.maps.Polyline({
      path: deliveryPathCoords,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    vehicles[deviceId].deliveryPath.setMap(map);
}


window.initialize = initialize
