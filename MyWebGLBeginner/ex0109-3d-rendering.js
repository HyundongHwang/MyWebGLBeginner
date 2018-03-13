"use strict";

let VERTEX_SHADER_SRC = `
	attribute vec3 aVertexPosition;
	attribute vec3 aVertexColor;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

	varying highp vec4 vColor;	
	void main(void) {
        gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
		vColor = vec4(aVertexColor, 1.0);
	}
`;

let FRAGMENT_SHADER_SRC = `
	varying highp vec4 vColor;
	void main(void) {
        gl_FragColor = vColor;
	}
`;


let GL;
let _canvas;
let _angle = 0;
let _glProgram;
let _triangleColorBuffer;
let _mvMatrix = mat4.create();
let _pMatrix = mat4.create();



$(document).ready(() => {
    _canvas = $("#my-canvas").get(0);
    GL = _canvas.getContext("webgl") || _canvas.get(0).getContext("experimental-webgl");

    let vertexShader = makeShader(VERTEX_SHADER_SRC, GL.VERTEX_SHADER);
    let fragmentShader = makeShader(FRAGMENT_SHADER_SRC, GL.FRAGMENT_SHADER);

    _glProgram = GL.createProgram();
    GL.attachShader(_glProgram, vertexShader);
    GL.attachShader(_glProgram, fragmentShader);
    GL.linkProgram(_glProgram);
    let result = GL.getProgramParameter(_glProgram, GL.LINK_STATUS);

    GL.useProgram(_glProgram);



    GL.viewport(0, 0, _canvas.width, _canvas.height);
    mat4.perspective(_pMatrix, 45, _canvas.width / _canvas.height, 0.1, 100.0);
    mat4.identity(_mvMatrix);
    mat4.translate(_mvMatrix, _mvMatrix, [0, 0, -2]);

    _glProgram.pMatrixUniform = GL.getUniformLocation(_glProgram, "uPMatrix");
    _glProgram.mvMatrixUniform = GL.getUniformLocation(_glProgram, "uMVMatrix");



    let triagleVerticeColors = [
        1.0, 0.0, 0.0,
        1.0, 1.0, 1.0,
        1.0, 0.0, 0.0,

        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,
        0.0, 0.0, 1.0,
    ];

    _triangleColorBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, _triangleColorBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triagleVerticeColors), GL.STATIC_DRAW);



    animLoop();
});



function makeShader(src, type) {
    let shader = GL.createShader(type);
    GL.shaderSource(shader, src);
    GL.compileShader(shader);
    let result = GL.getShaderParameter(shader, GL.COMPILE_STATUS);

    if (!result) {
        console.error("GL.getShaderInfoLog(shader) : " + GL.getShaderInfoLog(shader));
    }

    return shader;
}



function animLoop() {
    GL.clearColor(0.0, 1.0, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);



    var x_transition = Math.sin(_angle) / 2.0;

    var triangleVertices = [
        -0.5 + x_transition, 0.5, -0.5,
        0.0 + x_transition, 0.0, -0.5,
        -0.5 + x_transition, -0.5, -0.5,

        0.5 + x_transition, 0.5, 0.5,
        0.0 + x_transition, 0.0, 0.5,
        0.5 + x_transition, -0.5, 0.5,
    ];

    _angle += 0.01;

    let triangleVerticeBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleVerticeBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triangleVertices), GL.DYNAMIC_DRAW);



    GL.uniformMatrix4fv(_glProgram.pMatrixUniform, false, _pMatrix);
    GL.uniformMatrix4fv(_glProgram.mvMatrixUniform, false, _mvMatrix);



    let vertexPositionAttribute = GL.getAttribLocation(_glProgram, "aVertexPosition");
    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleVerticeBuffer);
    GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);



    let vertexColorAttribute = GL.getAttribLocation(_glProgram, "aVertexColor");
    GL.enableVertexAttribArray(vertexColorAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, _triangleColorBuffer);
    GL.vertexAttribPointer(vertexColorAttribute, 3, GL.FLOAT, false, 0, 0);



    GL.drawArrays(GL.TRIANGLES, 0, 6);
    requestAnimationFrame(animLoop, _canvas);
}