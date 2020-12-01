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
