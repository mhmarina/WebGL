// Marina Nasralla
// 4/9/25

function SOR(x){return Math.sin(x) + (1/2)*Math.sin(6*x)}
function Cylinder(x){return 1}

points = []
R = rotateY()
var program
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};


var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;


// f is a function
function generatePoints(f, a, b, stepT, stepTheta){
    points = []
    if(a > b){
        temp = a
        a = b
        b = temp
    }
    for(t = a; t <= b; t += stepT){
        for(theta = 0; theta <= radians(360); theta += stepTheta){
            // rotate about y
            // we know that z is 0 in f(t) so we'll just use the x component
            x = f(t) * Math.cos(theta)
            y = t
            z = f(t) * -Math.sin(theta)
            points.push(vec3(x,y,z))
        }
    }
}

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    resetBuffer(Cylinder)
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );


    // UI
    shapeSel = document.getElementById("shape-select")
    shapeSel.addEventListener('change', () =>{
        let fn
        if(shapeSel.value == "Cylinder"){fn = Cylinder}
        else{fn = SOR}
        resetBuffer(fn)
    })

	mouseControls();
    render()
}

// I want to reset all buffers when changing shapes 
function resetBuffer(fn){
    generatePoints(fn, -1, 1, 0.05, radians(20))

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // gl.drawArrays(gl.LINE_LOOP, 0, points.length);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
    // gl.drawArrays(gl.POINTS, 0, points.length);

    window.requestAnimFrame(render);
}
