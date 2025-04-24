var canvas
var gl
var program

var projectionMatrix 
var modelViewMatrix
var instanceMatrix
var modelViewMatrixLoc
var colorLoc

var vBuffer
var modelViewLoc

var pointsArray = []
var stack = []
var figure = []

// these vertices make up a prototype cube
// which will be transformed into the various elements of the object..
var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
]

// Identify every component 
// in minecraft dog
var chestID = 0 // this will be my root
var buttID = 1
var rightFrontLegID = 2
var leftFrontLegID = 3
var rightBackLegID = 4
var leftBackLegID = 5
var headID = 6
var snoutID = 7
var rightEarID = 8
var leftEarID = 9
var rightEyeID = 10
var leftEyeID = 11
var tailID = 12
var noseID = 13

var numNodes = 14

// dimesions and such I guess
var chestHeight = 2
var buttHeight = 1.6
var chestWidth = 2.5
var buttWidth = 2.8
var tailHeight = 1
var legHeight = 1.75
var legWidth = 0.5
var earHeight = 0.5
var earDepth = 0.5 // also equal to leg depth
var objectDepth = 2
var snoutHeight = 1
var snoutWidth = 1.3
var snoutDepth = 1.2
var headWidth = 1.2
var eyeDepth = 0.3

// rotations I guess reflect where the fixed points are
// the angles are relative to their parents
var theta = [10, 320, 180, 180, 130, 130, 0, 0, 0, 0, 0, 0, 330]

// helper functions
function scale4(a, b, c) {
    var result = mat4()
    result[0][0] = a
    result[1][1] = b
    result[2][2] = c
    return result
 }

 // node contains world transform matrix for instance, render function
 // one sibling and one child, or I guess we can store an array of children
 // in OG example, the torso has 4 children (2 arms, 2 legs, I wonder how theyre stored)
 function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node
}

function initNodes(ID){
    // initial modelview matrix
    var m = mat4()
    switch(ID){
        case(chestID):
            // rotate(angle, theta)
            m = rotate(theta[ID], 0, 1, 0)
            figure[ID] = createNode( m, chest, null, buttID)
            break
        case(buttID):
            m = translate(chestWidth+0.15, -(chestHeight/2 - buttHeight/2), 0)
            m = mult(m, translate(-0.5, -0.6, 0)) // sitting down pose
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, butt, headID, tailID)
            break
        case(tailID):
            m = translate((buttWidth/2+legWidth/2), 1, objectDepth/3-legWidth-0.13)
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, tail, rightBackLegID, null)
            break
        case(rightFrontLegID):
            m = translate(-chestWidth/2 + legWidth, -legHeight, -earDepth+objectDepth/2)
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, leg, leftFrontLegID, null)
            break
        case(leftFrontLegID):
            m = translate(-chestWidth/2 + legWidth, -legHeight, -earDepth)
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, leg, null, null)
            break
        case(rightBackLegID):
            m = translate(buttWidth/2-legWidth-0.4, -buttHeight, -earDepth+objectDepth/2)
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, leg, leftBackLegID, null)
            break
        case(leftBackLegID):
            m = translate(buttWidth/2-legWidth-0.4, -buttHeight, -earDepth)
            m = mult(m, rotate(theta[ID], 0, 0, 1))
            figure[ID] = createNode(m, leg, null, null)
            break
        case(headID):
            m = translate(-chestWidth/2-headWidth/2, 0, 0)
            m = mult(m, rotate(theta[ID], 0, 1, 0))
            figure[ID] = createNode(m, head, rightFrontLegID, snoutID)
            break
        case(snoutID):
            m = translate(-headWidth, -(chestHeight/2-snoutHeight/2), -(objectDepth/2-snoutDepth/2)+((objectDepth-snoutDepth)/2))
            figure[ID] = createNode(m, snout, rightEarID, noseID)
            break
        case(rightEarID):
            m = translate(0, chestHeight/2+earHeight/2, earDepth-objectDepth/2)
            m = mult(m, rotate(theta[ID], 1, 0, 0))
            figure[ID] = createNode(m, ear, leftEarID, null)
            break
        case(leftEarID):
            m = translate(0, chestHeight/2+earHeight/2, earDepth)
            m = mult(m, rotate(theta[ID], 1, 0, 0))
            figure[ID] = createNode(m, ear, rightEyeID, null)
            break
        case(rightEyeID):
            m = translate(eyeDepth-headWidth+0.2, 0.35, -objectDepth/2+0.6)
            figure[ID] = createNode(m, eye, leftEyeID, null)
            break
        case(leftEyeID):
            m = translate(eyeDepth-headWidth+0.2, 0.35, objectDepth/2-0.6)
            figure[ID] = createNode(m, eye, null, null)
            break
        case(noseID):
            m = translate(-snoutWidth+eyeDepth+0.3, 0.2, 0)
            figure[ID] = createNode(m, eye, null, null)
            break
    }
}

