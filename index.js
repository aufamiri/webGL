/** @type {WebGLRenderingContext} */
var gl;
/** @type {HTMLCanvasElement} */
var canvas;
var shaderProgram;
var vertexBuffer;

var vertextShaderSource = `
attribute vec3 aVertexPosition;

void main() {
    gl_Position = vec4(aVertexPosition, 1.0);
}
`;

var fragmentShaderSource = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

function setupShaders() {
  var vertextShader = loadShader(gl.VERTEX_SHADER, vertextShaderSource);
  var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
}

function loadShader(type, shaderSource) {
  var shader = gl.createShader(type);
}

function startup() {
  canvas = document.getElementById("canvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
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
