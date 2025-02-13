

window.onload = function init () {
    // initialize webgl context
    canvas = document.getElementById("gl-canvas")
    gl = WebGLUtils.setupWebGL(canvas)
    if(!gl){ alert("WebGl is not available. :(")}
    console.log(gl)
}