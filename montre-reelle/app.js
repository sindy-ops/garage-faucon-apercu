(function(){
var T=THREE,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var cv=document.getElementById('c'),stage=document.getElementById('stage');
function glOK(){try{var c=document.createElement('canvas');return !!(window.WebGL2RenderingContext&&c.getContext('webgl2'))}catch(e){return false}}
if(!glOK()){stage.style.display='none';return}
var renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
var scene=new T.Scene(),camera=new T.PerspectiveCamera(24,1,.01,100);
var envS=new T.Scene();envS.add(new T.Mesh(new T.SphereGeometry(30,24,16),new T.MeshBasicMaterial({color:0x060504,side:T.BackSide})));
function box(w,h,x,y,z,c,k){var m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(k),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envS.add(m)}
box(16,5,-8,9,8,0xffe6c0,9);box(8,14,13,2,6,0xffd29a,4);box(20,2,0,-9,5,0xffe0b0,3.5);box(5,12,-14,0,-3,0xc8d8ff,2);box(18,2,0,13,-3,0xffffff,5);box(10,10,0,0,-14,0xffb070,3);
scene.environment=new T.PMREMGenerator(renderer).fromScene(envS,.02).texture;
var key=new T.DirectionalLight(0xffe6c4,1.6);key.position.set(-4,6,8);scene.add(key);
var root=new T.Group();scene.add(root);var parts=[],size=new T.Vector3(),axis=2,mixer=null,clock=new T.Clock();
new T.GLTFLoader().load('watch.glb',function(g){
  var m=g.scene;scene.userData.ready=true;
  var bb=new T.Box3().setFromObject(m),c=bb.getCenter(new T.Vector3());bb.getSize(size);
  m.position.sub(c);root.add(m);
  var s=1.6/Math.max(size.x,size.y,size.z);root.scale.setScalar(s);
  var dims=[size.x,size.y,size.z];axis=dims.indexOf(Math.min.apply(null,dims));
  var long=dims.indexOf(Math.max.apply(null,dims));
  var list=[];m.traverse(function(o){if(o.isMesh){var top=o;while(top.parent&&top.parent!==m&&!/^Hands$/.test(top.parent.name))top=top.parent;if(list.indexOf(top)<0)list.push(top)}});
  var cm=new T.Vector3();
  list.forEach(function(o){var b=new T.Box3().setFromObject(o),cc=b.getCenter(new T.Vector3());o.userData.c=cc.clone();cm.add(cc)});cm.divideScalar(list.length);
  list.forEach(function(o){var wp=new T.Vector3();o.getWorldPosition(wp);o.userData.base=o.position.clone();o.userData.rel=o.userData.c.clone().sub(cm);o.userData.axis=axis;o.userData.long=long;parts.push(o)});
  if(g.animations&&g.animations.length){mixer=new T.AnimationMixer(m);g.animations.forEach(function(a){mixer.clipAction(a).play()})}
  m.rotation.set(0,0,0);root.userData.m=m;go()
},undefined,function(e){console.error('modele',e)});
var W=1,H=1;function resize(){var r=stage.getBoundingClientRect();if(r.width===W&&r.height===H)return;W=r.width;H=r.height;renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setSize(W,H,false);camera.aspect=W/H;camera.position.set(0,0,W/H<.9?12.5:(W/H<1.4?9:7.6));camera.updateProjectionMatrix()}
function prog(){var h=document.documentElement.scrollHeight-innerHeight;return h>0?Math.min(1,Math.max(0,scrollY/h)):0}
function sm(a,b,x){x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)}
var p=0,run=false;
function frame(){resize();var dt=clock.getDelta(),t=clock.elapsedTime;if(mixer)mixer.update(dt);
 p+=(prog()-p)*.12;var e=RM?.7:sm(0,.34,p)*(1-sm(.8,1,p));
 parts.forEach(function(o){var u=o.userData,k=new T.Vector3(0,0,0);var r=u.rel.clone(),a=['x','y','z'][u.axis],l=['x','y','z'][u.long];
   var ex=new T.Vector3();ex[a]=r[a]*3.4+Math.sign(r[a]||1)*.04*size[a];ex[l]=r[l]*.55;var o2=['x','y','z'].filter(function(q){return q!==a&&q!==l})[0];ex[o2]=r[o2]*.55;
   var pe=u.base.clone().add(ex.multiplyScalar(e));o.position.copy(pe)});
 root.rotation.x=-.25-.55*sm(0,.34,p)+.0;root.rotation.y=-.5+.9*sm(0,.34,p)+Math.sin(p*3.14)*.25;root.rotation.z=.05;
 root.position.x=W/H>1.2?1.15:0;root.position.y=W/H>1.2?0:.8;
 renderer.render(scene,camera);if(run)requestAnimationFrame(frame)}
function go(){if(!run){run=true;requestAnimationFrame(frame)}}
document.addEventListener('visibilitychange',function(){if(document.hidden)run=false;else go()});
addEventListener('scroll',function(){document.getElementById('hint').style.opacity=scrollY>40?0:1},{passive:true});
})();
