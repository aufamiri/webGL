/**
 * @typedef {Object} objectArray
 * @property {sphere} object contain the object VertexData and Colors
 * @property {number[]} translation translation of the object in [X, Y, Z]
 * @property {number} scale the scale of the planet
 * @property {number} deltaRotation the speed of the rotation
 * @property {number} currentRotation current angle of the rotation
 * @property {boolean} hasChild place in the hierarchy
 * @property {number} parentId the id of the parent
 */

/** @type {objectArray} */
var objectArray; //storing the list of object

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
function drawUniform(gl, attrLocation, uniformData) {
  gl.uniformMatrix4fv(attrLocation, false, uniformData);
}

/**
 * @typedef {Object} anim
 * @property {number[]} prevModelView previous modelview for hierarchy
 * @property {number[]} camLocation location coord of camera
 * @property {number[]} povLoc camera lookAt coord
 * @property {WebGLRenderingContext} gl
 * @property {HTMLCanvasElement} canvas
 *
 * @type {anim}
 */
var anim = {
  prevModelView: [],
  camLocation: [0, -10, 0],
  povLoc: [0, 0, 0],

  render: function () {
    anim.gl.viewport(0, 0, anim.canvas.width, anim.canvas.height);
    anim.gl.clear(anim.gl.COLOR_BUFFER_BIT | anim.gl.DEPTH_BUFFER_BIT);

    //reset prevModelVIew
    anim.prevModelView = [];

    drawAttr(
      anim.gl,
      new Float32Array(objectArray.object.vertexData),
      3,
      anim.programInfo.attr.vertexPostition
    );

    drawAttr(
      anim.gl,
      new Float32Array(objectArray.object.colors),
      4,
      anim.programInfo.attr.color
    );

    drawIndices(anim.gl, objectArray.object.indices);

    tempTranslate = animate(
      anim.gl,
      anim.canvas,
      anim.programInfo.uniform,
      objectArray.object.indices.length,
      objectArray.currentRotation,
      objectArray.scale,
      objectArray.translation,
      anim.prevModelView[objectArray.parentId],
      anim.camLocation,
      anim.povLoc
    );

    if (objectArray.hasChild) {
      anim.prevModelView.push(tempTranslate);
    }

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
 * @param {number} scale the scale of the planet
 * @param {number[]} translate translation value
 * @param {Iterable} prevModelView previous iteration modelView
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
  scale,
  translate,
  prevModelView,
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

  if (prevModelView != undefined) {
    modelViewMatrix = mat4.clone(prevModelView);
  } else {
    mat4.lookAt(modelViewMatrix, camLocation, POVLoc, [0, 0, 1]);
  }

  mat4.scale(modelViewMatrix, modelViewMatrix, [scale, scale, scale]);
  mat4.rotate(modelViewMatrix, modelViewMatrix, rotate, [0, 0, 1]);
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    translate
  );

  drawUniform(gl, uniformLocation.projection, projectionMatrix);
  drawUniform(gl, uniformLocation.modelView, modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, vertexLength, gl.UNSIGNED_SHORT, 0);

  return modelViewMatrix;
}

function startup() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("canvas");

  /** @type {WebGLRenderingContext} */
  const gl = createGLContext(canvas);

  document.addEventListener("keydown", onKeyUp, true);

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

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  gl.useProgram(shaderProgram);

  anim.render = anim.render.bind(anim);

  /** @type {WebGLRenderingContext} */
  anim.gl = gl;
  /** @type {HTMLCanvasElement} */
  anim.canvas = canvas;
  anim.programInfo = programInfo;

  anim.render();
}
