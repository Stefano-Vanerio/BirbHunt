#version 300 es

precision mediump float;

//ins
in vec3 sampleDir;
 
//uniforms
uniform samplerCube u_texture;
uniform mat4 inverseViewProjMatrix;

//outs
out vec4 outColor;
 
void main() {
    vec4 p = inverseViewProjMatrix*vec4(sampleDir, 1.0);
    vec4 rgba = texture(u_texture, normalize(p.xyz / p.w));
    
    //color for the skybox
    outColor = vec4(rgba.rgb, 1.0);
}