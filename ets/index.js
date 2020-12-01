/**
 * bind data to buffer and pass it to the shader
 *
 * @param {WebGLRenderingContext} gl
 * @param {BufferSource} attrData
 * @param {number} itemSize
 * @param {number} attrLocation
 */
function drawAttr(gl, attrData, itemSize, attrLocation) {
  const tempBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, tempBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, attrData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(attrLocation, itemSize, gl.FLOAT, false, 0, 0);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLUniformLocation} attrLocation
 * @param {Iterable} uniformData
 */
function drawUniform(gl, attrLocation, uniformData) {
  gl.uniformMatrix4fv(attrLocation, false, uniformData);
}

function render(gl, )

/**
 *
 * @param {WebGLRenderingContext} gl GL Rendering COntext
 * @param {number} deltaTime Elapsed Time
 * @param {Object} uniformLocation object cotanining WebGLUniformLocation
 * @param {number} vertexLength length of vertexData...
 * @param {HTMLCanvasElement} canvas HTML Canvas Element
 * @param {number} rotate the angle of rotation
 * @param {Array} translate translation value
 */
function animate(
  gl,
  canvas,
  deltaTime,
  uniformLocation,
  vertexLength,
  rotate,
  translate
) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //projection View Matrix
  const fieldOfView = (45 * Math.PI) / 180; //45 degree angle
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

  //ModelView Matrix
  const modelViewMatrix = mat4.create();

  mat4.rotate(modelViewMatrix, modelViewMatrix, rotate, [0, 0, 1]);
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    translate
  );

  drawUniform(gl, uniformLocation.projection, projectionMatrix);
  drawUniform(gl, uniformLocation.modelView, modelViewMatrix);
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

  circle = createCircle(100, 0, 0, 0.5, [0, 0, 0, 1.0]);
  circle2 = createCircle(100, 0, 0, 0.3, [0, 0, 1, 1.0]);

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.useProgram(shaderProgram);

  drawAttr(
    gl,
    new Float32Array(circle.vertexData),
    2,
    programInfo.attr.vertexPostition
  );
  drawAttr(gl, new Float32Array(circle.colors), 4, programInfo.attr.color);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.vertexData.length / 2);

  drawAttr(
    gl,
    new Float32Array(circle2.vertexData),
    2,
    programInfo.attr.vertexPostition
  );
  drawAttr(gl, new Float32Array(circle2.colors), 4, programInfo.attr.color);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, circle2.vertexData.length / 2);
}
