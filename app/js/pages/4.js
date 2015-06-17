var L = require('leaflet/dist/leaflet-src');
require('torque.js');

let initialized;

function init(map, page) {
    initTorque(map.map);
    
    page.on('scrollblock:scroll', block => {
        if (block.data.torque) {
            updateTorque(block.r);
        }   
        
    });

}

let torqueLayers = {};
let totalSteps = 92; 

function initTorque(map) {
    initialized = true;
  
    torqueLayers.heatmap = new L.TorqueLayer({
        user       : 'nerik',
        table      : 'terremotos_1',
        cartocss   : require('./4_heatmap.carto.css'),
        attribution: ['<a href="http://cartodb.com/attributions">CartoDB</a>','<a href="http://www.ign.es/">IGN España</a>'],
    });
    torqueLayers.heatmap.addTo(map);
    $(torqueLayers.heatmap._container).css('opacity','.75');

    torqueLayers.mag = new L.TorqueLayer({
        user       : 'nerik',
        table      : 'terremotos_1_minmag',
        cartocss   : require('./4_mag.carto.css'),
    });
    torqueLayers.mag.addTo(map);

    // torqueLayers.depth = new L.TorqueLayer({
    //     user       : 'nerik',
    //     table      : 'terremotos_1_minmag',
    //     cartocss   : require('./4_depth.carto.css'),
    // });
    // torqueLayers.depth.addTo(map);



    var legend = new L.Control.TorqueLegend({
        position: 'bottomright',
    })
     
    legend.addTo(map)

}

function updateTorque(r) {
    let s = Math.floor(r * totalSteps);
    torqueLayers.heatmap.setStep(s);
    torqueLayers.mag.setStep(s);
    // torqueLayers.depth.setStep(s);
}

L.Control.TorqueLegend = L.Control.extend({
    onAdd: function (map) {
        var div = L.DomUtil.create('div');
        div.innerHTML = require('./4_legend.html');
        return div;
    }
});

export default init;