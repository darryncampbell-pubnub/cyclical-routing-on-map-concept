const simulationInterval = 500;

//  Routes are stored in separate js files and loaded only by the web worker simulating that route.  The easiest way I could find to generate routes was to use https://www.gpsvisualizer.com/convert_input
const Routes = {
  TexasTesting: {
    description: 'Testing: Texas, USA',
    fileName: './routes/route_texas_testing.js',
    driverName: 'Simon Jones',
    startLat: 32.79406,
    startLong: -96.8145
  },
  WashingtonDC: {
    description: 'Washington DC, USA',
    fileName: './routes/route_washington_dc.js',
    driverName: 'Arthur Lowe',
    startLat: 38.887580000,
    startLong: -77.019910000
  }
}