// Marina Nasralla
var canvas
var gl
var program
var textureProgram

var projectionMatrix 
var modelViewMatrix
var instanceMatrix
var modelViewMatrixLoc
var colorLoc

var vBuffer
var modelViewLoc
var grassImage
var pixelsImage

var pointsArray = []
var stack = []
var figure = []
var texCoordsArray = []

var viewer = 
{
	eye: vec3(0.0, 0.0, 15),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
    radius: 15,
    theta: 0,
    phi: 0
};

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
var legHeight = 2
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
// with this butt translation: m = mult(m, translate(-0.5, -0.6, 0)) 
var theta = [0, 0, 210, 150, 210, 150, 0, 0, 0, 0, 0, 0, 310] // standing pose, tail to the right, first frame in walk cycle

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
 function createNode(transform, translate, rotate, render, sibling, child){
    var node = {
    transform: transform,
    translate: translate,
    rotate: rotate,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node
}

function initNodes(ID){
    // initial modelview matrix
    var m = mat4()
    var trans = mat4()
    var rot = mat4()
    switch(ID){
        case(chestID):
            // rotate(angle, theta)
            m = rotate(theta[ID], 0, 1, 0)
            figure[ID] = createNode( m, trans, m, chest, null, buttID)
            break
        case(buttID):
            trans = translate(chestWidth-0.15, -(chestHeight/2 - buttHeight/2), 0)
            rot = rotate(theta[ID], 0, 0, 1)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, butt, headID, tailID)
            break
        case(tailID):
            trans = translate((buttWidth/2+legWidth/2), 1, objectDepth/3-legWidth-0.13)
            rot = rotate(theta[ID], 0, 0, 1)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, tail, rightBackLegID, null)
            break
        case(rightFrontLegID):
            trans = translate(-chestWidth/2 + legWidth, -legHeight+0.5, -earDepth+objectDepth/2)
            rot = rotate(theta[ID], 0, 0, 1)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, leg, leftFrontLegID, null)
            break
        case(leftFrontLegID):
            trans = translate(-chestWidth/2 + legWidth, -legHeight+0.5, -earDepth)
            rot = rotate(theta[ID], 0, 0, 1)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, leg, null, null)
            break
        case(rightBackLegID):
            trans = translate(buttWidth/2-legWidth-0.4, -buttHeight+0.5, -earDepth+objectDepth/2)
            rot = rotate(theta[ID], 0, 0, 1)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, leg, leftBackLegID, null)
            break
        case(leftBackLegID):
            trans = translate(buttWidth/2-legWidth-0.4, -buttHeight+0.5, -earDepth)
            rot = rotate(theta[ID], 0, 0, 1)
            figure[ID] = createNode(m, trans, rot, leg, null, null)
            break
        case(headID):
            trans = translate(-chestWidth/2-headWidth/2, 0, 0)
            rot = rotate(theta[ID], 0, 1, 0)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, head, rightFrontLegID, snoutID)
            break
        case(snoutID):
            trans = translate(-headWidth, -(chestHeight/2-snoutHeight/2), -(objectDepth/2-snoutDepth/2)+((objectDepth-snoutDepth)/2))
            figure[ID] = createNode(trans, trans, rot, snout, rightEarID, noseID)
            break
        case(rightEarID):
            trans = translate(0, chestHeight/2+earHeight/2, earDepth-objectDepth/2)
            rot = rotate(theta[ID], 1, 0, 0)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, ear, leftEarID, null)
            break
        case(leftEarID):
            trans = translate(0, chestHeight/2+earHeight/2, earDepth)
            rot = rotate(theta[ID], 1, 0, 0)
            m = mult(trans, rot)
            figure[ID] = createNode(m, trans, rot, ear, rightEyeID, null)
            break
        case(rightEyeID):
            trans = translate(eyeDepth-headWidth+0.2, 0.35, -objectDepth/2+0.6)
            figure[ID] = createNode(trans, trans, rot, eye, leftEyeID, null)
            break
        case(leftEyeID):
            m = translate(eyeDepth-headWidth+0.2, 0.35, objectDepth/2-0.6)
            figure[ID] = createNode(m, m, rot, eye, null, null)
            break
        case(noseID):
            m = translate(-snoutWidth+eyeDepth+0.3, 0.2, 0)
            figure[ID] = createNode(m, m, rot, eye, null, null)
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
    instanceMatrix = mult(modelViewMatrix, scale4(buttWidth, buttHeight, objectDepth-0.1));
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

