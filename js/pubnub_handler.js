/**
 * Main entry point for communication coming from PubNub
 * The internal state of the application is managed by the 'vehicles' object.
 * This is designed to show the principle of what a delivery app with PubNub would look like - obviously storing these objects as part of the client app state does not lend itself to multiple clients viewing the same simulated device(!).  PubNub Objects would be a good approach to managing your devices on the server.
 */

var pubnub = null
var vehicles = null
var selectedId = null

async function onload () {
  changeTheme()
  vehicles = {}
  if (!testPubNubKeys()) {
    document.getElementById('noKeysAlert').style.display = 'block'
  } else {
    pubnub = createPubNubObject()

    await pubnub.addListener({
      //  Status events
      status: async statusEvent => {
        //  Channel subscription is now complete, pre-populate with simulators.
        if (statusEvent.affectedChannels[0] === 'vehicle.*') {
          initializeSimulators()
        }
      },
      message: async payload => {
        //console.log(payload.message)
        if (typeof payload.message.question !== 'undefined') {
          return
        }
        if (typeof payload.message.answer !== 'undefined') {
          //  One of the vehicles has answered our question
          document.getElementById('sendMessageModalResponseTxt').innerHTML =
            payload.message.answer
          $('#sendMessageModalResponse')
            .fadeTo(3000, 500)
            .slideUp(500, function () {
              $('#sendMessageModalResponse').slideUp(5000)
            })
          return
        }
        //  When we receive a message from the vehicle, assume we have reached our destination
        vehicles[payload.publisher].tachometer = 0
        vehicles[payload.publisher].lat = payload.message.lat
        vehicles[payload.publisher].long = payload.message.long
        ;(vehicles[payload.publisher].routeName = payload.message.routeName),
          (vehicles[payload.publisher].driverName = payload.message.driverName)
        vehicles[payload.publisher].currentStop = payload.message.currentStop
        vehicles[payload.publisher].nextStop = payload.message.nextStop
        vehicles[payload.publisher].vehicleStatus =
          payload.message.vehicleStatus
        vehicles[payload.publisher].distanceToNextDestination =
          payload.message.routeCoords.length
        moveMapMarker(payload.publisher, populateVehicleInformationTable)
        setNextDestinationMarker(payload.publisher, payload.message.routeCoords)
        toggleBounce(
          payload.publisher,
          payload.message.vehicleStatus == 'Stopped'
        )

        if (vehicles[payload.publisher].selected)
          populateVehicleInformationTable(payload.publisher, false)
        drawNextDeliveryPath(payload.publisher, payload.message.routeCoords)
      },
      signal: async payload => {
        //console.log(payload)
        //  When we receive a signal from the vehicle, its position has changed
        vehicles[payload.publisher].tachometer++
        vehicles[payload.publisher].lat = payload.message.lat
        vehicles[payload.publisher].long = payload.message.long

        moveMapMarker(payload.publisher, populateVehicleInformationTable)
        if (vehicles[payload.publisher].selected)
          populateVehicleInformationTable(payload.publisher, false)
      }
    })

    //  Wildcard subscribe, to listen for all devices in a scalable manner
    pubnub.subscribe({
      channels: ['vehicle.*'],
      withPresence: true
    })
  }
}
