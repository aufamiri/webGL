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
 * @typedef {Object} cube
 * @property {number[]} vertexData array vertexData
 * @property {number[]} colors array colors
 * @property {number[]} indices array indices
 * @property {number[]} normal array normal vector
 *
 * @returns {cube}
 */

function createCube() {
  //prettier-ignore
  const positions = [

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

   0.0,  1.5,  0.0
  ]

  const color = [
    [1.0, 1.0, 1.0, 1.0], // Front face: white
    [1.0, 0.0, 0.0, 1.0], // Back face: red
    [0.0, 1.0, 0.0, 1.0], // Top face: green
    [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0], // Right face: yellow
  ];

  var colors = [];

  for (var j = 0; j < color.length; ++j) {
    const c = color[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  //prettier-ignore
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    0,  1,  4,      2,  3,  4,    // back
    0,  3,  4,      1,  2,  4,   // top
  ];

  var normal = [];

  for (i = 0; i <= indices.length - 3; i += 3) {
    a = indices[i] * 3;
    b = indices[i + 1] * 3;
    c = indices[i + 2] * 3;

    p1 = vec3.fromValues(positions[a], positions[a + 1], positions[a + 2]);
    p2 = vec3.fromValues(positions[b], positions[b + 1], positions[b + 2]);
    p3 = vec3.fromValues(positions[c], positions[c + 1], positions[c + 2]);

    t1 = vec3.create();
    t2 = vec3.create();
    result = vec3.create();

    vec3.subtract(t1, p2, p1);
    vec3.subtract(t2, p3, p1);

    vec3.cross(result, t1, t2);
    vec3.normalize(result, result);

    normal = normal.concat([result[0], result[1], result[2]]);
  }

  return {
    vertexData: positions,
    indices: indices,
    colors: colors,
    normal: normal,
  };
}
