/**
 * Functions update the data in the Routes and Vehicle Information tables.
 */

function populateVehicleInformationTable (deviceId, manuallyInvoked) {
  if (selectedId != null && deviceId != null) {
    vehicles[selectedId].selected = false
  }

  var currentStop = vehicles[deviceId].nextStop
  if (vehicles[deviceId].vehicleStatus === 'Stopped')
    currentStop = vehicles[deviceId].currentStop

  selectedId = deviceId
  if (deviceId != null) {
    vehicles[deviceId].selected = true
  }

  document.getElementById('selected-vehicle').innerHTML = 'Vehicle'
  document.getElementById('selected-driver-name').innerHTML =
    deviceId != null ? themedDeliveryPerson[theme] + ' Name: ' + vehicles[deviceId].driverName : ''
  document.getElementById('selected-last-delivery').innerHTML =
    deviceId != null ? themedCurrentLocation[theme] + currentStop : ''
  document.getElementById('selected-next-delivery').innerHTML =
    deviceId != null
      ? themedPreviousLocation[theme] + vehicles[deviceId].currentStop
      : ''
  var vehicleStatus =
    "<span class='badge rounded-pill custom-bubble'>" +
    vehicles[deviceId].vehicleStatus +
    '</span>'
  document.getElementById('selected-location').innerHTML =
    deviceId != null
      ? 'Vehicle Status: ' +
        vehicleStatus +
        ' [lat: ' +
        vehicles[deviceId].lat +
        ' / long: ' +
        vehicles[deviceId].long +
        ']'
      : ''
  var etaInMs =
    (vehicles[deviceId].distanceToNextDestination -
      vehicles[deviceId].tachometer -
      1) *
    simulationInterval

    var etaInMins = Math.floor(etaInMs/(60 * 1000));
    var etaInSecs = etaInMs >= 60000 ? Math.floor((etaInMs % (etaInMins * 60 * 1000)) / 1000) : Math.floor(etaInMs / 1000)
    var eta = etaInMins + 'm ' + etaInSecs + 's'

  if (vehicles[deviceId].vehicleStatus == 'Stopped') {
    eta = 'Vehicle is stopped'
  }
  document.getElementById('selected-estimated-arrival').innerHTML =
    deviceId != null ? 'Estimated Arrival: ' + eta : ''
}

function addRoute (deviceId, description) {
  var ul = document.getElementById('routesList')
  var li = document.createElement('li')
  li.setAttribute('class', 'list-group-item small cursor-hand')

  li.setAttribute('id', deviceId)
  li.innerHTML = routesRow(deviceId, li, description)
  ul.insertBefore(li, ul.firstChild)
}

function routesRow (deviceId, li, description) {
  var sendMessageIcon =
    "<span style='float:right;white-space:nowrap'><a href='javascript:messageDriver(\"" +
    deviceId +
    "\")' style='color:black'>Chat: <font size='+1'><i class='fa-regular fa-comments'></i></font></span>"
  var html = ''
  html += description + ' '
  html += sendMessageIcon + ''
  return html
}

function routesRow_click (e) {
  if (e !== null && e.target !== null && vehicles[e.target.id]) {
    populateVehicleInformationTable(e.target.id, true)
    focusOnMarker(e.target.id)
  }
}

var ul = document.getElementById('routesList')
ul.addEventListener('click', routesRow_click, true)

const radioTheme = document.getElementById('themePicker')
radioTheme.addEventListener('click', ({ target }) => {
  if (target.id == 'deliverPackages') theme = 0
  else if (target.id == 'deliverPeople') theme = 1
  else if (target.id == 'deliverFood') theme = 2
  changeTheme()
})

function changeTheme()
{
  setMapIcons()
  for (var vehicle in vehicles) {
    if (vehicles[vehicle].selected) {
      populateVehicleInformationTable(vehicle, false)
    }
  }
  document.getElementById('selected-name').innerHTML = themedRoutes[theme];
  //  todo make sure everything updates immediately
}
