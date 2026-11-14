import * as T from 'three';

// Small invented keepsakes, not portraits or claims about the narrator's family.
// All images are drawn locally; there is no external image request.
export function addPersonalDetails(scene,{textures=true,anisotropy=4}={}){
 const root=new T.Group();root.name='AffairesPersonnelles';scene.add(root);
 const matte=color=>new T.MeshStandardMaterial({color,roughness:.96});
 const paper=matte(0xe8ddc1),tape=matte(0xc9ba94);
 function box(parent,w,h,d,x,y,z,material){
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function texture(draw){
  if(!textures||typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');if(!ctx)return null;draw(ctx);
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=anisotropy;return map;
 }
 function picture(kind){return texture(c=>{
  c.fillStyle='#e8dfc8';c.fillRect(0,0,512,512);
  if(kind==='drawing'){
   c.strokeStyle='#697988';c.lineWidth=5;c.lineCap='round';
   c.beginPath();c.moveTo(34,392);c.quadraticCurveTo(240,370,478,395);c.stroke();
   c.strokeStyle='#b4775b';c.strokeRect(142,208,217,177);
   c.beginPath();c.moveTo(112,211);c.lineTo(250,91);c.lineTo(383,213);c.stroke();
   c.strokeStyle='#527d94';c.strokeRect(166,242,56,54);c.strokeRect(277,242,56,54);
   c.strokeStyle='#8a7061';c.strokeRect(225,306,52,78);
   c.strokeStyle='#d2ac4f';c.beginPath();c.arc(416,85,33,0,Math.PI*2);c.stroke();
   for(let i=0;i<10;i++){const a=i*Math.PI/5;c.beginPath();c.moveTo(416+Math.cos(a)*42,85+Math.sin(a)*42);c.lineTo(416+Math.cos(a)*55,85+Math.sin(a)*55);c.stroke();}
   c.strokeStyle='#648576';c.beginPath();c.moveTo(72,386);c.lineTo(79,270);c.moveTo(76,325);c.lineTo(44,302);c.moveTo(79,309);c.lineTo(110,281);c.stroke();
  }else{
   const g=c.createLinearGradient(0,26,0,466);g.addColorStop(0,'#91a9ad');g.addColorStop(.55,'#d0c7a9');g.addColorStop(1,'#657a74');
   c.fillStyle=g;c.fillRect(26,26,460,430);
   c.save();c.beginPath();c.rect(26,26,460,430);c.clip();
   if(kind==='mountain'){
    for(let layer=0;layer<4;layer++){
     c.fillStyle=['#a4adb0','#858e89','#687d72','#4f655a'][layer];c.beginPath();c.moveTo(0,500);
     for(let x=0;x<=530;x+=15)c.lineTo(x,205+layer*48+Math.sin(x*.012+layer*2)*48+Math.sin(x*.034+layer)*24);
     c.lineTo(530,500);c.fill();
    }
    c.fillStyle='#d9d9c7';c.beginPath();c.moveTo(181,226);c.lineTo(215,170);c.lineTo(259,228);c.lineTo(224,211);c.lineTo(207,227);c.closePath();c.fill();
   }else{
    c.fillStyle='#5e838b';c.fillRect(0,237,512,280);
    c.strokeStyle='#c7d4c7';c.lineWidth=2;for(let y=252;y<470;y+=13){c.beginPath();c.moveTo(0,y);c.bezierCurveTo(140,y-8,350,y+5,512,y);c.stroke();}
    c.fillStyle='#b8aa84';c.beginPath();c.moveTo(0,337);c.bezierCurveTo(90,385,230,351,512,424);c.lineTo(512,512);c.lineTo(0,512);c.fill();
    c.fillStyle='#606b60';c.beginPath();c.moveTo(26,205);c.lineTo(90,241);c.lineTo(26,274);c.fill();
   }
   let seed=1729;for(let i=0;i<12000;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=(seed%460)+26;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%430+26;c.fillStyle=i%2?'#ffffff10':'#242a2610';c.fillRect(x,y,1.3,1.3);}
   c.restore();
   c.fillStyle='#7d7a68';c.font='italic 19px Georgia';c.fillText(kind==='mountain'?'Un peu de montagne':'Le large',45,486);
  }
 });}
 function wallPicture(name,kind,w,h,position,rotation,tilt){
  const frame=new T.Group();frame.name=name;frame.position.fromArray(position);frame.rotation.y=rotation;root.add(frame);
  const print=new T.Group();print.rotation.z=tilt;frame.add(print);
  box(print,w,h,.002,0,0,0,paper);
  const face=new T.Mesh(new T.PlaneGeometry(w*.96,h*.96),new T.MeshStandardMaterial({color:0xffffff,map:picture(kind),roughness:1}));
  face.position.z=.0015;print.add(face);
  for(const x of [-w*.3,w*.3]){const strip=box(print,.043,.020,.001,x,h*.48,.003,tape);strip.rotation.z=x<0?-.16:.12;}
  return frame;
 }
 wallPicture('ImageMontagne','mountain',.24,.21,[-1.485,2.13,-.58],Math.PI/2,-.055);
 wallPicture('ImageDuLarge','sea',.20,.18,[-1.485,2.12,-.27],Math.PI/2,.045);
 wallPicture('DessinMaison','drawing',.25,.30,[1.483,1.78,-.47],-Math.PI/2,-.04);
 wallPicture('DessinPresDuLit','drawing',.17,.21,[-1.484,1.10,-.64],Math.PI/2,.04);
 const titles=[['Albert Camus','L’Étranger',0x6b7563],['Victor Hugo','Les Misérables',0x8d5142],['Antoine de Saint-Exupéry','Le Petit Prince',0x355a70]];
 function book(index,x,y,z,angle){
  const [author,title,color]=titles[index],group=new T.Group();group.name='Livre — '+title;group.userData.title=title;group.position.set(x,y,z);group.rotation.y=angle;root.add(group);
  const cover=matte(color),pages=matte(0xdaceb5),w=.155,d=.224,h=index===1?.038:.022;
  box(group,w-.007,h-.005,d-.008,.002,h/2,0,pages);
  for(const level of [.0015,h-.0015])box(group,w,.003,d,0,level,0,cover);
  box(group,.005,h,d,-w/2+.0025,h/2,0,cover);
  for(let k=1;k<5;k++)box(group,.0005,.0005,d-.014,w/2-.001,k*h/5,0,matte(0xb8aa91));
  const coverMap=texture(c=>{
   c.fillStyle='#'+new T.Color(color).getHexString();c.fillRect(0,0,512,512);c.strokeStyle='#d4c5a0';c.lineWidth=3;c.strokeRect(29,29,454,454);
   c.fillStyle='#e6d8b9';c.textAlign='center';c.font='20px Georgia';c.fillText(author,256,117,425);
   c.font='36px Georgia';c.fillText(title,256,242,425);c.font='15px Georgia';c.fillText('CLASSIQUES',256,420);
  });
  const face=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshStandardMaterial({map:coverMap,color:coverMap?0xffffff:color,roughness:1}));face.rotation.x=-Math.PI/2;face.position.y=h+.0004;group.add(face);
  return h;
 }
 const first=book(1,1.075,.805,-.51,.12);book(0,1.075,.805+first,-.51,-.09);book(2,-1.03,.658,.52,.18);
 // Two envelopes, a folded letter and a bookmark, kept clear of the aisle.
 const envelope=new T.Group();envelope.name='LettresGardees';envelope.position.set(.71,.804,-.37);envelope.rotation.y=-.16;root.add(envelope);
 box(envelope,.13,.002,.09,0,.002,0,paper);box(envelope,.12,.001,.085,.012,.004,-.008,matte(0xddd2b7));
 const flap=new T.BufferGeometry();flap.setAttribute('position',new T.Float32BufferAttribute([-.06,.005,-.05,.06,.005,-.05,0,.005,.015],3));flap.setIndex([0,2,1]);flap.computeVertexNormals();envelope.add(new T.Mesh(flap,matte(0xcbbd9e)));
 box(root,.009,.0007,.075,-1.01,.682,.61,matte(0xb89655)).name='MarquePage';
 return root;
}
