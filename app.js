//general model
var canvas;
var gl;
var vaos = [];
var textures = [];
var images = [];
var pathname = [];
var redModel;
var viewMatrix;
var perspectiveMatrix;
var animation = false;

//directory
var BaseDir;

//skybox
var skyboxVertPos;
var skyboxTexture;
var inverseViewProjMatrix;
var skyboxVao;
var inverseViewProjMatrixHandle;
var skyboxTexHandle;
var skyboxVertPosAttr;

//lights
var specularColor = [0.1, 0.1, 0.1];
var specularPower = 20.0;  
var ambientLightCoeff = 0.3;
var ambientLightAlpha = 1.0;
var sunPosition = [-20.0, 20.0, -20.0];
var sunColor = [1.0, 1.0, 1.0];
var Decay = 0.0;
var Target = 6.0;

//-----------------------------------------Shaders intialization------------------------------------------//
//shaders initialization
async function init(){
  await loadModels();
  var path = window.location.pathname;
  var page = path.split("/").pop();
  BaseDir = window.location.href.replace(page, '');
  ShaderDir = BaseDir+"Shaders/"; 

  canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }
 
  await utils.loadFiles([ShaderDir + 'vertex.glsl', ShaderDir + 'fragment.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

    program = utils.createProgram(gl, vertexShader, fragmentShader);
    });

  await utils.loadFiles([ShaderDir + 'skybox_vertex.glsl', ShaderDir + 'skybox_fragment.glsl'], function (shaderText) {
    var vertexSkyShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentSkyShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
 
    skyboxProgram = utils.createProgram(gl, vertexSkyShader, fragmentSkyShader);
    });

  gl.useProgram(program);
  main();
}

//-------------------------------------------Start of Main----------------------------------------------//
function main () {

  //generation of world and sky
  LoadEnvironment();
  gl.useProgram(program);
  world_generation();
  GetAttributesAndUniforms();
  gl.useProgram(program);

  //add listeners for commands
  canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
  window.addEventListener("keyup", keyFunctionUp, false);
	window.addEventListener("keydown", keyFunctionDown, false);
    
  aspectRatio = canvas.clientWidth/canvas.clientHeight;

  //set global states (viewport size, viewport background color, Depth test)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.85, 0.85, 0.85, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  //define directional light
  var dirLightAlpha = -utils.degToRad(60);  //da vedere poi che angolo mettere
  var dirLightBeta  = -utils.degToRad(120);
  var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta), Math.sin(dirLightAlpha), Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)];
  var directionalLightColor = [1.0, 1.0, 1.0];
  
  //creation of handlers (light)
  var lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
  var lightColorHandle = gl.getUniformLocation(program, 'lightColor');
  var eyePositionHandle = gl.getUniformLocation(program, 'eyePosition');
  var materialEmissColorHandle = gl.getUniformLocation(program, 'mEmissColor');
  var materialSpecColorHandle = gl.getUniformLocation(program, 'mSpecColor');
  var materialSpecPowerHandle = gl.getUniformLocation(program, 'mSpecPower');
	var ambientCoeffHandle = gl.getUniformLocation(program, 'ambCoeff');
	var ambientAlphaHandle = gl.getUniformLocation(program, 'ambAlpha');
  var sunColorHandle = gl.getUniformLocation(program, 'sunColor');
	var sunPositionHandle = gl.getUniformLocation(program, 'sunPosition');
  var targetHandle = gl.getUniformLocation(program, 'Target');
	var decayHandle = gl.getUniformLocation(program, 'Decay');

  //creation of handlers(model)
  var normalAttributeLocation = gl.getAttribLocation(program, "in_normal");
  var normalMatrixPositionHandle = gl.getUniformLocation(program, 'n_Matrix');
  var vertexMatrixPositionHandle = gl.getUniformLocation(program, 'p_Matrix');
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position"); 
  var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");  
  var matrixLocation = gl.getUniformLocation(program, "matrix");  
  var textLocation = gl.getUniformLocation(program, "u_texture");

  perspectiveMatrix = utils.MakePerspective(90, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    
  //loading of texture for models
  for (k=0; k<models_index; k++) {
    if (!k) {
      loadAsset(k, pathname[0])}
    else {
      loadAsset(k, pathname[1]);
    }
  }

//-------------------------------------Red's vao binding and texture------------------------------------//
  vaoRed = gl.createVertexArray();
  gl.bindVertexArray(vaoRed);

  var positionBuffer = gl.createBuffer();

  //vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redModel.vertices), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  //uv buffer
  var uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redModel.textures), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  //normals buffer
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(redModel.vertexNormals), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  //indices buffer
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(redModel.indices), gl.STATIC_DRAW); 

  // create a texture
  var textureRed = gl.createTexture();
  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, textureRed);
  
  // load an image
  var imageRed = new Image();

  imageRed.src = BaseDir + TextureDir+"/texture_birb.png";
  imageRed.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, textureRed);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageRed);
            
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_2D);
  };
    
  drawScene();

