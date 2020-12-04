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

/**
 * bind data to buffer and pass it to the shader
 *
 * @param {WebGLRenderingContext} gl
 * @param {BufferSource} bufferData
 * @param {number} itemSize
 * @param {number} attrLocation
 */
function draw(gl, bufferData, itemSize, attrLocation) {
  const tempBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, tempBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(attrLocation, itemSize, gl.FLOAT, false, 0, 0);
}

function startup() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas");

  /** @type {WebGLRenderingContext} */
  const gl = createGLContext(canvas);

  const shaderProgram = setupShaders(
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

  gl.enableVertexAttribArray(programInfo.attr.vertexPostition);
  gl.enableVertexAttribArray(programInfo.attr.color);

  var triangleVertices = [0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];
  var colors = [0, 0, 1, 1, 0, 0, 0, 1, 0];

  gl.useProgram(shaderProgram);

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  var sphere = createSphere(gl, 6, [0.0, 0.0, 0.0]);

  // draw vertice
  draw(
    gl,
    new Float32Array(sphere.vertexData),
    3,
    programInfo.attr.vertexPostition
  );
  // draw colors
  draw(gl, new Float32Array(sphere.colors), 3, programInfo.attr.color);

  const indicesBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(sphere.indices),
    gl.STATIC_DRAW
  );

  gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);

  // gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length / 3);

  // draw(gl, new Float32Array(newTirangle), 3, programInfo.attr.vertexPostition);
  // draw(gl, new Float32Array(newColors), 3, programInfo.attr.color);
  // gl.drawArrays(gl.TRIANGLES, 0, newTirangle.length / 3);
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
