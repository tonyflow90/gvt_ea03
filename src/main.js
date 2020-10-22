let canvas, gl;
let aVertices = [];

document.body.onload = _ => {
    canvas = document.querySelector('#canvas');
    gl = canvas.getContext('webgl');

    // Pipeline setup
    gl.clearColor(.25, .35, .45, 1);
    // Backface culling.
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK); // or gl.FRONT

    let vertices, colors, indices = undefined;
    // Vertex data.
    // Positions.
    let nTriangleCount = 16;
    vertices = createVertices(nTriangleCount);

    // Colors as rgba.
    colors = createColors(nTriangleCount);

    // Index data.
    let indices2 = new Uint16Array(Array.from(Array(vertices.length).keys()));

    draw(gl.TRIANGLES, vertices, colors, indices2);
};

let createColors = (nCount = 8) => {
    let colors = [];
    let c1, c2, c3, v = 1;

    for (let i = 0; i < nCount*3; i += 1) {
        c1 = Math.round(Math.random() * 1);
        c2 = Math.round(Math.random() * 1);
        c3 = Math.round(Math.random() * 1);
        colors = [...colors, c1, c2, c3, v];
    }

    return new Float32Array(colors);
}

let createVertices = (nCount = 8) => {
    let vertices = [];
    let triangleCount = nCount;
    let r = 1;
    let g = 2 * Math.PI / triangleCount;

    for (let i = 0; i < triangleCount; i += 1) {
        r = Math.random() * .5 + .5;
        let x1 = 0;
        let y1 = 0;
        let z1 = 0;

        let x2 = r * Math.cos(g * i);
        let y2 = r * Math.sin(g * i);
        let z2 = 0;

        let x3 = r * Math.cos(g * (i + 1));
        let y3 = r * Math.sin(g * (i + 1));
        let z3 = 0;

        vertices = [...vertices, x1, y1, z1, x2, y2, z2, x3, y3, z3];
    }

    return new Float32Array(vertices);
}

let draw = (mode, aVertices, aColors, aIndices) => {

    // Compile a vertex shader
    let vsSource = '' +
        'attribute vec3 pos;' +
        'attribute vec4 col;' +
        'varying vec4 color;' +
        'void main(){' +
        'color = col;' +
        'gl_Position = vec4(pos, 1);' +
        '}';
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    // Compile a fragment shader
    let fsSouce = 'precision mediump float;' +
        'varying vec4 color;' +
        'void main() {' +
        'gl_FragColor = color;' +
        '}';
    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSouce);
    gl.compileShader(fs);

    // Link together into a program
    let prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Setup position vertex buffer object.
    var vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, aVertices, gl.STATIC_DRAW);
    // Bind vertex buffer to attribute variable.
    var posAttrib = gl.getAttribLocation(prog, 'pos');
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posAttrib);

    // Setup color vertex buffer object.
    var vboCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboCol);
    gl.bufferData(gl.ARRAY_BUFFER, aColors, gl.STATIC_DRAW);
    // Bind vertex buffer to attribute variable.
    var colAttrib = gl.getAttribLocation(prog, 'col');
    gl.vertexAttribPointer(colAttrib, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colAttrib);

    // Setup index buffer object.
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, aIndices,
        gl.STATIC_DRAW);
    ibo.numerOfEmements = aIndices.length;

    // Clear framebuffer and render primitives.
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(mode, ibo.numerOfEmements, gl.UNSIGNED_SHORT, 0);

}