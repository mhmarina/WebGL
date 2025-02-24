var cubeVertices = []
var colors = []
var modelViewLoc
var arrayOfTheta = []
var arrayOfVector = []
var speed = 0.05


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

    //
    modelViewLoc = gl.getUniformLocation(program, "vModelView")

    for(var i = 0; i < 11; i++){
        var mvVector = [0,0,0]
        mvVector[0] = Math.random() * 2 - 1
        mvVector[1] = Math.random() * 2 - 1
        mvVector = normalize(mvVector)

        arrayOfTheta.push(0)
        arrayOfVector.push(mvVector)
    }
    // instantiate
    render()
}

function render(){

    gl.clear( gl.COLOR_BUFFER_BIT );

    // draw the center prototype:
    // which does not move or rotate 
    var scale = mat4(
        0.25, 0, 0, 0,
        0, 0.25, 0, 0,
        0, 0, 0.25, 0,
        0, 0, 0, 1
    );
    var model = mat4()
    var modelView = flatten(mult(scale, model))

    gl.uniformMatrix4fv(modelViewLoc, false, modelView)
    gl.drawArrays(gl.TRIANGLES, 0, 100)

    for(var i = 1; i < 11; i++){
        arrayOfTheta[i] += 5;
        arrayOfVector[i][0] += (arrayOfVector[i][0] < 0 ? -1 : 1) * speed
        arrayOfVector[i][1] += (arrayOfVector[i][1] < 0 ? -1 : 1) * speed

        var copyOfVector = arrayOfVector[i].slice()
        model = mult(translate(copyOfVector), rotate(arrayOfTheta[i], copyOfVector))
        model = mult(model, translate(negate(copyOfVector)))

        modelView = flatten(mult(scale, model))
        gl.uniformMatrix4fv(modelViewLoc, false, modelView)

        gl.drawArrays(gl.TRIANGLES, 0, 50)
    }
    requestAnimationFrame(render)
}