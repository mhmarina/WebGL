function createBumpMapVoronoi()
{
    // Bump Data
    var data = [];
    var points = [];

    // number of random points
    var numPoints = 10;
    
    // Generate random points
    for (var i = 0; i < numPoints; i++)
    {
        points.push(
            {
                x: Math.random() * texSize,
                y: Math.random() * texSize
            }
        );
    }
    
    // Iterate through each texel
    for (var i = 0; i <= texSize; i++)
    {
        data[i] = [];
        for (var j = 0; j <= texSize; j++)
        {
            // Find the nearest point
            var minDist = Number.MAX_VALUE;
            var index = -1;
            for (var p = 0; p < numPoints; p++)
            {
                var dist = Math.sqrt(Math.pow(points[p].x - i, 2) + Math.pow(points[p].y - j, 2));
                if (dist < minDist)
                {
                    minDist = dist;
                    index = p;
                }
            }

            // Assign a value based on distance
            data[i][j] = 1.0 - minDist / texSize;
        }
    }
    
    // Bump Map Normals
    var normalst = [];
    for (var i = 0; i < texSize; i++) 
    {
        normalst[i] = [];
        for (var j = 0; j < texSize; j++) 
        {
            normalst[i][j] = [];
        }
    }
    
    for (var i = 0; i < texSize; i++) 
    {
        for (var j = 0; j < texSize; j++) 
        {
            normalst[i][j][0] = -(data[i + 1][j] - data[i][j]);
            normalst[i][j][1] = -(data[i][j + 1] - data[i][j]);
            normalst[i][j][2] = 1;
        }
    }
    
    // Transform normals
    for (var i = 0; i < texSize; i++) 
    {
        for (var j = 0; j < texSize; j++) 
        {
            var d = 0;
            for (var k = 0; k < 3; k++) 
            {
                d += normalst[i][j][k] * normalst[i][j][k];
            }

            d = Math.sqrt(d);
            for (var k = 0; k < 3; k++) 
            {
                normalst[i][j][k] = 0.5 * normalst[i][j][k] / d + 0.5;
            }
        }
    }
    
    // Scale and load into linear array
    for (var i = 0; i < texSize; i++) 
    {
        for (var j = 0; j < texSize; j++) 
        {
            for (var k = 0; k < 3; k++) 
            {
                bumpNormals[3 * texSize * i + 3 * j + k] = 255 * normalst[i][j][k];
            }
        }
    }
}