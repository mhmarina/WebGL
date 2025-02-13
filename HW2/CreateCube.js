
var numVertices = 8;
var numTriangles = 12;



var vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
];

// Create your own colors!!
var vertexColors = [
        [ 1.0, 1.0, 1.0, 1.0 ],   
        [ 1.0, 1.0, 1.0, 1.0 ],   
        [ 1.0, 1.0, 1.0, 1.0 ],   
        [ 1.0, 1.0, 1.0, 1.0 ],   
        [ 1.0, 1.0, 1.0, 1.0 ],   
        [ 1.0, 1.0, 1.0, 1.0 ],  
        [ 1.0, 1.0, 1.0, 1.0 ],  
        [ 1.0, 1.0, 1.0, 1.0 ]   
];

	
function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
	
}

function quad(a, b, c, d) 
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    console.log("CreateCube: indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );
               
    }
}



