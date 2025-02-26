
var numVertices = 8;
var numTriangles = 12;
//var j = 0;


// add two vertices to create tetrahedrons
// to the end of this cube
var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 ), // here come the tetrahedron vectors...
    vec3( 0.5, 0.5, -1.5 ),
    vec3( 0.5, 0.5, 0.5 )
];

// TODO: Create your own colors!!
var vertexColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red 
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.0, 1.0, 1.0 ],  // pink, this is the front face for some reason
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 0.5, 0.5, 0.5, 1.0 ],  // grey
        [ 0.0, 0.0, 0.0, 1.0 ]   // black
];

	
function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 ); // this is the front square with z = -1
    quad( 5, 4, 0, 1 );
    triad(4, 7, 6, 5, 8);
    triad(0, 3, 2, 1, 9);
}

function triad(a, b, c, d, e){
    // similar to quad(), I want to create 8 triangles that will form
    // the tetrahedrons on the sides...
    // b ------- c
    // | \     / |
    // |    e    |
    // | /     \ |
    // a ------- d  // something like this...

    var indices = [a , b, c, d]
    var triColors = [
        [ 1.0, 0.0, 0.0, 1.0 ],  // red 
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ]  // yellow
    ]

    for ( var i = 0; i < 4; i++){
        cubeVertices.push(vertices[indices[i]])
        cubeVertices.push(vertices[e]) //center of pyramid
        cubeVertices.push(vertices[indices[(i+1)%4]]) //push next vertex or wrap around

        for ( var j = 0; j < 3; j++ ){
            colors.push(triColors[i])
        }
    }      
}

function quad(a, b, c, d) 
{
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
        var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[0]] ); 
    }
}



