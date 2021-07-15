var lastTime=0;
var audio;
var audioPlaying=false;
var mouseState = false;
var lastMouseX = -100; 
var lastMouseY = -100;

//update of the values while key is pressed
var keyFunctionDown = function(e) {
	if(!keys[e.keyCode]) {
		keys[e.keyCode] = true;
		switch(e.keyCode) {
			case 77:
				cy += 1.0;
				break;
			case 78:
				cy -= 1.0;
				break;
			case 65:
				camAngle += 2.0;	
				break;
			case 68:
				camAngle -= 2.0;
				break;
			case 87:
				camElevation += 2.0;
				break;
			case 83:
				camElevation -= 2.0;
				break;
			case 37:
				vx-=5;
				break;
			case 39:
				vx+=5;
				break;
			case 38:
				preVz = vz;
                vz -= 5;
				break;
			case 40:
				preVz = vz;
                vz += 5;
				break;
			case 70:
				toggleFullScreen();
				break;
		}
	}
}

//update of the values while key is not more pressed
var keyFunctionUp = function(e) {
	if(keys[e.keyCode]) {
		keys[e.keyCode] = false;
		switch(e.keyCode) {		
			case 65:
				camAngle -= 2.0;	
				break;
			case 68:
				camAngle += 2.0;
				break;
			case 87:
				camElevation -= 2.0;
				break;
			case 83:
				camElevation += 2.0;
				break;
			case 37:
				vx+=5;
				break;
			case 39:
				vx-=5;
				break;
			case 38:
				preVz = vz;
                vz += 5;
				break;
			case 40:
				preVz = vz;
                vz -= 5;	
				break;
		}
	}
}

//click of the mouse
function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}

//de-clicking of the mouse
function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}

//change to small canvas to fullscreen
function toggleFullScreen() {
	var canvas = document.getElementById("c");
	if(!document.fullscreenElement) {
		canvas.requestFullscreen();
		deactivateRaycasting();
	}
	else {
		if(document.exitFullscreen) {
			document.exitFullscreen(); 
		}
		if(lastTime){
			activateRaycasting();
		}
	}
}

//activation/deactivation of the raycasting
function onCheckBoxChange(checkbox) {
    if (lastTime) {
        deactivateRaycasting();
        lastTime=0;
    } else {
        activateRaycasting();
        lastTime=1;
    }
}

//start animation of the bird
function fly() {
    startAnimation();
}

//start/stop the music
function play() {
	if(!audioPlaying) {
		audio = new Audio(BaseDir+'/Assets/Audio/bird_chip.mp4');
		audio.play();
		audioPlaying=true;}
	else {
		audio.pause();
		audio.currentTime = 0;
		audioPlaying=false;
	}
  }