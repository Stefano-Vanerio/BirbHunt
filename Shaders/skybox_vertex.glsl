#version 300 es

//ins
in vec3 in_position;

//outs    
out vec3 sampleDir;
     
void main() {
  // Pass the position for the skybox
  gl_Position = vec4(in_position,1.0);
 
  // Pass the position 
  sampleDir = in_position;
}