//--------------------------------------Draw of the entire game-----------------------------------------//
  //animation of flying bird  
  function animate(){
    currentTime = (new Date).getTime();
    
    if(!animation){
      bird_dyn_z=bird_z_coordinate;
      bird_dyn_x=bird_x_coordinate;
      bird_dyn_y=2.0;
      worldMatrix = utils.MakeWorld(bird_dyn_x, 2.0, bird_dyn_z, bird_rotation, 1.0, 1.0, 1.0);
    } else {
      bird_dyn_z=bird_z_coordinate+Math.cos(currentTime/1100);
      bird_dyn_x=bird_x_coordinate+Math.sin(currentTime/1200);
      bird_dyn_y=bird_y_coordinate+Math.cos(currentTime/1000);
      worldMatrix = utils.MakeWorld(bird_dyn_x, bird_dyn_y, bird_dyn_z, bird_rotation*Math.cos(currentTime/2000), 1.0, 1.0, 1.0);
    }
    lastUpdateTime = currentTime;      

    if(Math.sqrt(Math.pow((bird_dyn_x-cx),2)+Math.pow((bird_dyn_z-cz),2))<2.0 && win==false){
      alert("YOU WIN!!");
      location.reload();
      win = true;
    }  
  }


  function drawScene() {
    computeMatrices();
    gl.useProgram(program);
    animate();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
 
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    var normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix)); 
   
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(worldMatrix)); 
 
    gl.uniform3fv(lightColorHandle,  directionalLightColor);
    gl.uniform3fv(lightDirectionHandle,  directionalLight);
    gl.uniform3fv(eyePositionHandle, [0.0, 0.0, 0.0]); 
    gl.uniform3fv(materialSpecColorHandle, specularColor);
    gl.uniform1f(materialSpecPowerHandle, specularPower);  
    gl.uniform1f(ambientCoeffHandle, ambientLightCoeff);
    gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);
    gl.uniform3fv(materialEmissColorHandle, [0.0, 0.0, 0.0]); //no emission of light

    gl.uniform1f(targetHandle, Target);
    gl.uniform1f(decayHandle, Decay);
    gl.uniform3fv(sunColorHandle, sunColor);
    gl.uniform3fv(sunPositionHandle, sunPosition);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureRed);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vaoRed);
    gl.drawElements(gl.TRIANGLES, redModel.indices.length, gl.UNSIGNED_SHORT, 0 );

    //drawing of elements (trees and rocks)
    for (xd=0; xd<number_elements; xd++) {
      drawTrees(object_type[xd], object_x_coordinates[xd], object_z_coordinates[xd]);
    }

    //drawing of ground
    for (xd=minX; xd<maxX+2; xd=xd+2) {
      for(zd=minZ; zd<maxZ+2; zd=zd+2) {
        drawGround(xd,zd);
      }
    }

    //drawing of skybox
    drawSkybox(); 
    window.requestAnimationFrame(drawScene);
  }

