var canvas

var cubeVertices = []
var colors = []
var modelViewLoc
var arrayOfTheta = []
var arrayOfVector = []
var speed = 0.01
var isMoving = true
kft = 0

// UI Variables
var scaleVal = 0.25
var numInstances = 10


window.onload = function init () {
    // initialize webgl context
    canvas = document.getElementById("gl-canvas")
    var numObjSlider = document.getElementById("numObj-slider")
    var scaleSlider = document.getElementById("scale-slider")

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
    initializeArrays()
    modelViewLoc = gl.getUniformLocation(program, "vModelView")

    // TODO: Figure out this shit
    canvas.addEventListener('click', (e) => toggleAnimation(e))
    numObjSlider.addEventListener('change', (e)=>{
        numInstances = numObjSlider.value
        initializeArrays()
    })
    // I would have to re-populate arrays for this
    scaleSlider.addEventListener('change', (e)=>{
        scaleVal = scaleSlider.value
    })

    // instantiate
    render()
}

function initializeArrays(){
    isMoving = false
    // populate vector and theta arrays
    for(var i = 0; i < numInstances; i++){
        // create a random vector for each instance
        var mvVector = [0,0,0]
        mvVector[0] = Math.random() * 5 - 3
        mvVector[1] = Math.random() * 3 - 2
        mvVector = normalize(mvVector)
        arrayOfTheta.push(0)
        arrayOfVector.push(mvVector)
    }
}

function toggleAnimation(e){
    // TODO: on click when all instances are off the screen,
    // reinstantiate them

    var clipCoord = mouseToClip(e.clientX, e.clientY)
    if(clipCoord.x >= -scaleVal && clipCoord.x <= scaleVal
        && clipCoord.y >= -scaleVal && clipCoord.y <= scaleVal
     ){
        isMoving = !isMoving
     }
}

// utility to convert from mouse to clip coordinates:
function mouseToClip(mouseX, mouseY){
    const rect = canvas.getBoundingClientRect();
    var x = ((mouseX - canvas.offsetLeft) - rect.width / 2) / (rect.width / 2)
    var y = (-(mouseY - canvas.offsetTop)  + rect.height / 2) / (rect.height / 2)
    return {x, y}
}

function render(){

    gl.clear( gl.COLOR_BUFFER_BIT ); 

    // draw the center prototype:
    // which does not move or rotate 
    // scale is constant
    // so is the center offset which would be proportional to scale
    scale = mat4(
       scaleVal, 0, 0, -scaleVal/2,
        0,scaleVal, 0, -scaleVal/2,
        0, 0,scaleVal, 0,
        0, 0, 0, 1
    )

    // this encapsulates my rotation and translation
    var model = mat4()
    var modelView = flatten(mult(scale, model))

    gl.uniformMatrix4fv(modelViewLoc, false, modelView)
    gl.drawArrays(gl.TRIANGLES, 0, 60)

    for(var i = 0; i < numInstances; i++){
        // increment theta and position vector
        if(isMoving){
            arrayOfTheta[i] += (speed * 360)/1.5;
            arrayOfVector[i][0] += ((arrayOfVector[i][0] < 0 ? -1 : 1) * speed)*2.5
            arrayOfVector[i][1] += ((arrayOfVector[i][1] < 0 ? -1 : 1) * speed)*2.5
        }
        // rotate about random vector
        var copyOfVector = arrayOfVector[i].slice()
        model = mult(translate(copyOfVector), rotate(arrayOfTheta[i], copyOfVector))
        model = mult(model, translate(negate(copyOfVector)))
        // set my modelview matrix and send it to GPU
        modelView = flatten(mult(scale, model))
        gl.uniformMatrix4fv(modelViewLoc, false, modelView)
        gl.drawArrays(gl.TRIANGLES, 0, 60)
    }    
    requestAnimationFrame(render)
}