// Marina Nasralla
// 4/9/25

points = []
indices = []

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
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

// orthobox
var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

function SOR(x){return Math.sin(x) + (1/2)*Math.sin(6*x)}
function Cylinder(x){return 1}

// f is a function
function generatePoints(f, a, b, stepT, stepTheta){
    points = []
    if(a > b){
        temp = a
        a = b
        b = temp
    }

    // build object from bottom to top
    // the first "stepTheta" points build the bottom most circle (at t = -1)
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

// triangulation
function generateIndices(stepTheta){
    numSteps = radians(360) / stepTheta
    console.log(points.length-numSteps)
    for(i = 0; i < points.length - numSteps; i++){
        indices.push(i)
        indices.push(i+numSteps)
        indices.push(i+numSteps+1)
    }
    for(i = 0; i < points.length - numSteps-1; i++){
        indices.push(i)
        indices.push(i+1)
        indices.push(i+1+numSteps)
    }
    console.log(indices)
}

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
    generateIndices(radians(20))

    // elements buffer
    var iBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(indices)), gl.STATIC_DRAW);

    var vBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)
    
    var vPosition = gl.getAttribLocation( program, "vPosition")
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    // gl.drawArrays(gl.LINE_LOOP, 0, points.length);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
    // TODO: use draw elements
    // example: cubev -- cuberotating tris elements
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimFrame(render);
}