//----------------------------------------Elements load and draw----------------------------------------//
  //creation of buffers for each element
  function loadAsset(index, pathname) {
		
    vaos[index] = gl.createVertexArray();
    gl.bindVertexArray(vaos[index]);

    //vertex buffer
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[index].vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //uv buffer
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[index].textures), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //indices buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[index].indices), gl.STATIC_DRAW);
        
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[index].vertexNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //create a texture
    textures[index] = gl.createTexture();
    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, textures[index]);
    
    // load an image
    images[index] = new Image();

    images[index].src = BaseDir + TextureDir + pathname;
    images[index].onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, textures[index]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
                
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.generateMipmap(gl.TEXTURE_2D);
    };	
	}

  //function to draw trees
  function drawTrees(index, x, z){
    gl.useProgram(program);

    var wMatrix = utils.MakeWorld(x, 0.0, z, 0.0, 0.0, 0.0, 1.5);
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, wMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    var normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix)); 
   
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(wMatrix));

    gl.uniform3fv(lightColorHandle,  directionalLightColor);
    gl.uniform3fv(lightDirectionHandle,  directionalLight);
    gl.uniform3fv(eyePositionHandle, [0.0, 0.0, 0.0]); 
    gl.uniform3fv(materialSpecColorHandle, specularColor);
    gl.uniform1f(materialSpecPowerHandle, specularPower);  
    gl.uniform1f(ambientCoeffHandle, ambientLightCoeff);
    gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);
    gl.uniform3fv(materialEmissColorHandle, [0.0, 0.0, 0.0]); //no emission of light

    gl.uniform1f(targetHandle, Target);
    gl.uniform1f(decayHandle, Decay);
    gl.uniform3fv(sunColorHandle, sunColor);
    gl.uniform3fv(sunPositionHandle, sunPosition);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[index]);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vaos[index]);
    gl.drawElements(gl.TRIANGLES, models[index].indices.length, gl.UNSIGNED_SHORT, 0 );
  }

  //function to draw ground
  function drawGround(x,z){
    gl.useProgram(program);

    var wMatrix = utils.MakeWorld(x, 0.0, z, 0.0, 0.0, 0.0, 1.0);
    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, wMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    var normalMatrix = utils.invertMatrix(utils.transposeMatrix(viewWorldMatrix)); 
   
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(normalMatrix));
    gl.uniformMatrix4fv(vertexMatrixPositionHandle, gl.FALSE, utils.transposeMatrix(wMatrix));

    gl.uniform3fv(lightColorHandle,  directionalLightColor);
    gl.uniform3fv(lightDirectionHandle,  directionalLight);
    gl.uniform3fv(eyePositionHandle, [0.0, 0.0, 0.0]); 
    gl.uniform3fv(materialSpecColorHandle, specularColor);
    gl.uniform1f(materialSpecPowerHandle, specularPower);  
    gl.uniform1f(ambientCoeffHandle, ambientLightCoeff);
    gl.uniform1f(ambientAlphaHandle, ambientLightAlpha);
    gl.uniform3fv(materialEmissColorHandle, [0.0, 0.0, 0.0]); //no emission of light

    gl.uniform1f(targetHandle, Target);
    gl.uniform1f(decayHandle, Decay);
    gl.uniform3fv(sunColorHandle, sunColor);
    gl.uniform3fv(sunPositionHandle, sunPosition);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vaos[0]);
    gl.drawElements(gl.TRIANGLES, models[0].indices.length, gl.UNSIGNED_SHORT, 0 );
  }

//------------------------------------------Skybox operations-------------------------------------------//

//loading of the element necessary for the skybox (texture and model)
function LoadEnvironment(){
  gl.useProgram(skyboxProgram);
  skyboxVertPos = new Float32Array(
  [
    -1, -1, 1.0,
     1, -1, 1.0,
    -1,  1, 1.0,
    -1,  1, 1.0,
     1, -1, 1.0,
     1,  1, 1.0,
  ]);
  
  skyboxVao = gl.createVertexArray();
  gl.bindVertexArray(skyboxVao);
  
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, skyboxVertPos, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(skyboxVertPosAttr);
  gl.vertexAttribPointer(skyboxVertPosAttr, 3, gl.FLOAT, false, 0, 0);
  
  skyboxTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0+3);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
  
  var envTexDir = BaseDir+"Assets/Skybox/";

  const faceInfos = [
      {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
          url: envTexDir+'bluecloud_ft.jpg',// posx
      },
      {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
          url: envTexDir+'bluecloud_bk.jpg',// negx
      },
      {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
          url: envTexDir+'bluecloud_dn.jpg',// posy
      },
      {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
          url: envTexDir+'bluecloud_up.jpg',// negy
      },
      {
          target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
          url: envTexDir+'bluecloud_rt.jpg',// posz
      },
      {
          target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
          url: envTexDir+'bluecloud_lf.jpg',// negz
      },
  ];
  faceInfos.forEach((faceInfo) => {
      const {target, url} = faceInfo;
      
      // Upload the canvas to the cubemap face.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1024;
      const height = 1024;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      
      // setup each face so it's immediately renderable
      gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
      
      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener('load', function() {
          // Now that the image has loaded upload it to the texture.
          gl.activeTexture(gl.TEXTURE0+3);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
          gl.texImage2D(target, level, internalFormat, format, type, image);
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });     
  });
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

