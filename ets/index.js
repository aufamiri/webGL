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
    console.error("failed to create WEBGL context");
  }

  return context;
}

/**
 * Load Shader Script from DOM
 * @param {String} id
 */
function getShaderfromDOM(id) {
  var shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) {
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  return shaderSource;
}

/**
 * @param {int} pointN  jumlah banyaknya vertex
 * @param {int} pusatX koordinat X pusat lingkaran
 * @param {int} pusatY koordinat Y pusat lingkaran
 * @param {int} radius radius lingkaran
 * @param {array} color color value in array [R, G, B, 1.0]
 *
 *
 * @typedef {Object} result
 * @property {array} vertexData array vertexData
 * @property {array} colors array colors
 *
 * @returns {result}
 */

function createCircle(pointN, pusatX, pusatY, radius, color) {
  var vertexData = [pusatX, pusatY];

  for (var i = 0; i <= pointN; i++) {
    var theta = (i * 2 * Math.PI) / pointN;
    var x = pusatX + radius * Math.sin(theta);
    var y = pusatY + radius * Math.cos(theta);
    vertexData.push(x, y);
  }

  var colors = [];
  for (var i = 0; i != vertexData.length; i++) {
    colors = colors.concat(color);
  }

  return {
    vertexData: vertexData,
    colors: colors,
  };
}

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

  const vertexShaderSource = getShaderfromDOM("vs-src");
  const fragmentShaderSource = getShaderfromDOM("fs-src");

  const shaderProgram = setupShaders(
    gl,
    vertexShaderSource,
    fragmentShaderSource
  );

  const programInfo = {
    attr: {
      vertexPostition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      color: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    uniform: {
      modelView: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      projection: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
    },
  };

  gl.enableVertexAttribArray(programInfo.attr.vertexPostition);
  gl.enableVertexAttribArray(programInfo.attr.color);

  circle = createCircle(100, 0, 0, 0.3, [0, 0, 0, 1.0]);
  circle2 = createCircle(100, 0.3, 0, 0.1, [0, 0, 1, 1.0]);

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.useProgram(shaderProgram);

  draw(
    gl,
    new Float32Array(circle.vertexData),
    2,
    programInfo.attr.vertexPostition
  );
  draw(gl, new Float32Array(circle.colors), 4, programInfo.attr.color);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.vertexData.length / 2);

  draw(
    gl,
    new Float32Array(circle2.vertexData),
    2,
    programInfo.attr.vertexPostition
  );
  draw(gl, new Float32Array(circle2.colors), 4, programInfo.attr.color);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, circle2.vertexData.length / 2);
}
