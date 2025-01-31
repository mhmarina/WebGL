//
// simpleSquare.js
//
// Demonstration of a webgl program built with html and javascript.
// This program displays a square.
// Also needed: simpleSquare.html and the Common folder (and files)
//

// global variable for the drawing area and webgl context
var canvas;
var gl;

var justOne = 0;
 
// When all the files have been read, the window system call the init function that holds our program
// This is an example of an event listener/handler
window.onload = function init()
{
	// document is refering to the document object model (DOM)
	// This allows us to communicate with the HTML web page
	// We are creating a short name for the canvas/drawing space
    canvas = document.getElementById( "gl-canvas" );
    
	// set up to use webgl in the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	// webgl functions start with "gl." indicating that they belong to the canvas
	
	// Define part of canvas to draw to using viewport
    // Lower-left in canvas is (0,0) 
	// and grab width and height from HTML document
    gl.viewport( 0, 0, canvas.width, canvas.height);
	// Try this: divide the width and height in half
	
	// background color of canvas
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	//  Load shaders (defined in GLSL code in HTML file)
	// *** NITSHADERS USED TO LOAD, COMPILE AND LINK SHADERS TO FORM A
	// PROGRAM OBJECT
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	// We will use these shaders from now on
    gl.useProgram( program );
    
	
	// This is the best way to debug -- print to the browser console (F12 to open)
	//console.log("create vertices array");
	
	//  Create the square 
	//(The order of the vertices is a little unusual. Explained in render() function below)
	// To start, we will define coordinates within [-1,1] in x and y
	
	// *** Why does having only 2 vertices still let me draw a triangle????
	// first 8 vertices are octagon for head
	// 6 triangles, each coming out of the first point
	// *** how is this different from an svg polygon....???

	// ** triangles I want: 
	// (1,2,3)
	// (1,3,4)
	// (1,4,5)
	// (1,5,6)
	// (1,6,7)
	// (1,7,8)
    var vertices = [
        vec2(-0.5,-1), //1
		vec2(-1, -0.5), //2
        vec2(-1, 0.5), //3
		vec2(-0.5,-1),
		vec2(-1,0.5),
        vec2(-0.5, 1), //4
		vec2(-0.5,-1),
		vec2(-0.5, 1),
        vec2(0.5, 1), //5
		vec2(-0.5,-1),
		vec2(0.5,1),
        vec2(1, 0.5), //6
		vec2(-0.5,-1),
		vec2(1,0.5),
        vec2(1, -0.5), //7
		vec2(-0.5,-1),
		vec2(1,-0.5),
		vec2(0.5,-1), //8, end of octagon. 18 vertices
		vec2(-1,0.5), //start of hair
		vec2(-0.5, 1),
		vec2(-0.5,0.5), //10
		vec2(-0.5, 1),
		vec2(-0.5,0.5),
		vec2(0,1), // 9
		vec2(0,1),
		vec2(0.5, 1),
		vec2(0.5,0.5), // 11
		vec2(0.5,0.5),
		vec2(0.5, 1),
		vec2(1, 0.5), // end of hair (top), 12 vertices
		vec2(-1.5,0.5),
		vec2(-1,-0.5),
		vec2(-1,0.5), // left side hair
		vec2(1.5,0.5),
		vec2(1,-0.5),
		vec2(1,0.5), //right side hair // total hair: 18
		vec2(-0.75, 0.25), //12, //start of left eye
		vec2(-0.75, -0.25), //13
		vec2(-0.25, -0.25), //15
		vec2(-0.75, 0.25),
		vec2(-0.25, -0.25),
		vec2(-0.25, 0.25), // 14, end of left eye. 6 vertices
		vec2(0.75, 0.25), // right eye
		vec2(0.75, -0.25),
		vec2(0.25, -0.25), 
		vec2(0.75, 0.25),
		vec2(0.25, -0.25),
		vec2(0.25, 0.25),
		vec2(-0.25, -0.5), // mouth
		vec2(0.25, -0.5),
		vec2(0, -0.75)
    ];

	// I wanna set colors
	// the colors I need are:
	// skintone, black (hair,pupils,mouthline), green (iris), white (eye)

	// Do I have to define some attribute in the frag shader...???
	// 1 color for each vertex
	// first 18 vertices should be peach
	var colors = []
	for( let i = 0; i < 18; i++){
		colors.push(vec3(1,0.8,0.8));
	}
	for( let i = 0; i < 18; i++){
		colors.push(vec3(0,0,0));
	}
	for( let i = 0; i < 12; i++){
		colors.push(vec3(0.05,0.4,0.05))
	}
	for( let i = 0; i < 3; i++){
		colors.push(vec3(1,0.04,0.4))
	}
	colors = [].concat(...Array(11).fill(colors))

	// 11 copies of this shape so we should have
	// 11 * num vertices (51)
	vertices = [].concat(...Array(11).fill(vertices))
	vertices = vertices.map((e)=>[e[0]/6, e[1]/6])

	// TODO: *** Create array of centers for each object / instance
	const radius = 0.7;
	const angleStep = (2 * Math.PI) / 10;
	centerPoints = [
		vec2(0, 0) // Central point
	];
	for (let i = 0; i < 10; i++) {
		let angle = i * angleStep;
		centerPoints.push(vec2(radius * Math.cos(angle), radius * Math.sin(angle)));
	}

	// centers
	// these are i guess offsets for each vertex
	centers = []
	for(let i = 0; i < 11; i++){
		for(let j = 1; j <= 51; j++){
			centers.push(centerPoints[i])
		}
	}

	console.log("centers length: ", centers.length)
	console.log("vertices length: ", vertices.length)
	console.log("colors length: ", colors.length)
    
    // Load the data into the GPU
	// Create memory (buffer) to hold data -- here vertices
	// Bindbuffer identifies that "bufferId" is vertex information
	// Takes 2d vertices and flattens them into a 1d array
	// gl.STATIC_DRAW is an example of a webgl constant
	//    It means we intend to specify data once here and use repeatedly for webgl drawing
	//
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
	// Note that in the vertex shader, the vertex is called vPosition.
	// The var here is the same name to keep the association simple, but it is not necessary
	// 2d points being loaded
	//
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 ); //binds current buffer to attribute
    gl.enableVertexAttribArray( vPosition ); // turns on the generic vertex attribute array

	//do colors
	var colorBuffer	= gl.createBuffer() // create buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer) // bind color buffer (tell gl we're working with this one rn)
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW) // insert color data to buffer
	// associate shader variable with buffer
	var vColor = gl.getAttribLocation(program, "vColor")
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(vColor)

	//do centers
	var centerBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, centerBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, flatten(centers), gl.STATIC_DRAW)
	//associate ceneter var with buffer
	var vCenter = gl.getAttribLocation(program, "vCenter")
	gl.vertexAttribPointer(vCenter, 2, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(vCenter)

	// draw 
    justOne = 0;
	render();
	
    /* this is a little play to demo double buffering that occurs when call render -- revisit after doublebuffer ppt */
	/*
	console.log("displayed initially -- wait  and do again")
	setTimeout(function(){render();}, 5000);
	console.log("did it");
	*/
};


function render() {
	
	// clear the background
	// another example of a webgl constant - it is a bitmask
	// it will clear using the color defined in gl.clearColor
    
    gl.clear( gl.COLOR_BUFFER_BIT );

	// draw using vertices already loaded in the GPU 
	// here we draw two triangles 0,1,2 and 1,2,3
    
	// Draw octagon:
	// Use triangles
	//gl.drawArrays( gl.TRIANGLE_FAN, 0, 8); 
	// for each instance (excluding)
	// set uniforms (translation (vec2(x,y)), maybe theta)
	// *** send uniform attr to vertex  shader
	// *** for translation, rotation (theta)
	// *** Use for loop

	// draw triangles for prototype
	gl.drawArrays(gl.TRIANGLES, 0, 561) // center prot

	// NOTE: if we want to use one drawArrays call, we should
	// send the points to the gpu
	// 0 1 2 1 2 3
	//then call gl.drawArrays( gl.TRIANGLES, 0, 6 );
	// this is more like what you would really do
	
	// this is an option drawing also
	// a little tricky: 0,1,2 then 1,2,3
	//gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
	   
	// this method does not work with the vertex organization
	//gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

	// Not needed in this program -- this is needed for animation
    //window.requestAnimFrame(render);
}