//draw of the skybox, use of "skyboxProgram" and different shaders
function drawSkybox(){
  gl.useProgram(skyboxProgram);
  
  gl.activeTexture(gl.TEXTURE0+3);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
  gl.uniform1i(skyboxTexHandle, 3);
 
  var viewMatrix = utils.MakeView(0.0, 0.0, 0.0, elevation, angle);
  var viewProjMat = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);
  var inverseViewProjMatrix = utils.invertMatrix(viewProjMat);
  
  gl.uniformMatrix4fv(inverseViewProjMatrixHandle, gl.FALSE, utils.transposeMatrix(inverseViewProjMatrix));
  gl.bindVertexArray(skyboxVao);
  gl.depthFunc(gl.LEQUAL);
  gl.drawArrays(gl.TRIANGLES, 0, 1*6);
}

//uniforms used for the skybox
function GetAttributesAndUniforms(){
  gl.useProgram(skyboxProgram);
  skyboxTexHandle = gl.getUniformLocation(skyboxProgram, "u_texture"); 
  inverseViewProjMatrixHandle = gl.getUniformLocation(skyboxProgram, "inverseViewProjMatrix"); 
  skyboxVertPosAttr = gl.getAttribLocation(skyboxProgram, "in_position");
}

} 

//-----------------------------------------Loading of Models--------------------------------------------//
//loading of red's model
async function loadRed(){
  var path = window.location.pathname;
  var page = path.split("/").pop();
  BaseDir = window.location.href.replace(page, '');
  var RedDir = BaseDir+ModelsDir+"red.obj";
  var objStr = await utils.get_objstr(RedDir);
  redModel = new OBJ.Mesh(objStr); 
}

//load of ambient's element models
async function loadObject(where){
  var path = window.location.pathname;
  var page = path.split("/").pop();
  BaseDir = window.location.href.replace(page, '');
  var directory = BaseDir+ModelsDir+where;
  var objStr = await utils.get_objstr(directory);
  models[models_index] = new OBJ.Mesh(objStr); 
  models_index=models_index+1;
}

//general load of models
async function loadModels(){
  await loadRed("red.obj");
  await loadObject("ground.obj");      //0
  await loadObject("flower.obj");      //1
  await loadObject("plant.obj");       //2
  await loadObject("rock1.obj");       //3
  await loadObject("rock2.obj");       //4
  await loadObject("rock3.obj");       //5
  await loadObject("smallrock.obj");   //6
  await loadObject("stump.obj");       //7 
  await loadObject("tree4.obj");       //8
  await loadObject("tree3.obj");       //9
  await loadObject("tree2.obj");       //10
  await loadObject("tree1.obj");       //11

  //references to textures
  pathname[0]="green.png";
  pathname[1]="Texture_01.jpg";
}

//---------------------------------------Movement and animations----------------------------------------//
//start of the animation
function startAnimation(){
  animation = !animation;
}

//computation of the variations of the coordinates of camera
function computeMatrices() {
  preCx = cx;
  preCz = cz;

  viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

  var viewMatrixTransposed = utils.transposeMatrix(viewMatrix);

  viewMatrixTransposed[12] = viewMatrixTransposed[13] = viewMatrixTransposed[14] = 0.0;
  var xaxis = [viewMatrixTransposed[0], viewMatrixTransposed[4], viewMatrixTransposed[8]];
  var yaxis = [viewMatrixTransposed[1], viewMatrixTransposed[5], viewMatrixTransposed[9]];
  var zaxis = [viewMatrixTransposed[2], viewMatrixTransposed[6], viewMatrixTransposed[10]];

  //update of the camera's angles
  if (camAngle || camElevation) {
    var qx = Quaternion.fromAxisAngle(xaxis, utils.degToRad(camElevation));
    var qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(camAngle));
    var qz = Quaternion.fromAxisAngle(zaxis, utils.degToRad(camZ));
    var viewMatFromQuat = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(qy.toMatrix4(), qx.toMatrix4()), qz.toMatrix4()), viewMatrixTransposed);
    var R11 = viewMatFromQuat[10];
    var R12 = viewMatFromQuat[8];
    var R13 = viewMatFromQuat[9];
    var R21 = viewMatFromQuat[2];
    var R31 = viewMatFromQuat[6];

    if ((R31 < 1) && (R31 > -1)) {
        theta = -Math.asin(R31);
        psi = Math.atan2(R21 / Math.cos(theta), R11 / Math.cos(theta));
    } else if (R31 <= -1) {
        theta = Math.PI / 2;
        psi = Math.atan2(R12, R13);
    } else {
        theta = -Math.PI / 2;
        psi = Math.atan2(-R12, -R13);
    }

    theta = (theta >= 0.8) ? 0.8 : (theta <= -0.8 ? -0.8 : theta);

    elevation = utils.radToDeg(theta);
    angle = -utils.radToDeg(psi);
  }

  //update of camera coordinates
  var delta = utils.multiplyMatrixVector(viewMatrixTransposed, [vx, vy, vz, 0.0]);
  cx += delta[0]/20 ;
  cz += delta[2]/20 ;

  //move is invalid due to collisions with models
  if (checkCollisionsRocks() ||checkCollisionsTrees() || checkCollisionBird()) {
      cx = preCx;
      cz = preCz;
  }

  //update of the view matrix
  viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
}

