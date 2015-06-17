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

let torqueLayer;
let totalSteps = 92; 

function initTorque(map) {
    initialized = true;
  
    let cartoCss = require('./4.carto.css');

    torqueLayer = new L.TorqueLayer({
        user       : 'nerik',
        table      : 'terremotos_1',
        cartocss   : cartoCss,
        attribution: ['<a href="http://cartodb.com/attributions">CartoDB</a>','<a href="http://www.ign.es/">IGN España</a>'],
    });

    torqueLayer.addTo(map);
    $(torqueLayer._container).css('opacity','.5');

    torqueLayer.on('load', c => {
        console.log('loaded');
    });
}

function updateTorque(r) {
    let s = Math.floor(r * totalSteps);
    torqueLayer.setStep(s);
    // torqueLayer.stop()
}

export default init;