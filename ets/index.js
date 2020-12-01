/**
 * @typedef {Object} objectArray
 * @property {circle} object contain the object VertexData and Colors
 * @property {number[]} translation translation of the object in [X, Y, Z]
 * @property {number} deltaRotation the speed of the rotation
 * @property {number} currentRotation current angle of the rotation
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
 * @param {WebGLRenderingContext} gl
 * @param {WebGLUniformLocation} attrLocation
 * @param {Iterable} uniformData
 */
function drawUniform(gl, attrLocation, uniformData) {
  gl.uniformMatrix4fv(attrLocation, false, uniformData);
}

var anim = {
  render: function () {
    anim.gl.viewport(0, 0, anim.canvas.width, anim.canvas.height);
    anim.gl.clear(anim.gl.COLOR_BUFFER_BIT | anim.gl.DEPTH_BUFFER_BIT);

    for (var i = 0; i != objectArray.length; i++) {
      drawAttr(
        anim.gl,
        new Float32Array(objectArray[i].object.vertexData),
        2,
        anim.programInfo.attr.vertexPostition
      );

      drawAttr(
        anim.gl,
        new Float32Array(objectArray[i].object.colors),
        4,
        anim.programInfo.attr.color
      );

      animate(
        anim.gl,
        anim.canvas,
        anim.programInfo.uniform,
        objectArray[i].object.vertexData.length,
        objectArray[i].currentRotation,
        objectArray[i].translation
      );

      if (objectArray[i].currentRotation > 6) {
        objectArray[i].currentRotation -= 6;
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
 * @param {number[]} translate translation value
 */
function animate(gl, canvas, uniformLocation, vertexLength, rotate, translate) {
  //projection View Matrix
  const fieldOfView = (45 * Math.PI) / 180; //45 degree angle
  const aspect = canvas.clientWidth / canvas.clientHeight;

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

  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexLength / 2);
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

  var zIndex = -10;

  objectArray.push({
    object: createCircle(100, 0, 0, 0.3, [0, 0, 1, 1.0]),
    translation: [-1, 0, zIndex],
    deltaRotation: 0.1,
    currentRotation: 0,
  });

  objectArray.push({
    object: createCircle(100, 0, 0, 0.5, [0, 0, 0, 1.0]),
    translation: [0, 0, zIndex],
    deltaRotation: 0,
    currentRotation: 0,
  });

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
