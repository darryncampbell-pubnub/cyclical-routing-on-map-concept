/**
 * Web worker to represent a simulated vehicle.
 * Although the vehicle is simulated, all communication between the simulator and the dashboard is over the (external) PubNub network.
 */

if ('function' === typeof importScripts) {
  const window = null
  importScripts('https://cdn.pubnub.com/sdk/javascript/pubnub.7.2.0.min.js')
  importScripts('./simulator_types.js')
  importScripts('../theme.js')

  var vehicleChannelName
  var driverName
  var id
  var route
  var localPubNub
  var lat
  var long
  var tick = 0
  var idleTimer = 5

  onmessage = async function (args) {
    if (args.data.action === 'init') {
      id = args.data.params.id
      vehicleChannelName = 'vehicle.' + id
      driverName = args.data.params.driverName
      lat = args.data.params.lat
      long = args.data.params.long
      route = args.data.params.route
      if (route != null && route.fileName == '') route = null
      if (route != null) importScripts(route.fileName)

      var subKey = args.data.params.sub
      var pubKey = args.data.params.pub
      route = args.data.params.route
      localPubNub = new PubNub({
        publishKey: pubKey,
        subscribeKey: subKey,
        uuid: id,
        listenToBrowserNetworkEvents: false //  Allows us to call the PubNub SDK from a web worker
      })

      await localPubNub.addListener({
        status: async statusEvent => {},
        message: async payload =>
        {
          if (payload.publisher !== id)
          {
            localPubNub.publish({
              channel: vehicleChannelName,
              message: {
                answer: themedAnswers[payload.message.theme][payload.message.questionId]
              }
            });
            }

        }
      })

      await localPubNub.subscribe({
        channels: [vehicleChannelName],
        withPresence: false
      })

      vehicleSimulator = new VehicleSimulator(
        driverName,
        route,
        lat,
        long,
        simulationInterval
      )
      vehicleSimulator.start()
    }
  }

  class VehicleSimulator {
    interval
    intervalId
    constructor (driverName, route, latitude, longitude, simulationInterval) {
      this.interval = simulationInterval
      this.driverName = driverName
      this.route = route
      if (this.route != null && this.route.fileName == '') this.route = null

      this.latitude = latitude
      this.longitude = longitude
    }

    start () {
      this.publishMessage(
        localPubNub,
        vehicleChannelName,
        this.latitude,
        this.longitude,
        this.driverName
      )
      this.intervalId = setInterval(
        this.publishMessage,
        this.interval,
        localPubNub,
        vehicleChannelName,
        this.latitude,
        this.longitude,
        this.driverName
      )
    }

    stop () {
      clearInterval(this.intervalId)
    }

    toString () {
      return this.id + ' [' + this.latitude + ', ' + this.longitude + ']'
    }

    async publishMessage (
      localPubNub,
      channelName,
      latitude,
      longitude,
      driverName
    ) {
      var arrayIndex = tick % route_coords.coords.length
      var localLatitude = route_coords.coords[arrayIndex].lat
      var localLongitude = route_coords.coords[arrayIndex].long
      var currentStop = route_coords.coords[arrayIndex].stop
      var nextStop = route_coords.coords[arrayIndex].nextStop
      var nextStopIndex = route_coords.coords[arrayIndex].nextStopIndex
      var vehicleStatus = "Moving"

      if (typeof currentStop !== 'undefined') {
        //  We have made a stop
        //  Determine the route towards the next stop
        var routeCoords = []
        for (
          var i = arrayIndex;
          i % route_coords.coords.length != nextStopIndex;
          i++
        ) {
          routeCoords.push({
            lat: route_coords.coords[i].lat,
            lng: route_coords.coords[i].long
          })
        }

        //  Idle at the delivery location for a few seconds
        if (tick != 0) {
          if (idleTimer != 0) {
            tick--
            idleTimer--
            vehicleStatus = "Stopped"
          } else {
            idleTimer = 5
          }
        }

        await localPubNub.publish({
          channel: channelName,
          message: {
            lat: localLatitude,
            long: localLongitude,
            driverName: driverName,
            currentStop: currentStop,
            nextStop: nextStop,
            vehicleStatus: vehicleStatus,
            routeCoords: routeCoords
          }
        })
      } else {
        //  Send a signal if it is just a postional update
        await localPubNub.signal({
          channel: channelName,
          message: {
            lat: localLatitude,
            long: localLongitude
          }
        })
      }

      tick++
    }
  }
}
