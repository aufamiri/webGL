/** @type {WebGLRenderingContext} */
var gl;
var shaderProgram;
var vertexBuffer;
var colorBuffer;

var vertextShaderSource = `
attribute vec3 aVertexPosition;
attribute vec3 color;
varying vec3 vColor;

void main() {
    gl_Position = vec4(aVertexPosition, 1.0);
    vColor = color;
}
`;

var fragmentShaderSource = `
precision mediump float;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;

function setupBuffers() {
  var triangleVertices = [
    0.0,
    0.5,
    0.0,
    -0.5,
    -0.5,
    0.0,
    0.5,
    -0.5,
    0.0,

    0.5,
    0.2,
    0.0,
    0.1,
    0.5,
    0.0,
    0.9,
    0.5,
    0.0,
  ];

  var colors = [0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1];

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW
  );

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  vertexBuffer.itemSize = 3;
  vertexBuffer.numberOfItems = triangleVertices.length / vertexBuffer.itemSize;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {BufferSource} bufferData
 * @param {number} itemSize
 * @param {number} numberOfItems
 */
function draw(gl, bufferData, itemSize, numberOfItems) {
  const tempBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tempBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    vertexBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  gl.vertexAttribPointer(
    shaderProgram.color,
    vertexBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );
  gl.enableVertexAttribArray(shaderProgram.color);

  gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}

function startup() {
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  gl = createGLContext(canvas);

  /** @type {WebGLProgram} */
  var shaderProgram = setupShaders(
    gl,
    vertextShaderSource,
    fragmentShaderSource
  );

  const programInfo = {
    attr: {
      vertexPostition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      color: gl.getAttribLocation(shaderProgram, "color"),
    },
  };

  gl.useProgram(shaderProgram);

  setupBuffers();

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  draw();
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {WebGLRenderingContext} context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;

  // checking if the browser support WebGL or not
  for (var i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch (e) {
      console.error(e);
    }

    if (context) {
      break;
    }
  }

  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    console.error("failed to craete WEBGL context");
  }

  return context;
}
