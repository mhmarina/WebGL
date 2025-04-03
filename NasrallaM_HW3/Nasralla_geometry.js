// Marina Nasralla
// 4/9/25

function SOR(t){return Math.sin(t) + (1/2)*Math.sin(6*t)}
function SOR_dt(t){return 3 * Math.cos(t) + Math.cos(6*t)}
function Cylinder(t){return 1}
function Cylinder_dt(t){return 0}
function Shawarma(t){return Math.sin((1/7)*t) + (1/2) * Math.sin(12*t)}
function Shawarma_dt(t){return 6*Math.cos(12*t) + (1/7) * Math.cos((1/7)*t)}

let sor = [SOR, SOR_dt]
let cylinder = [Cylinder, Cylinder_dt]
let shawarma = [Shawarma, Shawarma_dt]
 
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
            x = f[0](t) * Math.cos(theta)
            y = t
            z = f[0](t) * -Math.sin(theta)
            points.push(vec3(x,y,z))
            
            dt = normalize(vec3(f[1](t)*Math.cos(theta), 1, f[1](t)*-Math.sin(theta)))
            dtheta = normalize(vec3(f[0](t)*-Math.sin(theta), 0, f[0](t)*Math.cos(theta)))
            normal = normalize(cross(dtheta, dt))
            normals.push(normal)
            // TODO: probably could just do this by hand
            // TODO: maybe create a datastructure that holds the function, the function's derivate w/respect to theta, and t
        }
    }

    generateIndices(stepTheta)
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