#version 300 es

//ins
in vec3 a_position;
in vec2 a_uv;
in vec3 in_normal;  

//uniforms
uniform mat4 matrix; 
uniform mat4 n_Matrix; 
uniform mat4 p_Matrix; 

//outs
out vec3 fs_normal; 
out vec2 uvFS;
out vec3 sunPos;
out vec3 fs_position;

void main() {
  //normals for the fragment
  fs_normal= mat3(n_Matrix)*in_normal; 

  //texture coordinates
  uvFS = a_uv;

  //positions of the target
  fs_position = (p_Matrix * vec4(a_position,1.0)).xyz;
  gl_Position = matrix * vec4(a_position,1.0);
}