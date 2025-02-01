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
var vCenter;
var centers;
var justOne = 0;
var theta = 0; //initialize object to not rotate
var deltaRadians = ( 2 * 3.149)/(24 * 60);
var vTheta;
 
// When all the files have been read, the window system call the init function that holds our program
// This is an example of an event listener/handler
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
	// set up to use webgl in the canvas
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
		
    gl.viewport( 0, 0, canvas.width, canvas.height);
	
	// background color of canvas
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
		
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

	var colors = [
		vec3(1,0.75,0.75),
		vec3(1,0.75,0.75),
		vec3(1,0.75,0.75), // 1
		vec3(1,0.8,0.8),
		vec3(1,0.8,0.8),
		vec3(1,0.8,0.8), //2
		vec3(1,0.9,0.8),
		vec3(1,0.9,0.8),
		vec3(1,0.9,0.8), //3
		vec3(0.9,0.9,0.7),
		vec3(0.9,0.9,0.7),
		vec3(0.9,0.9,0.7), //4
		vec3(1,0.6,0.5), 
		vec3(1,0.6,0.5), 
		vec3(1,0.6,0.5), //5
		vec3(0.95,0.3,0.4),
		vec3(0.95,0.3,0.4),
		vec3(0.95,0.3,0.4), //6 (face done)
		vec3(0.3,0.3,0.3),
		vec3(0.3,0.3,0.3),
		vec3(0.3,0.3,0.3), // 1
		vec3(0.2,0.2,0.2),
		vec3(0.2,0.2,0.2),
		vec3(0.2,0.2,0.2), //2
		vec3(0.1,0.1,0.2),
		vec3(0.1,0.1,0.2),
		vec3(0.1,0.1,0.2), //3
		vec3(0.05,0,0.1),
		vec3(0.05,0,0.1),
		vec3(0.05,0,0.1), //4
		vec3(0.4,0,0),
		vec3(0.4,0,0),
		vec3(0.4,0,0), //5
		vec3(0.1,0.1,0.3),
		vec3(0.1,0.1,0.3),
		vec3(0.1,0.1,0.3), //6, end of hair
		vec3(0.05,0.4,0.05),
		vec3(0.05,0.4,0.05),
		vec3(0.05,0.4,0.05), 
		vec3(0.0,0.7,0.05),
		vec3(0.0,0.7,0.05),
		vec3(0.0,0.7,0.05), //eye 1
		vec3(0.05,0.5,0.1), 
		vec3(0.05,0.5,0.1), 
		vec3(0.05,0.5,0.1),
		vec3(0.4,1,0.6),
		vec3(0.4,1,0.6),
		vec3(0.4,1,0.6), // eye 2
		vec3(1,0.04,0.4),
		vec3(1,0.04,0.4),
		vec3(1,0.04,0.4) // mouth
	]

	vertices = vertices.map((e)=>[e[0]/6, e[1]/6])

	// centers 
	const radius = 0.7;
	const angleStep = (2 * Math.PI) / 10;
	centers = [
		vec2(0, 0) // Central point
	];
	for (let i = 0; i < 10; i++) {
		let angle = i * angleStep;
		centers.push(vec2(radius * Math.cos(angle), radius * Math.sin(angle)));
	}
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 ); //binds current buffer to attribute
    gl.enableVertexAttribArray( vPosition ); // turns on the generic vertex attribute array

	var colorBuffer	= gl.createBuffer() // create buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer) // bind color buffer (tell gl we're working with this one rn)
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW) // insert color data to buffer
	// associate shader variable with buffer
	var vColor = gl.getAttribLocation(program, "vColor")
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0)
	gl.enableVertexAttribArray(vColor)

	//get location of center
	vCenter = gl.getUniformLocation(program, "vCenter")
	//get location of theta
	vTheta = gl.getUniformLocation(program, "vTheta")

	// draw 
	render();
	
    /* this is a little play to demo double buffering that occurs when call render -- revisit after doublebuffer ppt */
	/*
	console.log("displayed initially -- wait  and do again")
	setTimeout(function(){render();}, 5000);
	console.log("did it");
	*/
};


function render() {
	    
    gl.clear( gl.COLOR_BUFFER_BIT );

	// draw using vertices already loaded in the GPU 
	// here we draw two triangles 0,1,2 and 1,2,3
    
	// *** send uniform attr to vertex  shader
	// *** for translation, rotation (theta)
	// *** Use for loop

	theta += deltaRadians

	console.log(centers)
	for(let i = 0; i < 11; i++){
		// set center uniform
		gl.uniform2f(vCenter, centers[i][0], centers[i][1])
		// rotate prototype clockwise
		// instances counterclockwise
		gl.uniform1f(vTheta, i == 0 ? -theta : theta);
		// draw triangles for prototype and instances
		gl.drawArrays(gl.TRIANGLES, 0, 51)
	}

	// animation
    window.requestAnimFrame(render);
}