init();

//---------------------------------------------Raycasting-----------------------------------------------//
//activation of raycasting
function activateRaycasting(){
  window.addEventListener("mouseup", myOnMouseUp);
}

//deactivation of raycasting
function deactivateRaycasting(){
  window.removeEventListener("mouseup", myOnMouseUp);
}

//This algorithm is taken from the book Real Time Rendering fourth edition (exercise lesson 04)
function raySphereIntersection(rayStartPoint, rayNormalisedDir, sphereCentre, sphereRadius){

	//Distance between sphere origin and origin of ray
	var l = [sphereCentre[0] - rayStartPoint[0], sphereCentre[1] - rayStartPoint[1], sphereCentre[2] - rayStartPoint[2]];
	var l_squared = l[0] * l[0] + l[2] * l[2] + l[1] * l[1];

	//If this is true, the ray origin is inside the sphere so it collides with the sphere
	if(l_squared < (sphereRadius*sphereRadius)){
		return true;
	}

	//Projection of l onto the ray direction 
	var s = l[0] * rayNormalisedDir[0] + l[1] * rayNormalisedDir[1] + l[2] * rayNormalisedDir[2];

	//The spere is behind the ray origin so no intersection
	if(s < 0){
		return false;
	}

	//Squared distance from sphere centre and projection s with Pythagorean theorem
	var m_squared = l_squared - (s*s);
 
	//If this is true the ray will miss the sphere
	if(m_squared > (sphereRadius*sphereRadius)){
		return false;
	}

	//Now we can say that the ray will hit the sphere 
	return true;
}

//normalization of a vector
function normaliseVector(vec){
var magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
var normVec = [vec[0]/magnitude, vec[1]/magnitude, vec[2]/magnitude];
return normVec;
}

//function to apply when click with raycasting active
function myOnMouseUp(ev){

	//This is a way of calculating the coordinates of the click in the canvas taking into account its possible displacement in the page
	var top = 0.0, left = 0.0;
	while (canvas && canvas.tagName !== 'BODY') {
		top += canvas.offsetTop;
		left += canvas.offsetLeft;
		canvas = canvas.offsetParent;
	}
	var x = ev.clientX - left;
	var y = ev.clientY - top;
		
	//Here we calculate the normalised device coordinates from the pixel coordinates of the canvas
	var normX = (2*x)/ gl.canvas.width - 1;
	var normY = 1 - (2*y) / gl.canvas.height;

	//We need to go through the transformation pipeline in the inverse order so we invert the matrices
	var projInv = utils.invertMatrix(perspectiveMatrix);
  var viewInv = utils.invertMatrix(viewMatrix);
	
	//Find the point (un)projected on the near plane, from clip space coords to eye coords
	//z = -1 makes it so the point is on the near plane
	//w = 1 is for the homogeneous coordinates in clip space
	var pointEyeCoords = utils.multiplyMatrixVector(projInv, [normX, normY, -1, 1]);

	//This finds the direction of the ray in eye space
	//Formally, to calculate the direction you would do dir = point - eyePos but since we are in eye space eyePos = [0,0,0] 
	//w = 0 is because this is not a point anymore but is considered as a direction
	var rayEyeCoords = [pointEyeCoords[0], pointEyeCoords[1], pointEyeCoords[2], 0];
	
	//We find the direction expressed in world coordinates by multipling with the inverse of the view matrix
	var rayDir = utils.multiplyMatrixVector(viewInv, rayEyeCoords);
	var normalisedRayDir = normaliseVector(rayDir);

	//The ray starts from the camera in world coordinates
  var rayStartPoint = [cx, cy, cz];

  var bird_coords = [bird_dyn_x, bird_dyn_y, bird_dyn_z];
	var hit = raySphereIntersection(rayStartPoint, normalisedRayDir, bird_coords, 0.8);
	if(hit){
		alert("YOU WIN!");
    location.reload();
	}
}