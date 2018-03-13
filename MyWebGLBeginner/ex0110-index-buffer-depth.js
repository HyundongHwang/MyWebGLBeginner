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
let _mvMatrix = mat4.create();
let _pMatrix = mat4.create();
let _triangleColorBuffer;
let _trianglesVerticeBuffer;
let _triangleVerticesIndexBuffer;



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


    _glProgram.pMatrixUniform = GL.getUniformLocation(_glProgram, "uPMatrix");
    _glProgram.mvMatrixUniform = GL.getUniformLocation(_glProgram, "uMVMatrix");



    let triangleVerticeColors = [
        //front face	
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        1.0, 1.0, 1.0,

        //rear face
        0.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        1.0, 1.0, 1.0
    ];

    _triangleColorBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, _triangleColorBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), GL.STATIC_DRAW);



    //12 vertices
    var triangleVertices = [
        //front face
        //bottom left to right,  to top
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        2.0, 0.0, 0.0,
        0.5, 1.0, 0.0,
        1.5, 1.0, 0.0,
        1.0, 2.0, 0.0,

        //rear face
        0.0, 0.0, -2.0,
        1.0, 0.0, -2.0,
        2.0, 0.0, -2.0,
        0.5, 1.0, -2.0,
        1.5, 1.0, -2.0,
        1.0, 2.0, -2.0,
    ];

    _trianglesVerticeBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, _trianglesVerticeBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triangleVertices), GL.STATIC_DRAW);		



    //setup vertice buffers
    //18 triangles
    let triangleVertexIndices = [
        //front face
        0, 1, 3,
        1, 3, 4,
        1, 2, 4,
        3, 4, 5,

        //rear face
        6, 7, 9,
        7, 9, 10,
        7, 8, 10,
        9, 10, 11,

        //left side
        0, 3, 6,
        3, 6, 9,
        3, 5, 9,
        5, 9, 11,

        //right side
        2, 4, 8,
        4, 8, 10,
        4, 5, 10,
        5, 10, 11,
        //bottom faces
        0, 6, 8,
        8, 2, 0
    ];

    _triangleVerticesIndexBuffer = GL.createBuffer();
    _triangleVerticesIndexBuffer.number_vertex_points = triangleVertexIndices.length;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, _triangleVerticesIndexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleVertexIndices), GL.STATIC_DRAW);



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
    GL.clearColor(0.1, 0.5, 0.1, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.enable(GL.DEPTH_TEST);


    GL.viewport(0, 0, _canvas.width, _canvas.height);
    mat4.perspective(_pMatrix, 45, _canvas.width / _canvas.height, 0.1, 100.0);
    mat4.identity(_mvMatrix);
    mat4.translate(_mvMatrix, _mvMatrix, [-1.0, -1.0, -7.0]);
    mat4.rotate(_mvMatrix, _mvMatrix, _angle, [0.0, 1.0, 0.0]);
    _angle += 0.01;



    GL.uniformMatrix4fv(_glProgram.pMatrixUniform, false, _pMatrix);
    GL.uniformMatrix4fv(_glProgram.mvMatrixUniform, false, _mvMatrix);



    let vertexPositionAttribute = GL.getAttribLocation(_glProgram, "aVertexPosition");
    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, _trianglesVerticeBuffer);
    GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);



    let vertexColorAttribute = GL.getAttribLocation(_glProgram, "aVertexColor");
    GL.enableVertexAttribArray(vertexColorAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, _triangleColorBuffer);
    GL.vertexAttribPointer(vertexColorAttribute, 3, GL.FLOAT, false, 0, 0);



    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, _triangleVerticesIndexBuffer);
    GL.drawElements(GL.TRIANGLES, _triangleVerticesIndexBuffer.number_vertex_points, GL.UNSIGNED_SHORT, 0);



    //GL.drawArrays(GL.TRIANGLES, 0, 6);
    requestAnimationFrame(animLoop, _canvas);
}