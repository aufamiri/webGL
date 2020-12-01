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
 * fungsi untuk membuat lingkaran dengan enak, gampang dan langsung
 *
 * @param {number} pointN  jumlah banyaknya vertex
 * @param {number} pusatX koordinat X pusat lingkaran
 * @param {number} pusatY koordinat Y pusat lingkaran
 * @param {number} radius radius lingkaran
 * @param {number[]} color color value in array [R, G, B, 1.0]
 *
 *
 * @typedef {Object} circle value circle
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
