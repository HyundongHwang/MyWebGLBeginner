let VERTEX_SHADER_SRC = `
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexColor;

    varying highp vec4 vColor;

    void main(void)
    {
        gl_Position = vec4(aVertexPosition, 1.0);
        vColor = vec4(aVertexColor, 1.0);
    }
`;



let FRAGMENT_SHADER_SRC = `
    varying highp vec4 vColor;

    void main(void)
    {
        gl_FragColor = vColor;
    }
`;



let GL;



$(document).ready(() => {
    GL = $("#my-canvas").get(0).getContext("webgl") || $("#my-canvas").get(0).getContext("experimental-webgl");
    GL.clearColor(0, 1, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT);

    let vertexShader = makeShader(VERTEX_SHADER_SRC, GL.VERTEX_SHADER);
    let fragmentShader = makeShader(FRAGMENT_SHADER_SRC, GL.FRAGMENT_SHADER);

    glProgram = GL.createProgram();
    GL.attachShader(glProgram, vertexShader);
    GL.attachShader(glProgram, fragmentShader);
    GL.linkProgram(glProgram);
    let result = GL.getProgramParameter(glProgram, GL.LINK_STATUS);

    GL.useProgram(glProgram);

    let triagleVertices = [
        -0.5, 0.5, 0.0,
        0.0, 0.0, 0.0,
        -0.5, -0.5, 0.0,

        0.5, 0.5, 0.0,
        0.0, 0.0, 0.0,
        0.5, -0.5, 0.0,
    ];

    let triagleVerticeBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, triagleVerticeBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triagleVertices), GL.STATIC_DRAW);

    let vertexPositionAttribute = GL.getAttribLocation(glProgram, "aVertexPosition");
    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, triagleVerticeBuffer);
    GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);



    let triagleVerticeColors = [
        1.0, 0.0, 0.0,
        1.0, 1.0, 1.0,
        1.0, 0.0, 0.0,

        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,
        0.0, 0.0, 1.0,
    ];

    let triangleColorBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleColorBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triagleVerticeColors), GL.STATIC_DRAW);

    let vertexColorAttribute = GL.getAttribLocation(glProgram, "aVertexColor");
    GL.enableVertexAttribArray(vertexColorAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleColorBuffer);
    GL.vertexAttribPointer(vertexColorAttribute, 3, GL.FLOAT, false, 0, 0);

    GL.drawArrays(GL.TRIANGLES, 0, 6);
});



function makeShader(src, type) {
    let shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);
    let result = GL.getShaderParameter(shader, GL.COMPILE_STATUS);

    if (!result) {
        console.error("gl.getShaderInfoLog(shader) : " + GL.getShaderInfoLog(shader));
    }

    return shader;
}