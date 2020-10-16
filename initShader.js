/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexSource
 * @param {string} fragmentSource
 */
function setupShaders(gl, vertexSource, fragmentSource) {
  var vertextShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertextShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error("failed to setup shaders");
  }

  return shaderProgram;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} type
 * @param {string} shaderSource
 */
function loadShader(gl, type, shaderSource) {
  const shader = gl.createShader(type);

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
