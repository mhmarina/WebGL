// Marina Nasralla
// 4/9/25

points = []
indices = []
normals = []

// f is a function
function generatePoints(f, a, b, stepT, stepTheta){
    points = []
    normals = []
    if(a > b){
        temp = a
        a = b
        b = temp
    }

    // build object from bottom to top
    // the first "stepTheta" points build the bottom most circle (at t = -1)
    for(t = a; t <= b; t += stepT){
        for(theta = 0; theta <= radians(360); theta += stepTheta){
            // rotate about y
            // we know that z is 0 in f(t) so we'll just use the x component
            x = f(t) * Math.cos(theta)
            y = t
            z = f(t) * -Math.sin(theta)
            points.push(vec3(x,y,z))
            normals.push(vec3(x,y,z))
        }
    }
}

// triangulation
function generateIndices(stepTheta){
    indices = []
    numSteps = radians(360) / stepTheta
    // .
    // |\
    // .-.
    for(i = 0; i < points.length - numSteps; i++){
        indices.push(i)
        indices.push(i+numSteps)
        indices.push(i+numSteps+1)
    }
    //   .
    //  /|
    // .-.
    for(i = 0; i < points.length - numSteps-1; i++){
        indices.push(i)
        indices.push(i+1)
        indices.push(i+1+numSteps)
    }
}