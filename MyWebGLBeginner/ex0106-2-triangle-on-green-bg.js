let VERTEX_SHADER_SRC = `
    attribute vec3 aVertexPosition;
    void main(void)
    {
        gl_Position = vec4(aVertexPosition, 1.0);
        gl_PointSize = 5.0;
    }
`;

let FRAGMENT_SHADER_SRC = `
    void main(void)
    {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

let GL;

$(document).ready(() => {
    $("[name='radioDrawArraysType']").click(() => {
        drawArrays();
    });

    GL = $("#my-canvas").get(0).getContext("webgl") || $("#my-canvas").get(0).getContext("experimental-webgl");
    drawArrays();
});

function drawArrays() {
    let drawArraysType = $("input[name=radioDrawArraysType]:checked").val();
    drawArraysWithType(drawArraysType);
}

function drawArraysWithType(type) {
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

    triagleVerticeBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, triagleVerticeBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triagleVertices), GL.STATIC_DRAW);



    let vertexPositionAttribute = GL.getAttribLocation(glProgram, "aVertexPosition");
    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, triagleVerticeBuffer);
    GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);


    if (type === "TRIANGLES") {
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    } else if (type === "LINES") {
        GL.drawArrays(GL.LINES, 0, 2);
        GL.drawArrays(GL.LINES, 2, 2);
        GL.drawArrays(GL.LINES, 4, 2);
    } else if (type === "POINTS") {
        GL.drawArrays(GL.POINTS, 0, 6);
    }
}

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