function traverse(ID) {
    stack.push(modelViewMatrix)
    modelViewMatrix = mult(modelViewMatrix, figure[ID].transform)
    figure[ID].render()

    if(figure[ID].child != null){
        traverse(figure[ID].child) 
        modelViewMatrix = stack.pop()
    } 

    if(figure[ID].sibling != null){
        modelViewMatrix = stack.pop()
        traverse(figure[ID].sibling)
    }
 } 

 // helper
function drawCube(){
    for(var i=0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

// render functions for each instance type
function chest(){
    instanceMatrix = mult(modelViewMatrix, scale4(chestWidth, chestHeight, objectDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.9, 0.74, 0.78, 1)));
    drawCube()
}

function butt(){
    instanceMatrix = mult(modelViewMatrix, scale4(buttWidth, buttHeight, objectDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.94, 1, 0.88, 1)));
    drawCube()
}

function tail(){
    instanceMatrix = mult(modelViewMatrix, scale4(legWidth, tailHeight, earDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.83, 0.74, 0.76, 1)));
    drawCube()
}

function leg(){
    instanceMatrix = mult(modelViewMatrix, scale4(legWidth, legHeight, earDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.83, 0.74, 0.76, 1)));
    drawCube()
}

function head(){
    instanceMatrix = mult(modelViewMatrix, scale4(headWidth, chestHeight, objectDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.92, 1, 0.882, 1)));
    drawCube()
}

function snout(){
    instanceMatrix = mult(modelViewMatrix, scale4(snoutWidth, snoutHeight, snoutDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(1, 0.79, 0.69, 1)));
    drawCube()
}

function ear(){
    instanceMatrix = mult(modelViewMatrix, scale4(headWidth/3, earHeight, earDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0.94, 0.86, 0.88, 1)));
    drawCube()
}
function eye(){
    instanceMatrix = mult(modelViewMatrix, scale4(eyeDepth, eyeDepth, eyeDepth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
	gl.uniform4fv(colorLoc, flatten(vec4(0, 0, 0, 1)));
    drawCube()
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]) 
    pointsArray.push(vertices[b]) 
    pointsArray.push(vertices[c])     
    pointsArray.push(vertices[d])    
}

function cube()
{
   quad( 1, 0, 3, 2 )
   quad( 2, 3, 7, 6 )
   quad( 3, 0, 4, 7 )
   quad( 6, 5, 1, 2 )
   quad( 4, 5, 6, 7 )
   quad( 5, 4, 0, 1 )
}

window.onload = function init() {
   canvas = document.getElementById( "gl-canvas" )
   gl = WebGLUtils.setupWebGL( canvas )
   if ( !gl ) { alert( "WebGL isn't available" ) }
   
   gl.viewport( 0, 0, canvas.width, canvas.height )
   gl.clearColor( 0, 0.3, 0, 1.0 )
   gl.enable(gl.DEPTH_TEST)
   program = initShaders( gl, "vertex-shader", "fragment-shader")
   gl.useProgram( program)

   instanceMatrix = mat4()
   projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0)
   modelViewMatrix = mat4()
   modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) )
   gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) )
   colorLoc = gl.getUniformLocation(program, "color")
   gl.uniform4fv(colorLoc, flatten(new vec4(0.9, 0.74, 0.78, 1)) )

   // create cube prototype
   // pushed to points array
   cube()
   vBuffer = gl.createBuffer()
   gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer )
   gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)
   
   var vPosition = gl.getAttribLocation( program, "vPosition" )
   gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 )
   gl.enableVertexAttribArray( vPosition )

   // initialize all nodes
   for(i=0; i<numNodes; i++) {
    initNodes(i)
   }
   render()
}


function render() {
       gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    //    modelViewMatrix = mat4()
       traverse(chestID)
       console.log(stack)
       requestAnimFrame(render)
}