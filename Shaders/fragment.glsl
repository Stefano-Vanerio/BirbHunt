#version 300 es

precision mediump float;

//ins
in vec2 uvFS;
in vec3 fs_normal;
in vec3 fs_position;

//uniforms
uniform sampler2D u_texture;  //texture of the model
uniform vec3 lightDirection;  // directional light direction vector
uniform vec3 lightColor;      //directional light color 
uniform vec3 eyePosition;     //Observer's position
uniform vec3 sunPosition;     //position of point light
uniform vec3 sunColor;        //color of point light
uniform vec3 mEmissColor;     //material emission color 
uniform vec3 mSpecColor;      //material specular color
uniform float mSpecPower;     //power of specular ref
uniform float ambCoeff;       //ambient coefficient
uniform float ambAlpha;       //ambient constant
uniform float Target;         //target of the point light
uniform float Decay;          //decay of the point light

//outs
out vec4 outColor;            //final color

//functions

//computation of the diffuse component
vec3 f_diff(vec3 lx, vec3 n) {
	vec3 txt_col = texture(u_texture, uvFS).xyz;
	return txt_col * clamp(dot(normalize(lx), n), 0.0, 1.0);
}

//computation of the specular component
vec3 f_spec(vec3 lx, vec3 eye_dir, vec3 n) {
	lx = normalize(lx);
	vec3 r = 2.0 * dot(lx, n) * n - lx;
	return mSpecColor * pow(clamp(dot(eye_dir, r), 0.0, 1.0), mSpecPower);
}

//BRDF of the model
vec3 f_BRDF(vec3 lx, vec3 eye_dir, vec3 n) {
	return clamp(f_diff(lx, n) + f_spec(lx, eye_dir, n), 0.0, 1.0);
}

void main() {
  //directional light
  vec3 nEyeDirection = normalize(eyePosition - fs_position);
  vec3 nLightDirection = - normalize(lightDirection);
  vec3 nNormal = normalize(fs_normal);
  vec3 dirLight = lightColor * f_BRDF(nLightDirection, nEyeDirection, nNormal);

  //point light
  vec3 OlightDir = normalize(sunPosition - fs_position);
  vec3 OlightColor = sunColor * pow(Target/(length(sunPosition-fs_position)), Decay);
  OlightColor = OlightColor*f_BRDF(OlightDir, nEyeDirection, nNormal);

  //ambient light
  vec3 ambientLight = texture(u_texture, uvFS).xyz * ambCoeff * ambAlpha;

  //final color 
  outColor = vec4(clamp(OlightColor + dirLight + ambientLight + mEmissColor, 0.0, 1.0), texture(u_texture, uvFS).a);
}