//directories
var ShaderDir = "Shaders/";
var ModelsDir = "Assets/Models/";
var TextureDir = "Assets/Textures/";

//programs
var program = null;
var skyboxProgram = null;

//time
var currentTime=(new Date).getTime();
var lastUpdateTime = (new Date).getTime();

//win condition
var win = false;

//speeds
var vz = 0.0;
var vx = 0.0;
var vy = 0.0;
var preVz = 0.0;

//delta camera
var camAngle=0.0;       
var camElevation=0.0;   
var camZ=0.0;

//camera
var cx=0.0;
var cy=2.0;
var cz=0.0;
var elevation=0.0;
var angle=-90.0;
var theta=0;
var psi=0;
var preCx = cx;
var preCz = cz;
var aspectRatio;

//models
var models = [];
var models_index=0;

//textures
var textures = [];
var texture_index=0;

//commands
var keys = [];