// time for some texture map action
var texCoord = [
    vec2(0, 0),
    vec2(0, 3),
    vec2(3,3),
    vec2(3, 0)
];

function configureTexture( myimage ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, myimage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function groundPlane(){
    var m = mult(modelViewMatrix, translate(0, -7.6, 0))
    m = mult(m, scale4(50,10,50))
    gl.uniformMatrix4fv(gl.getUniformLocation(textureProgram, "modelViewMatrix"), false, flatten(m))
    gl.uniform4fv(colorLoc, flatten(vec4(0.5, 1, 0, 1)));
    drawCube()
}

function quad(a, b, c, d) {
    pointsArray.push(vertices[a]) 
    texCoordsArray.push(texCoord[0])
    pointsArray.push(vertices[b]) 
    texCoordsArray.push(texCoord[1])
    pointsArray.push(vertices[c]) 
    texCoordsArray.push(texCoord[2])    
    pointsArray.push(vertices[d]) 
    texCoordsArray.push(texCoord[3])   
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
   gl.clearColor( 0.322, 0.69, 1, 1.0 )
   gl.enable(gl.DEPTH_TEST)
   textureProgram = initShaders( gl, "texturev-shader", "texturef-shader")
   program = initShaders( gl, "vertex-shader", "fragment-shader")
   gl.useProgram(program)

   instanceMatrix = mat4()
   projectionMatrix = perspective(45, 1.33, 0.01, 100)
   modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up)
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

   // texture program type shi
   gl.useProgram(textureProgram)
   var tBuffer = gl.createBuffer()
   gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer )
   gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW )
   
   var vTexCoord = gl.getAttribLocation( textureProgram, "vTexCoord" )
   gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 )
   gl.enableVertexAttribArray( vTexCoord )

   gl.uniformMatrix4fv(gl.getUniformLocation(textureProgram, "modelViewMatrix"), false, flatten(modelViewMatrix))
   gl.uniformMatrix4fv(gl.getUniformLocation(textureProgram, "projectionMatrix"), false, flatten(projectionMatrix))
   vBuffer = gl.createBuffer()
   gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer )
   gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)
   var vPosition = gl.getAttribLocation( textureProgram, "vPosition" )
   gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 )
   gl.enableVertexAttribArray( vPosition )
   gl.uniform4fv(gl.getUniformLocation(textureProgram, "color"), flatten(new vec4(0, 1, 0, 1)) )

   // initialize all nodes
   for(i=0; i<numNodes; i++) {
    initNodes(i)
   }

   // textures
    pixelsImage = new Image();
    pixelsImage.crossOrigin = "anonymous";
    pixelsImage.src = pixels_base64
    pixelsImage.onload = function() { 
        configureTexture( pixelsImage );
    } 

    grassImage = new Image();
    grassImage.crossOrigin = "anonymous";
    grassImage.src = grass_base64
    
   mouseControls()
   render()
}

const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
}

var kft = 0
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);

    // animation lol
    let swingAngle = -50 + (Math.sin(kft * Math.PI * 2) + 1) * 50;
    let rot = rotate(swingAngle, 0, 0, 1)
    let negRot = rotate(-swingAngle, 0, 0, 1)

    figure[leftBackLegID].transform = mult(figure[leftBackLegID].translate, rot)
    figure[leftFrontLegID].transform = mult(figure[leftFrontLegID].translate, rot)
    figure[rightBackLegID].transform = mult(figure[rightBackLegID].translate, negRot)
    figure[rightFrontLegID].transform = mult(figure[rightFrontLegID].translate, negRot)
    figure[tailID].transform = mult(figure[tailID].translate, rot)

    let headSwingAngle = -90 + (Math.sin(kft * Math.PI * 2) + 1) * 90;
    figure[headID].transform = mult(figure[headID].translate, rotate(headSwingAngle, 0, 1, 0))

    let bootySwingAngle = 0 + (Math.sin(kft * Math.PI * 2)+1) * -10
    figure[buttID].transform = mult(figure[buttID].translate, rotateZ(bootySwingAngle+1))
    
    gl.useProgram(textureProgram)
    modelViewMatrixLoc = gl.getUniformLocation(textureProgram, "modelViewMatrix")
    colorLoc = gl.getUniformLocation(textureProgram, "color")
    // set pixels texture here 
    traverse(chestID)
    stack = []

    //gl.useProgram(textureProgram)
    groundPlane()

    kft += 0.01
    if(kft >= 1){
        kft = 0
    }
    kft = clamp(kft, 0, 1)
    requestAnimFrame(render)
}
