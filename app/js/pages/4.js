var L = require('leaflet/dist/leaflet-src');
require('torque.js');

function init(map, page) {
     // define the torque layer style using cartocss
      var cartoCss = require('./4.carto.css');
        
      // var map = new L.Map('map', {
      //   zoomControl: true,
      //   center: [40, 0],
      //   zoom: 3
      // });

      // L.tileLayer('http://{s}.api.cartocdn.com/base-dark/{z}/{x}/{y}.png', {
      //   attribution: 'CartoDB'
      // }).addTo(map);

      var torqueLayer = new L.TorqueLayer({
        user       : 'nerik',
        table      : 'terremotos_1',
        cartocss   : cartoCss
      });
      torqueLayer.addTo(map.map);
      torqueLayer.play()
  
}

export default init;