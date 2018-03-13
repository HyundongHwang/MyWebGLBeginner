"use strict";

let VERTEX_SHADER_SRC = `
	attribute vec3 aVertexPosition;
	attribute vec3 aVertexColor;

	varying highp vec4 vColor;	
	void main(void) {
        gl_Position = vec4(aVertexPosition, 1.0);
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
let _angle = 0;
let _glProgram;
let _triangleColorBuffer;


$(document).ready(() => {
    GL = $("#my-canvas").get(0).getContext("webgl") || $("#my-canvas").get(0).getContext("experimental-webgl");
    GL.clearColor(0, 1, 0, 1);
    GL.clear(GL.COLOR_BUFFER_BIT);

    let vertexShader = makeShader(VERTEX_SHADER_SRC, GL.VERTEX_SHADER);
    let fragmentShader = makeShader(FRAGMENT_SHADER_SRC, GL.FRAGMENT_SHADER);

    _glProgram = GL.createProgram();
    GL.attachShader(_glProgram, vertexShader);
    GL.attachShader(_glProgram, fragmentShader);
    GL.linkProgram(_glProgram);
    let result = GL.getProgramParameter(_glProgram, GL.LINK_STATUS);

    GL.useProgram(_glProgram);



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
    var x_transition = Math.sin(_angle) / 2.0;

    var triangleVertices = [
        -0.5 + x_transition, 0.5, 0.0,
        0.0 + x_transition, 0.0, 0.0,
        -0.5 + x_transition, -0.5, 0.0,

        0.5 + x_transition, 0.5, 0.0,
        0.0 + x_transition, 0.0, 0.0,
        0.5 + x_transition, -0.5, 0.0,
    ];

    _angle += 0.01;

    let triangleVerticeBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleVerticeBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(triangleVertices), GL.DYNAMIC_DRAW);



    let vertexPositionAttribute = GL.getAttribLocation(_glProgram, "aVertexPosition");
    GL.enableVertexAttribArray(vertexPositionAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, triangleVerticeBuffer);
    GL.vertexAttribPointer(vertexPositionAttribute, 3, GL.FLOAT, false, 0, 0);



    let vertexColorAttribute = GL.getAttribLocation(_glProgram, "aVertexColor");
    GL.enableVertexAttribArray(vertexColorAttribute);
    GL.bindBuffer(GL.ARRAY_BUFFER, _triangleColorBuffer);
    GL.vertexAttribPointer(vertexColorAttribute, 3, GL.FLOAT, false, 0, 0);



    GL.drawArrays(GL.TRIANGLES, 0, 6);
    requestAnimationFrame(animLoop, $("#my-canvas").get(0));
}