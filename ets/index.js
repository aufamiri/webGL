var data = [
  {
    color: [1, 0.97, 0.19, 1.0],
    translation: [0, 0, 0],
    rotation: 0.0,
    scale: 1,
    hasChild: true,
    parentId: -1,
  },

  {
    color: [0.57, 0.27, 0.18, 1.0],
    translation: [-20, 0, 0],
    rotation: 0.08,
    scale: 0.1,
    hasChild: false,
    parentId: 0,
  },

  {
    color: [0.57, 0.09, 0.09, 1.0],
    translation: [-22, 0, 0],
    rotation: 0.05,
    scale: 0.15,
    hasChild: false,
    parentId: 0,
  },

  {
    color: [0.15, 0.22, 0.8, 1.0],
    translation: [-12, 0, 0],
    rotation: 0.02,
    scale: 0.4,
    hasChild: true,
    parentId: 0,
  },

  {
    color: [0.8, 0.8, 0.8, 1.0],
    translation: [-8, 0, 0],
    rotation: 0.08,
    scale: 0.25,
    hasChild: false,
    parentId: 1,
  },

  // {
  //   rad: 0.3,
  //   color: [1.0, 0.15, 0.05, 1.0],
  //   translation: [-4.3, 0, 0],
  //   rotation: 0.028,
  //   hasChild: false,
  //   parentId: 0,
  // },

  // {
  //   rad: 0.6,
  //   color: [0.58, 0.38, 0.25, 1.0],
  //   translation: [-6, 0, 0],
  //   rotation: 0.02,
  //   hasChild: false,
  //   parentId: 0,
  // },

  // {
  //   rad: 0.6,
  //   color: [0.58, 0.38, 0.25, 1.0],
  //   translation: [-6, 0, 0],
  //   rotation: 0.02,
  //   hasChild: false,
  //   parentId: 0,
  // },
];

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

/** @type {objectArray[]} */
var objectArray = []; //storing the list of object

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

var anim = {
  prevModelView: [],
  prevParentId: -2,

  render: function () {
    anim.gl.viewport(0, 0, anim.canvas.width, anim.canvas.height);
    anim.gl.clear(anim.gl.COLOR_BUFFER_BIT | anim.gl.DEPTH_BUFFER_BIT);

    //reset prevModelVIew
    anim.prevModelView = [];

    for (var i = 0; i != objectArray.length; i++) {
      drawAttr(
        anim.gl,
        new Float32Array(objectArray[i].object.vertexData),
        3,
        anim.programInfo.attr.vertexPostition
      );

      drawAttr(
        anim.gl,
        new Float32Array(objectArray[i].object.colors),
        4,
        anim.programInfo.attr.color
      );

      drawIndices(anim.gl, objectArray[i].object.indices);

      tempTranslate = animate(
        anim.gl,
        anim.canvas,
        anim.programInfo.uniform,
        objectArray[i].object.indices.length,
        objectArray[i].currentRotation,
        objectArray[i].scale,
        objectArray[i].translation,
        anim.prevModelView[objectArray[i].parentId]
      );

      if (objectArray[i].hasChild) {
        anim.prevModelView.push(tempTranslate);
      }

      objectArray[i].currentRotation =
        objectArray[i].currentRotation + objectArray[i].deltaRotation;
    }

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
 * @param {Iterable} prevTranslate previous iteration modelView
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
  prevTranslate
) {
  //projection View Matrix
  const fieldOfView = (45 * Math.PI) / 180; //45 degree angle
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100000000000.0);
  mat4.lookAt(projectionMatrix, [0, 0, -20], [0, 0, 0], [0, 1, 0]);

  //ModelView Matrix
  var modelViewMatrix = mat4.create();

  if (prevTranslate != undefined) {
    modelViewMatrix = mat4.clone(prevTranslate);
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

  const defaultN = 10;

  for (obj in data) {
    objectArray.push({
      object: createSphere(defaultN, data[obj].color),
      translation: data[obj].translation,
      scale: data[obj].scale,
      deltaRotation: data[obj].rotation,
      currentRotation: 0,
      hasChild: data[obj].hasChild,
      parentId: data[obj].parentId,
    });
  }

  gl.clearColor(102 / 255, 153 / 255, 1.0, 1.0);
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
