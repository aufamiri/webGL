/**
 * @typedef {Object} objectArray
 * @property {pyramid} object contain the object VertexData and Colors
 * @property {number} deltaRotation the speed of the rotation
 * @property {number} currentRotation current angle of the rotation
 */

/** @type {objectArray} */
var objectArray; //storing the list of object

var lightPosition = [-1.5, 2.0, 4.0, 1.0];
var lightAmbient = [0.5, 0.5, 0.5, 1.0];
var lightDiffuse = [1.0, 1.0, 1.0, 1.0];
var lightSpecular = [1.0, 1.0, 1.0, 1.0];

var materialAmbient = [1.0, 0.0, 0.0, 1.0];
var materialDiffuse = [1.0, 0.38, 0.31, 1.0];
var materialSpecular = [0.4, 0.4, 0.4, 1.0];
var materialShininess = 300.0;

var isFlip = false;

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
 * bind data to buffer and pass it to the shader
 *
 * @param {WebGLRenderingContext} gl
 * @param {BufferSource} attrData
 * @param {number} itemSize
 * @param {number} attrLocation
 *
 * @returns {WebGLBuffer} //indices buffer
 */
function drawIndices(gl, indexData) {
  const tempBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tempBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexData),
    gl.STATIC_DRAW
  );

  return tempBuffer;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLUniformLocation} attrLocation
 * @param {Iterable} uniformData
 */
function drawMatUniform(gl, attrLocation, uniformData) {
  gl.uniformMatrix4fv(attrLocation, false, uniformData);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLUniformLocation} attrLocation
 * @param {Iterable} uniformData
 */
function drawVecUniform(gl, attrLocation, uniformData) {
  gl.uniform4fv(attrLocation, uniformData);
}

/**
 * @typedef {Object} anim
 * @property {number[]} camLocation location coord of camera
 * @property {number[]} povLoc camera lookAt coord
 * @property {WebGLRenderingContext} gl
 * @property {HTMLCanvasElement} canvas
 *
 * @type {anim}
 */
var anim = {
  camLocation: [4, 0, 0],
  povLoc: [0, 0, 0],

  render: function () {
    anim.gl.viewport(0, 0, anim.canvas.width, anim.canvas.height);
    anim.gl.clear(anim.gl.COLOR_BUFFER_BIT | anim.gl.DEPTH_BUFFER_BIT);

    drawAttr(
      anim.gl,
      new Float32Array(objectArray.object.vertexData),
      3,
      anim.programInfo.attr.vertexPostition
    );

    drawAttr(
      anim.gl,
      new Float32Array(objectArray.object.normal),
      // objectArray.object.normal,
      3,
      anim.programInfo.attr.normal
    );

    drawIndices(anim.gl, objectArray.object.indices);

    tempTranslate = animate(
      anim.gl,
      anim.canvas,
      anim.programInfo.uniform,
      objectArray.object.indices.length,
      objectArray.currentRotation,
      anim.camLocation,
      anim.povLoc
    );

    objectArray.currentRotation =
      objectArray.currentRotation + objectArray.deltaRotation;

    window.requestAnimationFrame(this.render);
  },
};

/**
 * @param {WebGLRenderingContext} gl GL Rendering COntext
 * @param {number} deltaTime Elapsed Time
 * @param {Object} uniformLocation object cotanining WebGLUniformLocation
 * @param {number} vertexLength length of vertexData...
 * @param {HTMLCanvasElement} canvas HTML Canvas Element
 * @param {number} rotate the angle of rotation
 * @param {number[]} camLocation vec3 of cameraLocation
 * @param {number[]} POVLoc vec3 of POV
 *
 * @returns {Iterable}
 */
function animate(
  gl,
  canvas,
  uniformLocation,
  vertexLength,
  rotate,
  camLocation,
  POVLoc
) {
  //projection View Matrix
  const fieldOfView = (45 * Math.PI) / 180; //45 degree angle
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

  //ModelView Matrix
  var modelViewMatrix = mat4.create();

  mat4.lookAt(modelViewMatrix, camLocation, POVLoc, [0, 1, 0]);

  var normalViewMatrix = mat4.clone(modelViewMatrix);

  mat4.rotate(modelViewMatrix, modelViewMatrix, rotate, [0, 1, 0]);

  //lighting...
  var ambientProduct = vec4.create();
  vec4.multiply(ambientProduct, lightAmbient, materialAmbient);

  var diffuseProduct = vec4.create();
  vec4.multiply(diffuseProduct, lightDiffuse, materialDiffuse);

  var specularProduct = vec4.create();
  vec4.multiply(specularProduct, lightSpecular, materialSpecular);

  if (isFlip === true) {
    lightPosition[0] += 0.05;
  } else {
    lightPosition[0] -= 0.05;
  }

  if (lightPosition[0] * lightPosition[0] > 4) {
    isFlip = !isFlip;
  }

  drawMatUniform(gl, uniformLocation.projection, projectionMatrix);
  drawMatUniform(gl, uniformLocation.modelView, modelViewMatrix);
  drawMatUniform(gl, uniformLocation.normalView, normalViewMatrix);

  drawVecUniform(gl, uniformLocation.lightPos, lightPosition);
  drawVecUniform(gl, uniformLocation.ambientProduct, ambientProduct);
  drawVecUniform(gl, uniformLocation.diffuseProduct, diffuseProduct);
  drawVecUniform(gl, uniformLocation.specularProduct, specularProduct);

  gl.uniform1f(uniformLocation.shininess, materialShininess);

  gl.drawElements(gl.TRIANGLES, vertexLength, gl.UNSIGNED_SHORT, 0);

  return modelViewMatrix;
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
      normal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
    },
    uniform: {
      modelView: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      projection: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      normalView: gl.getUniformLocation(shaderProgram, "uNormalViewMatrix"),
      lightPos: gl.getUniformLocation(shaderProgram, "uLightPosition"),
      ambientProduct: gl.getUniformLocation(shaderProgram, "ambientProduct"),
      diffuseProduct: gl.getUniformLocation(shaderProgram, "diffuseProduct"),
      specularProduct: gl.getUniformLocation(shaderProgram, "specularProduct"),
      shininess: gl.getUniformLocation(shaderProgram, "shininess"),
    },
  };

  gl.enableVertexAttribArray(programInfo.attr.vertexPostition);
  // gl.enableVertexAttribArray(programInfo.attr.color);
  gl.enableVertexAttribArray(programInfo.attr.normal);

  gl.clearColor(0.19, 0.67, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.useProgram(shaderProgram);

  objectArray = {
    object: createPyramid(),
    currentRotation: 0,
    deltaRotation: 0.01,
  };

  anim.render = anim.render.bind(anim);

  /** @type {WebGLRenderingContext} */
  anim.gl = gl;
  /** @type {HTMLCanvasElement} */
  anim.canvas = canvas;
  anim.programInfo = programInfo;

  anim.render();
}
