import * as T from 'three';
// Keep the camera on one side of the eye-line; the listener stays on the same screen side after a cut.
export function composeDialogue(camera,playerEyes,guestEyes,size,who,inset=0){
  const speaker=who==='guest'?guestEyes:playerEyes,listener=who==='guest'?playerEyes:guestEyes;
  const axis=guestEyes.clone().sub(playerEyes).setY(0),separation=axis.length();axis.divideScalar(separation||1);
  if(separation<.02)axis.set(1,0,0);
  const side=new T.Vector3(axis.z,0,-axis.x);
  const focus=speaker.clone(),delta=new T.Vector3();
  const safe=T.MathUtils.clamp(inset,0,.4),visible=1-safe;
  camera.fov=size==='wide'?44:size==='close'?32:37;camera.updateProjectionMatrix();
  const tan=Math.tan(camera.fov*Math.PI/360),aspect=camera.aspect;
  if(size==='wide'){
    focus.add(listener).multiplyScalar(.5);focus.y-=.34;
    const distance=Math.max(1.25/(2*tan*visible),(separation+.65)/(2*tan*aspect));
    delta.copy(side).multiplyScalar(distance);delta.y=.10*distance;
  }else{
    const height=size==='close'?.41:.95;
    const distance=Math.max(height/(2*tan*visible),(size==='close'?.225:.53)/(2*tan*aspect));
    const towards=axis.clone().multiplyScalar(who==='guest'?-1:1);
    delta.copy(towards).multiplyScalar(.82).addScaledVector(side,.58).normalize().multiplyScalar(distance);
    delta.y=.035*distance;focus.y-=size==='close'?.040:.19;
    focus.addScaledVector(towards,Math.min(.06,distance*tan*aspect*.14));
  }
  focus.y-=safe*delta.length()*tan;
  camera.position.copy(focus).add(delta);camera.lookAt(focus);camera.updateMatrixWorld();
  const view=speaker.clone().applyMatrix4(camera.matrixWorldInverse);
  return {distance:-view.z,blur:size==='wide'?0:size==='close'?3.5:1.65,band:size==='close'?.115:.24};
}

// A single scene render and a depth-aware gather; the UI is outside the render target.
export function createFocusPass(renderer){
  const material=new T.ShaderMaterial({
    uniforms:{sceneColor:{value:null},sceneDepth:{value:null},pixel:{value:new T.Vector2()},nearFar:{value:new T.Vector2()},focus:{value:1},band:{value:.12},radius:{value:2}},
    vertexShader:'varying vec2 tex; void main(){tex=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`varying vec2 tex;uniform sampler2D sceneColor,sceneDepth;uniform vec2 pixel,nearFar;uniform float focus,band,radius;
      float metres(vec2 p){float z=texture2D(sceneDepth,p).x;return nearFar.x*nearFar.y/(nearFar.y-z*(nearFar.y-nearFar.x));}
      void main(){float depth=metres(tex),amount=smoothstep(band,band+.68,abs(depth-focus));vec3 color=texture2D(sceneColor,tex).rgb;
        if(amount>.018){float weight=1.;for(int i=0;i<14;i++){float j=float(i)+.5;float angle=j*2.399963;vec2 p=tex+vec2(cos(angle),sin(angle))*sqrt(j/14.)*pixel*radius*amount;
          float other=metres(p);float w=smoothstep(-.13,.02,other-depth);color+=w*texture2D(sceneColor,p).rgb;weight+=w;}color/=weight;}
        gl_FragColor=vec4(color,1.);
        #include <colorspace_fragment>
      }`,depthTest:false,depthWrite:false,toneMapped:false
  });
  const screen=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2),material),lens=new T.Camera(),size=new T.Vector2();screen.add(quad);
  let target;
  return function render(scene,camera,shot){
    if(!shot?.blur){renderer.render(scene,camera);return;}
    renderer.getDrawingBufferSize(size);
    if(!target){
      target=new T.WebGLRenderTarget(size.x,size.y,{depthTexture:new T.DepthTexture(size.x,size.y,T.UnsignedIntType),samples:Math.min(2,renderer.capabilities.maxSamples)});
      target.texture.colorSpace=T.SRGBColorSpace;
    }else if(size.x!==target.width||size.y!==target.height)target.setSize(size.x,size.y);
    const u=material.uniforms;u.sceneColor.value=target.texture;u.sceneDepth.value=target.depthTexture;
    u.pixel.value.set(1/size.x,1/size.y);u.focus.value=shot.distance;u.band.value=shot.band;
    u.radius.value=shot.blur*renderer.getPixelRatio();u.nearFar.value.set(camera.near,camera.far);
    renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(screen,lens);
  };
}
