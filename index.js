/** @type {WebGLRenderingContext} */
var gl;
/** @type {HTMLCanvasElement} */
var canvas;
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
  vertexBuffer = gl.createBuffer();

  colorBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

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

    /*     0.5,
    0.2,
    0.0,
    0.1,
    0.5,
    0.0,
    0.9,
    0.5,
    0.0, */
  ];

  var colors = [0, 0, 1, 1, 0, 0, 0, 1, 0 /* 1, 1, 0, 1, 0, 1, 0, 1, 1*/];

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(triangleVertices),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  vertexBuffer.itemSize = 3;

  vertexBuffer.numberOfItems = triangleVertices.length / vertexBuffer.itemSize;
}

function setupShaders() {
  var vertextShader = loadShader(gl.VERTEX_SHADER, vertextShaderSource);
  var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertextShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram,
    "aVertexPosition"
  );

  shaderProgram.color = gl.getAttribLocation(shaderProgram, "color");
}

function loadShader(type, shaderSource) {
  var shader = gl.createShader(type);

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  // if something happened, delete the shader and return null
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`ERROR ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.vertexAttribPointer(
    shaderProgram.vertexPositionAttribute,
    vertexBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

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
  canvas = document.getElementById("canvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
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
