var L = require('leaflet/dist/leaflet-src');
require('torque.js');

function init(map, page) {
     // define the torque layer style using cartocss
      var CARTOCSS = [
           'Map {',
        '-torque-frame-count:64;',
        '-torque-animation-duration:120;',
        '-torque-time-attribute:"datetime";',
        '-torque-aggregation-function:"count(cartodb_id)";',
        '-torque-resolution:8;',
        '-torque-data-aggregation:linear;',
        '}',
        '#layer{',
        '  image-filters: colorize-alpha(blue, cyan, lightgreen, yellow , orange, red);',
        '  marker-file: url(http://s3.amazonaws.com/com.cartodb.assets.static/alphamarker.png);',
        '  marker-fill-opacity: 0.4*[value];',
        '  marker-width: 35;',
        '}',
        '#layer[frame-offset=1] {',
        ' marker-width:37;',
        ' marker-fill-opacity:0.2; ',
        '}',
        '#layer[frame-offset=2] {',
        ' marker-width:39;',
        ' marker-fill-opacity:0.1; ',
        '}',
        '#layer[frame-offset=3] {',
        ' marker-width:41;',
        ' marker-fill-opacity:0.06666666666666667; ',
        '}'
      ].join('\n');

        
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
        cartocss: CARTOCSS
      });
      torqueLayer.addTo(map.map);
      torqueLayer.play()
  
}

export default init;