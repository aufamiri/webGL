/**
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
 * @param {string} id
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
 * @param {number} pointN  jumlah banyaknya vertex
 * @param {number} pusatX koordinat X pusat lingkaran
 * @param {number} pusatY koordinat Y pusat lingkaran
 * @param {number} radius radius lingkaran
 * @param {number[]} color color value in array [R, G, B, 1.0]
 *
 *
 * @typedef {Object} circle
 * @property {number[]} vertexData array vertexData
 * @property {number[]} colors array colors
 *
 * @returns {circle}
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
 * @param {number} div radius lingkaran
 * @param {number[]} color color value in array [R, G, B, 1.0]
 *
 *
 * @typedef {Object} sphere
 * @property {number[]} vertexData array vertexData
 * @property {number[]} colors array colors
 * @property {number[]} indices array indices
 *
 * @returns {sphere}
 */

function createSphere(gl, div, color) {
  var positions = [];
  for (var i = 0; i <= div; ++i) {
    var ai = (i * Math.PI) / div;
    var si = Math.sin(ai);
    var ci = Math.cos(ai);
    for (var j = 0; j <= div; ++j) {
      var aj = (j * 2 * Math.PI) / div;
      var sj = Math.sin(aj);
      var cj = Math.cos(aj);
      positions = positions.concat([si * sj, ci, si * cj]);
    }
  }

  var indices = [];
  for (var i = 0; i < div; ++i) {
    for (var j = 0; j < div; ++j) {
      var p1 = i * (div + 1) + j;
      var p2 = p1 + (div + 1);
      indices = indices.concat([p1, p2, p1 + 1, p1 + 1, p2, p2 + 1]);
    }
  }

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  var colors = [];
  for (var i = 0; i != vertexData.length; i++) {
    colors = colors.concat(color);
  }

  return {
    vertexData: positions,
    indices: indices,
    colors: colors,
  };
}
