/**
 * Logic related to creating predefined simulators (simulated vehicles).
 */

async function initializeSimulators () {
//  var id = 'sim_1' + makeid(6)
//  await createSimulator({
//    id: id,
//    driverName: Routes.TexasTesting.driverName,
//    route: Routes.TexasTesting,
//    description: Routes.TexasTesting.description,
//    lat: Routes.TexasTesting.startLat,
//    long: Routes.TexasTesting.startLong
//  }).then(webWorker => {
//    vehicles[id].worker = webWorker
//  })

  var id = 'sim_2' + makeid(6)
  await createSimulator({
    id: id,
    driverName: Routes.WashingtonDC.driverName,
    route: Routes.WashingtonDC,
    description: Routes.WashingtonDC.description,
    lat: Routes.WashingtonDC.startLat,
    long: Routes.WashingtonDC.startLong
  }).then(webWorker => {
    vehicles[id].worker = webWorker
  })

}

async function createSimulator (args) {
  var simulatorTask = new Worker('./js/simulation/worker_vehiclesim.js')

  var deviceId = args.id
  var driverName = args.driverName
  if (!vehicles[deviceId]) {
    vehicles[deviceId] = {
      selected: false,
      channelName: 'vehicle.' + args.id,
      driverName: driverName,
      tachometer: 0,
      currentStop: '',
      nextStop: '',
      vehicleStatus: '',
      lat: args.lat,
      long: args.long,
      route: args.route,
      mapMarker: null,
      nextDestinationMarker: null,
      deliveryPath: null
    }
  }

  addRoute(deviceId, args.description)

  simulatorTask.postMessage({
    action: 'init',
    params: {
      id: args.id,
      driverName: args.driverName,
      route: args.route,
      lat: args.lat,
      long: args.long,
      sub: subscribe_key,
      pub: publish_key
    }
  })
}
