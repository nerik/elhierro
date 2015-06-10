

let camera, scene, meshContainer, mesh, renderer;
let targetRotation = 0;
let targetRotationOnMouseDown = 0;
let mouseXOnMouseDown, mouseX;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let scale = 12;

function init(map) {
    var gps = map.updateGPS('2_para',1);
    console.log(gps);
    // return
    $('body').addClass('isModalOpen');

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();

    buildScene(gps.coords);

    renderer = new THREE.WebGLRenderer({ antialias: true/*, alpha:true*/ });
    renderer.setClearColor(0x2c4164)
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.getElementById('modal').appendChild( renderer.domElement );

    initEvents();

    animate();
}

function buildScene(gpsCoords) {
    let sampleClosedSpline = new THREE.ClosedSplineCurve3([
        new THREE.Vector3(-40,0, -40),
        new THREE.Vector3(40,20, -40),
        new THREE.Vector3(140,0, -40),
        new THREE.Vector3(40,50, 40),
        new THREE.Vector3(-40,0, 40),
    ]);

    let splineCoords = [];
    let g, lat, lon, alt, v, x, z, y;

    // var latMin =  Number.POSITIVE_INFINITY;
    // var lonMin =  Number.POSITIVE_INFINITY;
    // var latMax =  Number.NEGATIVE_INFINITY;
    // var lonMax =  Number.NEGATIVE_INFINITY;

    let latMin = 27.732765;
    let latMax = 27.772151;
    let lonMin = -18.033666;
    let lonMax = -17.981946;
    let latAmp = 0.039386000000000365;
    let lonAmp = 0.051719999999999544;

    for (var i = 0; i < gpsCoords.length; i++) {
        
        g = gpsCoords[i];
        lat = g[0];
        lon = g[1];
        alt = g[2];

        // if (lat<latMin) latMin = lat;
        // if (lon<lonMin) lonMin = lon;
        // if (lat>latMax) latMax = lat;
        // if (lon>lonMax) lonMax = lon;

        x = (lon - lonMin)*2000;
        z = (lat - latMin)*2000;
        y = (alt- 200)/50;

        v = new THREE.Vector3(
            x,
            y,
            z
            );
        splineCoords.push(v);
    };

    let spline = new THREE.ClosedSplineCurve3(splineCoords);

    meshContainer = new THREE.Object3D();
    scene.add( meshContainer );

    //                                    path, segments, radius, radiusSegments, closed
    let geometry = new THREE.TubeGeometry(spline, 500, .4, 4, false);

    let faceIndices = [ 'a', 'b', 'c', 'd' ];
    let color, f, f2, f3, p, n, vertexIndex;
    color = new THREE.Color( Math.random()*0xffffff );
    //tint using vertex colors
    for ( let i = 0; i < geometry.faces.length; i ++ ) {

        f  = geometry.faces[ i ];

        n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        

        for( let j = 0; j < n; j++ ) {

            vertexIndex = f[ faceIndices[ j ] ];

            p = geometry.vertices[ vertexIndex ];

            // color.setHSL( ( p.y / radius + 1 ) / 2, 1.0, 0.5 );

            f.vertexColors[ j ] = color;

        }

    }

    let materials = [
        new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
        new THREE.MeshBasicMaterial( { color: 0x00ff00, shading: THREE.FlatShading, wireframe: true, transparent: true } )
    ];

    // mesh = new THREE.Mesh(geometry, material);
    mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
    mesh.scale.set( scale, scale, scale );

    meshContainer.add( mesh );

}

function initEvents() {
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
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

function clearEvents(event) {

    renderer.domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    renderer.domElement.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function animate() {
 
    requestAnimationFrame( animate.bind(this) );

    meshContainer.rotation.y += ( targetRotation - meshContainer.rotation.y ) * 0.05;

    renderer.render( scene, camera );
}


export default init;

