// Marina Nasralla
// 4/4/25
var program
var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0),
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3.0,
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

// lighting and materials
var lightPosition = vec4(3.0, 3.0, 5, 1.0 );
// light values
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var isLightMoving = false

let currMaterial
// materials
pearl = {
    materialAmbient: vec4( 0.25, 0.20725, 0.20725, 1.0 ),
    materialDiffuse: vec4( 1, 0.829, 0.829, 1.0 ),
    materialSpecular: vec4( 0.296648, 0.296648, 0.296648, 1.0 ),
    materialShininess: 8.8
}
gold = {
    materialAmbient: vec4( 1.0, 0.0, 1.0, 1.0 ),
    materialDiffuse: vec4( 1.0, 0.8, 0.0, 1.0 ),
    materialSpecular: vec4( 1.0, 0.8, 0.0, 1.0 ),
    materialShininess: 100.0
}
plastic = {
    materialAmbient: vec4( 0, 0.0, 0, 1.0 ),
    materialDiffuse: vec4( 0.01, 0.01, 0.01, 1.0 ),
    materialSpecular: vec4( 0.5, 0.5, 0.5, 1.0 ),
    materialShininess: 25
}

var ambientColor, diffuseColor, specularColor;

console.log(`eye: ${viewer.eye}, at: ${viewer.at}, up: ${viewer.up}`)
console.log(`initial light position: ${lightPosition}`)

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    resetBuffer(cylinder)
    setMaterial(gold)
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    projectionMatrix = perspective(60, 1, near, far)
    console.log(`initial perspective fov: 60, near: ${near}, far: ${far}`)
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
 
    // UI
    shapeSel = document.getElementById("shape-select")
    shapeSel.addEventListener('change', () =>{
        let fn
        switch(shapeSel.value){
            case("Cylinder"): {fn = cylinder} break
            case("SOR"): {fn = sor} break
            case("Shawarma"): {fn = shawarma} break
            default: fn = cylinder
        }
        resetBuffer(fn)
    })

    materialSel = document.getElementById("material-select")
    materialSel.addEventListener('change', ()=>{
        let mat
        switch(materialSel.value){
            case("Gold"): {mat = gold} break
            case("Pearl"): {mat = pearl} break
            case("Plastic"): {mat = plastic} break
            default: mat = gold
        }
        setMaterial(mat)
    })

    shinySlide = document.getElementById("shiny-slider")
    shinySlide.addEventListener('input', ()=>{
        gl.uniform1f( gl.getUniformLocation(program, 
            "shininess"), currMaterial.materialShininess * parseInt(shinySlide.value)) 
    })

    fovSlide = document.getElementById("fov-slider")
    fovSlide.addEventListener('input', ()=>{
        var fov = parseInt(fovSlide.value)
        projectionMatrix = perspective(fov, 1, near, far)
        // projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );    
    })

    lightSel = document.getElementById("light-select")
    lightSel.addEventListener('change', ()=>{
        switch(lightSel.value){
            case("Stationary"): 
                isLightMoving = false
                gl.uniform4fv( gl.getUniformLocation(program, 
                    "lightPosition"),flatten(lightPosition));
                break
            default:
                isLightMoving = true;            
        }
    })
	mouseControls();
    render()
}

function setMaterial(material){    
    ambientProduct = mult(lightAmbient, material.materialAmbient);
    diffuseProduct = mult(lightDiffuse, material.materialDiffuse);
    specularProduct = mult(lightSpecular, material.materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"),flatten(ambientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program, 
        "diffuseProduct"),flatten(diffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program, 
        "specularProduct"),flatten(specularProduct) );	
     gl.uniform1f( gl.getUniformLocation(program, 
        "shininess"), material.materialShininess );
    gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(lightPosition));
    
    shinySlide = document.getElementById("shiny-slider")
    shinySlide.value = '1' // reset shininess in UI
    currMaterial = material
}

// I want to reset all buffers when changing shapes 
function resetBuffer(fn){
    generatePoints(fn, -1, 1, 0.01, radians(10))

    // elements buffer
    var iBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(indices)), gl.STATIC_DRAW);

    // vertex positions
    var vBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)
    
    var vPosition = gl.getAttribLocation( program, "vPosition")
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    // normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    console.log(`minmax box: left: ${left}, right: ${right}, top: ${ytop}, bottom: ${bottom}, near: ${near}, far: ${far}`)
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //animate light
    if(isLightMoving){
        animateLight(0.03)
    }
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    window.requestAnimFrame(render);
}

var angle = 10
function animateLight(speed){
    var lx = lightPosition[0] * Math.cos(angle)
    var ly = lightPosition[1]
    var lz = lightPosition[2] * -Math.sin(angle)

    //lightPosition = new vec4(lx, ly, lz, 1.0)
    gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(new vec4(lx, ly, lz, 1.0)) );
    angle += speed
}
