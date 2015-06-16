var L = require('leaflet/dist/leaflet-src');
require('torque.js');

let initialized;

function init(map, page) {
    page.on('scrollblock:enter', (block) => {
        console.log('enter');
        if (block.data.torque && !initialized) initTorque(map.map);
    });

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
        cartocss   : cartoCss
    });
    torqueLayer.addTo(map);

    torqueLayer.on('load', c => {
        console.log('loade');
    });
}

function updateTorque(r) {
    let s = Math.floor(r * totalSteps);
    torqueLayer.setStep(s);
    // torqueLayer.stop()
}

export default init;