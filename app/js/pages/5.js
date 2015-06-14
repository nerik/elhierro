

let camera, scene, meshContainer, mesh, renderer;
let targetRotation = 0;
let targetRotationOnMouseDown = 0;
let mouseXOnMouseDown, mouseX;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let meshScale = 2000;
let meshScaleAlt = .02;
let currentScale = 1;

let colorStops = [
    {
        r:0,
        c: new THREE.Color(0xa5e071)
    },
    {
        r: .25,
        c: new THREE.Color(0xa5e071) 
    },
    {
        r: .6,
        c: new THREE.Color(0xf2be20)  
    },
    {
        r: 1,
        c: new THREE.Color(0xa3835d)  
    }
];

let initialized;



function init(map, page) {
    let gps = map.getGPS('2_para');

    page.on('scrollblock:enter', (block) => {
        if (block.data.three && !initialized) initThree(gps, block.el[0]);
    });
}

function initThree(gps, el) {

    initialized = true;
    // $('body').addClass('isModalOpen');

    let width = window.innerWidth;
    let height = window.innerHeight;
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 1000 );;

    var currentCamDistance = 50;
    camera.position.y = currentCamDistance/2;
    camera.position.x = currentCamDistance;
    camera.position.z = currentCamDistance;

    camera.lookAt( new THREE.Vector3(0,0,0))

    scene = new THREE.Scene();

    buildScene(gps.coords);

        setScale(currentScale);

    renderer = new THREE.WebGLRenderer({ antialias: true/*, alpha:true*/ });
    renderer.setClearColor(0x2c4164)
    renderer.setSize( window.innerWidth, window.innerHeight );

    el.appendChild( renderer.domElement );

    // map.map.on('click', function  (e) {
    //     $('body').addClass('isModalOpen');
    // });



    initEvents();

    animate();
}

function buildScene(gpsCoords) {


    let splineCoords = [];
    let g, lat, lon, alt, v, x, z, y;

    // var latMin =  Number.POSITIVE_INFINITY;
    // var lonMin =  Number.POSITIVE_INFINITY;
    // var latMax =  Number.NEGATIVE_INFINITY;
    // var lonMax =  Number.NEGATIVE_INFINITY;
    // var altMax = Number.NEGATIVE_INFINITY;
    // var altMin = Number.POSITIVE_INFINITY;

    let latMin = 27.732765;
    let latMax = 27.772151;
    let lonMin = -18.033666;
    let lonMax = -17.981946;
    let latAmp = 0.039386000000000365;
    let lonAmp = 0.051719999999999544;
    let altMin = 231;
    let altMax = 1345;
    let altAmp = 1114;

    for (var i = 0; i < gpsCoords.length; i++) {
        
        g = gpsCoords[i];
        lat = g[0];
        lon = g[1];
        alt = g[2];

        // if (lat<latMin) latMin = lat;
        // if (lon<lonMin) lonMin = lon;
        // if (lat>latMax) latMax = lat;
        // if (lon>lonMax) lonMax = lon;
        // if (alt<altMin) altMin = alt;
        // if (alt>altMax) altMax = alt;

        x = -(lon - lonMin)*meshScale;
        z = (lat - latMin)*meshScale;
        y = (alt- altMin)*meshScaleAlt;

        v = new THREE.Vector3(
            x,
            y,
            z
            );
        splineCoords.push(v);
    };

    console.log(altMin, altMax)

    let spline = new THREE.SplineCurve3(splineCoords);

    //                                    path, segments, radius, radiusSegments, closed
    let geometry = new THREE.TubeGeometry(spline, 1000, .2, 10, false);

    //vertex colors
    let faceIndices = [ 'a', 'b', 'c', 'd' ];
    let f, f2, f3, p, n, vertexIndex;
    // color = new THREE.Color( Math.random()*0xffffff );

    var yMax = altAmp * meshScaleAlt;
    //tint using vertex colors
    for ( let i = 0; i < geometry.faces.length; i ++ ) {

        f  = geometry.faces[ i ];

        n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        

        for( let j = 0; j < n; j++ ) {

            vertexIndex = f[ faceIndices[ j ] ];

            p = geometry.vertices[ vertexIndex ];

            let r = Math.min(1, p.y/yMax);
            // r = .05 + (1-r)*.3;


            f.vertexColors[ j ] = getColorAt(r);

        }

    }

    let materials = [
        new THREE.MeshLambertMaterial( { color: 0xffffff, vertexColors: THREE.VertexColors } ),
        // new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
        // new THREE.MeshBasicMaterial( { color: 0x0, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    meshContainer = new THREE.Object3D();
    // meshContainer.position.x = -200;
    scene.add( meshContainer );


    mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    mesh.position.x = (lonAmp/2)*meshScale;
    mesh.position.z = -(latAmp/2)*meshScale;
    // mesh.scale.set( scale, scale, scale );

    meshContainer.add( mesh );

    var light = new THREE.PointLight( 0xffffff, 1, 300 );
    light.position.set( 0, 15, 0 );
    scene.add( light );

    var light2 = new THREE.AmbientLight( 0x909090 ); // soft white light
    scene.add( light2 );

    scene.add(new THREE.AxisHelper(100));
    scene.add(new THREE.GridHelper(1000,100));

}

function getColorAt(r) {
    let startColor, endColor, startR, endR;
    for (let i = 0; i < 3; i++) {
        if (r <= colorStops[i+1].r) {
            startColor = colorStops[i].c.clone();
            endColor = colorStops[i+1].c;
            startR = colorStops[i].r;
            endR = colorStops[i+1].r;
            break;
        }
    };    

    let finalR = (r - startR)/(endR - startR);

    return startColor.lerp( endColor, finalR );    
}


function setScale(dist) {

    meshContainer.scale.set( dist, dist, dist );
}

function initEvents() {
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    // renderer.domElement.addEventListener( 'wheel', onDocumentMouseWheel, false );
}

function onDocumentMouseDown(event) {

    event.preventDefault();

    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    renderer.domElement.addEventListener( 'mouseout', onDocumentMouseOut, false );

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {
    clearEvents();
}

function onDocumentMouseOut(event) {
    clearEvents();
}

function onDocumentMouseWheel(event) {
    console.log(event.wheelDelta);
    setScale(currentScale += event.wheelDelta/100);

}

function clearEvents(event) {

    renderer.domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    renderer.domElement.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function animate() {
 
    requestAnimationFrame( animate.bind(this) );
    var d = ( targetRotation - meshContainer.rotation.y ) * 0.05;


    meshContainer.rotation.y += d;

    renderer.render( scene, camera );
}


export default init;

