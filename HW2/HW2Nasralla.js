var cubeVertices = []
var colors = []
var thetaLoc;
var mvVecLoc;
var arrayOfTheta = []
var arrayOfVector = []

window.onload = function init () {
    // initialize webgl context
    canvas = document.getElementById("gl-canvas")
    gl = WebGLUtils.setupWebGL(canvas)
    if(!gl){ alert("WebGl is not available. :(")}
    gl.viewport( 0, 0, canvas.width, canvas.height);


    // initailiaze program (vertex and fragment shader) & use it
    var program = initShaders(gl, "vertex-shader", "fragment-shader")
    gl.useProgram(program)
    gl.enable(gl.DEPTH_TEST) // enable Z-buffer

    // call this function from CreateCube.js
    // this will populate our cubeVertices and colors arrays
    createCube()
    
    // create vertex buffer
    var vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW)
    var vPosition = gl.getAttribLocation(program, "vPosition")
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    // create color buffer
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    var vColor = gl.getAttribLocation(program, "vColor")
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vColor)

    //theta
    thetaLoc = gl.getUniformLocation(program, "theta")
    //movementVector
    mvVecLoc = gl.getUniformLocation(program, "mvVector")

    for(var i = 0; i < 11; i++){
        var mvVector = [0,0,0]
        mvVector[0] = Math.random() * 2 - 1
        mvVector[1] = Math.random() * 2 - 1
        mvVector = normalize(mvVector)

        arrayOfTheta.push([0,0,0])
        arrayOfVector.push(mvVector)
    }

    // instantiate
    render()
}

function render(){

    gl.clear( gl.COLOR_BUFFER_BIT );

    // draw the center prototype:
    // which does not move or rotate 
    gl.uniform3fv(thetaLoc, arrayOfTheta[0]);
    gl.uniform3fv(mvVecLoc, [0,0,0]);
    gl.drawArrays(gl.TRIANGLES, 0, 100)


    for(var i = 1; i < 10; i++){
        // TODO: make this more dynamic or random:
        arrayOfTheta[i][0] += 2.0

        // currently this is exponential
        // TODO: Figure out if this is okay
        arrayOfVector[i][0] *= 1.05
        arrayOfVector[i][1] *= 1.05
        gl.uniform3fv(thetaLoc, arrayOfTheta[i]);
        gl.uniform3fv(mvVecLoc, arrayOfVector[i]);
        gl.drawArrays(gl.TRIANGLES, 0, 100)
    }

    requestAnimationFrame(render)
}