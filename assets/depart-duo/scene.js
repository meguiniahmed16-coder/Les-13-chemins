(async()=>{/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var wf=0,ph=1,Tf=2;var To=1,Af=2,ii=3,Gn=0,Wt=1,rt=2,yi=0,ls=1,mh=2,gh=3,xh=4,Ef=5,Bi=100,Cf=101,Rf=102,If=103,Pf=104,Df=200,Lf=201,Uf=202,Nf=203,Aa=204,Ea=205,Ff=206,Of=207,Bf=208,zf=209,kf=210,Vf=211,Gf=212,Hf=213,Wf=214,el=0,tl=1,nl=2,cs=3,il=4,sl=5,rl=6,ol=7,vh=0,Xf=1,qf=2,Mi=0,Yf=1,Zf=2,Jf=3,$f=4,Kf=5,jf=6,Qf=7,eh="attached",ed="detached",_h=300,ms=301,gs=302,al=303,ll=304,Ao=306,Ks=1e3,Oi=1001,Ca=1002,on=1003,td=1004;var Eo=1005;var Hn=1006,cl=1007;var Xi=1008;var qn=1009,yh=1010,Mh=1011,ur=1012,hl=1013,qi=1014,Un=1015,fr=1016,ul=1017,fl=1018,dr=1020,Sh=35902,bh=35899,wh=1021,Th=1022,vn=1023,js=1026,pr=1027,dl=1028,pl=1029,Ah=1030,ml=1031;var gl=1033,Co=33776,Ro=33777,Io=33778,Po=33779,xl=35840,vl=35841,_l=35842,yl=35843,Ml=36196,Sl=37492,bl=37496,wl=37808,Tl=37809,Al=37810,El=37811,Cl=37812,Rl=37813,Il=37814,Pl=37815,Dl=37816,Ll=37817,Ul=37818,Nl=37819,Fl=37820,Ol=37821,Bl=36492,zl=36494,kl=36495,Vl=36283,Gl=36284,Hl=36285,Wl=36286;var Yr=2300,Ra=2301,Ta=2302,th=2400,nh=2401,ih=2402;var nd=3200,id=3201;var Eh=0,sd=1,Si="",Ut="srgb",hs="srgb-linear",Zr="linear",ft="srgb";var as=7680;var sh=519,rd=512,od=513,ad=514,Ch=515,ld=516,cd=517,hd=518,ud=519,rh=35044,Do=35048;var Rh="300 es",Vn=2e3,Jr=2001;var xi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Hu=1234567,Hr=Math.PI/180,Qs=180/Math.PI;function Yi(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(qt[n&255]+qt[n>>8&255]+qt[n>>16&255]+qt[n>>24&255]+"-"+qt[e&255]+qt[e>>8&255]+"-"+qt[e>>16&15|64]+qt[e>>24&255]+"-"+qt[t&63|128]+qt[t>>8&255]+"-"+qt[t>>16&255]+qt[t>>24&255]+qt[i&255]+qt[i>>8&255]+qt[i>>16&255]+qt[i>>24&255]).toLowerCase()}function je(n,e,t){return Math.max(e,Math.min(t,n))}function Ih(n,e){return(n%e+e)%e}function Lm(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Um(n,e,t){return n!==e?(t-n)/(e-n):0}function Wr(n,e,t){return(1-t)*n+t*e}function Nm(n,e,t,i){return Wr(n,e,1-Math.exp(-t*i))}function Fm(n,e=1){return e-Math.abs(Ih(n,e*2)-e)}function Om(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Bm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function zm(n,e){return n+Math.floor(Math.random()*(e-n+1))}function km(n,e){return n+Math.random()*(e-n)}function Vm(n){return n*(.5-Math.random())}function Gm(n){n!==void 0&&(Hu=n);let e=Hu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Hm(n){return n*Hr}function Wm(n){return n*Qs}function Xm(n){return(n&n-1)===0&&n!==0}function qm(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Ym(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Zm(n,e,t,i,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),u=r((e-i)/2),f=o((e-i)/2),d=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*u,l*f,a*c);break;case"YZY":n.set(l*f,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*f,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*d,a*c);break;case"YXY":n.set(l*d,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*d,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Js(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function en(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Xl={DEG2RAD:Hr,RAD2DEG:Qs,generateUUID:Yi,clamp:je,euclideanModulo:Ih,mapLinear:Lm,inverseLerp:Um,lerp:Wr,damp:Nm,pingpong:Fm,smoothstep:Om,smootherstep:Bm,randInt:zm,randFloat:km,randFloatSpread:Vm,seededRandom:Gm,degToRad:Hm,radToDeg:Wm,isPowerOfTwo:Xm,ceilPowerOfTwo:qm,floorPowerOfTwo:Ym,setQuaternionFromProperEuler:Zm,normalize:en,denormalize:Js},fe=class n{constructor(e=0,t=0){n.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},pn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],f=r[o+0],d=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=d,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==f||c!==d||h!==g){let m=1-a,p=l*f+c*d+h*g+u*x,y=p>=0?1:-1,M=1-p*p;if(M>Number.EPSILON){let E=Math.sqrt(M),A=Math.atan2(E,p*y);m=Math.sin(m*A)/E,a=Math.sin(a*A)/E}let v=a*y;if(l=l*m+f*v,c=c*m+d*v,h=h*m+g*v,u=u*m+x*v,m===1-a){let E=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=E,c*=E,h*=E,u*=E}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){let a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],f=r[o+1],d=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*d-c*f,e[t+1]=l*g+h*f+c*u-a*d,e[t+2]=c*g+h*d+a*f-l*u,e[t+3]=h*g-a*u-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),f=l(i/2),d=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=i+a+u;if(f>0){let d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(o-s)*d}else if(i>a&&i>u){let d=2*Math.sqrt(1+i-a-u);this._w=(h-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+c)/d}else if(a>u){let d=2*Math.sqrt(1+a-i-u);this._w=(r-c)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+u-i-a);this._w=(o-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let d=1-t;return this._w=d*o+t*this._w,this._x=d*i+t*this._x,this._y=d*s+t*this._y,this._z=d*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=o*u+this._w*f,this._x=i*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class n{constructor(e=0,t=0,i=0){n.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Wu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Wu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),u=2*(r*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ec.copy(this).projectOnVector(e),this.sub(Ec)}reflect(e){return this.sub(Ec.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ec=new P,Wu=new pn,Xe=class n{constructor(e,t,i,s,r,o,a,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],f=i[2],d=i[5],g=i[8],x=s[0],m=s[3],p=s[6],y=s[1],M=s[4],v=s[7],E=s[2],A=s[5],I=s[8];return r[0]=o*x+a*y+l*E,r[3]=o*m+a*M+l*A,r[6]=o*p+a*v+l*I,r[1]=c*x+h*y+u*E,r[4]=c*m+h*M+u*A,r[7]=c*p+h*v+u*I,r[2]=f*x+d*y+g*E,r[5]=f*m+d*M+g*A,r[8]=f*p+d*v+g*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,f=a*l-h*r,d=c*r-o*l,g=t*u+i*f+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return e[0]=u*x,e[1]=(s*c-h*i)*x,e[2]=(a*i-s*o)*x,e[3]=f*x,e[4]=(h*t-s*l)*x,e[5]=(s*r-a*t)*x,e[6]=d*x,e[7]=(i*l-c*t)*x,e[8]=(o*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Cc.makeScale(e,t)),this}rotate(e){return this.premultiply(Cc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Cc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Cc=new Xe;function Ph(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function $r(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function fd(){let n=$r("canvas");return n.style.display="block",n}var Xu={};function er(n){n in Xu||(Xu[n]=!0,console.warn(n))}function dd(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var qu=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Yu=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Jm(){let n={enabled:!0,workingColorSpace:hs,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ft&&(s.r=gi(s.r),s.g=gi(s.g),s.b=gi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ft&&(s.r=$s(s.r),s.g=$s(s.g),s.b=$s(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Si?Zr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return er("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return er("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[hs]:{primaries:e,whitePoint:i,transfer:Zr,toXYZ:qu,fromXYZ:Yu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ut},outputColorSpaceConfig:{drawingBufferColorSpace:Ut}},[Ut]:{primaries:e,whitePoint:i,transfer:ft,toXYZ:qu,fromXYZ:Yu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ut}}}),n}var tt=Jm();function gi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function $s(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Fs,Ia=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Fs===void 0&&(Fs=$r("canvas")),Fs.width=e.width,Fs.height=e.height;let s=Fs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Fs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=$r("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=gi(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(gi(t[i]/255)*255):t[i]=gi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},$m=0,tr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:$m++}),this.uuid=Yi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Rc(s[o].image)):r.push(Rc(s[o]))}else r=Rc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Rc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ia.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Km=0,Ic=new P,Gt=class n extends xi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Oi,s=Oi,r=Hn,o=Xi,a=vn,l=qn,c=n.DEFAULT_ANISOTROPY,h=Si){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Km++}),this.uuid=Yi(),this.name="",this.source=new tr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new fe(0,0),this.repeat=new fe(1,1),this.center=new fe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Ic).x}get height(){return this.source.getSize(Ic).y}get depth(){return this.source.getSize(Ic).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==_h)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ks:e.x=e.x-Math.floor(e.x);break;case Oi:e.x=e.x<0?0:1;break;case Ca:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ks:e.y=e.y-Math.floor(e.y);break;case Oi:e.y=e.y<0?0:1;break;case Ca:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Gt.DEFAULT_IMAGE=null;Gt.DEFAULT_MAPPING=_h;Gt.DEFAULT_ANISOTROPY=1;var vt=class n{constructor(e=0,t=0,i=0,s=1){n.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let M=(c+1)/2,v=(d+1)/2,E=(p+1)/2,A=(h+f)/4,I=(u+x)/4,D=(g+m)/4;return M>v&&M>E?M<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(M),s=A/i,r=I/i):v>E?v<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),i=A/s,r=D/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=I/r,s=D/r),this.set(i,s,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(f-h)*(f-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-x)/y,this.z=(f-h)/y,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this.w=je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this.w=je(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Pa=class extends xi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Hn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t);let s={width:e,height:t,depth:i.depth},r=new Gt(s);this.textures=[];let o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let t={minFilter:Hn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new tr(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},ei=class extends Pa{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Kr=class extends Gt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=on,this.minFilter=on,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Da=class extends Gt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=on,this.minFilter=on,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var mn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Bn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Bn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Bn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Bn):Bn.fromBufferAttribute(r,o),Bn.applyMatrix4(e.matrixWorld),this.expandByPoint(Bn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),na.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),na.copy(i.boundingBox)),na.applyMatrix4(e.matrixWorld),this.union(na)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Bn),Bn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fr),ia.subVectors(this.max,Fr),Os.subVectors(e.a,Fr),Bs.subVectors(e.b,Fr),zs.subVectors(e.c,Fr),Ii.subVectors(Bs,Os),Pi.subVectors(zs,Bs),is.subVectors(Os,zs);let t=[0,-Ii.z,Ii.y,0,-Pi.z,Pi.y,0,-is.z,is.y,Ii.z,0,-Ii.x,Pi.z,0,-Pi.x,is.z,0,-is.x,-Ii.y,Ii.x,0,-Pi.y,Pi.x,0,-is.y,is.x,0];return!Pc(t,Os,Bs,zs,ia)||(t=[1,0,0,0,1,0,0,0,1],!Pc(t,Os,Bs,zs,ia))?!1:(sa.crossVectors(Ii,Pi),t=[sa.x,sa.y,sa.z],Pc(t,Os,Bs,zs,ia))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Bn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Bn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ui[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ui[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ui[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ui[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ui[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ui[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ui[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ui[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ui),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ui=[new P,new P,new P,new P,new P,new P,new P,new P],Bn=new P,na=new mn,Os=new P,Bs=new P,zs=new P,Ii=new P,Pi=new P,is=new P,Fr=new P,ia=new P,sa=new P,ss=new P;function Pc(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){ss.fromArray(n,r);let a=s.x*Math.abs(ss.x)+s.y*Math.abs(ss.y)+s.z*Math.abs(ss.z),l=e.dot(ss),c=t.dot(ss),h=i.dot(ss);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var jm=new mn,Or=new P,Dc=new P,ti=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):jm.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Or.subVectors(e,this.center);let t=Or.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Or,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Dc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Or.copy(e.center).add(Dc)),this.expandByPoint(Or.copy(e.center).sub(Dc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},fi=new P,Lc=new P,ra=new P,Di=new P,Uc=new P,oa=new P,Nc=new P,nr=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=fi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fi.copy(this.origin).addScaledVector(this.direction,t),fi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Lc.copy(e).add(t).multiplyScalar(.5),ra.copy(t).sub(e).normalize(),Di.copy(this.origin).sub(Lc);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ra),a=Di.dot(this.direction),l=-Di.dot(ra),c=Di.lengthSq(),h=Math.abs(1-o*o),u,f,d,g;if(h>0)if(u=o*l-a,f=o*a-l,g=r*h,u>=0)if(f>=-g)if(f<=g){let x=1/h;u*=x,f*=x,d=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Lc).addScaledVector(ra,f),d}intersectSphere(e,t){fi.subVectors(e.center,this.origin);let i=fi.dot(this.direction),s=fi.dot(fi)-i*i,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,fi)!==null}intersectTriangle(e,t,i,s,r){Uc.subVectors(t,e),oa.subVectors(i,e),Nc.crossVectors(Uc,oa);let o=this.direction.dot(Nc),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Di.subVectors(this.origin,e);let l=a*this.direction.dot(oa.crossVectors(Di,oa));if(l<0)return null;let c=a*this.direction.dot(Uc.cross(Di));if(c<0||l+c>o)return null;let h=-a*Di.dot(Nc);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ze=class n{constructor(e,t,i,s,r,o,a,l,c,h,u,f,d,g,x,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,u,f,d,g,x,m)}set(e,t,i,s,r,o,a,l,c,h,u,f,d,g,x,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,i=e.elements,s=1/ks.setFromMatrixColumn(e,0).length(),r=1/ks.setFromMatrixColumn(e,1).length(),o=1/ks.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let f=o*h,d=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=d+g*c,t[5]=f-x*c,t[9]=-a*l,t[2]=x-f*c,t[6]=g+d*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*h,d=l*u,g=c*h,x=c*u;t[0]=f+x*a,t[4]=g*a-d,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=d*a-g,t[6]=x+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*h,d=l*u,g=c*h,x=c*u;t[0]=f-x*a,t[4]=-o*u,t[8]=g+d*a,t[1]=d+g*a,t[5]=o*h,t[9]=x-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*h,d=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=g*c-d,t[8]=f*c+x,t[1]=l*u,t[5]=x*c+f,t[9]=d*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=x-f*u,t[8]=g*u+d,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=d*u+g,t[10]=f-x*u}else if(e.order==="XZY"){let f=o*l,d=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+x,t[5]=o*h,t[9]=d*u-g,t[2]=g*u-d,t[6]=a*h,t[10]=x*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Qm,e,eg)}lookAt(e,t,i){let s=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),Li.crossVectors(i,fn),Li.lengthSq()===0&&(Math.abs(i.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),Li.crossVectors(i,fn)),Li.normalize(),aa.crossVectors(fn,Li),s[0]=Li.x,s[4]=aa.x,s[8]=fn.x,s[1]=Li.y,s[5]=aa.y,s[9]=fn.y,s[2]=Li.z,s[6]=aa.z,s[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],f=i[9],d=i[13],g=i[2],x=i[6],m=i[10],p=i[14],y=i[3],M=i[7],v=i[11],E=i[15],A=s[0],I=s[4],D=s[8],b=s[12],S=s[1],C=s[5],U=s[9],z=s[13],H=s[2],X=s[6],V=s[10],Q=s[14],k=s[3],se=s[7],ge=s[11],Me=s[15];return r[0]=o*A+a*S+l*H+c*k,r[4]=o*I+a*C+l*X+c*se,r[8]=o*D+a*U+l*V+c*ge,r[12]=o*b+a*z+l*Q+c*Me,r[1]=h*A+u*S+f*H+d*k,r[5]=h*I+u*C+f*X+d*se,r[9]=h*D+u*U+f*V+d*ge,r[13]=h*b+u*z+f*Q+d*Me,r[2]=g*A+x*S+m*H+p*k,r[6]=g*I+x*C+m*X+p*se,r[10]=g*D+x*U+m*V+p*ge,r[14]=g*b+x*z+m*Q+p*Me,r[3]=y*A+M*S+v*H+E*k,r[7]=y*I+M*C+v*X+E*se,r[11]=y*D+M*U+v*V+E*ge,r[15]=y*b+M*z+v*Q+E*Me,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],d=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*l*u-s*c*u-r*a*f+i*c*f+s*a*d-i*l*d)+x*(+t*l*d-t*c*f+r*o*f-s*o*d+s*c*h-r*l*h)+m*(+t*c*u-t*a*d-r*o*u+i*o*d+r*a*h-i*c*h)+p*(-s*a*h-t*l*u+t*a*f+s*o*u-i*o*f+i*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],d=e[11],g=e[12],x=e[13],m=e[14],p=e[15],y=u*m*c-x*f*c+x*l*d-a*m*d-u*l*p+a*f*p,M=g*f*c-h*m*c-g*l*d+o*m*d+h*l*p-o*f*p,v=h*x*c-g*u*c+g*a*d-o*x*d-h*a*p+o*u*p,E=g*u*l-h*x*l-g*a*f+o*x*f+h*a*m-o*u*m,A=t*y+i*M+s*v+r*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let I=1/A;return e[0]=y*I,e[1]=(x*f*r-u*m*r-x*s*d+i*m*d+u*s*p-i*f*p)*I,e[2]=(a*m*r-x*l*r+x*s*c-i*m*c-a*s*p+i*l*p)*I,e[3]=(u*l*r-a*f*r-u*s*c+i*f*c+a*s*d-i*l*d)*I,e[4]=M*I,e[5]=(h*m*r-g*f*r+g*s*d-t*m*d-h*s*p+t*f*p)*I,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*I,e[7]=(o*f*r-h*l*r+h*s*c-t*f*c-o*s*d+t*l*d)*I,e[8]=v*I,e[9]=(g*u*r-h*x*r-g*i*d+t*x*d+h*i*p-t*u*p)*I,e[10]=(o*x*r-g*a*r+g*i*c-t*x*c-o*i*p+t*a*p)*I,e[11]=(h*a*r-o*u*r-h*i*c+t*u*c+o*i*d-t*a*d)*I,e[12]=E*I,e[13]=(h*x*s-g*u*s+g*i*f-t*x*f-h*i*m+t*u*m)*I,e[14]=(g*a*s-o*x*s-g*i*l+t*x*l+o*i*m-t*a*m)*I,e[15]=(o*u*s-h*a*s+h*i*l-t*u*l-o*i*f+t*a*f)*I,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,f=r*c,d=r*h,g=r*u,x=o*h,m=o*u,p=a*u,y=l*c,M=l*h,v=l*u,E=i.x,A=i.y,I=i.z;return s[0]=(1-(x+p))*E,s[1]=(d+v)*E,s[2]=(g-M)*E,s[3]=0,s[4]=(d-v)*A,s[5]=(1-(f+p))*A,s[6]=(m+y)*A,s[7]=0,s[8]=(g+M)*I,s[9]=(m-y)*I,s[10]=(1-(f+x))*I,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements,r=ks.set(s[0],s[1],s[2]).length(),o=ks.set(s[4],s[5],s[6]).length(),a=ks.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],zn.copy(this);let c=1/r,h=1/o,u=1/a;return zn.elements[0]*=c,zn.elements[1]*=c,zn.elements[2]*=c,zn.elements[4]*=h,zn.elements[5]*=h,zn.elements[6]*=h,zn.elements[8]*=u,zn.elements[9]*=u,zn.elements[10]*=u,t.setFromRotationMatrix(zn),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=Vn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(i-s),f=(t+e)/(t-e),d=(i+s)/(i-s),g,x;if(l)g=r/(o-r),x=o*r/(o-r);else if(a===Vn)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Jr)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=Vn,l=!1){let c=this.elements,h=2/(t-e),u=2/(i-s),f=-(t+e)/(t-e),d=-(i+s)/(i-s),g,x;if(l)g=1/(o-r),x=o/(o-r);else if(a===Vn)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===Jr)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},ks=new P,zn=new Ze,Qm=new P(0,0,0),eg=new P(1,1,1),Li=new P,aa=new P,fn=new P,Zu=new Ze,Ju=new pn,Wn=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Zu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Zu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ju.setFromEuler(this),this.setFromQuaternion(Ju,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wn.DEFAULT_ORDER="XYZ";var ir=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},tg=0,$u=new P,Vs=new pn,di=new Ze,la=new P,Br=new P,ng=new P,ig=new pn,Ku=new P(1,0,0),ju=new P(0,1,0),Qu=new P(0,0,1),ef={type:"added"},sg={type:"removed"},Gs={type:"childadded",child:null},Fc={type:"childremoved",child:null},Rt=class n extends xi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:tg++}),this.uuid=Yi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new Wn,i=new pn,s=new P(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ze},normalMatrix:{value:new Xe}}),this.matrix=new Ze,this.matrixWorld=new Ze,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ir,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.multiply(Vs),this}rotateOnWorldAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.premultiply(Vs),this}rotateX(e){return this.rotateOnAxis(Ku,e)}rotateY(e){return this.rotateOnAxis(ju,e)}rotateZ(e){return this.rotateOnAxis(Qu,e)}translateOnAxis(e,t){return $u.copy(e).applyQuaternion(this.quaternion),this.position.add($u.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ku,e)}translateY(e){return this.translateOnAxis(ju,e)}translateZ(e){return this.translateOnAxis(Qu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?la.copy(e):la.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Br.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?di.lookAt(Br,la,this.up):di.lookAt(la,Br,this.up),this.quaternion.setFromRotationMatrix(di),s&&(di.extractRotation(s.matrixWorld),Vs.setFromRotationMatrix(di),this.quaternion.premultiply(Vs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ef),Gs.child=e,this.dispatchEvent(Gs),Gs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(sg),Fc.child=e,this.dispatchEvent(Fc),Fc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),di.multiply(e.parent.matrixWorld)),e.applyMatrix4(di),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ef),Gs.child=e,this.dispatchEvent(Gs),Gs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,e,ng),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Br,ig,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){let i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),d=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),f.length>0&&(i.skeletons=f),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};Rt.DEFAULT_UP=new P(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var kn=new P,pi=new P,Oc=new P,mi=new P,Hs=new P,Ws=new P,tf=new P,Bc=new P,zc=new P,kc=new P,Vc=new vt,Gc=new vt,Hc=new vt,Fi=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),kn.subVectors(e,t),s.cross(kn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){kn.subVectors(s,t),pi.subVectors(i,t),Oc.subVectors(e,t);let o=kn.dot(kn),a=kn.dot(pi),l=kn.dot(Oc),c=pi.dot(pi),h=pi.dot(Oc),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let f=1/u,d=(c*l-a*h)*f,g=(o*h-a*l)*f;return r.set(1-d-g,g,d)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,mi)===null?!1:mi.x>=0&&mi.y>=0&&mi.x+mi.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,mi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,mi.x),l.addScaledVector(o,mi.y),l.addScaledVector(a,mi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Vc.setScalar(0),Gc.setScalar(0),Hc.setScalar(0),Vc.fromBufferAttribute(e,t),Gc.fromBufferAttribute(e,i),Hc.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Vc,r.x),o.addScaledVector(Gc,r.y),o.addScaledVector(Hc,r.z),o}static isFrontFacing(e,t,i,s){return kn.subVectors(i,t),pi.subVectors(e,t),kn.cross(pi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return kn.subVectors(this.c,this.b),pi.subVectors(this.a,this.b),kn.cross(pi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,o,a;Hs.subVectors(s,i),Ws.subVectors(r,i),Bc.subVectors(e,i);let l=Hs.dot(Bc),c=Ws.dot(Bc);if(l<=0&&c<=0)return t.copy(i);zc.subVectors(e,s);let h=Hs.dot(zc),u=Ws.dot(zc);if(h>=0&&u<=h)return t.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(Hs,o);kc.subVectors(e,r);let d=Hs.dot(kc),g=Ws.dot(kc);if(g>=0&&d<=g)return t.copy(r);let x=d*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(Ws,a);let m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return tf.subVectors(r,s),a=(u-h)/(u-h+(d-g)),t.copy(s).addScaledVector(tf,a);let p=1/(m+x+f);return o=x*p,a=f*p,t.copy(i).addScaledVector(Hs,o).addScaledVector(Ws,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},pd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ui={h:0,s:0,l:0},ca={h:0,s:0,l:0};function Wc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Le=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,tt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=tt.workingColorSpace){if(e=Ih(e,1),t=je(t,0,1),i=je(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Wc(o,r,e+1/3),this.g=Wc(o,r,e),this.b=Wc(o,r,e-1/3)}return tt.colorSpaceToWorking(this,s),this}setStyle(e,t=Ut){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ut){let i=pd[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=gi(e.r),this.g=gi(e.g),this.b=gi(e.b),this}copyLinearToSRGB(e){return this.r=$s(e.r),this.g=$s(e.g),this.b=$s(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ut){return tt.workingToColorSpace(Yt.copy(this),e),Math.round(je(Yt.r*255,0,255))*65536+Math.round(je(Yt.g*255,0,255))*256+Math.round(je(Yt.b*255,0,255))}getHexString(e=Ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(Yt.copy(this),t);let i=Yt.r,s=Yt.g,r=Yt.b,o=Math.max(i,s,r),a=Math.min(i,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(Yt.copy(this),t),e.r=Yt.r,e.g=Yt.g,e.b=Yt.b,e}getStyle(e=Ut){tt.workingToColorSpace(Yt.copy(this),e);let t=Yt.r,i=Yt.g,s=Yt.b;return e!==Ut?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ui),this.setHSL(Ui.h+e,Ui.s+t,Ui.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ui),e.getHSL(ca);let i=Wr(Ui.h,ca.h,t),s=Wr(Ui.s,ca.s,t),r=Wr(Ui.l,ca.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Yt=new Le;Le.NAMES=pd;var rg=0,zi=class extends xi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=Yi(),this.name="",this.type="Material",this.blending=ls,this.side=Gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Aa,this.blendDst=Ea,this.blendEquation=Bi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Le(0,0,0),this.blendAlpha=0,this.depthFunc=cs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=sh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=as,this.stencilZFail=as,this.stencilZPass=as,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==ls&&(i.blending=this.blending),this.side!==Gn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Aa&&(i.blendSrc=this.blendSrc),this.blendDst!==Ea&&(i.blendDst=this.blendDst),this.blendEquation!==Bi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==cs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==sh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==as&&(i.stencilFail=this.stencilFail),this.stencilZFail!==as&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==as&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Ln=class extends zi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=vh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Lt=new P,ha=new fe,og=0,kt=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:og++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=rh,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)ha.fromBufferAttribute(this,t),ha.applyMatrix3(e),this.setXY(t,ha.x,ha.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix3(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix4(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyNormalMatrix(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.transformDirection(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Js(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=en(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Js(t,this.array)),t}setX(e,t){return this.normalized&&(t=en(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Js(t,this.array)),t}setY(e,t){return this.normalized&&(t=en(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Js(t,this.array)),t}setZ(e,t){return this.normalized&&(t=en(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Js(t,this.array)),t}setW(e,t){return this.normalized&&(t=en(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=en(t,this.array),i=en(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=en(t,this.array),i=en(i,this.array),s=en(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=en(t,this.array),i=en(i,this.array),s=en(s,this.array),r=en(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==rh&&(e.usage=this.usage),e}};var us=class extends kt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var jr=class extends kt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var ht=class extends kt{constructor(e,t,i){super(new Float32Array(e),t,i)}},ag=0,Pn=new Ze,Xc=new Rt,Xs=new P,dn=new mn,zr=new mn,zt=new P,pt=class n extends xi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ag++}),this.uuid=Yi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ph(e)?jr:us)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Xe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Pn.makeRotationFromQuaternion(e),this.applyMatrix4(Pn),this}rotateX(e){return Pn.makeRotationX(e),this.applyMatrix4(Pn),this}rotateY(e){return Pn.makeRotationY(e),this.applyMatrix4(Pn),this}rotateZ(e){return Pn.makeRotationZ(e),this.applyMatrix4(Pn),this}translate(e,t,i){return Pn.makeTranslation(e,t,i),this.applyMatrix4(Pn),this}scale(e,t,i){return Pn.makeScale(e,t,i),this.applyMatrix4(Pn),this}lookAt(e){return Xc.lookAt(e),Xc.updateMatrix(),this.applyMatrix4(Xc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xs).negate(),this.translate(Xs.x,Xs.y,Xs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ht(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];dn.setFromBufferAttribute(r),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ti);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];zr.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(dn.min,zr.min),dn.expandByPoint(zt),zt.addVectors(dn.max,zr.max),dn.expandByPoint(zt)):(dn.expandByPoint(zr.min),dn.expandByPoint(zr.max))}dn.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)zt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(zt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)zt.fromBufferAttribute(a,c),l&&(Xs.fromBufferAttribute(e,c),zt.add(Xs)),s=Math.max(s,i.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new kt(new Float32Array(4*i.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<i.count;D++)a[D]=new P,l[D]=new P;let c=new P,h=new P,u=new P,f=new fe,d=new fe,g=new fe,x=new P,m=new P;function p(D,b,S){c.fromBufferAttribute(i,D),h.fromBufferAttribute(i,b),u.fromBufferAttribute(i,S),f.fromBufferAttribute(r,D),d.fromBufferAttribute(r,b),g.fromBufferAttribute(r,S),h.sub(c),u.sub(c),d.sub(f),g.sub(f);let C=1/(d.x*g.y-g.x*d.y);isFinite(C)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(C),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(C),a[D].add(x),a[b].add(x),a[S].add(x),l[D].add(m),l[b].add(m),l[S].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let D=0,b=y.length;D<b;++D){let S=y[D],C=S.start,U=S.count;for(let z=C,H=C+U;z<H;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let M=new P,v=new P,E=new P,A=new P;function I(D){E.fromBufferAttribute(s,D),A.copy(E);let b=a[D];M.copy(b),M.sub(E.multiplyScalar(E.dot(b))).normalize(),v.crossVectors(A,b);let C=v.dot(l[D])<0?-1:1;o.setXYZW(D,M.x,M.y,M.z,C)}for(let D=0,b=y.length;D<b;++D){let S=y[D],C=S.start,U=S.count;for(let z=C,H=C+U;z<H;z+=3)I(e.getX(z+0)),I(e.getX(z+1)),I(e.getX(z+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new kt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,d=i.count;f<d;f++)i.setXYZ(f,0,0,0);let s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let f=0,d=e.count;f<d;f+=3){let g=e.getX(f+0),x=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h),d=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new kt(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,i);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let f=c[h],d=e(f,i);l.push(d)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let d=c[u];h.push(d.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},nf=new Ze,rs=new nr,ua=new ti,sf=new P,fa=new P,da=new P,pa=new P,qc=new P,ma=new P,rf=new P,ga=new P,Ht=class extends Rt{constructor(e=new pt,t=new Ln){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){ma.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(qc.fromBufferAttribute(u,e),o?ma.addScaledVector(qc,h):ma.addScaledVector(qc.sub(t),h))}t.add(ma)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ua.copy(i.boundingSphere),ua.applyMatrix4(r),rs.copy(e.ray).recast(e.near),!(ua.containsPoint(rs.origin)===!1&&(rs.intersectSphere(ua,sf)===null||rs.origin.distanceToSquared(sf)>(e.far-e.near)**2))&&(nf.copy(r).invert(),rs.copy(e.ray).applyMatrix4(nf),!(i.boundingBox!==null&&rs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,rs)))}_computeIntersections(e,t,i){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),M=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,E=M;v<E;v+=3){let A=a.getX(v),I=a.getX(v+1),D=a.getX(v+2);s=xa(this,p,e,i,c,h,u,A,I,D),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let y=a.getX(m),M=a.getX(m+1),v=a.getX(m+2);s=xa(this,o,e,i,c,h,u,y,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=f.length;g<x;g++){let m=f[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),M=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let v=y,E=M;v<E;v+=3){let A=v,I=v+1,D=v+2;s=xa(this,p,e,i,c,h,u,A,I,D),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let m=g,p=x;m<p;m+=3){let y=m,M=m+1,v=m+2;s=xa(this,o,e,i,c,h,u,y,M,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function lg(n,e,t,i,s,r,o,a){let l;if(e.side===Wt?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===Gn,a),l===null)return null;ga.copy(a),ga.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(ga);return c<t.near||c>t.far?null:{distance:c,point:ga.clone(),object:n}}function xa(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,fa),n.getVertexPosition(l,da),n.getVertexPosition(c,pa);let h=lg(n,e,t,i,fa,da,pa,rf);if(h){let u=new P;Fi.getBarycoord(rf,fa,da,pa,u),s&&(h.uv=Fi.getInterpolatedAttribute(s,a,l,c,u,new fe)),r&&(h.uv1=Fi.getInterpolatedAttribute(r,a,l,c,u,new fe)),o&&(h.normal=Fi.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new P,materialIndex:0};Fi.getNormal(fa,da,pa,f.normal),h.face=f,h.barycoord=u}return h}var ki=class n extends pt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],f=0,d=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new ht(c,3)),this.setAttribute("normal",new ht(h,3)),this.setAttribute("uv",new ht(u,2));function g(x,m,p,y,M,v,E,A,I,D,b){let S=v/I,C=E/D,U=v/2,z=E/2,H=A/2,X=I+1,V=D+1,Q=0,k=0,se=new P;for(let ge=0;ge<V;ge++){let Me=ge*C-z;for(let Ne=0;Ne<X;Ne++){let Ve=Ne*S-U;se[x]=Ve*y,se[m]=Me*M,se[p]=H,c.push(se.x,se.y,se.z),se[x]=0,se[m]=0,se[p]=A>0?1:-1,h.push(se.x,se.y,se.z),u.push(Ne/I),u.push(1-ge/D),Q+=1}}for(let ge=0;ge<D;ge++)for(let Me=0;Me<I;Me++){let Ne=f+Me+X*ge,Ve=f+Me+X*(ge+1),Qe=f+(Me+1)+X*(ge+1),Oe=f+(Me+1)+X*ge;l.push(Ne,Ve,Oe),l.push(Ve,Qe,Oe),k+=6}a.addGroup(d,k,b),d+=k,f+=Q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function xs(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Jt(n){let e={};for(let t=0;t<n.length;t++){let i=xs(n[t]);for(let s in i)e[s]=i[s]}return e}function cg(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Dh(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var md={clone:xs,merge:Jt},hg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ug=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Xn=class extends zi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=hg,this.fragmentShader=ug,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xs(e.uniforms),this.uniformsGroups=cg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},Qr=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ze,this.projectionMatrix=new Ze,this.projectionMatrixInverse=new Ze,this.coordinateSystem=Vn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Ni=new P,of=new fe,af=new fe,Zt=class extends Qr{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Qs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Hr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Qs*2*Math.atan(Math.tan(Hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ni.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z),Ni.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ni.x,Ni.y).multiplyScalar(-e/Ni.z)}getViewSize(e,t){return this.getViewBounds(e,of,af),t.subVectors(af,of)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Hr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},qs=-90,Ys=1,La=class extends Rt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Zt(qs,Ys,e,t);s.layers=this.layers,this.add(s);let r=new Zt(qs,Ys,e,t);r.layers=this.layers,this.add(r);let o=new Zt(qs,Ys,e,t);o.layers=this.layers,this.add(o);let a=new Zt(qs,Ys,e,t);a.layers=this.layers,this.add(a);let l=new Zt(qs,Ys,e,t);l.layers=this.layers,this.add(l);let c=new Zt(qs,Ys,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===Vn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Jr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},eo=class extends Gt{constructor(e=[],t=ms,i,s,r,o,a,l,c,h){super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ua=class extends ei{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new eo(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ki(5,5,5),r=new Xn({name:"CubemapFromEquirect",uniforms:xs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Wt,blending:yi});r.uniforms.tEquirect.value=t;let o=new Ht(s,r),a=t.minFilter;return t.minFilter===Xi&&(t.minFilter=Hn),new La(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}},St=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},fg={type:"move"},sr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new St,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new St,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new St,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let x of e.hand.values()){let m=t.getJointPose(x,i),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(fg)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new St;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},to=class n{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Le(e),this.density=t}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var no=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wn,this.environmentIntensity=1,this.environmentRotation=new Wn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var lf=new P,cf=new vt,hf=new vt,dg=new P,uf=new Ze,va=new P,Yc=new ti,ff=new Ze,Zc=new nr,io=class extends Ht{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=eh,this.bindMatrix=new Ze,this.bindMatrixInverse=new Ze,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new mn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,va),this.boundingBox.expandByPoint(va)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ti),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,va),this.boundingSphere.expandByPoint(va)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let i=this.material,s=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Yc.copy(this.boundingSphere),Yc.applyMatrix4(s),e.ray.intersectsSphere(Yc)!==!1&&(ff.copy(s).invert(),Zc.copy(e.ray).applyMatrix4(ff),!(this.boundingBox!==null&&Zc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Zc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new vt,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===eh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===ed?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let i=this.skeleton,s=this.geometry;cf.fromBufferAttribute(s.attributes.skinIndex,e),hf.fromBufferAttribute(s.attributes.skinWeight,e),lf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=hf.getComponent(r);if(o!==0){let a=cf.getComponent(r);uf.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(dg.copy(lf).applyMatrix4(uf),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},Vi=class extends Rt{constructor(){super(),this.isBone=!0,this.type="Bone"}},so=class extends Gt{constructor(e=null,t=1,i=1,s,r,o,a,l,c=on,h=on,u,f){super(null,o,a,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},df=new Ze,pg=new Ze,ro=class n{constructor(e=[],t=[]){this.uuid=Yi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new Ze)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let i=new Ze;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:pg;df.multiplyMatrices(a,t[r]),df.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new n(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let i=new so(t,e,e,vn,Un);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){let r=e.bones[i],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Vi),this.bones.push(o),this.boneInverses.push(new Ze().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=i[s];e.boneInverses.push(a.toArray())}return e}},rr=class extends kt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Zs=new Ze,pf=new Ze,_a=[],mf=new mn,mg=new Ze,kr=new Ht,Vr=new ti,ni=class extends Ht{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new rr(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,mg)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new mn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Zs),mf.copy(e.boundingBox).applyMatrix4(Zs),this.boundingBox.union(mf)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ti),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Zs),Vr.copy(e.boundingSphere).applyMatrix4(Zs),this.boundingSphere.union(Vr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(kr.geometry=this.geometry,kr.material=this.material,kr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vr.copy(this.boundingSphere),Vr.applyMatrix4(i),e.ray.intersectsSphere(Vr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Zs),pf.multiplyMatrices(i,Zs),kr.matrixWorld=pf,kr.raycast(e,_a);for(let o=0,a=_a.length;o<a;o++){let l=_a[o];l.instanceId=r,l.object=this,t.push(l)}_a.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new rr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new so(new Float32Array(s*this.count),s,this.count,dl,Un));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Jc=new P,gg=new P,xg=new Xe,Dn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Jc.subVectors(i,t).cross(gg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(Jc),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||xg.getNormalMatrix(e),s=this.coplanarPoint(Jc).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},os=new ti,vg=new fe(.5,.5),ya=new P,or=class{constructor(e=new Dn,t=new Dn,i=new Dn,s=new Dn,r=new Dn,o=new Dn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Vn,i=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],d=r[7],g=r[8],x=r[9],m=r[10],p=r[11],y=r[12],M=r[13],v=r[14],E=r[15];if(s[0].setComponents(c-o,d-h,p-g,E-y).normalize(),s[1].setComponents(c+o,d+h,p+g,E+y).normalize(),s[2].setComponents(c+a,d+u,p+x,E+M).normalize(),s[3].setComponents(c-a,d-u,p-x,E-M).normalize(),i)s[4].setComponents(l,f,m,v).normalize(),s[5].setComponents(c-l,d-f,p-m,E-v).normalize();else if(s[4].setComponents(c-l,d-f,p-m,E-v).normalize(),t===Vn)s[5].setComponents(c+l,d+f,p+m,E+v).normalize();else if(t===Jr)s[5].setComponents(l,f,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(e){os.center.set(0,0,0);let t=vg.distanceTo(e.center);return os.radius=.7071067811865476+t,os.applyMatrix4(e.matrixWorld),this.intersectsSphere(os)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(ya.x=s.normal.x>0?e.max.x:e.min.x,ya.y=s.normal.y>0?e.max.y:e.min.y,ya.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ya)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var vi=class extends Gt{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},oo=class extends Gt{constructor(e,t,i=qi,s,r,o,a=on,l=on,c,h=js,u=1){if(h!==js&&h!==pr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:u};super(f,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new tr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ao=class extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var Gi=class n extends pt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],f=[],d=[],g=0,x=[],m=i/2,p=0;y(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new ht(u,3)),this.setAttribute("normal",new ht(f,3)),this.setAttribute("uv",new ht(d,2));function y(){let v=new P,E=new P,A=0,I=(t-e)/i;for(let D=0;D<=r;D++){let b=[],S=D/r,C=S*(t-e)+e;for(let U=0;U<=s;U++){let z=U/s,H=z*l+a,X=Math.sin(H),V=Math.cos(H);E.x=C*X,E.y=-S*i+m,E.z=C*V,u.push(E.x,E.y,E.z),v.set(X,I,V).normalize(),f.push(v.x,v.y,v.z),d.push(z,1-S),b.push(g++)}x.push(b)}for(let D=0;D<s;D++)for(let b=0;b<r;b++){let S=x[b][D],C=x[b+1][D],U=x[b+1][D+1],z=x[b][D+1];(e>0||b!==0)&&(h.push(S,C,z),A+=3),(t>0||b!==r-1)&&(h.push(C,U,z),A+=3)}c.addGroup(p,A,0),p+=A}function M(v){let E=g,A=new fe,I=new P,D=0,b=v===!0?e:t,S=v===!0?1:-1;for(let U=1;U<=s;U++)u.push(0,m*S,0),f.push(0,S,0),d.push(.5,.5),g++;let C=g;for(let U=0;U<=s;U++){let H=U/s*l+a,X=Math.cos(H),V=Math.sin(H);I.x=b*V,I.y=m*S,I.z=b*X,u.push(I.x,I.y,I.z),f.push(0,S,0),A.x=X*.5+.5,A.y=V*.5*S+.5,d.push(A.x,A.y),g++}for(let U=0;U<s;U++){let z=E+U,H=C+U;v===!0?h.push(H,H+1,z):h.push(H+1,H,z),D+=3}c.addGroup(p,D,v===!0?1:2),p+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Na=class n extends pt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],o=[];a(s),c(i),h(),this.setAttribute("position",new ht(r,3)),this.setAttribute("normal",new ht(r.slice(),3)),this.setAttribute("uv",new ht(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let M=new P,v=new P,E=new P;for(let A=0;A<t.length;A+=3)d(t[A+0],M),d(t[A+1],v),d(t[A+2],E),l(M,v,E,y)}function l(y,M,v,E){let A=E+1,I=[];for(let D=0;D<=A;D++){I[D]=[];let b=y.clone().lerp(v,D/A),S=M.clone().lerp(v,D/A),C=A-D;for(let U=0;U<=C;U++)U===0&&D===A?I[D][U]=b:I[D][U]=b.clone().lerp(S,U/C)}for(let D=0;D<A;D++)for(let b=0;b<2*(A-D)-1;b++){let S=Math.floor(b/2);b%2===0?(f(I[D][S+1]),f(I[D+1][S]),f(I[D][S])):(f(I[D][S+1]),f(I[D+1][S+1]),f(I[D+1][S]))}}function c(y){let M=new P;for(let v=0;v<r.length;v+=3)M.x=r[v+0],M.y=r[v+1],M.z=r[v+2],M.normalize().multiplyScalar(y),r[v+0]=M.x,r[v+1]=M.y,r[v+2]=M.z}function h(){let y=new P;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];let v=m(y)/2/Math.PI+.5,E=p(y)/Math.PI+.5;o.push(v,1-E)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){let M=o[y+0],v=o[y+2],E=o[y+4],A=Math.max(M,v,E),I=Math.min(M,v,E);A>.9&&I<.1&&(M<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),E<.2&&(o[y+4]+=1))}}function f(y){r.push(y.x,y.y,y.z)}function d(y,M){let v=y*3;M.x=e[v+0],M.y=e[v+1],M.z=e[v+2]}function g(){let y=new P,M=new P,v=new P,E=new P,A=new fe,I=new fe,D=new fe;for(let b=0,S=0;b<r.length;b+=9,S+=6){y.set(r[b+0],r[b+1],r[b+2]),M.set(r[b+3],r[b+4],r[b+5]),v.set(r[b+6],r[b+7],r[b+8]),A.set(o[S+0],o[S+1]),I.set(o[S+2],o[S+3]),D.set(o[S+4],o[S+5]),E.copy(y).add(M).add(v).divideScalar(3);let C=m(E);x(A,S+0,y,C),x(I,S+2,M,C),x(D,S+4,v,C)}}function x(y,M,v,E){E<0&&y.x===1&&(o[M]=y.x-1),v.x===0&&v.z===0&&(o[M]=E/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.details)}};var gn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);let h=i[s],f=i[s+1]-h,d=(o-h)/f;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new fe:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new P,s=[],r=[],o=[],a=new P,l=new Ze;for(let d=0;d<=e;d++){let g=d/e;s[d]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),f<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(je(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(je(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ar=class extends gn{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new fe){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Fa=class extends ar{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Lh(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,d=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,d*=h,s(o,a,f,d)},calc:function(r){let o=r*r,a=o*r;return n+e*r+t*o+i*a}}}var Ma=new P,$c=new Lh,Kc=new Lh,jc=new Lh,Oa=class extends gn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new P){let i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Ma.subVectors(s[0],s[1]).add(s[0]),c=Ma);let u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Ma.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Ma),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),d),x=Math.pow(u.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(h),d);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),$c.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,g,x,m),Kc.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,g,x,m),jc.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&($c.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),Kc.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),jc.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return i.set($c.calc(l),Kc.calc(l),jc.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function gf(n,e,t,i,s){let r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function _g(n,e){let t=1-n;return t*t*e}function yg(n,e){return 2*(1-n)*n*e}function Mg(n,e){return n*n*e}function Xr(n,e,t,i){return _g(n,e)+yg(n,t)+Mg(n,i)}function Sg(n,e){let t=1-n;return t*t*t*e}function bg(n,e){let t=1-n;return 3*t*t*n*e}function wg(n,e){return 3*(1-n)*n*n*e}function Tg(n,e){return n*n*n*e}function qr(n,e,t,i,s){return Sg(n,e)+bg(n,t)+wg(n,i)+Tg(n,s)}var lo=class extends gn{constructor(e=new fe,t=new fe,i=new fe,s=new fe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new fe){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(qr(e,s.x,r.x,o.x,a.x),qr(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ba=class extends gn{constructor(e=new P,t=new P,i=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new P){let i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(qr(e,s.x,r.x,o.x,a.x),qr(e,s.y,r.y,o.y,a.y),qr(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},co=class extends gn{constructor(e=new fe,t=new fe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new fe){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new fe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},za=class extends gn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ho=class extends gn{constructor(e=new fe,t=new fe,i=new fe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new fe){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Xr(e,s.x,r.x,o.x),Xr(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ka=class extends gn{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Xr(e,s.x,r.x,o.x),Xr(e,s.y,r.y,o.y),Xr(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},uo=class extends gn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new fe){let i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return i.set(gf(a,l.x,c.x,h.x,u.x),gf(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new fe().fromArray(s))}return this}},oh=Object.freeze({__proto__:null,ArcCurve:Fa,CatmullRomCurve3:Oa,CubicBezierCurve:lo,CubicBezierCurve3:Ba,EllipseCurve:ar,LineCurve:co,LineCurve3:za,QuadraticBezierCurve:ho,QuadraticBezierCurve3:ka,SplineCurve:uo}),Va=class extends gn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new oh[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new oh[s.type]().fromJSON(s))}return this}},fo=class extends Va{constructor(e){super(),this.type="Path",this.currentPoint=new fe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new co(this.currentPoint.clone(),new fe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new ho(this.currentPoint.clone(),new fe(e,t),new fe(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){let a=new lo(this.currentPoint.clone(),new fe(e,t),new fe(i,s),new fe(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new uo(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){let c=new ar(e,t,i,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},_i=class extends fo{constructor(e){super(e),this.uuid=Yi(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new fo().fromJSON(s))}return this}};function Ag(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=gd(n,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(i&&(r=Pg(n,e,r,t)),n.length>80*t){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let f=t;f<s;f+=t){let d=n[f],g=n[f+1];d<a&&(a=d),g<l&&(l=g),d>h&&(h=d),g>u&&(u=g)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return po(r,o,t,a,l,c,0),o}function gd(n,e,t,i,s){let r;if(s===Gg(n,e,t,i)>0)for(let o=e;o<t;o+=i)r=xf(o/i|0,n[o],n[o+1],r);else for(let o=t-i;o>=e;o-=i)r=xf(o/i|0,n[o],n[o+1],r);return r&&lr(r,r.next)&&(go(r),r=r.next),r}function fs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(lr(t,t.next)||At(t.prev,t,t.next)===0)){if(go(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function po(n,e,t,i,s,r,o){if(!n)return;!o&&r&&Fg(n,i,s,r);let a=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?Cg(n,i,s,r):Eg(n)){e.push(l.i,n.i,c.i),go(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=Rg(fs(n),e),po(n,e,t,i,s,r,2)):o===2&&Ig(n,e,t,i,s,r):po(fs(n),e,t,i,s,r,1);break}}}function Eg(n){let e=n.prev,t=n,i=n.next;if(At(e,t,i)>=0)return!1;let s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=Math.min(s,r,o),u=Math.min(a,l,c),f=Math.max(s,r,o),d=Math.max(a,l,c),g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&Gr(s,a,r,l,o,c,g.x,g.y)&&At(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Cg(n,e,t,i){let s=n.prev,r=n,o=n.next;if(At(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,f=o.y,d=Math.min(a,l,c),g=Math.min(h,u,f),x=Math.max(a,l,c),m=Math.max(h,u,f),p=ah(d,g,e,t,i),y=ah(x,m,e,t,i),M=n.prevZ,v=n.nextZ;for(;M&&M.z>=p&&v&&v.z<=y;){if(M.x>=d&&M.x<=x&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&Gr(a,h,l,u,c,f,M.x,M.y)&&At(M.prev,M,M.next)>=0||(M=M.prevZ,v.x>=d&&v.x<=x&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Gr(a,h,l,u,c,f,v.x,v.y)&&At(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;M&&M.z>=p;){if(M.x>=d&&M.x<=x&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&Gr(a,h,l,u,c,f,M.x,M.y)&&At(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;v&&v.z<=y;){if(v.x>=d&&v.x<=x&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Gr(a,h,l,u,c,f,v.x,v.y)&&At(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Rg(n,e){let t=n;do{let i=t.prev,s=t.next.next;!lr(i,s)&&vd(i,t,t.next,s)&&mo(i,s)&&mo(s,i)&&(e.push(i.i,t.i,s.i),go(t),go(t.next),t=n=s),t=t.next}while(t!==n);return fs(t)}function Ig(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&zg(o,a)){let l=_d(o,a);o=fs(o,o.next),l=fs(l,l.next),po(o,e,t,i,s,r,0),po(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function Pg(n,e,t,i){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=gd(n,a,l,i,!1);c===c.next&&(c.steiner=!0),s.push(Bg(c))}s.sort(Dg);for(let r=0;r<s.length;r++)t=Lg(s[r],t);return t}function Dg(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function Lg(n,e){let t=Ug(n,e);if(!t)return e;let i=_d(t,n);return fs(i,i.next),fs(t,t.next)}function Ug(n,e){let t=e,i=n.x,s=n.y,r=-1/0,o;if(lr(n,t))return t;do{if(lr(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=i&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===i))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;t=o;do{if(i>=t.x&&t.x>=l&&i!==t.x&&xd(s<c?i:r,s,l,c,s<c?r:i,s,t.x,t.y)){let u=Math.abs(s-t.y)/(i-t.x);mo(t,n)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Ng(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Ng(n,e){return At(n.prev,n,e.prev)<0&&At(e.next,n,n.next)<0}function Fg(n,e,t,i){let s=n;do s.z===0&&(s.z=ah(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,Og(s)}function Og(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let o=i,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||i.z<=o.z)?(s=i,i=i.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=o}r.nextZ=null,t*=2}while(e>1);return n}function ah(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function Bg(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function xd(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function Gr(n,e,t,i,s,r,o,a){return!(n===o&&e===a)&&xd(n,e,t,i,s,r,o,a)}function zg(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!kg(n,e)&&(mo(n,e)&&mo(e,n)&&Vg(n,e)&&(At(n.prev,n,e.prev)||At(n,e.prev,e))||lr(n,e)&&At(n.prev,n,n.next)>0&&At(e.prev,e,e.next)>0)}function At(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function lr(n,e){return n.x===e.x&&n.y===e.y}function vd(n,e,t,i){let s=ba(At(n,e,t)),r=ba(At(n,e,i)),o=ba(At(t,i,n)),a=ba(At(t,i,e));return!!(s!==r&&o!==a||s===0&&Sa(n,t,e)||r===0&&Sa(n,i,e)||o===0&&Sa(t,n,i)||a===0&&Sa(t,e,i))}function Sa(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function ba(n){return n>0?1:n<0?-1:0}function kg(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&vd(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function mo(n,e){return At(n.prev,n,n.next)<0?At(n,e,n.next)>=0&&At(n,n.prev,e)>=0:At(n,e,n.prev)<0||At(n,n.next,e)<0}function Vg(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function _d(n,e){let t=lh(n.i,n.x,n.y),i=lh(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function xf(n,e,t,i){let s=lh(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function go(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function lh(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Gg(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}var ch=class{static triangulate(e,t,i=2){return Ag(e,t,i)}},Qn=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];vf(e),_f(i,e);let o=e.length;t.forEach(vf);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,_f(i,t[l]);let a=ch.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function vf(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function _f(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var cr=class n extends pt{constructor(e=new _i([new fe(.5,.5),new fe(-.5,.5),new fe(-.5,-.5),new fe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new ht(s,3)),this.setAttribute("uv",new ht(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:d-.1,x=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:Hg,M,v=!1,E,A,I,D;p&&(M=p.getSpacedPoints(h),v=!0,f=!1,E=p.computeFrenetFrames(h,!1),A=new P,I=new P,D=new P),f||(m=0,d=0,g=0,x=0);let b=a.extractPoints(c),S=b.shape,C=b.holes;if(!Qn.isClockWise(S)){S=S.reverse();for(let ie=0,K=C.length;ie<K;ie++){let $=C[ie];Qn.isClockWise($)&&(C[ie]=$.reverse())}}function z(ie){let $=10000000000000001e-36,J=ie[0];for(let de=1;de<=ie.length;de++){let re=de%ie.length,pe=ie[re],He=pe.x-J.x,Ge=pe.y-J.y,T=He*He+Ge*Ge,_=Math.max(Math.abs(pe.x),Math.abs(pe.y),Math.abs(J.x),Math.abs(J.y)),O=$*_*_;if(T<=O){ie.splice(re,1),de--;continue}J=pe}}z(S),C.forEach(z);let H=C.length,X=S;for(let ie=0;ie<H;ie++){let K=C[ie];S=S.concat(K)}function V(ie,K,$){return K||console.error("THREE.ExtrudeGeometry: vec does not exist"),ie.clone().addScaledVector(K,$)}let Q=S.length;function k(ie,K,$){let J,de,re,pe=ie.x-K.x,He=ie.y-K.y,Ge=$.x-ie.x,T=$.y-ie.y,_=pe*pe+He*He,O=pe*T-He*Ge;if(Math.abs(O)>Number.EPSILON){let q=Math.sqrt(_),te=Math.sqrt(Ge*Ge+T*T),Y=K.x-He/q,Ie=K.y+pe/q,ue=$.x-T/te,Ee=$.y+Ge/te,Ce=((ue-Y)*T-(Ee-Ie)*Ge)/(pe*T-He*Ge);J=Y+pe*Ce-ie.x,de=Ie+He*Ce-ie.y;let oe=J*J+de*de;if(oe<=2)return new fe(J,de);re=Math.sqrt(oe/2)}else{let q=!1;pe>Number.EPSILON?Ge>Number.EPSILON&&(q=!0):pe<-Number.EPSILON?Ge<-Number.EPSILON&&(q=!0):Math.sign(He)===Math.sign(T)&&(q=!0),q?(J=-He,de=pe,re=Math.sqrt(_)):(J=pe,de=He,re=Math.sqrt(_/2))}return new fe(J/re,de/re)}let se=[];for(let ie=0,K=X.length,$=K-1,J=ie+1;ie<K;ie++,$++,J++)$===K&&($=0),J===K&&(J=0),se[ie]=k(X[ie],X[$],X[J]);let ge=[],Me,Ne=se.concat();for(let ie=0,K=H;ie<K;ie++){let $=C[ie];Me=[];for(let J=0,de=$.length,re=de-1,pe=J+1;J<de;J++,re++,pe++)re===de&&(re=0),pe===de&&(pe=0),Me[J]=k($[J],$[re],$[pe]);ge.push(Me),Ne=Ne.concat(Me)}let Ve;if(m===0)Ve=Qn.triangulateShape(X,C);else{let ie=[],K=[];for(let $=0;$<m;$++){let J=$/m,de=d*Math.cos(J*Math.PI/2),re=g*Math.sin(J*Math.PI/2)+x;for(let pe=0,He=X.length;pe<He;pe++){let Ge=V(X[pe],se[pe],re);Pe(Ge.x,Ge.y,-de),J===0&&ie.push(Ge)}for(let pe=0,He=H;pe<He;pe++){let Ge=C[pe];Me=ge[pe];let T=[];for(let _=0,O=Ge.length;_<O;_++){let q=V(Ge[_],Me[_],re);Pe(q.x,q.y,-de),J===0&&T.push(q)}J===0&&K.push(T)}}Ve=Qn.triangulateShape(ie,K)}let Qe=Ve.length,Oe=g+x;for(let ie=0;ie<Q;ie++){let K=f?V(S[ie],Ne[ie],Oe):S[ie];v?(I.copy(E.normals[0]).multiplyScalar(K.x),A.copy(E.binormals[0]).multiplyScalar(K.y),D.copy(M[0]).add(I).add(A),Pe(D.x,D.y,D.z)):Pe(K.x,K.y,0)}for(let ie=1;ie<=h;ie++)for(let K=0;K<Q;K++){let $=f?V(S[K],Ne[K],Oe):S[K];v?(I.copy(E.normals[ie]).multiplyScalar($.x),A.copy(E.binormals[ie]).multiplyScalar($.y),D.copy(M[ie]).add(I).add(A),Pe(D.x,D.y,D.z)):Pe($.x,$.y,u/h*ie)}for(let ie=m-1;ie>=0;ie--){let K=ie/m,$=d*Math.cos(K*Math.PI/2),J=g*Math.sin(K*Math.PI/2)+x;for(let de=0,re=X.length;de<re;de++){let pe=V(X[de],se[de],J);Pe(pe.x,pe.y,u+$)}for(let de=0,re=C.length;de<re;de++){let pe=C[de];Me=ge[de];for(let He=0,Ge=pe.length;He<Ge;He++){let T=V(pe[He],Me[He],J);v?Pe(T.x,T.y+M[h-1].y,M[h-1].x+$):Pe(T.x,T.y,u+$)}}}Z(),ee();function Z(){let ie=s.length/3;if(f){let K=0,$=Q*K;for(let J=0;J<Qe;J++){let de=Ve[J];Te(de[2]+$,de[1]+$,de[0]+$)}K=h+m*2,$=Q*K;for(let J=0;J<Qe;J++){let de=Ve[J];Te(de[0]+$,de[1]+$,de[2]+$)}}else{for(let K=0;K<Qe;K++){let $=Ve[K];Te($[2],$[1],$[0])}for(let K=0;K<Qe;K++){let $=Ve[K];Te($[0]+Q*h,$[1]+Q*h,$[2]+Q*h)}}i.addGroup(ie,s.length/3-ie,0)}function ee(){let ie=s.length/3,K=0;Se(X,K),K+=X.length;for(let $=0,J=C.length;$<J;$++){let de=C[$];Se(de,K),K+=de.length}i.addGroup(ie,s.length/3-ie,1)}function Se(ie,K){let $=ie.length;for(;--$>=0;){let J=$,de=$-1;de<0&&(de=ie.length-1);for(let re=0,pe=h+m*2;re<pe;re++){let He=Q*re,Ge=Q*(re+1),T=K+J+He,_=K+de+He,O=K+de+Ge,q=K+J+Ge;Ke(T,_,O,q)}}}function Pe(ie,K,$){l.push(ie),l.push(K),l.push($)}function Te(ie,K,$){ut(ie),ut(K),ut($);let J=s.length/3,de=y.generateTopUV(i,s,J-3,J-2,J-1);R(de[0]),R(de[1]),R(de[2])}function Ke(ie,K,$,J){ut(ie),ut(K),ut(J),ut(K),ut($),ut(J);let de=s.length/3,re=y.generateSideWallUV(i,s,de-6,de-3,de-2,de-1);R(re[0]),R(re[1]),R(re[3]),R(re[1]),R(re[2]),R(re[3])}function ut(ie){s.push(l[ie*3+0]),s.push(l[ie*3+1]),s.push(l[ie*3+2])}function R(ie){r.push(ie.x),r.push(ie.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return Wg(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];i.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new oh[s.type]().fromJSON(s)),new n(i,e.options)}},Hg={generateTopUV:function(n,e,t,i,s){let r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new fe(r,o),new fe(a,l),new fe(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],f=e[s*3],d=e[s*3+1],g=e[s*3+2],x=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new fe(o,1-l),new fe(c,1-u),new fe(f,1-g),new fe(x,1-p)]:[new fe(a,1-l),new fe(h,1-u),new fe(d,1-g),new fe(m,1-p)]}};function Wg(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var xo=class n extends Na{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var an=class n extends pt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=e/a,f=t/l,d=[],g=[],x=[],m=[];for(let p=0;p<h;p++){let y=p*f-o;for(let M=0;M<c;M++){let v=M*u-r;g.push(v,-y,0),x.push(0,0,1),m.push(M/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){let M=y+c*p,v=y+c*(p+1),E=y+1+c*(p+1),A=y+1+c*p;d.push(M,v,A),d.push(v,E,A)}this.setIndex(d),this.setAttribute("position",new ht(g,3)),this.setAttribute("normal",new ht(x,3)),this.setAttribute("uv",new ht(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var vo=class n extends pt{constructor(e=new _i([new fe(0,.5),new fe(-.5,-.5),new fe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],s=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new ht(s,3)),this.setAttribute("normal",new ht(r,3)),this.setAttribute("uv",new ht(o,2));function c(h){let u=s.length/3,f=h.extractPoints(t),d=f.shape,g=f.holes;Qn.isClockWise(d)===!1&&(d=d.reverse());for(let m=0,p=g.length;m<p;m++){let y=g[m];Qn.isClockWise(y)===!0&&(g[m]=y.reverse())}let x=Qn.triangulateShape(d,g);for(let m=0,p=g.length;m<p;m++){let y=g[m];d=d.concat(y)}for(let m=0,p=d.length;m<p;m++){let y=d[m];s.push(y.x,y.y,0),r.push(0,0,1),o.push(y.x,y.y)}for(let m=0,p=x.length;m<p;m++){let y=x[m],M=y[0]+u,v=y[1]+u,E=y[2]+u;i.push(M,v,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Xg(t,e)}static fromJSON(e,t){let i=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];i.push(o)}return new n(i,e.curveSegments)}};function Xg(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}var ds=class n extends pt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new P,f=new P,d=[],g=[],x=[],m=[];for(let p=0;p<=i;p++){let y=[],M=p/i,v=0;p===0&&o===0?v=.5/t:p===i&&l===Math.PI&&(v=-.5/t);for(let E=0;E<=t;E++){let A=E/t;u.x=-e*Math.cos(s+A*r)*Math.sin(o+M*a),u.y=e*Math.cos(o+M*a),u.z=e*Math.sin(s+A*r)*Math.sin(o+M*a),g.push(u.x,u.y,u.z),f.copy(u).normalize(),x.push(f.x,f.y,f.z),m.push(A+v,1-M),y.push(c++)}h.push(y)}for(let p=0;p<i;p++)for(let y=0;y<t;y++){let M=h[p][y+1],v=h[p][y],E=h[p+1][y],A=h[p+1][y+1];(p!==0||o>0)&&d.push(M,v,A),(p!==i-1||l<Math.PI)&&d.push(v,E,A)}this.setIndex(d),this.setAttribute("position",new ht(g,3)),this.setAttribute("normal",new ht(x,3)),this.setAttribute("uv",new ht(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var _o=class n extends pt{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let o=[],a=[],l=[],c=[],h=new P,u=new P,f=new P;for(let d=0;d<=i;d++)for(let g=0;g<=s;g++){let x=g/s*r,m=d/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(x),u.y=(e+t*Math.cos(m))*Math.sin(x),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(x),h.y=e*Math.sin(x),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(g/s),c.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=s;g++){let x=(s+1)*d+g-1,m=(s+1)*(d-1)+g-1,p=(s+1)*(d-1)+g,y=(s+1)*d+g;o.push(x,m,y),o.push(m,p,y)}this.setIndex(o),this.setAttribute("position",new ht(a,3)),this.setAttribute("normal",new ht(l,3)),this.setAttribute("uv",new ht(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var It=class extends zi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Eh,this.normalScale=new fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};var Ga=class extends zi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=nd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ha=class extends zi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function wa(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function qg(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var ps=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Wa=class extends ps{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:th,endingEnd:th}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case nh:r=e,a=2*t-i;break;case ih:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case nh:o=e,l=2*i-t;break;case ih:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,g=(i-t)/(s-t),x=g*g,m=x*g,p=-f*m+2*f*x-f*g,y=(1+f)*m+(-1.5-2*f)*x+(-.5+f)*g+1,M=(-1-d)*m+(1.5+d)*x+.5*g,v=d*m-d*x;for(let E=0;E!==a;++E)r[E]=p*o[h+E]+y*o[c+E]+M*o[l+E]+v*o[u+E];return r}},Xa=class extends ps{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),u=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*u+o[l+f]*h;return r}},qa=class extends ps{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},xn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=wa(t,this.TimeBufferType),this.values=wa(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:wa(e.times,Array),values:wa(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new qa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Xa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Wa(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Yr:t=this.InterpolantFactoryMethodDiscrete;break;case Ra:t=this.InterpolantFactoryMethodLinear;break;case Ta:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Yr;case this.InterpolantFactoryMethodLinear:return Ra;case this.InterpolantFactoryMethodSmooth:return Ta}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&qg(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Ta,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*i,f=u-i,d=u+i;for(let g=0;g!==i;++g){let x=t[u+g];if(x!==t[f+g]||x!==t[d+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*i,f=o*i;for(let d=0;d!==i;++d)t[f+d]=t[u+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};xn.prototype.ValueTypeName="";xn.prototype.TimeBufferType=Float32Array;xn.prototype.ValueBufferType=Float32Array;xn.prototype.DefaultInterpolation=Ra;var Hi=class extends xn{constructor(e,t,i){super(e,t,i)}};Hi.prototype.ValueTypeName="bool";Hi.prototype.ValueBufferType=Array;Hi.prototype.DefaultInterpolation=Yr;Hi.prototype.InterpolantFactoryMethodLinear=void 0;Hi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ya=class extends xn{constructor(e,t,i,s){super(e,t,i,s)}};Ya.prototype.ValueTypeName="color";var Za=class extends xn{constructor(e,t,i,s){super(e,t,i,s)}};Za.prototype.ValueTypeName="number";var Ja=class extends ps{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)pn.slerpFlat(r,0,o,c-a,o,c,l);return r}},yo=class extends xn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Ja(this.times,this.values,this.getValueSize(),e)}};yo.prototype.ValueTypeName="quaternion";yo.prototype.InterpolantFactoryMethodSmooth=void 0;var Wi=class extends xn{constructor(e,t,i){super(e,t,i)}};Wi.prototype.ValueTypeName="string";Wi.prototype.ValueBufferType=Array;Wi.prototype.DefaultInterpolation=Yr;Wi.prototype.InterpolantFactoryMethodLinear=void 0;Wi.prototype.InterpolantFactoryMethodSmooth=void 0;var $a=class extends xn{constructor(e,t,i,s){super(e,t,i,s)}};$a.prototype.ValueTypeName="vector";var Ka=class{constructor(e,t,i){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let d=c[u],g=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},yd=new Ka,ja=class{constructor(e){this.manager=e!==void 0?e:yd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};ja.DEFAULT_MATERIAL_NAME="__DEFAULT";var Mo=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Le(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},So=class extends Mo{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Le(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Qc=new Ze,yf=new P,Mf=new P,hh=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new fe(512,512),this.mapType=qn,this.map=null,this.mapPass=null,this.matrix=new Ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new or,this._frameExtents=new fe(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;yf.setFromMatrixPosition(e.matrixWorld),t.position.copy(yf),Mf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Mf),t.updateMatrixWorld(),Qc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Qc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Qc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var bo=class extends Qr{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},uh=class extends hh{constructor(){super(new bo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},hr=class extends Mo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new uh}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Qa=class extends Zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Uh="\\[\\]\\.:\\/",Yg=new RegExp("["+Uh+"]","g"),Nh="[^"+Uh+"]",Zg="[^"+Uh.replace("\\.","")+"]",Jg=/((?:WC+[\/:])*)/.source.replace("WC",Nh),$g=/(WCOD+)?/.source.replace("WCOD",Zg),Kg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Nh),jg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Nh),Qg=new RegExp("^"+Jg+$g+Kg+jg+"$"),e0=["material","materials","bones","map"],fh=class{constructor(e,t,i){let s=i||yt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},yt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Yg,"")}static parseTrackName(e){let t=Qg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);e0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};yt.Composite=fh;yt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};yt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};yt.prototype.GetterByBindingType=[yt.prototype._getValue_direct,yt.prototype._getValue_array,yt.prototype._getValue_arrayElement,yt.prototype._getValue_toArray];yt.prototype.SetterByBindingTypeAndVersioning=[[yt.prototype._setValue_direct,yt.prototype._setValue_direct_setNeedsUpdate,yt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_array,yt.prototype._setValue_array_setNeedsUpdate,yt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_arrayElement,yt.prototype._setValue_arrayElement_setNeedsUpdate,yt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_fromArray,yt.prototype._setValue_fromArray_setNeedsUpdate,yt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var RS=new Float32Array(1);var Sf=new Ze,wo=class{constructor(e,t,i=0,s=1/0){this.ray=new nr(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new ir,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Sf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Sf),this}intersectObject(e,t=!0,i=[]){return dh(e,this,i,t),i.sort(bf),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)dh(e[s],this,i,t);return i.sort(bf),i}};function bf(n,e){return n.distance-e.distance}function dh(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let o=0,a=r.length;o<a;o++)dh(r[o],e,t,!0)}}function Fh(n,e,t,i){let s=t0(i);switch(t){case wh:return n*e;case dl:return n*e/s.components*s.byteLength;case pl:return n*e/s.components*s.byteLength;case Ah:return n*e*2/s.components*s.byteLength;case ml:return n*e*2/s.components*s.byteLength;case Th:return n*e*3/s.components*s.byteLength;case vn:return n*e*4/s.components*s.byteLength;case gl:return n*e*4/s.components*s.byteLength;case Co:case Ro:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Io:case Po:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case vl:case yl:return Math.max(n,16)*Math.max(e,8)/4;case xl:case _l:return Math.max(n,8)*Math.max(e,8)/2;case Ml:case Sl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case bl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case wl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Tl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Al:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case El:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case Cl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Rl:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Il:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Pl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Dl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Ll:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Ul:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case Nl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case Fl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Ol:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Bl:case zl:case kl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Vl:case Gl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Hl:case Wl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function t0(n){switch(n){case qn:case yh:return{byteLength:1,components:1};case ur:case Mh:case fr:return{byteLength:2,components:1};case ul:case fl:return{byteLength:2,components:4};case qi:case hl:case Un:return{byteLength:4,components:1};case Sh:case bh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Wd(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function l0(n){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,f=n.createBuffer();n.bindBuffer(l,f),n.bufferData(l,c,h),a.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=n.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((d,g)=>d.start-g.start);let f=0;for(let d=1;d<u.length;d++){let g=u[f],x=u[d];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++f,u[f]=x)}u.length=f+1;for(let d=0,g=u.length;d<g;d++){let x=u[d];n.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var c0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,h0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,u0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,f0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,d0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,p0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,m0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,g0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,x0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,v0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,_0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,y0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,M0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,S0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,b0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,w0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,T0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,A0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,E0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,C0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,R0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,I0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,P0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,D0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,L0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,U0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,N0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,F0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,O0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,B0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,z0="gl_FragColor = linearToOutputTexel( gl_FragColor );",k0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,V0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,G0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,H0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,W0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,X0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,q0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Y0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Z0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,J0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,K0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,j0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Q0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ex=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,tx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,nx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ix=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,sx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rx=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ox=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ax=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lx=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,cx=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,hx=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ux=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,px=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,vx=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_x=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Mx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Sx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wx=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Tx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ax=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ex=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Cx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ix=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Px=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Dx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Lx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ux=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Nx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ox=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Bx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Vx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Gx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Hx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Xx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,qx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Yx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Zx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Jx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$x=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Kx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,jx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Qx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ev=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,nv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,iv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,sv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ov=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,av=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,lv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cv=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,uv=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,fv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,mv=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,gv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,xv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,vv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_v=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yv=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,bv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wv=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tv=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Av=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Ev=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Cv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Iv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Lv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Uv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Nv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fv=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Ov=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Je={alphahash_fragment:c0,alphahash_pars_fragment:h0,alphamap_fragment:u0,alphamap_pars_fragment:f0,alphatest_fragment:d0,alphatest_pars_fragment:p0,aomap_fragment:m0,aomap_pars_fragment:g0,batching_pars_vertex:x0,batching_vertex:v0,begin_vertex:_0,beginnormal_vertex:y0,bsdfs:M0,iridescence_fragment:S0,bumpmap_pars_fragment:b0,clipping_planes_fragment:w0,clipping_planes_pars_fragment:T0,clipping_planes_pars_vertex:A0,clipping_planes_vertex:E0,color_fragment:C0,color_pars_fragment:R0,color_pars_vertex:I0,color_vertex:P0,common:D0,cube_uv_reflection_fragment:L0,defaultnormal_vertex:U0,displacementmap_pars_vertex:N0,displacementmap_vertex:F0,emissivemap_fragment:O0,emissivemap_pars_fragment:B0,colorspace_fragment:z0,colorspace_pars_fragment:k0,envmap_fragment:V0,envmap_common_pars_fragment:G0,envmap_pars_fragment:H0,envmap_pars_vertex:W0,envmap_physical_pars_fragment:tx,envmap_vertex:X0,fog_vertex:q0,fog_pars_vertex:Y0,fog_fragment:Z0,fog_pars_fragment:J0,gradientmap_pars_fragment:$0,lightmap_pars_fragment:K0,lights_lambert_fragment:j0,lights_lambert_pars_fragment:Q0,lights_pars_begin:ex,lights_toon_fragment:nx,lights_toon_pars_fragment:ix,lights_phong_fragment:sx,lights_phong_pars_fragment:rx,lights_physical_fragment:ox,lights_physical_pars_fragment:ax,lights_fragment_begin:lx,lights_fragment_maps:cx,lights_fragment_end:hx,logdepthbuf_fragment:ux,logdepthbuf_pars_fragment:fx,logdepthbuf_pars_vertex:dx,logdepthbuf_vertex:px,map_fragment:mx,map_pars_fragment:gx,map_particle_fragment:xx,map_particle_pars_fragment:vx,metalnessmap_fragment:_x,metalnessmap_pars_fragment:yx,morphinstance_vertex:Mx,morphcolor_vertex:Sx,morphnormal_vertex:bx,morphtarget_pars_vertex:wx,morphtarget_vertex:Tx,normal_fragment_begin:Ax,normal_fragment_maps:Ex,normal_pars_fragment:Cx,normal_pars_vertex:Rx,normal_vertex:Ix,normalmap_pars_fragment:Px,clearcoat_normal_fragment_begin:Dx,clearcoat_normal_fragment_maps:Lx,clearcoat_pars_fragment:Ux,iridescence_pars_fragment:Nx,opaque_fragment:Fx,packing:Ox,premultiplied_alpha_fragment:Bx,project_vertex:zx,dithering_fragment:kx,dithering_pars_fragment:Vx,roughnessmap_fragment:Gx,roughnessmap_pars_fragment:Hx,shadowmap_pars_fragment:Wx,shadowmap_pars_vertex:Xx,shadowmap_vertex:qx,shadowmask_pars_fragment:Yx,skinbase_vertex:Zx,skinning_pars_vertex:Jx,skinning_vertex:$x,skinnormal_vertex:Kx,specularmap_fragment:jx,specularmap_pars_fragment:Qx,tonemapping_fragment:ev,tonemapping_pars_fragment:tv,transmission_fragment:nv,transmission_pars_fragment:iv,uv_pars_fragment:sv,uv_pars_vertex:rv,uv_vertex:ov,worldpos_vertex:av,background_vert:lv,background_frag:cv,backgroundCube_vert:hv,backgroundCube_frag:uv,cube_vert:fv,cube_frag:dv,depth_vert:pv,depth_frag:mv,distanceRGBA_vert:gv,distanceRGBA_frag:xv,equirect_vert:vv,equirect_frag:_v,linedashed_vert:yv,linedashed_frag:Mv,meshbasic_vert:Sv,meshbasic_frag:bv,meshlambert_vert:wv,meshlambert_frag:Tv,meshmatcap_vert:Av,meshmatcap_frag:Ev,meshnormal_vert:Cv,meshnormal_frag:Rv,meshphong_vert:Iv,meshphong_frag:Pv,meshphysical_vert:Dv,meshphysical_frag:Lv,meshtoon_vert:Uv,meshtoon_frag:Nv,points_vert:Fv,points_frag:Ov,shadow_vert:Bv,shadow_frag:zv,sprite_vert:kv,sprite_frag:Vv},xe={common:{diffuse:{value:new Le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new fe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Le(16777215)},opacity:{value:1},center:{value:new fe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},si={basic:{uniforms:Jt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.fog]),vertexShader:Je.meshbasic_vert,fragmentShader:Je.meshbasic_frag},lambert:{uniforms:Jt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Le(0)}}]),vertexShader:Je.meshlambert_vert,fragmentShader:Je.meshlambert_frag},phong:{uniforms:Jt([xe.common,xe.specularmap,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,xe.lights,{emissive:{value:new Le(0)},specular:{value:new Le(1118481)},shininess:{value:30}}]),vertexShader:Je.meshphong_vert,fragmentShader:Je.meshphong_frag},standard:{uniforms:Jt([xe.common,xe.envmap,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.roughnessmap,xe.metalnessmap,xe.fog,xe.lights,{emissive:{value:new Le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag},toon:{uniforms:Jt([xe.common,xe.aomap,xe.lightmap,xe.emissivemap,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.gradientmap,xe.fog,xe.lights,{emissive:{value:new Le(0)}}]),vertexShader:Je.meshtoon_vert,fragmentShader:Je.meshtoon_frag},matcap:{uniforms:Jt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,xe.fog,{matcap:{value:null}}]),vertexShader:Je.meshmatcap_vert,fragmentShader:Je.meshmatcap_frag},points:{uniforms:Jt([xe.points,xe.fog]),vertexShader:Je.points_vert,fragmentShader:Je.points_frag},dashed:{uniforms:Jt([xe.common,xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Je.linedashed_vert,fragmentShader:Je.linedashed_frag},depth:{uniforms:Jt([xe.common,xe.displacementmap]),vertexShader:Je.depth_vert,fragmentShader:Je.depth_frag},normal:{uniforms:Jt([xe.common,xe.bumpmap,xe.normalmap,xe.displacementmap,{opacity:{value:1}}]),vertexShader:Je.meshnormal_vert,fragmentShader:Je.meshnormal_frag},sprite:{uniforms:Jt([xe.sprite,xe.fog]),vertexShader:Je.sprite_vert,fragmentShader:Je.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Je.background_vert,fragmentShader:Je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:Je.backgroundCube_vert,fragmentShader:Je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Je.cube_vert,fragmentShader:Je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Je.equirect_vert,fragmentShader:Je.equirect_frag},distanceRGBA:{uniforms:Jt([xe.common,xe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Je.distanceRGBA_vert,fragmentShader:Je.distanceRGBA_frag},shadow:{uniforms:Jt([xe.lights,xe.fog,{color:{value:new Le(0)},opacity:{value:1}}]),vertexShader:Je.shadow_vert,fragmentShader:Je.shadow_frag}};si.physical={uniforms:Jt([si.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new fe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new fe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Le(0)},specularColor:{value:new Le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new fe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag};var ql={r:0,b:0,g:0},vs=new Wn,Gv=new Ze;function Hv(n,e,t,i,s,r,o){let a=new Le(0),l=r===!0?0:1,c,h,u=null,f=0,d=null;function g(M){let v=M.isScene===!0?M.background:null;return v&&v.isTexture&&(v=(M.backgroundBlurriness>0?t:e).get(v)),v}function x(M){let v=!1,E=g(M);E===null?p(a,l):E&&E.isColor&&(p(E,1),v=!0);let A=n.xr.getEnvironmentBlendMode();A==="additive"?i.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(M,v){let E=g(v);E&&(E.isCubeTexture||E.mapping===Ao)?(h===void 0&&(h=new Ht(new ki(1,1,1),new Xn({name:"BackgroundCubeMaterial",uniforms:xs(si.backgroundCube.uniforms),vertexShader:si.backgroundCube.vertexShader,fragmentShader:si.backgroundCube.fragmentShader,side:Wt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,I,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),vs.copy(v.backgroundRotation),vs.x*=-1,vs.y*=-1,vs.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(vs.y*=-1,vs.z*=-1),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Gv.makeRotationFromEuler(vs)),h.material.toneMapped=tt.getTransfer(E.colorSpace)!==ft,(u!==E||f!==E.version||d!==n.toneMapping)&&(h.material.needsUpdate=!0,u=E,f=E.version,d=n.toneMapping),h.layers.enableAll(),M.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new Ht(new an(2,2),new Xn({name:"BackgroundMaterial",uniforms:xs(si.background.uniforms),vertexShader:si.background.vertexShader,fragmentShader:si.background.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=tt.getTransfer(E.colorSpace)!==ft,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(u!==E||f!==E.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,u=E,f=E.version,d=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function p(M,v){M.getRGB(ql,Dh(n)),i.buffers.color.setClear(ql.r,ql.g,ql.b,v,o)}function y(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,v=1){a.set(M),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(M){l=M,p(a,l)},render:x,addToRenderList:m,dispose:y}}function Wv(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null),r=s,o=!1;function a(S,C,U,z,H){let X=!1,V=u(z,U,C);r!==V&&(r=V,c(r.object)),X=d(S,z,U,H),X&&g(S,z,U,H),H!==null&&e.update(H,n.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,v(S,C,U,z),H!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return n.createVertexArray()}function c(S){return n.bindVertexArray(S)}function h(S){return n.deleteVertexArray(S)}function u(S,C,U){let z=U.wireframe===!0,H=i[S.id];H===void 0&&(H={},i[S.id]=H);let X=H[C.id];X===void 0&&(X={},H[C.id]=X);let V=X[z];return V===void 0&&(V=f(l()),X[z]=V),V}function f(S){let C=[],U=[],z=[];for(let H=0;H<t;H++)C[H]=0,U[H]=0,z[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:U,attributeDivisors:z,object:S,attributes:{},index:null}}function d(S,C,U,z){let H=r.attributes,X=C.attributes,V=0,Q=U.getAttributes();for(let k in Q)if(Q[k].location>=0){let ge=H[k],Me=X[k];if(Me===void 0&&(k==="instanceMatrix"&&S.instanceMatrix&&(Me=S.instanceMatrix),k==="instanceColor"&&S.instanceColor&&(Me=S.instanceColor)),ge===void 0||ge.attribute!==Me||Me&&ge.data!==Me.data)return!0;V++}return r.attributesNum!==V||r.index!==z}function g(S,C,U,z){let H={},X=C.attributes,V=0,Q=U.getAttributes();for(let k in Q)if(Q[k].location>=0){let ge=X[k];ge===void 0&&(k==="instanceMatrix"&&S.instanceMatrix&&(ge=S.instanceMatrix),k==="instanceColor"&&S.instanceColor&&(ge=S.instanceColor));let Me={};Me.attribute=ge,ge&&ge.data&&(Me.data=ge.data),H[k]=Me,V++}r.attributes=H,r.attributesNum=V,r.index=z}function x(){let S=r.newAttributes;for(let C=0,U=S.length;C<U;C++)S[C]=0}function m(S){p(S,0)}function p(S,C){let U=r.newAttributes,z=r.enabledAttributes,H=r.attributeDivisors;U[S]=1,z[S]===0&&(n.enableVertexAttribArray(S),z[S]=1),H[S]!==C&&(n.vertexAttribDivisor(S,C),H[S]=C)}function y(){let S=r.newAttributes,C=r.enabledAttributes;for(let U=0,z=C.length;U<z;U++)C[U]!==S[U]&&(n.disableVertexAttribArray(U),C[U]=0)}function M(S,C,U,z,H,X,V){V===!0?n.vertexAttribIPointer(S,C,U,H,X):n.vertexAttribPointer(S,C,U,z,H,X)}function v(S,C,U,z){x();let H=z.attributes,X=U.getAttributes(),V=C.defaultAttributeValues;for(let Q in X){let k=X[Q];if(k.location>=0){let se=H[Q];if(se===void 0&&(Q==="instanceMatrix"&&S.instanceMatrix&&(se=S.instanceMatrix),Q==="instanceColor"&&S.instanceColor&&(se=S.instanceColor)),se!==void 0){let ge=se.normalized,Me=se.itemSize,Ne=e.get(se);if(Ne===void 0)continue;let Ve=Ne.buffer,Qe=Ne.type,Oe=Ne.bytesPerElement,Z=Qe===n.INT||Qe===n.UNSIGNED_INT||se.gpuType===hl;if(se.isInterleavedBufferAttribute){let ee=se.data,Se=ee.stride,Pe=se.offset;if(ee.isInstancedInterleavedBuffer){for(let Te=0;Te<k.locationSize;Te++)p(k.location+Te,ee.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Te=0;Te<k.locationSize;Te++)m(k.location+Te);n.bindBuffer(n.ARRAY_BUFFER,Ve);for(let Te=0;Te<k.locationSize;Te++)M(k.location+Te,Me/k.locationSize,Qe,ge,Se*Oe,(Pe+Me/k.locationSize*Te)*Oe,Z)}else{if(se.isInstancedBufferAttribute){for(let ee=0;ee<k.locationSize;ee++)p(k.location+ee,se.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let ee=0;ee<k.locationSize;ee++)m(k.location+ee);n.bindBuffer(n.ARRAY_BUFFER,Ve);for(let ee=0;ee<k.locationSize;ee++)M(k.location+ee,Me/k.locationSize,Qe,ge,Me*Oe,Me/k.locationSize*ee*Oe,Z)}}else if(V!==void 0){let ge=V[Q];if(ge!==void 0)switch(ge.length){case 2:n.vertexAttrib2fv(k.location,ge);break;case 3:n.vertexAttrib3fv(k.location,ge);break;case 4:n.vertexAttrib4fv(k.location,ge);break;default:n.vertexAttrib1fv(k.location,ge)}}}}y()}function E(){D();for(let S in i){let C=i[S];for(let U in C){let z=C[U];for(let H in z)h(z[H].object),delete z[H];delete C[U]}delete i[S]}}function A(S){if(i[S.id]===void 0)return;let C=i[S.id];for(let U in C){let z=C[U];for(let H in z)h(z[H].object),delete z[H];delete C[U]}delete i[S.id]}function I(S){for(let C in i){let U=i[C];if(U[S.id]===void 0)continue;let z=U[S.id];for(let H in z)h(z[H].object),delete z[H];delete U[S.id]}}function D(){b(),o=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:D,resetDefaultState:b,dispose:E,releaseStatesOfGeometry:A,releaseStatesOfProgram:I,initAttributes:x,enableAttribute:m,disableUnusedAttributes:y}}function Xv(n,e,t){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];t.update(d,i,1)}function l(c,h,u,f){if(u===0)return;let d=e.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,h,0,f,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*f[x];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function qv(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(I){return!(I!==vn&&i.convert(I)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(I){let D=I===fr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==qn&&i.convert(I)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Un&&!D)}function l(I){if(I==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),y=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),M=n.getParameter(n.MAX_VARYING_VECTORS),v=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=g>0,A=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:v,vertexTextures:E,maxSamples:A}}function Yv(n){let e=this,t=null,i=0,s=!1,r=!1,o=new Dn,a=new Xe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let d=u.length!==0||f||i!==0||s;return s=f,i=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let y=r?0:i,M=y*4,v=p.clippingState||null;l.value=v,v=h(g,f,M,d);for(let E=0;E!==M;++E)v[E]=t[E];p.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,f,d,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=l.value,g!==!0||m===null){let p=d+x*4,y=f.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,v=d;M!==x;++M,v+=4)o.copy(u[M]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Zv(n){let e=new WeakMap;function t(o,a){return a===al?o.mapping=ms:a===ll&&(o.mapping=gs),o}function i(o){if(o&&o.isTexture){let a=o.mapping;if(a===al||a===ll)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Ua(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}var gr=4,Md=[.125,.215,.35,.446,.526,.582],Ms=20,Oh=new bo,Sd=new Le,Bh=null,zh=0,kh=0,Vh=!1,ys=(1+Math.sqrt(5))/2,mr=1/ys,bd=[new P(-ys,mr,0),new P(ys,mr,0),new P(-mr,0,ys),new P(mr,0,ys),new P(0,ys,-mr),new P(0,ys,mr),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],Jv=new P,Jl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100,r={}){let{size:o=256,position:a=Jv}=r;Bh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),kh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ad(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Td(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Bh,zh,kh),this._renderer.xr.enabled=Vh,e.scissorTest=!1,Yl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ms||e.mapping===gs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),kh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Hn,minFilter:Hn,generateMipmaps:!1,type:fr,format:vn,colorSpace:hs,depthBuffer:!1},s=wd(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wd(e,t,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=$v(r)),this._blurMaterial=Kv(r,e,t)}return s}_compileMaterial(e){let t=new Ht(this._lodPlanes[0],e);this._renderer.compile(t,Oh)}_sceneToCubeUV(e,t,i,s,r){let l=new Zt(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(Sd),u.toneMapping=Mi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));let x=new Ln({name:"PMREM.Background",side:Wt,depthWrite:!1,depthTest:!1}),m=new Ht(new ki,x),p=!1,y=e.background;y?y.isColor&&(x.color.copy(y),e.background=null,p=!0):(x.color.copy(Sd),p=!0);for(let M=0;M<6;M++){let v=M%3;v===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):v===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let E=this._cubeSize;Yl(s,v*E,M>2?E:0,E,E),u.setRenderTarget(s),p&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=d,u.autoClear=f,e.background=y}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===ms||e.mapping===gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ad()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Td());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ht(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Yl(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Oh)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=bd[(s-r-1)%bd.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new Ht(this._lodPlanes[s],c),f=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Ms-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):Ms;m>Ms&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ms}`);let p=[],y=0;for(let I=0;I<Ms;++I){let D=I/x,b=Math.exp(-D*D/2);p.push(b),I===0?y+=b:I<m&&(y+=2*b)}for(let I=0;I<p.length;I++)p[I]=p[I]/y;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:M}=this;f.dTheta.value=g,f.mipInt.value=M-i;let v=this._sizeLods[s],E=3*v*(s>M-gr?s-M+gr:0),A=4*(this._cubeSize-v);Yl(t,E,A,3*v,2*v),l.setRenderTarget(t),l.render(u,Oh)}};function $v(n){let e=[],t=[],i=[],s=n,r=n-gr+1+Md.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>n-gr?l=Md[o-n+gr-1]:o===0&&(l=0),i.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,x=3,m=2,p=1,y=new Float32Array(x*g*d),M=new Float32Array(m*g*d),v=new Float32Array(p*g*d);for(let A=0;A<d;A++){let I=A%3*2/3-1,D=A>2?0:-1,b=[I,D,0,I+2/3,D,0,I+2/3,D+1,0,I,D,0,I+2/3,D+1,0,I,D+1,0];y.set(b,x*g*A),M.set(f,m*g*A);let S=[A,A,A,A,A,A];v.set(S,p*g*A)}let E=new pt;E.setAttribute("position",new kt(y,x)),E.setAttribute("uv",new kt(M,m)),E.setAttribute("faceIndex",new kt(v,p)),e.push(E),s>gr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function wd(n,e,t){let i=new ei(n,e,t);return i.texture.mapping=Ao,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Yl(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Kv(n,e,t){let i=new Float32Array(Ms),s=new P(0,1,0);return new Xn({name:"SphericalGaussianBlur",defines:{n:Ms,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Td(){return new Xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Ad(){return new Xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:yi,depthTest:!1,depthWrite:!1})}function Kh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function jv(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){let l=a.mapping,c=l===al||l===ll,h=l===ms||l===gs;if(c||h){let u=e.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Jl(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let d=a.image;return c&&d&&d.height>0||h&&d&&s(d)?(t===null&&(t=new Jl(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Qv(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&er("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function e_(n,e,t,i){let s={},r=new WeakMap;function o(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];let d=r.get(f);d&&(e.remove(d),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let d in f)e.update(f[d],n.ARRAY_BUFFER)}function c(u){let f=[],d=u.index,g=u.attributes.position,x=0;if(d!==null){let y=d.array;x=d.version;for(let M=0,v=y.length;M<v;M+=3){let E=y[M+0],A=y[M+1],I=y[M+2];f.push(E,A,A,I,I,E)}}else if(g!==void 0){let y=g.array;x=g.version;for(let M=0,v=y.length/3-1;M<v;M+=3){let E=M+0,A=M+1,I=M+2;f.push(E,A,A,I,I,E)}}else return;let m=new(Ph(f)?jr:us)(f,1);m.version=x;let p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){let f=r.get(u);if(f){let d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function t_(n,e,t){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,d){n.drawElements(i,d,r,f*o),t.update(d,i,1)}function c(f,d,g){g!==0&&(n.drawElementsInstanced(i,d,r,f*o,g),t.update(d,i,g))}function h(f,d,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];t.update(m,i,1)}function u(f,d,g,x){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/o,d[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(i,d,0,r,f,0,x,0,g);let p=0;for(let y=0;y<g;y++)p+=d[y]*x[y];t.update(p,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function n_(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function i_(n,e,t){let i=new WeakMap,s=new vt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=i.get(a);if(f===void 0||f.count!==u){let b=function(){I.dispose(),i.delete(a),a.removeEventListener("dispose",b)};f!==void 0&&f.texture.dispose();let d=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],M=0;d===!0&&(M=1),g===!0&&(M=2),x===!0&&(M=3);let v=a.attributes.position.count*M,E=1;v>e.maxTextureSize&&(E=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let A=new Float32Array(v*E*4*u),I=new Kr(A,v,E,u);I.type=Un,I.needsUpdate=!0;let D=M*4;for(let S=0;S<u;S++){let C=m[S],U=p[S],z=y[S],H=v*E*4*S;for(let X=0;X<C.count;X++){let V=X*D;d===!0&&(s.fromBufferAttribute(C,X),A[H+V+0]=s.x,A[H+V+1]=s.y,A[H+V+2]=s.z,A[H+V+3]=0),g===!0&&(s.fromBufferAttribute(U,X),A[H+V+4]=s.x,A[H+V+5]=s.y,A[H+V+6]=s.z,A[H+V+7]=0),x===!0&&(s.fromBufferAttribute(z,X),A[H+V+8]=s.x,A[H+V+9]=s.y,A[H+V+10]=s.z,A[H+V+11]=z.itemSize===4?s.w:1)}}f={count:u,texture:I,size:new fe(v,E)},i.set(a,f),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let d=0;for(let x=0;x<c.length;x++)d+=c[x];let g=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function s_(n,e,t,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var Xd=new Gt,Ed=new oo(1,1),qd=new Kr,Yd=new Da,Zd=new eo,Cd=[],Rd=[],Id=new Float32Array(16),Pd=new Float32Array(9),Dd=new Float32Array(4);function vr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Cd[s];if(r===void 0&&(r=new Float32Array(s),Cd[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Ft(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ot(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Kl(n,e){let t=Rd[e];t===void 0&&(t=new Int32Array(e),Rd[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function r_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function o_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;n.uniform2fv(this.addr,e),Ot(t,e)}}function a_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ft(t,e))return;n.uniform3fv(this.addr,e),Ot(t,e)}}function l_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;n.uniform4fv(this.addr,e),Ot(t,e)}}function c_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ft(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,i))return;Dd.set(i),n.uniformMatrix2fv(this.addr,!1,Dd),Ot(t,i)}}function h_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ft(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,i))return;Pd.set(i),n.uniformMatrix3fv(this.addr,!1,Pd),Ot(t,i)}}function u_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Ft(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,i))return;Id.set(i),n.uniformMatrix4fv(this.addr,!1,Id),Ot(t,i)}}function f_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function d_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;n.uniform2iv(this.addr,e),Ot(t,e)}}function p_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;n.uniform3iv(this.addr,e),Ot(t,e)}}function m_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;n.uniform4iv(this.addr,e),Ot(t,e)}}function g_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function x_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;n.uniform2uiv(this.addr,e),Ot(t,e)}}function v_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;n.uniform3uiv(this.addr,e),Ot(t,e)}}function __(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;n.uniform4uiv(this.addr,e),Ot(t,e)}}function y_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Ed.compareFunction=Ch,r=Ed):r=Xd,t.setTexture2D(e||r,s)}function M_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Yd,s)}function S_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Zd,s)}function b_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||qd,s)}function w_(n){switch(n){case 5126:return r_;case 35664:return o_;case 35665:return a_;case 35666:return l_;case 35674:return c_;case 35675:return h_;case 35676:return u_;case 5124:case 35670:return f_;case 35667:case 35671:return d_;case 35668:case 35672:return p_;case 35669:case 35673:return m_;case 5125:return g_;case 36294:return x_;case 36295:return v_;case 36296:return __;case 35678:case 36198:case 36298:case 36306:case 35682:return y_;case 35679:case 36299:case 36307:return M_;case 35680:case 36300:case 36308:case 36293:return S_;case 36289:case 36303:case 36311:case 36292:return b_}}function T_(n,e){n.uniform1fv(this.addr,e)}function A_(n,e){let t=vr(e,this.size,2);n.uniform2fv(this.addr,t)}function E_(n,e){let t=vr(e,this.size,3);n.uniform3fv(this.addr,t)}function C_(n,e){let t=vr(e,this.size,4);n.uniform4fv(this.addr,t)}function R_(n,e){let t=vr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function I_(n,e){let t=vr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function P_(n,e){let t=vr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function D_(n,e){n.uniform1iv(this.addr,e)}function L_(n,e){n.uniform2iv(this.addr,e)}function U_(n,e){n.uniform3iv(this.addr,e)}function N_(n,e){n.uniform4iv(this.addr,e)}function F_(n,e){n.uniform1uiv(this.addr,e)}function O_(n,e){n.uniform2uiv(this.addr,e)}function B_(n,e){n.uniform3uiv(this.addr,e)}function z_(n,e){n.uniform4uiv(this.addr,e)}function k_(n,e,t){let i=this.cache,s=e.length,r=Kl(t,s);Ft(i,r)||(n.uniform1iv(this.addr,r),Ot(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Xd,r[o])}function V_(n,e,t){let i=this.cache,s=e.length,r=Kl(t,s);Ft(i,r)||(n.uniform1iv(this.addr,r),Ot(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Yd,r[o])}function G_(n,e,t){let i=this.cache,s=e.length,r=Kl(t,s);Ft(i,r)||(n.uniform1iv(this.addr,r),Ot(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Zd,r[o])}function H_(n,e,t){let i=this.cache,s=e.length,r=Kl(t,s);Ft(i,r)||(n.uniform1iv(this.addr,r),Ot(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||qd,r[o])}function W_(n){switch(n){case 5126:return T_;case 35664:return A_;case 35665:return E_;case 35666:return C_;case 35674:return R_;case 35675:return I_;case 35676:return P_;case 5124:case 35670:return D_;case 35667:case 35671:return L_;case 35668:case 35672:return U_;case 35669:case 35673:return N_;case 5125:return F_;case 36294:return O_;case 36295:return B_;case 36296:return z_;case 35678:case 36198:case 36298:case 36306:case 35682:return k_;case 35679:case 36299:case 36307:return V_;case 35680:case 36300:case 36308:case 36293:return G_;case 36289:case 36303:case 36311:case 36292:return H_}}var Hh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=w_(t.type)}},Wh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=W_(t.type)}},Xh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],i)}}},Gh=/(\w+)(\])?(\[|\.)?/g;function Ld(n,e){n.seq.push(e),n.map[e.id]=e}function X_(n,e,t){let i=n.name,s=i.length;for(Gh.lastIndex=0;;){let r=Gh.exec(i),o=Gh.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Ld(t,c===void 0?new Hh(a,n,e):new Wh(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Xh(a),Ld(t,u)),t=u}}}var xr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);X_(r,o,this)}}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&i.push(o)}return i}};function Ud(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var q_=37297,Y_=0;function Z_(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var Nd=new Xe;function J_(n){tt._getMatrix(Nd,tt.workingColorSpace,n);let e=`mat3( ${Nd.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(n)){case Zr:return[e,"LinearTransferOETF"];case ft:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Fd(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Z_(n.getShaderSource(e),a)}else return r}function $_(n,e){let t=J_(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function K_(n,e){let t;switch(e){case Yf:t="Linear";break;case Zf:t="Reinhard";break;case Jf:t="Cineon";break;case $f:t="ACESFilmic";break;case jf:t="AgX";break;case Qf:t="Neutral";break;case Kf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Zl=new P;function j_(){tt.getLuminanceCoefficients(Zl);let n=Zl.x.toFixed(4),e=Zl.y.toFixed(4),t=Zl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Q_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Lo).join(`
`)}function ey(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function ty(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),o=r.name,a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Lo(n){return n!==""}function Od(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Bd(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ny=/^[ \t]*#include +<([\w\d./]+)>/gm;function qh(n){return n.replace(ny,sy)}var iy=new Map;function sy(n,e){let t=Je[e];if(t===void 0){let i=iy.get(e);if(i!==void 0)t=Je[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return qh(t)}var ry=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function zd(n){return n.replace(ry,oy)}function oy(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function kd(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function ay(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===To?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===Af?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ii&&(e="SHADOWMAP_TYPE_VSM"),e}function ly(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ms:case gs:e="ENVMAP_TYPE_CUBE";break;case Ao:e="ENVMAP_TYPE_CUBE_UV";break}return e}function cy(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case gs:e="ENVMAP_MODE_REFRACTION";break}return e}function hy(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case vh:e="ENVMAP_BLENDING_MULTIPLY";break;case Xf:e="ENVMAP_BLENDING_MIX";break;case qf:e="ENVMAP_BLENDING_ADD";break}return e}function uy(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function fy(n,e,t,i){let s=n.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=ay(t),c=ly(t),h=cy(t),u=hy(t),f=uy(t),d=Q_(t),g=ey(r),x=s.createProgram(),m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Lo).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Lo).join(`
`),p.length>0&&(p+=`
`)):(m=[kd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Lo).join(`
`),p=[kd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mi?"#define TONE_MAPPING":"",t.toneMapping!==Mi?Je.tonemapping_pars_fragment:"",t.toneMapping!==Mi?K_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Je.colorspace_pars_fragment,$_("linearToOutputTexel",t.outputColorSpace),j_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Lo).join(`
`)),o=qh(o),o=Od(o,t),o=Bd(o,t),a=qh(a),a=Od(a,t),a=Bd(a,t),o=zd(o),a=zd(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Rh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Rh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let M=y+m+o,v=y+p+a,E=Ud(s,s.VERTEX_SHADER,M),A=Ud(s,s.FRAGMENT_SHADER,v);s.attachShader(x,E),s.attachShader(x,A),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function I(C){if(n.debug.checkShaderErrors){let U=s.getProgramInfoLog(x)||"",z=s.getShaderInfoLog(E)||"",H=s.getShaderInfoLog(A)||"",X=U.trim(),V=z.trim(),Q=H.trim(),k=!0,se=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(k=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,E,A);else{let ge=Fd(s,E,"vertex"),Me=Fd(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+X+`
`+ge+`
`+Me)}else X!==""?console.warn("THREE.WebGLProgram: Program Info Log:",X):(V===""||Q==="")&&(se=!1);se&&(C.diagnostics={runnable:k,programLog:X,vertexShader:{log:V,prefix:m},fragmentShader:{log:Q,prefix:p}})}s.deleteShader(E),s.deleteShader(A),D=new xr(s,x),b=ty(s,x)}let D;this.getUniforms=function(){return D===void 0&&I(this),D};let b;this.getAttributes=function(){return b===void 0&&I(this),b};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(x,q_)),S},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Y_++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=A,this}var dy=0,Yh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Zh(e),t.set(e,i)),i}},Zh=class{constructor(e){this.id=dy++,this.code=e,this.usedTimes=0}};function py(n,e,t,i,s,r,o){let a=new ir,l=new Yh,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures,d=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(b){return c.add(b),b===0?"uv":`uv${b}`}function m(b,S,C,U,z){let H=U.fog,X=z.geometry,V=b.isMeshStandardMaterial?U.environment:null,Q=(b.isMeshStandardMaterial?t:e).get(b.envMap||V),k=Q&&Q.mapping===Ao?Q.image.height:null,se=g[b.type];b.precision!==null&&(d=s.getMaxPrecision(b.precision),d!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",d,"instead."));let ge=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Me=ge!==void 0?ge.length:0,Ne=0;X.morphAttributes.position!==void 0&&(Ne=1),X.morphAttributes.normal!==void 0&&(Ne=2),X.morphAttributes.color!==void 0&&(Ne=3);let Ve,Qe,Oe,Z;if(se){let ct=si[se];Ve=ct.vertexShader,Qe=ct.fragmentShader}else Ve=b.vertexShader,Qe=b.fragmentShader,l.update(b),Oe=l.getVertexShaderID(b),Z=l.getFragmentShaderID(b);let ee=n.getRenderTarget(),Se=n.state.buffers.depth.getReversed(),Pe=z.isInstancedMesh===!0,Te=z.isBatchedMesh===!0,Ke=!!b.map,ut=!!b.matcap,R=!!Q,ie=!!b.aoMap,K=!!b.lightMap,$=!!b.bumpMap,J=!!b.normalMap,de=!!b.displacementMap,re=!!b.emissiveMap,pe=!!b.metalnessMap,He=!!b.roughnessMap,Ge=b.anisotropy>0,T=b.clearcoat>0,_=b.dispersion>0,O=b.iridescence>0,q=b.sheen>0,te=b.transmission>0,Y=Ge&&!!b.anisotropyMap,Ie=T&&!!b.clearcoatMap,ue=T&&!!b.clearcoatNormalMap,Ee=T&&!!b.clearcoatRoughnessMap,Ce=O&&!!b.iridescenceMap,oe=O&&!!b.iridescenceThicknessMap,ye=q&&!!b.sheenColorMap,ze=q&&!!b.sheenRoughnessMap,De=!!b.specularMap,ve=!!b.specularColorMap,Ye=!!b.specularIntensityMap,L=te&&!!b.transmissionMap,he=te&&!!b.thicknessMap,me=!!b.gradientMap,we=!!b.alphaMap,ae=b.alphaTest>0,j=!!b.alphaHash,Re=!!b.extensions,We=Mi;b.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(We=n.toneMapping);let xt={shaderID:se,shaderType:b.type,shaderName:b.name,vertexShader:Ve,fragmentShader:Qe,defines:b.defines,customVertexShaderID:Oe,customFragmentShaderID:Z,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:d,batching:Te,batchingColor:Te&&z._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&z.instanceColor!==null,instancingMorph:Pe&&z.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ee===null?n.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:hs,alphaToCoverage:!!b.alphaToCoverage,map:Ke,matcap:ut,envMap:R,envMapMode:R&&Q.mapping,envMapCubeUVHeight:k,aoMap:ie,lightMap:K,bumpMap:$,normalMap:J,displacementMap:f&&de,emissiveMap:re,normalMapObjectSpace:J&&b.normalMapType===sd,normalMapTangentSpace:J&&b.normalMapType===Eh,metalnessMap:pe,roughnessMap:He,anisotropy:Ge,anisotropyMap:Y,clearcoat:T,clearcoatMap:Ie,clearcoatNormalMap:ue,clearcoatRoughnessMap:Ee,dispersion:_,iridescence:O,iridescenceMap:Ce,iridescenceThicknessMap:oe,sheen:q,sheenColorMap:ye,sheenRoughnessMap:ze,specularMap:De,specularColorMap:ve,specularIntensityMap:Ye,transmission:te,transmissionMap:L,thicknessMap:he,gradientMap:me,opaque:b.transparent===!1&&b.blending===ls&&b.alphaToCoverage===!1,alphaMap:we,alphaTest:ae,alphaHash:j,combine:b.combine,mapUv:Ke&&x(b.map.channel),aoMapUv:ie&&x(b.aoMap.channel),lightMapUv:K&&x(b.lightMap.channel),bumpMapUv:$&&x(b.bumpMap.channel),normalMapUv:J&&x(b.normalMap.channel),displacementMapUv:de&&x(b.displacementMap.channel),emissiveMapUv:re&&x(b.emissiveMap.channel),metalnessMapUv:pe&&x(b.metalnessMap.channel),roughnessMapUv:He&&x(b.roughnessMap.channel),anisotropyMapUv:Y&&x(b.anisotropyMap.channel),clearcoatMapUv:Ie&&x(b.clearcoatMap.channel),clearcoatNormalMapUv:ue&&x(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&x(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&x(b.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&x(b.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&x(b.sheenColorMap.channel),sheenRoughnessMapUv:ze&&x(b.sheenRoughnessMap.channel),specularMapUv:De&&x(b.specularMap.channel),specularColorMapUv:ve&&x(b.specularColorMap.channel),specularIntensityMapUv:Ye&&x(b.specularIntensityMap.channel),transmissionMapUv:L&&x(b.transmissionMap.channel),thicknessMapUv:he&&x(b.thicknessMap.channel),alphaMapUv:we&&x(b.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(J||Ge),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!X.attributes.uv&&(Ke||we),fog:!!H,useFog:b.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Se,skinning:z.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Ne,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:We,decodeVideoTexture:Ke&&b.map.isVideoTexture===!0&&tt.getTransfer(b.map.colorSpace)===ft,decodeVideoTextureEmissive:re&&b.emissiveMap.isVideoTexture===!0&&tt.getTransfer(b.emissiveMap.colorSpace)===ft,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===rt,flipSided:b.side===Wt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Re&&b.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Re&&b.extensions.multiDraw===!0||Te)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return xt.vertexUv1s=c.has(1),xt.vertexUv2s=c.has(2),xt.vertexUv3s=c.has(3),c.clear(),xt}function p(b){let S=[];if(b.shaderID?S.push(b.shaderID):(S.push(b.customVertexShaderID),S.push(b.customFragmentShaderID)),b.defines!==void 0)for(let C in b.defines)S.push(C),S.push(b.defines[C]);return b.isRawShaderMaterial===!1&&(y(S,b),M(S,b),S.push(n.outputColorSpace)),S.push(b.customProgramCacheKey),S.join()}function y(b,S){b.push(S.precision),b.push(S.outputColorSpace),b.push(S.envMapMode),b.push(S.envMapCubeUVHeight),b.push(S.mapUv),b.push(S.alphaMapUv),b.push(S.lightMapUv),b.push(S.aoMapUv),b.push(S.bumpMapUv),b.push(S.normalMapUv),b.push(S.displacementMapUv),b.push(S.emissiveMapUv),b.push(S.metalnessMapUv),b.push(S.roughnessMapUv),b.push(S.anisotropyMapUv),b.push(S.clearcoatMapUv),b.push(S.clearcoatNormalMapUv),b.push(S.clearcoatRoughnessMapUv),b.push(S.iridescenceMapUv),b.push(S.iridescenceThicknessMapUv),b.push(S.sheenColorMapUv),b.push(S.sheenRoughnessMapUv),b.push(S.specularMapUv),b.push(S.specularColorMapUv),b.push(S.specularIntensityMapUv),b.push(S.transmissionMapUv),b.push(S.thicknessMapUv),b.push(S.combine),b.push(S.fogExp2),b.push(S.sizeAttenuation),b.push(S.morphTargetsCount),b.push(S.morphAttributeCount),b.push(S.numDirLights),b.push(S.numPointLights),b.push(S.numSpotLights),b.push(S.numSpotLightMaps),b.push(S.numHemiLights),b.push(S.numRectAreaLights),b.push(S.numDirLightShadows),b.push(S.numPointLightShadows),b.push(S.numSpotLightShadows),b.push(S.numSpotLightShadowsWithMaps),b.push(S.numLightProbes),b.push(S.shadowMapType),b.push(S.toneMapping),b.push(S.numClippingPlanes),b.push(S.numClipIntersection),b.push(S.depthPacking)}function M(b,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),S.gradientMap&&a.enable(22),b.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),b.push(a.mask)}function v(b){let S=g[b.type],C;if(S){let U=si[S];C=md.clone(U.uniforms)}else C=b.uniforms;return C}function E(b,S){let C;for(let U=0,z=h.length;U<z;U++){let H=h[U];if(H.cacheKey===S){C=H,++C.usedTimes;break}}return C===void 0&&(C=new fy(n,S,b,r),h.push(C)),C}function A(b){if(--b.usedTimes===0){let S=h.indexOf(b);h[S]=h[h.length-1],h.pop(),b.destroy()}}function I(b){l.remove(b)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:E,releaseProgram:A,releaseShaderCache:I,programs:h,dispose:D}}function my(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function gy(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Vd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Gd(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(u,f,d,g,x,m){let p=n[e];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},n[e]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m),e++,p}function a(u,f,d,g,x,m){let p=o(u,f,d,g,x,m);d.transmission>0?i.push(p):d.transparent===!0?s.push(p):t.push(p)}function l(u,f,d,g,x,m){let p=o(u,f,d,g,x,m);d.transmission>0?i.unshift(p):d.transparent===!0?s.unshift(p):t.unshift(p)}function c(u,f){t.length>1&&t.sort(u||gy),i.length>1&&i.sort(f||Vd),s.length>1&&s.sort(f||Vd)}function h(){for(let u=e,f=n.length;u<f;u++){let d=n[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function xy(){let n=new WeakMap;function e(i,s){let r=n.get(i),o;return r===void 0?(o=new Gd,n.set(i,[o])):s>=r.length?(o=new Gd,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function vy(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Le};break;case"SpotLight":t={position:new P,direction:new P,color:new Le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Le,groundColor:new Le};break;case"RectAreaLight":t={color:new Le,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function _y(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new fe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var yy=0;function My(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Sy(n){let e=new vy,t=_y(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let s=new P,r=new Ze,o=new Ze;function a(c){let h=0,u=0,f=0;for(let b=0;b<9;b++)i.probe[b].set(0,0,0);let d=0,g=0,x=0,m=0,p=0,y=0,M=0,v=0,E=0,A=0,I=0;c.sort(My);for(let b=0,S=c.length;b<S;b++){let C=c[b],U=C.color,z=C.intensity,H=C.distance,X=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=U.r*z,u+=U.g*z,f+=U.b*z;else if(C.isLightProbe){for(let V=0;V<9;V++)i.probe[V].addScaledVector(C.sh.coefficients[V],z);I++}else if(C.isDirectionalLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Q=C.shadow,k=t.get(C);k.shadowIntensity=Q.intensity,k.shadowBias=Q.bias,k.shadowNormalBias=Q.normalBias,k.shadowRadius=Q.radius,k.shadowMapSize=Q.mapSize,i.directionalShadow[d]=k,i.directionalShadowMap[d]=X,i.directionalShadowMatrix[d]=C.shadow.matrix,y++}i.directional[d]=V,d++}else if(C.isSpotLight){let V=e.get(C);V.position.setFromMatrixPosition(C.matrixWorld),V.color.copy(U).multiplyScalar(z),V.distance=H,V.coneCos=Math.cos(C.angle),V.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),V.decay=C.decay,i.spot[x]=V;let Q=C.shadow;if(C.map&&(i.spotLightMap[E]=C.map,E++,Q.updateMatrices(C),C.castShadow&&A++),i.spotLightMatrix[x]=Q.matrix,C.castShadow){let k=t.get(C);k.shadowIntensity=Q.intensity,k.shadowBias=Q.bias,k.shadowNormalBias=Q.normalBias,k.shadowRadius=Q.radius,k.shadowMapSize=Q.mapSize,i.spotShadow[x]=k,i.spotShadowMap[x]=X,v++}x++}else if(C.isRectAreaLight){let V=e.get(C);V.color.copy(U).multiplyScalar(z),V.halfWidth.set(C.width*.5,0,0),V.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=V,m++}else if(C.isPointLight){let V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),V.distance=C.distance,V.decay=C.decay,C.castShadow){let Q=C.shadow,k=t.get(C);k.shadowIntensity=Q.intensity,k.shadowBias=Q.bias,k.shadowNormalBias=Q.normalBias,k.shadowRadius=Q.radius,k.shadowMapSize=Q.mapSize,k.shadowCameraNear=Q.camera.near,k.shadowCameraFar=Q.camera.far,i.pointShadow[g]=k,i.pointShadowMap[g]=X,i.pointShadowMatrix[g]=C.shadow.matrix,M++}i.point[g]=V,g++}else if(C.isHemisphereLight){let V=e.get(C);V.skyColor.copy(C.color).multiplyScalar(z),V.groundColor.copy(C.groundColor).multiplyScalar(z),i.hemi[p]=V,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xe.LTC_FLOAT_1,i.rectAreaLTC2=xe.LTC_FLOAT_2):(i.rectAreaLTC1=xe.LTC_HALF_1,i.rectAreaLTC2=xe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=f;let D=i.hash;(D.directionalLength!==d||D.pointLength!==g||D.spotLength!==x||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==y||D.numPointShadows!==M||D.numSpotShadows!==v||D.numSpotMaps!==E||D.numLightProbes!==I)&&(i.directional.length=d,i.spot.length=x,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=y,i.directionalShadowMap.length=y,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=v,i.spotShadowMap.length=v,i.directionalShadowMatrix.length=y,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=v+E-A,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=I,D.directionalLength=d,D.pointLength=g,D.spotLength=x,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=y,D.numPointShadows=M,D.numSpotShadows=v,D.numSpotMaps=E,D.numLightProbes=I,i.version=yy++)}function l(c,h){let u=0,f=0,d=0,g=0,x=0,m=h.matrixWorldInverse;for(let p=0,y=c.length;p<y;p++){let M=c[p];if(M.isDirectionalLight){let v=i.directional[u];v.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),u++}else if(M.isSpotLight){let v=i.spot[d];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),d++}else if(M.isRectAreaLight){let v=i.rectArea[g];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(M.width*.5,0,0),v.halfHeight.set(0,M.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){let v=i.point[f];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){let v=i.hemi[x];v.direction.setFromMatrixPosition(M.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:l,state:i}}function Hd(n){let e=new Sy(n),t=[],i=[];function s(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function by(n){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Hd(n),e.set(s,[a])):r>=o.length?(a=new Hd(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var wy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ty=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Ay(n,e,t){let i=new or,s=new fe,r=new fe,o=new vt,a=new Ga({depthPacking:id}),l=new Ha,c={},h=t.maxTextureSize,u={[Gn]:Wt,[Wt]:Gn,[rt]:rt},f=new Xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new fe},radius:{value:4}},vertexShader:wy,fragmentShader:Ty}),d=f.clone();d.defines.HORIZONTAL_PASS=1;let g=new pt;g.setAttribute("position",new kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Ht(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=To;let p=this.type;this.render=function(A,I,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let b=n.getRenderTarget(),S=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),U=n.state;U.setBlending(yi),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let z=p!==ii&&this.type===ii,H=p===ii&&this.type!==ii;for(let X=0,V=A.length;X<V;X++){let Q=A[X],k=Q.shadow;if(k===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);let se=k.getFrameExtents();if(s.multiply(se),r.copy(k.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/se.x),s.x=r.x*se.x,k.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/se.y),s.y=r.y*se.y,k.mapSize.y=r.y)),k.map===null||z===!0||H===!0){let Me=this.type!==ii?{minFilter:on,magFilter:on}:{};k.map!==null&&k.map.dispose(),k.map=new ei(s.x,s.y,Me),k.map.texture.name=Q.name+".shadowMap",k.camera.updateProjectionMatrix()}n.setRenderTarget(k.map),n.clear();let ge=k.getViewportCount();for(let Me=0;Me<ge;Me++){let Ne=k.getViewport(Me);o.set(r.x*Ne.x,r.y*Ne.y,r.x*Ne.z,r.y*Ne.w),U.viewport(o),k.updateMatrices(Q,Me),i=k.getFrustum(),v(I,D,k.camera,Q,this.type)}k.isPointLightShadow!==!0&&this.type===ii&&y(k,D),k.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(b,S,C)};function y(A,I){let D=e.update(x);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new ei(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,n.setRenderTarget(A.mapPass),n.clear(),n.renderBufferDirect(I,null,D,f,x,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,n.setRenderTarget(A.map),n.clear(),n.renderBufferDirect(I,null,D,d,x,null)}function M(A,I,D,b){let S=null,C=D.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)S=C;else if(S=D.isPointLight===!0?l:a,n.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let U=S.uuid,z=I.uuid,H=c[U];H===void 0&&(H={},c[U]=H);let X=H[z];X===void 0&&(X=S.clone(),H[z]=X,I.addEventListener("dispose",E)),S=X}if(S.visible=I.visible,S.wireframe=I.wireframe,b===ii?S.side=I.shadowSide!==null?I.shadowSide:I.side:S.side=I.shadowSide!==null?I.shadowSide:u[I.side],S.alphaMap=I.alphaMap,S.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,S.map=I.map,S.clipShadows=I.clipShadows,S.clippingPlanes=I.clippingPlanes,S.clipIntersection=I.clipIntersection,S.displacementMap=I.displacementMap,S.displacementScale=I.displacementScale,S.displacementBias=I.displacementBias,S.wireframeLinewidth=I.wireframeLinewidth,S.linewidth=I.linewidth,D.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let U=n.properties.get(S);U.light=D}return S}function v(A,I,D,b,S){if(A.visible===!1)return;if(A.layers.test(I.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&S===ii)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,A.matrixWorld);let z=e.update(A),H=A.material;if(Array.isArray(H)){let X=z.groups;for(let V=0,Q=X.length;V<Q;V++){let k=X[V],se=H[k.materialIndex];if(se&&se.visible){let ge=M(A,se,b,S);A.onBeforeShadow(n,A,I,D,z,ge,k),n.renderBufferDirect(D,null,z,ge,A,k),A.onAfterShadow(n,A,I,D,z,ge,k)}}}else if(H.visible){let X=M(A,H,b,S);A.onBeforeShadow(n,A,I,D,z,X,null),n.renderBufferDirect(D,null,z,X,A,null),A.onAfterShadow(n,A,I,D,z,X,null)}}let U=A.children;for(let z=0,H=U.length;z<H;z++)v(U[z],I,D,b,S)}function E(A){A.target.removeEventListener("dispose",E);for(let D in c){let b=c[D],S=A.target.uuid;S in b&&(b[S].dispose(),delete b[S])}}}var Ey={[el]:tl,[nl]:rl,[il]:ol,[cs]:sl,[tl]:el,[rl]:nl,[ol]:il,[sl]:cs};function Cy(n,e){function t(){let L=!1,he=new vt,me=null,we=new vt(0,0,0,0);return{setMask:function(ae){me!==ae&&!L&&(n.colorMask(ae,ae,ae,ae),me=ae)},setLocked:function(ae){L=ae},setClear:function(ae,j,Re,We,xt){xt===!0&&(ae*=We,j*=We,Re*=We),he.set(ae,j,Re,We),we.equals(he)===!1&&(n.clearColor(ae,j,Re,We),we.copy(he))},reset:function(){L=!1,me=null,we.set(-1,0,0,0)}}}function i(){let L=!1,he=!1,me=null,we=null,ae=null;return{setReversed:function(j){if(he!==j){let Re=e.get("EXT_clip_control");j?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),he=j;let We=ae;ae=null,this.setClear(We)}},getReversed:function(){return he},setTest:function(j){j?ee(n.DEPTH_TEST):Se(n.DEPTH_TEST)},setMask:function(j){me!==j&&!L&&(n.depthMask(j),me=j)},setFunc:function(j){if(he&&(j=Ey[j]),we!==j){switch(j){case el:n.depthFunc(n.NEVER);break;case tl:n.depthFunc(n.ALWAYS);break;case nl:n.depthFunc(n.LESS);break;case cs:n.depthFunc(n.LEQUAL);break;case il:n.depthFunc(n.EQUAL);break;case sl:n.depthFunc(n.GEQUAL);break;case rl:n.depthFunc(n.GREATER);break;case ol:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}we=j}},setLocked:function(j){L=j},setClear:function(j){ae!==j&&(he&&(j=1-j),n.clearDepth(j),ae=j)},reset:function(){L=!1,me=null,we=null,ae=null,he=!1}}}function s(){let L=!1,he=null,me=null,we=null,ae=null,j=null,Re=null,We=null,xt=null;return{setTest:function(ct){L||(ct?ee(n.STENCIL_TEST):Se(n.STENCIL_TEST))},setMask:function(ct){he!==ct&&!L&&(n.stencilMask(ct),he=ct)},setFunc:function(ct,hi,jn){(me!==ct||we!==hi||ae!==jn)&&(n.stencilFunc(ct,hi,jn),me=ct,we=hi,ae=jn)},setOp:function(ct,hi,jn){(j!==ct||Re!==hi||We!==jn)&&(n.stencilOp(ct,hi,jn),j=ct,Re=hi,We=jn)},setLocked:function(ct){L=ct},setClear:function(ct){xt!==ct&&(n.clearStencil(ct),xt=ct)},reset:function(){L=!1,he=null,me=null,we=null,ae=null,j=null,Re=null,We=null,xt=null}}}let r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,d=[],g=null,x=!1,m=null,p=null,y=null,M=null,v=null,E=null,A=null,I=new Le(0,0,0),D=0,b=!1,S=null,C=null,U=null,z=null,H=null,X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,Q=0,k=n.getParameter(n.VERSION);k.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(k)[1]),V=Q>=1):k.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),V=Q>=2);let se=null,ge={},Me=n.getParameter(n.SCISSOR_BOX),Ne=n.getParameter(n.VIEWPORT),Ve=new vt().fromArray(Me),Qe=new vt().fromArray(Ne);function Oe(L,he,me,we){let ae=new Uint8Array(4),j=n.createTexture();n.bindTexture(L,j),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Re=0;Re<me;Re++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(he,0,n.RGBA,1,1,we,0,n.RGBA,n.UNSIGNED_BYTE,ae):n.texImage2D(he+Re,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ae);return j}let Z={};Z[n.TEXTURE_2D]=Oe(n.TEXTURE_2D,n.TEXTURE_2D,1),Z[n.TEXTURE_CUBE_MAP]=Oe(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[n.TEXTURE_2D_ARRAY]=Oe(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Z[n.TEXTURE_3D]=Oe(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(n.DEPTH_TEST),o.setFunc(cs),$(!1),J(ph),ee(n.CULL_FACE),ie(yi);function ee(L){h[L]!==!0&&(n.enable(L),h[L]=!0)}function Se(L){h[L]!==!1&&(n.disable(L),h[L]=!1)}function Pe(L,he){return u[L]!==he?(n.bindFramebuffer(L,he),u[L]=he,L===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=he),L===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=he),!0):!1}function Te(L,he){let me=d,we=!1;if(L){me=f.get(he),me===void 0&&(me=[],f.set(he,me));let ae=L.textures;if(me.length!==ae.length||me[0]!==n.COLOR_ATTACHMENT0){for(let j=0,Re=ae.length;j<Re;j++)me[j]=n.COLOR_ATTACHMENT0+j;me.length=ae.length,we=!0}}else me[0]!==n.BACK&&(me[0]=n.BACK,we=!0);we&&n.drawBuffers(me)}function Ke(L){return g!==L?(n.useProgram(L),g=L,!0):!1}let ut={[Bi]:n.FUNC_ADD,[Cf]:n.FUNC_SUBTRACT,[Rf]:n.FUNC_REVERSE_SUBTRACT};ut[If]=n.MIN,ut[Pf]=n.MAX;let R={[Df]:n.ZERO,[Lf]:n.ONE,[Uf]:n.SRC_COLOR,[Aa]:n.SRC_ALPHA,[kf]:n.SRC_ALPHA_SATURATE,[Bf]:n.DST_COLOR,[Ff]:n.DST_ALPHA,[Nf]:n.ONE_MINUS_SRC_COLOR,[Ea]:n.ONE_MINUS_SRC_ALPHA,[zf]:n.ONE_MINUS_DST_COLOR,[Of]:n.ONE_MINUS_DST_ALPHA,[Vf]:n.CONSTANT_COLOR,[Gf]:n.ONE_MINUS_CONSTANT_COLOR,[Hf]:n.CONSTANT_ALPHA,[Wf]:n.ONE_MINUS_CONSTANT_ALPHA};function ie(L,he,me,we,ae,j,Re,We,xt,ct){if(L===yi){x===!0&&(Se(n.BLEND),x=!1);return}if(x===!1&&(ee(n.BLEND),x=!0),L!==Ef){if(L!==m||ct!==b){if((p!==Bi||v!==Bi)&&(n.blendEquation(n.FUNC_ADD),p=Bi,v=Bi),ct)switch(L){case ls:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case mh:n.blendFunc(n.ONE,n.ONE);break;case gh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case xh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case ls:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case mh:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case gh:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}y=null,M=null,E=null,A=null,I.set(0,0,0),D=0,m=L,b=ct}return}ae=ae||he,j=j||me,Re=Re||we,(he!==p||ae!==v)&&(n.blendEquationSeparate(ut[he],ut[ae]),p=he,v=ae),(me!==y||we!==M||j!==E||Re!==A)&&(n.blendFuncSeparate(R[me],R[we],R[j],R[Re]),y=me,M=we,E=j,A=Re),(We.equals(I)===!1||xt!==D)&&(n.blendColor(We.r,We.g,We.b,xt),I.copy(We),D=xt),m=L,b=!1}function K(L,he){L.side===rt?Se(n.CULL_FACE):ee(n.CULL_FACE);let me=L.side===Wt;he&&(me=!me),$(me),L.blending===ls&&L.transparent===!1?ie(yi):ie(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),r.setMask(L.colorWrite);let we=L.stencilWrite;a.setTest(we),we&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),re(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ee(n.SAMPLE_ALPHA_TO_COVERAGE):Se(n.SAMPLE_ALPHA_TO_COVERAGE)}function $(L){S!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),S=L)}function J(L){L!==wf?(ee(n.CULL_FACE),L!==C&&(L===ph?n.cullFace(n.BACK):L===Tf?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Se(n.CULL_FACE),C=L}function de(L){L!==U&&(V&&n.lineWidth(L),U=L)}function re(L,he,me){L?(ee(n.POLYGON_OFFSET_FILL),(z!==he||H!==me)&&(n.polygonOffset(he,me),z=he,H=me)):Se(n.POLYGON_OFFSET_FILL)}function pe(L){L?ee(n.SCISSOR_TEST):Se(n.SCISSOR_TEST)}function He(L){L===void 0&&(L=n.TEXTURE0+X-1),se!==L&&(n.activeTexture(L),se=L)}function Ge(L,he,me){me===void 0&&(se===null?me=n.TEXTURE0+X-1:me=se);let we=ge[me];we===void 0&&(we={type:void 0,texture:void 0},ge[me]=we),(we.type!==L||we.texture!==he)&&(se!==me&&(n.activeTexture(me),se=me),n.bindTexture(L,he||Z[L]),we.type=L,we.texture=he)}function T(){let L=ge[se];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function _(){try{n.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function O(){try{n.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function q(){try{n.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function te(){try{n.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Y(){try{n.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ie(){try{n.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ue(){try{n.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ee(){try{n.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ce(){try{n.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function oe(){try{n.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ye(L){Ve.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),Ve.copy(L))}function ze(L){Qe.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),Qe.copy(L))}function De(L,he){let me=c.get(he);me===void 0&&(me=new WeakMap,c.set(he,me));let we=me.get(L);we===void 0&&(we=n.getUniformBlockIndex(he,L.name),me.set(L,we))}function ve(L,he){let we=c.get(he).get(L);l.get(he)!==we&&(n.uniformBlockBinding(he,we,L.__bindingPointIndex),l.set(he,we))}function Ye(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},se=null,ge={},u={},f=new WeakMap,d=[],g=null,x=!1,m=null,p=null,y=null,M=null,v=null,E=null,A=null,I=new Le(0,0,0),D=0,b=!1,S=null,C=null,U=null,z=null,H=null,Ve.set(0,0,n.canvas.width,n.canvas.height),Qe.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ee,disable:Se,bindFramebuffer:Pe,drawBuffers:Te,useProgram:Ke,setBlending:ie,setMaterial:K,setFlipSided:$,setCullFace:J,setLineWidth:de,setPolygonOffset:re,setScissorTest:pe,activeTexture:He,bindTexture:Ge,unbindTexture:T,compressedTexImage2D:_,compressedTexImage3D:O,texImage2D:Ce,texImage3D:oe,updateUBOMapping:De,uniformBlockBinding:ve,texStorage2D:ue,texStorage3D:Ee,texSubImage2D:q,texSubImage3D:te,compressedTexSubImage2D:Y,compressedTexSubImage3D:Ie,scissor:ye,viewport:ze,reset:Ye}}function Ry(n,e,t,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new fe,h=new WeakMap,u,f=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return d?new OffscreenCanvas(T,_):$r("canvas")}function x(T,_,O){let q=1,te=Ge(T);if((te.width>O||te.height>O)&&(q=O/Math.max(te.width,te.height)),q<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let Y=Math.floor(q*te.width),Ie=Math.floor(q*te.height);u===void 0&&(u=g(Y,Ie));let ue=_?g(Y,Ie):u;return ue.width=Y,ue.height=Ie,ue.getContext("2d").drawImage(T,0,0,Y,Ie),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+Y+"x"+Ie+")."),ue}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){n.generateMipmap(T)}function y(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function M(T,_,O,q,te=!1){if(T!==null){if(n[T]!==void 0)return n[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=_;if(_===n.RED&&(O===n.FLOAT&&(Y=n.R32F),O===n.HALF_FLOAT&&(Y=n.R16F),O===n.UNSIGNED_BYTE&&(Y=n.R8)),_===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.R8UI),O===n.UNSIGNED_SHORT&&(Y=n.R16UI),O===n.UNSIGNED_INT&&(Y=n.R32UI),O===n.BYTE&&(Y=n.R8I),O===n.SHORT&&(Y=n.R16I),O===n.INT&&(Y=n.R32I)),_===n.RG&&(O===n.FLOAT&&(Y=n.RG32F),O===n.HALF_FLOAT&&(Y=n.RG16F),O===n.UNSIGNED_BYTE&&(Y=n.RG8)),_===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RG8UI),O===n.UNSIGNED_SHORT&&(Y=n.RG16UI),O===n.UNSIGNED_INT&&(Y=n.RG32UI),O===n.BYTE&&(Y=n.RG8I),O===n.SHORT&&(Y=n.RG16I),O===n.INT&&(Y=n.RG32I)),_===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),O===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),O===n.UNSIGNED_INT&&(Y=n.RGB32UI),O===n.BYTE&&(Y=n.RGB8I),O===n.SHORT&&(Y=n.RGB16I),O===n.INT&&(Y=n.RGB32I)),_===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),O===n.UNSIGNED_INT&&(Y=n.RGBA32UI),O===n.BYTE&&(Y=n.RGBA8I),O===n.SHORT&&(Y=n.RGBA16I),O===n.INT&&(Y=n.RGBA32I)),_===n.RGB&&(O===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),O===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),_===n.RGBA){let Ie=te?Zr:tt.getTransfer(q);O===n.FLOAT&&(Y=n.RGBA32F),O===n.HALF_FLOAT&&(Y=n.RGBA16F),O===n.UNSIGNED_BYTE&&(Y=Ie===ft?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function v(T,_){let O;return T?_===null||_===qi||_===dr?O=n.DEPTH24_STENCIL8:_===Un?O=n.DEPTH32F_STENCIL8:_===ur&&(O=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===qi||_===dr?O=n.DEPTH_COMPONENT24:_===Un?O=n.DEPTH_COMPONENT32F:_===ur&&(O=n.DEPTH_COMPONENT16),O}function E(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==on&&T.minFilter!==Hn?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function A(T){let _=T.target;_.removeEventListener("dispose",A),D(_),_.isVideoTexture&&h.delete(_)}function I(T){let _=T.target;_.removeEventListener("dispose",I),S(_)}function D(T){let _=i.get(T);if(_.__webglInit===void 0)return;let O=T.source,q=f.get(O);if(q){let te=q[_.__cacheKey];te.usedTimes--,te.usedTimes===0&&b(T),Object.keys(q).length===0&&f.delete(O)}i.remove(T)}function b(T){let _=i.get(T);n.deleteTexture(_.__webglTexture);let O=T.source,q=f.get(O);delete q[_.__cacheKey],o.memory.textures--}function S(T){let _=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(_.__webglFramebuffer[q]))for(let te=0;te<_.__webglFramebuffer[q].length;te++)n.deleteFramebuffer(_.__webglFramebuffer[q][te]);else n.deleteFramebuffer(_.__webglFramebuffer[q]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[q])}else{if(Array.isArray(_.__webglFramebuffer))for(let q=0;q<_.__webglFramebuffer.length;q++)n.deleteFramebuffer(_.__webglFramebuffer[q]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let q=0;q<_.__webglColorRenderbuffer.length;q++)_.__webglColorRenderbuffer[q]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[q]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let O=T.textures;for(let q=0,te=O.length;q<te;q++){let Y=i.get(O[q]);Y.__webglTexture&&(n.deleteTexture(Y.__webglTexture),o.memory.textures--),i.remove(O[q])}i.remove(T)}let C=0;function U(){C=0}function z(){let T=C;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),C+=1,T}function H(T){let _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function X(T,_){let O=i.get(T);if(T.isVideoTexture&&pe(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&O.__version!==T.version){let q=T.image;if(q===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(O,T,_);return}}else T.isExternalTexture&&(O.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+_)}function V(T,_){let O=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Z(O,T,_);return}t.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+_)}function Q(T,_){let O=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){Z(O,T,_);return}t.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+_)}function k(T,_){let O=i.get(T);if(T.version>0&&O.__version!==T.version){ee(O,T,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+_)}let se={[Ks]:n.REPEAT,[Oi]:n.CLAMP_TO_EDGE,[Ca]:n.MIRRORED_REPEAT},ge={[on]:n.NEAREST,[td]:n.NEAREST_MIPMAP_NEAREST,[Eo]:n.NEAREST_MIPMAP_LINEAR,[Hn]:n.LINEAR,[cl]:n.LINEAR_MIPMAP_NEAREST,[Xi]:n.LINEAR_MIPMAP_LINEAR},Me={[rd]:n.NEVER,[ud]:n.ALWAYS,[od]:n.LESS,[Ch]:n.LEQUAL,[ad]:n.EQUAL,[hd]:n.GEQUAL,[ld]:n.GREATER,[cd]:n.NOTEQUAL};function Ne(T,_){if(_.type===Un&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Hn||_.magFilter===cl||_.magFilter===Eo||_.magFilter===Xi||_.minFilter===Hn||_.minFilter===cl||_.minFilter===Eo||_.minFilter===Xi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,se[_.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,se[_.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,se[_.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,ge[_.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,ge[_.minFilter]),_.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,Me[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===on||_.minFilter!==Eo&&_.minFilter!==Xi||_.type===Un&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");n.texParameterf(T,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function Ve(T,_){let O=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",A));let q=_.source,te=f.get(q);te===void 0&&(te={},f.set(q,te));let Y=H(_);if(Y!==T.__cacheKey){te[Y]===void 0&&(te[Y]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,O=!0),te[Y].usedTimes++;let Ie=te[T.__cacheKey];Ie!==void 0&&(te[T.__cacheKey].usedTimes--,Ie.usedTimes===0&&b(_)),T.__cacheKey=Y,T.__webglTexture=te[Y].texture}return O}function Qe(T,_,O){return Math.floor(Math.floor(T/O)/_)}function Oe(T,_,O,q){let Y=T.updateRanges;if(Y.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,O,q,_.data);else{Y.sort((oe,ye)=>oe.start-ye.start);let Ie=0;for(let oe=1;oe<Y.length;oe++){let ye=Y[Ie],ze=Y[oe],De=ye.start+ye.count,ve=Qe(ze.start,_.width,4),Ye=Qe(ye.start,_.width,4);ze.start<=De+1&&ve===Ye&&Qe(ze.start+ze.count-1,_.width,4)===ve?ye.count=Math.max(ye.count,ze.start+ze.count-ye.start):(++Ie,Y[Ie]=ze)}Y.length=Ie+1;let ue=n.getParameter(n.UNPACK_ROW_LENGTH),Ee=n.getParameter(n.UNPACK_SKIP_PIXELS),Ce=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let oe=0,ye=Y.length;oe<ye;oe++){let ze=Y[oe],De=Math.floor(ze.start/4),ve=Math.ceil(ze.count/4),Ye=De%_.width,L=Math.floor(De/_.width),he=ve,me=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ye),n.pixelStorei(n.UNPACK_SKIP_ROWS,L),t.texSubImage2D(n.TEXTURE_2D,0,Ye,L,he,me,O,q,_.data)}T.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,ue),n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ee),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ce)}}function Z(T,_,O){let q=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(q=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(q=n.TEXTURE_3D);let te=Ve(T,_),Y=_.source;t.bindTexture(q,T.__webglTexture,n.TEXTURE0+O);let Ie=i.get(Y);if(Y.version!==Ie.__version||te===!0){t.activeTexture(n.TEXTURE0+O);let ue=tt.getPrimaries(tt.workingColorSpace),Ee=_.colorSpace===Si?null:tt.getPrimaries(_.colorSpace),Ce=_.colorSpace===Si||ue===Ee?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);let oe=x(_.image,!1,s.maxTextureSize);oe=He(_,oe);let ye=r.convert(_.format,_.colorSpace),ze=r.convert(_.type),De=M(_.internalFormat,ye,ze,_.colorSpace,_.isVideoTexture);Ne(q,_);let ve,Ye=_.mipmaps,L=_.isVideoTexture!==!0,he=Ie.__version===void 0||te===!0,me=Y.dataReady,we=E(_,oe);if(_.isDepthTexture)De=v(_.format===pr,_.type),he&&(L?t.texStorage2D(n.TEXTURE_2D,1,De,oe.width,oe.height):t.texImage2D(n.TEXTURE_2D,0,De,oe.width,oe.height,0,ye,ze,null));else if(_.isDataTexture)if(Ye.length>0){L&&he&&t.texStorage2D(n.TEXTURE_2D,we,De,Ye[0].width,Ye[0].height);for(let ae=0,j=Ye.length;ae<j;ae++)ve=Ye[ae],L?me&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,ve.width,ve.height,ye,ze,ve.data):t.texImage2D(n.TEXTURE_2D,ae,De,ve.width,ve.height,0,ye,ze,ve.data);_.generateMipmaps=!1}else L?(he&&t.texStorage2D(n.TEXTURE_2D,we,De,oe.width,oe.height),me&&Oe(_,oe,ye,ze)):t.texImage2D(n.TEXTURE_2D,0,De,oe.width,oe.height,0,ye,ze,oe.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){L&&he&&t.texStorage3D(n.TEXTURE_2D_ARRAY,we,De,Ye[0].width,Ye[0].height,oe.depth);for(let ae=0,j=Ye.length;ae<j;ae++)if(ve=Ye[ae],_.format!==vn)if(ye!==null)if(L){if(me)if(_.layerUpdates.size>0){let Re=Fh(ve.width,ve.height,_.format,_.type);for(let We of _.layerUpdates){let xt=ve.data.subarray(We*Re/ve.data.BYTES_PER_ELEMENT,(We+1)*Re/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,We,ve.width,ve.height,1,ye,xt)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,0,ve.width,ve.height,oe.depth,ye,ve.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ae,De,ve.width,ve.height,oe.depth,0,ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?me&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ae,0,0,0,ve.width,ve.height,oe.depth,ye,ze,ve.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ae,De,ve.width,ve.height,oe.depth,0,ye,ze,ve.data)}else{L&&he&&t.texStorage2D(n.TEXTURE_2D,we,De,Ye[0].width,Ye[0].height);for(let ae=0,j=Ye.length;ae<j;ae++)ve=Ye[ae],_.format!==vn?ye!==null?L?me&&t.compressedTexSubImage2D(n.TEXTURE_2D,ae,0,0,ve.width,ve.height,ye,ve.data):t.compressedTexImage2D(n.TEXTURE_2D,ae,De,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?me&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,ve.width,ve.height,ye,ze,ve.data):t.texImage2D(n.TEXTURE_2D,ae,De,ve.width,ve.height,0,ye,ze,ve.data)}else if(_.isDataArrayTexture)if(L){if(he&&t.texStorage3D(n.TEXTURE_2D_ARRAY,we,De,oe.width,oe.height,oe.depth),me)if(_.layerUpdates.size>0){let ae=Fh(oe.width,oe.height,_.format,_.type);for(let j of _.layerUpdates){let Re=oe.data.subarray(j*ae/oe.data.BYTES_PER_ELEMENT,(j+1)*ae/oe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,j,oe.width,oe.height,1,ye,ze,Re)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,ye,ze,oe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,De,oe.width,oe.height,oe.depth,0,ye,ze,oe.data);else if(_.isData3DTexture)L?(he&&t.texStorage3D(n.TEXTURE_3D,we,De,oe.width,oe.height,oe.depth),me&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,ye,ze,oe.data)):t.texImage3D(n.TEXTURE_3D,0,De,oe.width,oe.height,oe.depth,0,ye,ze,oe.data);else if(_.isFramebufferTexture){if(he)if(L)t.texStorage2D(n.TEXTURE_2D,we,De,oe.width,oe.height);else{let ae=oe.width,j=oe.height;for(let Re=0;Re<we;Re++)t.texImage2D(n.TEXTURE_2D,Re,De,ae,j,0,ye,ze,null),ae>>=1,j>>=1}}else if(Ye.length>0){if(L&&he){let ae=Ge(Ye[0]);t.texStorage2D(n.TEXTURE_2D,we,De,ae.width,ae.height)}for(let ae=0,j=Ye.length;ae<j;ae++)ve=Ye[ae],L?me&&t.texSubImage2D(n.TEXTURE_2D,ae,0,0,ye,ze,ve):t.texImage2D(n.TEXTURE_2D,ae,De,ye,ze,ve);_.generateMipmaps=!1}else if(L){if(he){let ae=Ge(oe);t.texStorage2D(n.TEXTURE_2D,we,De,ae.width,ae.height)}me&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ye,ze,oe)}else t.texImage2D(n.TEXTURE_2D,0,De,ye,ze,oe);m(_)&&p(q),Ie.__version=Y.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ee(T,_,O){if(_.image.length!==6)return;let q=Ve(T,_),te=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+O);let Y=i.get(te);if(te.version!==Y.__version||q===!0){t.activeTexture(n.TEXTURE0+O);let Ie=tt.getPrimaries(tt.workingColorSpace),ue=_.colorSpace===Si?null:tt.getPrimaries(_.colorSpace),Ee=_.colorSpace===Si||Ie===ue?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);let Ce=_.isCompressedTexture||_.image[0].isCompressedTexture,oe=_.image[0]&&_.image[0].isDataTexture,ye=[];for(let j=0;j<6;j++)!Ce&&!oe?ye[j]=x(_.image[j],!0,s.maxCubemapSize):ye[j]=oe?_.image[j].image:_.image[j],ye[j]=He(_,ye[j]);let ze=ye[0],De=r.convert(_.format,_.colorSpace),ve=r.convert(_.type),Ye=M(_.internalFormat,De,ve,_.colorSpace),L=_.isVideoTexture!==!0,he=Y.__version===void 0||q===!0,me=te.dataReady,we=E(_,ze);Ne(n.TEXTURE_CUBE_MAP,_);let ae;if(Ce){L&&he&&t.texStorage2D(n.TEXTURE_CUBE_MAP,we,Ye,ze.width,ze.height);for(let j=0;j<6;j++){ae=ye[j].mipmaps;for(let Re=0;Re<ae.length;Re++){let We=ae[Re];_.format!==vn?De!==null?L?me&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re,0,0,We.width,We.height,De,We.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re,Ye,We.width,We.height,0,We.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?me&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re,0,0,We.width,We.height,De,ve,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re,Ye,We.width,We.height,0,De,ve,We.data)}}}else{if(ae=_.mipmaps,L&&he){ae.length>0&&we++;let j=Ge(ye[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,we,Ye,j.width,j.height)}for(let j=0;j<6;j++)if(oe){L?me&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,ye[j].width,ye[j].height,De,ve,ye[j].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Ye,ye[j].width,ye[j].height,0,De,ve,ye[j].data);for(let Re=0;Re<ae.length;Re++){let xt=ae[Re].image[j].image;L?me&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re+1,0,0,xt.width,xt.height,De,ve,xt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re+1,Ye,xt.width,xt.height,0,De,ve,xt.data)}}else{L?me&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,De,ve,ye[j]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Ye,De,ve,ye[j]);for(let Re=0;Re<ae.length;Re++){let We=ae[Re];L?me&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re+1,0,0,De,ve,We.image[j]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Re+1,Ye,De,ve,We.image[j])}}}m(_)&&p(n.TEXTURE_CUBE_MAP),Y.__version=te.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function Se(T,_,O,q,te,Y){let Ie=r.convert(O.format,O.colorSpace),ue=r.convert(O.type),Ee=M(O.internalFormat,Ie,ue,O.colorSpace),Ce=i.get(_),oe=i.get(O);if(oe.__renderTarget=_,!Ce.__hasExternalTextures){let ye=Math.max(1,_.width>>Y),ze=Math.max(1,_.height>>Y);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,Y,Ee,ye,ze,_.depth,0,Ie,ue,null):t.texImage2D(te,Y,Ee,ye,ze,0,Ie,ue,null)}t.bindFramebuffer(n.FRAMEBUFFER,T),re(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,q,te,oe.__webglTexture,0,de(_)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,q,te,oe.__webglTexture,Y),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Pe(T,_,O){if(n.bindRenderbuffer(n.RENDERBUFFER,T),_.depthBuffer){let q=_.depthTexture,te=q&&q.isDepthTexture?q.type:null,Y=v(_.stencilBuffer,te),Ie=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ue=de(_);re(_)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ue,Y,_.width,_.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,ue,Y,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Y,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ie,n.RENDERBUFFER,T)}else{let q=_.textures;for(let te=0;te<q.length;te++){let Y=q[te],Ie=r.convert(Y.format,Y.colorSpace),ue=r.convert(Y.type),Ee=M(Y.internalFormat,Ie,ue,Y.colorSpace),Ce=de(_);O&&re(_)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ce,Ee,_.width,_.height):re(_)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ce,Ee,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,Ee,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Te(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let q=i.get(_.depthTexture);q.__renderTarget=_,(!q.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),X(_.depthTexture,0);let te=q.__webglTexture,Y=de(_);if(_.depthTexture.format===js)re(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,te,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,te,0);else if(_.depthTexture.format===pr)re(_)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,te,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,te,0);else throw new Error("Unknown depthTexture format")}function Ke(T){let _=i.get(T),O=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){let q=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),q){let te=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,q.removeEventListener("dispose",te)};q.addEventListener("dispose",te),_.__depthDisposeCallback=te}_.__boundDepthTexture=q}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let q=T.texture.mipmaps;q&&q.length>0?Te(_.__webglFramebuffer[0],T):Te(_.__webglFramebuffer,T)}else if(O){_.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[q]),_.__webglDepthbuffer[q]===void 0)_.__webglDepthbuffer[q]=n.createRenderbuffer(),Pe(_.__webglDepthbuffer[q],T,!1);else{let te=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer[q];n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,Y)}}else{let q=T.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Pe(_.__webglDepthbuffer,T,!1);else{let te=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,Y)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ut(T,_,O){let q=i.get(T);_!==void 0&&Se(q.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&Ke(T)}function R(T){let _=T.texture,O=i.get(T),q=i.get(_);T.addEventListener("dispose",I);let te=T.textures,Y=T.isWebGLCubeRenderTarget===!0,Ie=te.length>1;if(Ie||(q.__webglTexture===void 0&&(q.__webglTexture=n.createTexture()),q.__version=_.version,o.memory.textures++),Y){O.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[ue]=[];for(let Ee=0;Ee<_.mipmaps.length;Ee++)O.__webglFramebuffer[ue][Ee]=n.createFramebuffer()}else O.__webglFramebuffer[ue]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let ue=0;ue<_.mipmaps.length;ue++)O.__webglFramebuffer[ue]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(Ie)for(let ue=0,Ee=te.length;ue<Ee;ue++){let Ce=i.get(te[ue]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=n.createTexture(),o.memory.textures++)}if(T.samples>0&&re(T)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ue=0;ue<te.length;ue++){let Ee=te[ue];O.__webglColorRenderbuffer[ue]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[ue]);let Ce=r.convert(Ee.format,Ee.colorSpace),oe=r.convert(Ee.type),ye=M(Ee.internalFormat,Ce,oe,Ee.colorSpace,T.isXRRenderTarget===!0),ze=de(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,ze,ye,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,O.__webglColorRenderbuffer[ue])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),Pe(O.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Y){t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),Ne(n.TEXTURE_CUBE_MAP,_);for(let ue=0;ue<6;ue++)if(_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)Se(O.__webglFramebuffer[ue][Ee],T,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,Ee);else Se(O.__webglFramebuffer[ue],T,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);m(_)&&p(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ie){for(let ue=0,Ee=te.length;ue<Ee;ue++){let Ce=te[ue],oe=i.get(Ce),ye=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ye=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ye,oe.__webglTexture),Ne(ye,Ce),Se(O.__webglFramebuffer,T,Ce,n.COLOR_ATTACHMENT0+ue,ye,0),m(Ce)&&p(ye)}t.unbindTexture()}else{let ue=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ue=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ue,q.__webglTexture),Ne(ue,_),_.mipmaps&&_.mipmaps.length>0)for(let Ee=0;Ee<_.mipmaps.length;Ee++)Se(O.__webglFramebuffer[Ee],T,_,n.COLOR_ATTACHMENT0,ue,Ee);else Se(O.__webglFramebuffer,T,_,n.COLOR_ATTACHMENT0,ue,0);m(_)&&p(ue),t.unbindTexture()}T.depthBuffer&&Ke(T)}function ie(T){let _=T.textures;for(let O=0,q=_.length;O<q;O++){let te=_[O];if(m(te)){let Y=y(T),Ie=i.get(te).__webglTexture;t.bindTexture(Y,Ie),p(Y),t.unbindTexture()}}}let K=[],$=[];function J(T){if(T.samples>0){if(re(T)===!1){let _=T.textures,O=T.width,q=T.height,te=n.COLOR_BUFFER_BIT,Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ie=i.get(T),ue=_.length>1;if(ue)for(let Ce=0;Ce<_.length;Ce++)t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer);let Ee=T.texture.mipmaps;Ee&&Ee.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglFramebuffer);for(let Ce=0;Ce<_.length;Ce++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),ue){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ce]);let oe=i.get(_[Ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,oe,0)}n.blitFramebuffer(0,0,O,q,0,0,O,q,te,n.NEAREST),l===!0&&(K.length=0,$.length=0,K.push(n.COLOR_ATTACHMENT0+Ce),T.depthBuffer&&T.resolveDepthBuffer===!1&&(K.push(Y),$.push(Y),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,$)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,K))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ue)for(let Ce=0;Ce<_.length;Ce++){t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.RENDERBUFFER,Ie.__webglColorRenderbuffer[Ce]);let oe=i.get(_[Ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ie.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.TEXTURE_2D,oe,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ie.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){let _=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function de(T){return Math.min(s.maxSamples,T.samples)}function re(T){let _=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function pe(T){let _=o.render.frame;h.get(T)!==_&&(h.set(T,_),T.update())}function He(T,_){let O=T.colorSpace,q=T.format,te=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||O!==hs&&O!==Si&&(tt.getTransfer(O)===ft?(q!==vn||te!==qn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),_}function Ge(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=U,this.setTexture2D=X,this.setTexture2DArray=V,this.setTexture3D=Q,this.setTextureCube=k,this.rebindTextures=ut,this.setupRenderTarget=R,this.updateRenderTargetMipmap=ie,this.updateMultisampleRenderTarget=J,this.setupDepthRenderbuffer=Ke,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=re}function Iy(n,e){function t(i,s=Si){let r,o=tt.getTransfer(s);if(i===qn)return n.UNSIGNED_BYTE;if(i===ul)return n.UNSIGNED_SHORT_4_4_4_4;if(i===fl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Sh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===bh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===yh)return n.BYTE;if(i===Mh)return n.SHORT;if(i===ur)return n.UNSIGNED_SHORT;if(i===hl)return n.INT;if(i===qi)return n.UNSIGNED_INT;if(i===Un)return n.FLOAT;if(i===fr)return n.HALF_FLOAT;if(i===wh)return n.ALPHA;if(i===Th)return n.RGB;if(i===vn)return n.RGBA;if(i===js)return n.DEPTH_COMPONENT;if(i===pr)return n.DEPTH_STENCIL;if(i===dl)return n.RED;if(i===pl)return n.RED_INTEGER;if(i===Ah)return n.RG;if(i===ml)return n.RG_INTEGER;if(i===gl)return n.RGBA_INTEGER;if(i===Co||i===Ro||i===Io||i===Po)if(o===ft)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Co)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Co)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ro)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Io)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Po)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===xl||i===vl||i===_l||i===yl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===xl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===vl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===_l)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===yl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Ml||i===Sl||i===bl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Ml||i===Sl)return o===ft?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===bl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===wl||i===Tl||i===Al||i===El||i===Cl||i===Rl||i===Il||i===Pl||i===Dl||i===Ll||i===Ul||i===Nl||i===Fl||i===Ol)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===wl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Tl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Al)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===El)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Cl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Rl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Il)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Pl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Dl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ll)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ul)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Nl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Fl)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ol)return o===ft?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Bl||i===zl||i===kl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Bl)return o===ft?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===zl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===kl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Vl||i===Gl||i===Hl||i===Wl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Vl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Gl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Hl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Wl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===dr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var Py=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Jh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ao(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Xn({vertexShader:Py,fragmentShader:Dy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ht(new an(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},$h=class extends xi{constructor(e,t){super();let i=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null,x=typeof XRWebGLBinding<"u",m=new Jh,p={},y=t.getContextAttributes(),M=null,v=null,E=[],A=[],I=new fe,D=null,b=new Zt;b.viewport=new vt;let S=new Zt;S.viewport=new vt;let C=[b,S],U=new Qa,z=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=E[Z];return ee===void 0&&(ee=new sr,E[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=E[Z];return ee===void 0&&(ee=new sr,E[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=E[Z];return ee===void 0&&(ee=new sr,E[Z]=ee),ee.getHandSpace()};function X(Z){let ee=A.indexOf(Z.inputSource);if(ee===-1)return;let Se=E[ee];Se!==void 0&&(Se.update(Z.inputSource,Z.frame,c||o),Se.dispatchEvent({type:Z.type,data:Z.inputSource}))}function V(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",Q);for(let Z=0;Z<E.length;Z++){let ee=A[Z];ee!==null&&(A[Z]=null,E[Z].disconnect(ee))}z=null,H=null,m.reset();for(let Z in p)delete p[Z];e.setRenderTarget(M),d=null,f=null,u=null,s=null,v=null,Oe.stop(),i.isPresenting=!1,e.setPixelRatio(D),e.setSize(I.width,I.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(M=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",V),s.addEventListener("inputsourceschange",Q),y.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(I),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Pe=null,Te=null;y.depth&&(Te=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=y.stencil?pr:js,Pe=y.stencil?dr:qi);let Ke={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Ke),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new ei(f.textureWidth,f.textureHeight,{format:vn,type:qn,depthTexture:new oo(f.textureWidth,f.textureHeight,Pe,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let Se={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,Se),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new ei(d.framebufferWidth,d.framebufferHeight,{format:vn,type:qn,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Oe.setContext(s),Oe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Q(Z){for(let ee=0;ee<Z.removed.length;ee++){let Se=Z.removed[ee],Pe=A.indexOf(Se);Pe>=0&&(A[Pe]=null,E[Pe].disconnect(Se))}for(let ee=0;ee<Z.added.length;ee++){let Se=Z.added[ee],Pe=A.indexOf(Se);if(Pe===-1){for(let Ke=0;Ke<E.length;Ke++)if(Ke>=A.length){A.push(Se),Pe=Ke;break}else if(A[Ke]===null){A[Ke]=Se,Pe=Ke;break}if(Pe===-1)break}let Te=E[Pe];Te&&Te.connect(Se)}}let k=new P,se=new P;function ge(Z,ee,Se){k.setFromMatrixPosition(ee.matrixWorld),se.setFromMatrixPosition(Se.matrixWorld);let Pe=k.distanceTo(se),Te=ee.projectionMatrix.elements,Ke=Se.projectionMatrix.elements,ut=Te[14]/(Te[10]-1),R=Te[14]/(Te[10]+1),ie=(Te[9]+1)/Te[5],K=(Te[9]-1)/Te[5],$=(Te[8]-1)/Te[0],J=(Ke[8]+1)/Ke[0],de=ut*$,re=ut*J,pe=Pe/(-$+J),He=pe*-$;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(He),Z.translateZ(pe),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Te[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let Ge=ut+pe,T=R+pe,_=de-He,O=re+(Pe-He),q=ie*R/T*Ge,te=K*R/T*Ge;Z.projectionMatrix.makePerspective(_,O,q,te,Ge,T),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Me(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ee=Z.near,Se=Z.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(Se=m.depthFar)),U.near=S.near=b.near=ee,U.far=S.far=b.far=Se,(z!==U.near||H!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),z=U.near,H=U.far),U.layers.mask=Z.layers.mask|6,b.layers.mask=U.layers.mask&3,S.layers.mask=U.layers.mask&5;let Pe=Z.parent,Te=U.cameras;Me(U,Pe);for(let Ke=0;Ke<Te.length;Ke++)Me(Te[Ke],Pe);Te.length===2?ge(U,b,S):U.projectionMatrix.copy(b.projectionMatrix),Ne(Z,U,Pe)};function Ne(Z,ee,Se){Se===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(Se.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Qs*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(Z){l=Z,f!==null&&(f.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(Z){return p[Z]};let Ve=null;function Qe(Z,ee){if(h=ee.getViewerPose(c||o),g=ee,h!==null){let Se=h.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let Pe=!1;Se.length!==U.cameras.length&&(U.cameras.length=0,Pe=!0);for(let R=0;R<Se.length;R++){let ie=Se[R],K=null;if(d!==null)K=d.getViewport(ie);else{let J=u.getViewSubImage(f,ie);K=J.viewport,R===0&&(e.setRenderTargetTextures(v,J.colorTexture,J.depthStencilTexture),e.setRenderTarget(v))}let $=C[R];$===void 0&&($=new Zt,$.layers.enable(R),$.viewport=new vt,C[R]=$),$.matrix.fromArray(ie.transform.matrix),$.matrix.decompose($.position,$.quaternion,$.scale),$.projectionMatrix.fromArray(ie.projectionMatrix),$.projectionMatrixInverse.copy($.projectionMatrix).invert(),$.viewport.set(K.x,K.y,K.width,K.height),R===0&&(U.matrix.copy($.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),Pe===!0&&U.cameras.push($)}let Te=s.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){u=i.getBinding();let R=u.getDepthInformation(Se[0]);R&&R.isValid&&R.texture&&m.init(R,s.renderState)}if(Te&&Te.includes("camera-access")&&x){e.state.unbindTexture(),u=i.getBinding();for(let R=0;R<Se.length;R++){let ie=Se[R].camera;if(ie){let K=p[ie];K||(K=new ao,p[ie]=K);let $=u.getCameraImage(ie);K.sourceTexture=$}}}}for(let Se=0;Se<E.length;Se++){let Pe=A[Se],Te=E[Se];Pe!==null&&Te!==void 0&&Te.update(Pe,ee,c||o)}Ve&&Ve(Z,ee),ee.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ee}),g=null}let Oe=new Wd;Oe.setAnimationLoop(Qe),this.setAnimationLoop=function(Z){Ve=Z},this.dispose=function(){}}},_s=new Wn,Ly=new Ze;function Uy(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Dh(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,y,M,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,M):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Wt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Wt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let y=e.get(p),M=y.envMap,v=y.envMapRotation;M&&(m.envMap.value=M,_s.copy(v),_s.x*=-1,_s.y*=-1,_s.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(_s.y*=-1,_s.z*=-1),m.envMapRotation.value.setFromMatrix4(Ly.makeRotationFromEuler(_s)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=M*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Wt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Ny(n,e,t,i){let s={},r={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,M){let v=M.program;i.uniformBlockBinding(y,v)}function c(y,M){let v=s[y.id];v===void 0&&(g(y),v=h(y),s[y.id]=v,y.addEventListener("dispose",m));let E=M.program;i.updateUBOMapping(y,E);let A=e.render.frame;r[y.id]!==A&&(f(y),r[y.id]=A)}function h(y){let M=u();y.__bindingPointIndex=M;let v=n.createBuffer(),E=y.__size,A=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,v),n.bufferData(n.UNIFORM_BUFFER,E,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,v),v}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){let M=s[y.id],v=y.uniforms,E=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let A=0,I=v.length;A<I;A++){let D=Array.isArray(v[A])?v[A]:[v[A]];for(let b=0,S=D.length;b<S;b++){let C=D[b];if(d(C,A,b,E)===!0){let U=C.__offset,z=Array.isArray(C.value)?C.value:[C.value],H=0;for(let X=0;X<z.length;X++){let V=z[X],Q=x(V);typeof V=="number"||typeof V=="boolean"?(C.__data[0]=V,n.bufferSubData(n.UNIFORM_BUFFER,U+H,C.__data)):V.isMatrix3?(C.__data[0]=V.elements[0],C.__data[1]=V.elements[1],C.__data[2]=V.elements[2],C.__data[3]=0,C.__data[4]=V.elements[3],C.__data[5]=V.elements[4],C.__data[6]=V.elements[5],C.__data[7]=0,C.__data[8]=V.elements[6],C.__data[9]=V.elements[7],C.__data[10]=V.elements[8],C.__data[11]=0):(V.toArray(C.__data,H),H+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,U,C.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(y,M,v,E){let A=y.value,I=M+"_"+v;if(E[I]===void 0)return typeof A=="number"||typeof A=="boolean"?E[I]=A:E[I]=A.clone(),!0;{let D=E[I];if(typeof A=="number"||typeof A=="boolean"){if(D!==A)return E[I]=A,!0}else if(D.equals(A)===!1)return D.copy(A),!0}return!1}function g(y){let M=y.uniforms,v=0,E=16;for(let I=0,D=M.length;I<D;I++){let b=Array.isArray(M[I])?M[I]:[M[I]];for(let S=0,C=b.length;S<C;S++){let U=b[S],z=Array.isArray(U.value)?U.value:[U.value];for(let H=0,X=z.length;H<X;H++){let V=z[H],Q=x(V),k=v%E,se=k%Q.boundary,ge=k+se;v+=se,ge!==0&&E-ge<Q.storage&&(v+=E-ge),U.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=v,v+=Q.storage}}}let A=v%E;return A>0&&(v+=E-A),y.__size=v,y.__cache={},this}function x(y){let M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function m(y){let M=y.target;M.removeEventListener("dispose",m);let v=o.indexOf(M.__bindingPointIndex);o.splice(v,1),n.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function p(){for(let y in s)n.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var $l=class{constructor(e={}){let{canvas:t=fd(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=o;let g=new Uint32Array(4),x=new Int32Array(4),m=null,p=null,y=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,E=!1;this._outputColorSpace=Ut;let A=0,I=0,D=null,b=-1,S=null,C=new vt,U=new vt,z=null,H=new Le(0),X=0,V=t.width,Q=t.height,k=1,se=null,ge=null,Me=new vt(0,0,V,Q),Ne=new vt(0,0,V,Q),Ve=!1,Qe=new or,Oe=!1,Z=!1,ee=new Ze,Se=new P,Pe=new vt,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function ut(){return D===null?k:1}let R=i;function ie(w,N){return t.getContext(w,N)}try{let w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",we,!1),t.addEventListener("webglcontextcreationerror",ae,!1),R===null){let N="webgl2";if(R=ie(N,w),R===null)throw ie(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let K,$,J,de,re,pe,He,Ge,T,_,O,q,te,Y,Ie,ue,Ee,Ce,oe,ye,ze,De,ve,Ye;function L(){K=new Qv(R),K.init(),De=new Iy(R,K),$=new qv(R,K,e,De),J=new Cy(R,K),$.reversedDepthBuffer&&f&&J.buffers.depth.setReversed(!0),de=new n_(R),re=new my,pe=new Ry(R,K,J,re,$,De,de),He=new Zv(v),Ge=new jv(v),T=new l0(R),ve=new Wv(R,T),_=new e_(R,T,de,ve),O=new s_(R,_,T,de),oe=new i_(R,$,pe),ue=new Yv(re),q=new py(v,He,Ge,K,$,ve,ue),te=new Uy(v,re),Y=new xy,Ie=new by(K),Ce=new Hv(v,He,Ge,J,O,d,l),Ee=new Ay(v,O,$),Ye=new Ny(R,de,$,J),ye=new Xv(R,K,de),ze=new t_(R,K,de),de.programs=q.programs,v.capabilities=$,v.extensions=K,v.properties=re,v.renderLists=Y,v.shadowMap=Ee,v.state=J,v.info=de}L();let he=new $h(v,R);this.xr=he,this.getContext=function(){return R},this.getContextAttributes=function(){return R.getContextAttributes()},this.forceContextLoss=function(){let w=K.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=K.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(w){w!==void 0&&(k=w,this.setSize(V,Q,!1))},this.getSize=function(w){return w.set(V,Q)},this.setSize=function(w,N,G=!0){if(he.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=w,Q=N,t.width=Math.floor(w*k),t.height=Math.floor(N*k),G===!0&&(t.style.width=w+"px",t.style.height=N+"px"),this.setViewport(0,0,w,N)},this.getDrawingBufferSize=function(w){return w.set(V*k,Q*k).floor()},this.setDrawingBufferSize=function(w,N,G){V=w,Q=N,k=G,t.width=Math.floor(w*G),t.height=Math.floor(N*G),this.setViewport(0,0,w,N)},this.getCurrentViewport=function(w){return w.copy(C)},this.getViewport=function(w){return w.copy(Me)},this.setViewport=function(w,N,G,W){w.isVector4?Me.set(w.x,w.y,w.z,w.w):Me.set(w,N,G,W),J.viewport(C.copy(Me).multiplyScalar(k).round())},this.getScissor=function(w){return w.copy(Ne)},this.setScissor=function(w,N,G,W){w.isVector4?Ne.set(w.x,w.y,w.z,w.w):Ne.set(w,N,G,W),J.scissor(U.copy(Ne).multiplyScalar(k).round())},this.getScissorTest=function(){return Ve},this.setScissorTest=function(w){J.setScissorTest(Ve=w)},this.setOpaqueSort=function(w){se=w},this.setTransparentSort=function(w){ge=w},this.getClearColor=function(w){return w.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor(...arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha(...arguments)},this.clear=function(w=!0,N=!0,G=!0){let W=0;if(w){let F=!1;if(D!==null){let le=D.texture.format;F=le===gl||le===ml||le===pl}if(F){let le=D.texture.type,_e=le===qn||le===qi||le===ur||le===dr||le===ul||le===fl,Ae=Ce.getClearColor(),be=Ce.getClearAlpha(),Be=Ae.r,ke=Ae.g,Ue=Ae.b;_e?(g[0]=Be,g[1]=ke,g[2]=Ue,g[3]=be,R.clearBufferuiv(R.COLOR,0,g)):(x[0]=Be,x[1]=ke,x[2]=Ue,x[3]=be,R.clearBufferiv(R.COLOR,0,x))}else W|=R.COLOR_BUFFER_BIT}N&&(W|=R.DEPTH_BUFFER_BIT),G&&(W|=R.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),R.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",we,!1),t.removeEventListener("webglcontextcreationerror",ae,!1),Ce.dispose(),Y.dispose(),Ie.dispose(),re.dispose(),He.dispose(),Ge.dispose(),O.dispose(),ve.dispose(),Ye.dispose(),q.dispose(),he.dispose(),he.removeEventListener("sessionstart",jn),he.removeEventListener("sessionend",Ou),ts.stop()};function me(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function we(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;let w=de.autoReset,N=Ee.enabled,G=Ee.autoUpdate,W=Ee.needsUpdate,F=Ee.type;L(),de.autoReset=w,Ee.enabled=N,Ee.autoUpdate=G,Ee.needsUpdate=W,Ee.type=F}function ae(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function j(w){let N=w.target;N.removeEventListener("dispose",j),Re(N)}function Re(w){We(w),re.remove(w)}function We(w){let N=re.get(w).programs;N!==void 0&&(N.forEach(function(G){q.releaseProgram(G)}),w.isShaderMaterial&&q.releaseShaderCache(w))}this.renderBufferDirect=function(w,N,G,W,F,le){N===null&&(N=Te);let _e=F.isMesh&&F.matrixWorld.determinant()<0,Ae=Em(w,N,G,W,F);J.setMaterial(W,_e);let be=G.index,Be=1;if(W.wireframe===!0){if(be=_.getWireframeAttribute(G),be===void 0)return;Be=2}let ke=G.drawRange,Ue=G.attributes.position,et=ke.start*Be,dt=(ke.start+ke.count)*Be;le!==null&&(et=Math.max(et,le.start*Be),dt=Math.min(dt,(le.start+le.count)*Be)),be!==null?(et=Math.max(et,0),dt=Math.min(dt,be.count)):Ue!=null&&(et=Math.max(et,0),dt=Math.min(dt,Ue.count));let Ct=dt-et;if(Ct<0||Ct===1/0)return;ve.setup(F,W,Ae,G,be);let _t,mt=ye;if(be!==null&&(_t=T.get(be),mt=ze,mt.setIndex(_t)),F.isMesh)W.wireframe===!0?(J.setLineWidth(W.wireframeLinewidth*ut()),mt.setMode(R.LINES)):mt.setMode(R.TRIANGLES);else if(F.isLine){let Fe=W.linewidth;Fe===void 0&&(Fe=1),J.setLineWidth(Fe*ut()),F.isLineSegments?mt.setMode(R.LINES):F.isLineLoop?mt.setMode(R.LINE_LOOP):mt.setMode(R.LINE_STRIP)}else F.isPoints?mt.setMode(R.POINTS):F.isSprite&&mt.setMode(R.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)er("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),mt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(K.get("WEBGL_multi_draw"))mt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Fe=F._multiDrawStarts,wt=F._multiDrawCounts,st=F._multiDrawCount,hn=be?T.get(be).bytesPerElement:1,Ns=re.get(W).currentProgram.getUniforms();for(let un=0;un<st;un++)Ns.setValue(R,"_gl_DrawID",un),mt.render(Fe[un]/hn,wt[un])}else if(F.isInstancedMesh)mt.renderInstances(et,Ct,F.count);else if(G.isInstancedBufferGeometry){let Fe=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,wt=Math.min(G.instanceCount,Fe);mt.renderInstances(et,Ct,wt)}else mt.render(et,Ct)};function xt(w,N,G){w.transparent===!0&&w.side===rt&&w.forceSinglePass===!1?(w.side=Wt,w.needsUpdate=!0,ta(w,N,G),w.side=Gn,w.needsUpdate=!0,ta(w,N,G),w.side=rt):ta(w,N,G)}this.compile=function(w,N,G=null){G===null&&(G=w),p=Ie.get(G),p.init(N),M.push(p),G.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),w!==G&&w.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();let W=new Set;return w.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let le=F.material;if(le)if(Array.isArray(le))for(let _e=0;_e<le.length;_e++){let Ae=le[_e];xt(Ae,G,F),W.add(Ae)}else xt(le,G,F),W.add(le)}),p=M.pop(),W},this.compileAsync=function(w,N,G=null){let W=this.compile(w,N,G);return new Promise(F=>{function le(){if(W.forEach(function(_e){re.get(_e).currentProgram.isReady()&&W.delete(_e)}),W.size===0){F(w);return}setTimeout(le,10)}K.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let ct=null;function hi(w){ct&&ct(w)}function jn(){ts.stop()}function Ou(){ts.start()}let ts=new Wd;ts.setAnimationLoop(hi),typeof self<"u"&&ts.setContext(self),this.setAnimationLoop=function(w){ct=w,he.setAnimationLoop(w),w===null?ts.stop():ts.start()},he.addEventListener("sessionstart",jn),he.addEventListener("sessionend",Ou),this.render=function(w,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),he.enabled===!0&&he.isPresenting===!0&&(he.cameraAutoUpdate===!0&&he.updateCamera(N),N=he.getCamera()),w.isScene===!0&&w.onBeforeRender(v,w,N,D),p=Ie.get(w,M.length),p.init(N),M.push(p),ee.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Qe.setFromProjectionMatrix(ee,Vn,N.reversedDepth),Z=this.localClippingEnabled,Oe=ue.init(this.clippingPlanes,Z),m=Y.get(w,y.length),m.init(),y.push(m),he.enabled===!0&&he.isPresenting===!0){let le=v.xr.getDepthSensingMesh();le!==null&&Tc(le,N,-1/0,v.sortObjects)}Tc(w,N,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(se,ge),Ke=he.enabled===!1||he.isPresenting===!1||he.hasDepthSensing()===!1,Ke&&Ce.addToRenderList(m,w),this.info.render.frame++,Oe===!0&&ue.beginShadows();let G=p.state.shadowsArray;Ee.render(G,w,N),Oe===!0&&ue.endShadows(),this.info.autoReset===!0&&this.info.reset();let W=m.opaque,F=m.transmissive;if(p.setupLights(),N.isArrayCamera){let le=N.cameras;if(F.length>0)for(let _e=0,Ae=le.length;_e<Ae;_e++){let be=le[_e];zu(W,F,w,be)}Ke&&Ce.render(w);for(let _e=0,Ae=le.length;_e<Ae;_e++){let be=le[_e];Bu(m,w,be,be.viewport)}}else F.length>0&&zu(W,F,w,N),Ke&&Ce.render(w),Bu(m,w,N);D!==null&&I===0&&(pe.updateMultisampleRenderTarget(D),pe.updateRenderTargetMipmap(D)),w.isScene===!0&&w.onAfterRender(v,w,N),ve.resetDefaultState(),b=-1,S=null,M.pop(),M.length>0?(p=M[M.length-1],Oe===!0&&ue.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function Tc(w,N,G,W){if(w.visible===!1)return;if(w.layers.test(N.layers)){if(w.isGroup)G=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(N);else if(w.isLight)p.pushLight(w),w.castShadow&&p.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||Qe.intersectsSprite(w)){W&&Pe.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ee);let _e=O.update(w),Ae=w.material;Ae.visible&&m.push(w,_e,Ae,G,Pe.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||Qe.intersectsObject(w))){let _e=O.update(w),Ae=w.material;if(W&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Pe.copy(w.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Pe.copy(_e.boundingSphere.center)),Pe.applyMatrix4(w.matrixWorld).applyMatrix4(ee)),Array.isArray(Ae)){let be=_e.groups;for(let Be=0,ke=be.length;Be<ke;Be++){let Ue=be[Be],et=Ae[Ue.materialIndex];et&&et.visible&&m.push(w,_e,et,G,Pe.z,Ue)}}else Ae.visible&&m.push(w,_e,Ae,G,Pe.z,null)}}let le=w.children;for(let _e=0,Ae=le.length;_e<Ae;_e++)Tc(le[_e],N,G,W)}function Bu(w,N,G,W){let F=w.opaque,le=w.transmissive,_e=w.transparent;p.setupLightsView(G),Oe===!0&&ue.setGlobalState(v.clippingPlanes,G),W&&J.viewport(C.copy(W)),F.length>0&&ea(F,N,G),le.length>0&&ea(le,N,G),_e.length>0&&ea(_e,N,G),J.buffers.depth.setTest(!0),J.buffers.depth.setMask(!0),J.buffers.color.setMask(!0),J.setPolygonOffset(!1)}function zu(w,N,G,W){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[W.id]===void 0&&(p.state.transmissionRenderTarget[W.id]=new ei(1,1,{generateMipmaps:!0,type:K.has("EXT_color_buffer_half_float")||K.has("EXT_color_buffer_float")?fr:qn,minFilter:Xi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:tt.workingColorSpace}));let le=p.state.transmissionRenderTarget[W.id],_e=W.viewport||C;le.setSize(_e.z*v.transmissionResolutionScale,_e.w*v.transmissionResolutionScale);let Ae=v.getRenderTarget(),be=v.getActiveCubeFace(),Be=v.getActiveMipmapLevel();v.setRenderTarget(le),v.getClearColor(H),X=v.getClearAlpha(),X<1&&v.setClearColor(16777215,.5),v.clear(),Ke&&Ce.render(G);let ke=v.toneMapping;v.toneMapping=Mi;let Ue=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),p.setupLightsView(W),Oe===!0&&ue.setGlobalState(v.clippingPlanes,W),ea(w,G,W),pe.updateMultisampleRenderTarget(le),pe.updateRenderTargetMipmap(le),K.has("WEBGL_multisampled_render_to_texture")===!1){let et=!1;for(let dt=0,Ct=N.length;dt<Ct;dt++){let _t=N[dt],mt=_t.object,Fe=_t.geometry,wt=_t.material,st=_t.group;if(wt.side===rt&&mt.layers.test(W.layers)){let hn=wt.side;wt.side=Wt,wt.needsUpdate=!0,ku(mt,G,W,Fe,wt,st),wt.side=hn,wt.needsUpdate=!0,et=!0}}et===!0&&(pe.updateMultisampleRenderTarget(le),pe.updateRenderTargetMipmap(le))}v.setRenderTarget(Ae,be,Be),v.setClearColor(H,X),Ue!==void 0&&(W.viewport=Ue),v.toneMapping=ke}function ea(w,N,G){let W=N.isScene===!0?N.overrideMaterial:null;for(let F=0,le=w.length;F<le;F++){let _e=w[F],Ae=_e.object,be=_e.geometry,Be=_e.group,ke=_e.material;ke.allowOverride===!0&&W!==null&&(ke=W),Ae.layers.test(G.layers)&&ku(Ae,N,G,be,ke,Be)}}function ku(w,N,G,W,F,le){w.onBeforeRender(v,N,G,W,F,le),w.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),F.onBeforeRender(v,N,G,W,w,le),F.transparent===!0&&F.side===rt&&F.forceSinglePass===!1?(F.side=Wt,F.needsUpdate=!0,v.renderBufferDirect(G,N,W,F,w,le),F.side=Gn,F.needsUpdate=!0,v.renderBufferDirect(G,N,W,F,w,le),F.side=rt):v.renderBufferDirect(G,N,W,F,w,le),w.onAfterRender(v,N,G,W,F,le)}function ta(w,N,G){N.isScene!==!0&&(N=Te);let W=re.get(w),F=p.state.lights,le=p.state.shadowsArray,_e=F.state.version,Ae=q.getParameters(w,F.state,le,N,G),be=q.getProgramCacheKey(Ae),Be=W.programs;W.environment=w.isMeshStandardMaterial?N.environment:null,W.fog=N.fog,W.envMap=(w.isMeshStandardMaterial?Ge:He).get(w.envMap||W.environment),W.envMapRotation=W.environment!==null&&w.envMap===null?N.environmentRotation:w.envMapRotation,Be===void 0&&(w.addEventListener("dispose",j),Be=new Map,W.programs=Be);let ke=Be.get(be);if(ke!==void 0){if(W.currentProgram===ke&&W.lightsStateVersion===_e)return Gu(w,Ae),ke}else Ae.uniforms=q.getUniforms(w),w.onBeforeCompile(Ae,v),ke=q.acquireProgram(Ae,be),Be.set(be,ke),W.uniforms=Ae.uniforms;let Ue=W.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ue.clippingPlanes=ue.uniform),Gu(w,Ae),W.needsLights=Rm(w),W.lightsStateVersion=_e,W.needsLights&&(Ue.ambientLightColor.value=F.state.ambient,Ue.lightProbe.value=F.state.probe,Ue.directionalLights.value=F.state.directional,Ue.directionalLightShadows.value=F.state.directionalShadow,Ue.spotLights.value=F.state.spot,Ue.spotLightShadows.value=F.state.spotShadow,Ue.rectAreaLights.value=F.state.rectArea,Ue.ltc_1.value=F.state.rectAreaLTC1,Ue.ltc_2.value=F.state.rectAreaLTC2,Ue.pointLights.value=F.state.point,Ue.pointLightShadows.value=F.state.pointShadow,Ue.hemisphereLights.value=F.state.hemi,Ue.directionalShadowMap.value=F.state.directionalShadowMap,Ue.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ue.spotShadowMap.value=F.state.spotShadowMap,Ue.spotLightMatrix.value=F.state.spotLightMatrix,Ue.spotLightMap.value=F.state.spotLightMap,Ue.pointShadowMap.value=F.state.pointShadowMap,Ue.pointShadowMatrix.value=F.state.pointShadowMatrix),W.currentProgram=ke,W.uniformsList=null,ke}function Vu(w){if(w.uniformsList===null){let N=w.currentProgram.getUniforms();w.uniformsList=xr.seqWithValue(N.seq,w.uniforms)}return w.uniformsList}function Gu(w,N){let G=re.get(w);G.outputColorSpace=N.outputColorSpace,G.batching=N.batching,G.batchingColor=N.batchingColor,G.instancing=N.instancing,G.instancingColor=N.instancingColor,G.instancingMorph=N.instancingMorph,G.skinning=N.skinning,G.morphTargets=N.morphTargets,G.morphNormals=N.morphNormals,G.morphColors=N.morphColors,G.morphTargetsCount=N.morphTargetsCount,G.numClippingPlanes=N.numClippingPlanes,G.numIntersection=N.numClipIntersection,G.vertexAlphas=N.vertexAlphas,G.vertexTangents=N.vertexTangents,G.toneMapping=N.toneMapping}function Em(w,N,G,W,F){N.isScene!==!0&&(N=Te),pe.resetTextureUnits();let le=N.fog,_e=W.isMeshStandardMaterial?N.environment:null,Ae=D===null?v.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:hs,be=(W.isMeshStandardMaterial?Ge:He).get(W.envMap||_e),Be=W.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,ke=!!G.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ue=!!G.morphAttributes.position,et=!!G.morphAttributes.normal,dt=!!G.morphAttributes.color,Ct=Mi;W.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(Ct=v.toneMapping);let _t=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,mt=_t!==void 0?_t.length:0,Fe=re.get(W),wt=p.state.lights;if(Oe===!0&&(Z===!0||w!==S)){let Qt=w===S&&W.id===b;ue.setState(W,w,Qt)}let st=!1;W.version===Fe.__version?(Fe.needsLights&&Fe.lightsStateVersion!==wt.state.version||Fe.outputColorSpace!==Ae||F.isBatchedMesh&&Fe.batching===!1||!F.isBatchedMesh&&Fe.batching===!0||F.isBatchedMesh&&Fe.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Fe.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Fe.instancing===!1||!F.isInstancedMesh&&Fe.instancing===!0||F.isSkinnedMesh&&Fe.skinning===!1||!F.isSkinnedMesh&&Fe.skinning===!0||F.isInstancedMesh&&Fe.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Fe.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Fe.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Fe.instancingMorph===!1&&F.morphTexture!==null||Fe.envMap!==be||W.fog===!0&&Fe.fog!==le||Fe.numClippingPlanes!==void 0&&(Fe.numClippingPlanes!==ue.numPlanes||Fe.numIntersection!==ue.numIntersection)||Fe.vertexAlphas!==Be||Fe.vertexTangents!==ke||Fe.morphTargets!==Ue||Fe.morphNormals!==et||Fe.morphColors!==dt||Fe.toneMapping!==Ct||Fe.morphTargetsCount!==mt)&&(st=!0):(st=!0,Fe.__version=W.version);let hn=Fe.currentProgram;st===!0&&(hn=ta(W,N,F));let Ns=!1,un=!1,Nr=!1,Tt=hn.getUniforms(),Rn=Fe.uniforms;if(J.useProgram(hn.program)&&(Ns=!0,un=!0,Nr=!0),W.id!==b&&(b=W.id,un=!0),Ns||S!==w){J.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Tt.setValue(R,"projectionMatrix",w.projectionMatrix),Tt.setValue(R,"viewMatrix",w.matrixWorldInverse);let rn=Tt.map.cameraPosition;rn!==void 0&&rn.setValue(R,Se.setFromMatrixPosition(w.matrixWorld)),$.logarithmicDepthBuffer&&Tt.setValue(R,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&Tt.setValue(R,"isOrthographic",w.isOrthographicCamera===!0),S!==w&&(S=w,un=!0,Nr=!0)}if(F.isSkinnedMesh){Tt.setOptional(R,F,"bindMatrix"),Tt.setOptional(R,F,"bindMatrixInverse");let Qt=F.skeleton;Qt&&(Qt.boneTexture===null&&Qt.computeBoneTexture(),Tt.setValue(R,"boneTexture",Qt.boneTexture,pe))}F.isBatchedMesh&&(Tt.setOptional(R,F,"batchingTexture"),Tt.setValue(R,"batchingTexture",F._matricesTexture,pe),Tt.setOptional(R,F,"batchingIdTexture"),Tt.setValue(R,"batchingIdTexture",F._indirectTexture,pe),Tt.setOptional(R,F,"batchingColorTexture"),F._colorsTexture!==null&&Tt.setValue(R,"batchingColorTexture",F._colorsTexture,pe));let In=G.morphAttributes;if((In.position!==void 0||In.normal!==void 0||In.color!==void 0)&&oe.update(F,G,hn),(un||Fe.receiveShadow!==F.receiveShadow)&&(Fe.receiveShadow=F.receiveShadow,Tt.setValue(R,"receiveShadow",F.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(Rn.envMap.value=be,Rn.flipEnvMap.value=be.isCubeTexture&&be.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&N.environment!==null&&(Rn.envMapIntensity.value=N.environmentIntensity),un&&(Tt.setValue(R,"toneMappingExposure",v.toneMappingExposure),Fe.needsLights&&Cm(Rn,Nr),le&&W.fog===!0&&te.refreshFogUniforms(Rn,le),te.refreshMaterialUniforms(Rn,W,k,Q,p.state.transmissionRenderTarget[w.id]),xr.upload(R,Vu(Fe),Rn,pe)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(xr.upload(R,Vu(Fe),Rn,pe),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&Tt.setValue(R,"center",F.center),Tt.setValue(R,"modelViewMatrix",F.modelViewMatrix),Tt.setValue(R,"normalMatrix",F.normalMatrix),Tt.setValue(R,"modelMatrix",F.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){let Qt=W.uniformsGroups;for(let rn=0,Ac=Qt.length;rn<Ac;rn++){let ns=Qt[rn];Ye.update(ns,hn),Ye.bind(ns,hn)}}return hn}function Cm(w,N){w.ambientLightColor.needsUpdate=N,w.lightProbe.needsUpdate=N,w.directionalLights.needsUpdate=N,w.directionalLightShadows.needsUpdate=N,w.pointLights.needsUpdate=N,w.pointLightShadows.needsUpdate=N,w.spotLights.needsUpdate=N,w.spotLightShadows.needsUpdate=N,w.rectAreaLights.needsUpdate=N,w.hemisphereLights.needsUpdate=N}function Rm(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(w,N,G){let W=re.get(w);W.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),re.get(w.texture).__webglTexture=N,re.get(w.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:G,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,N){let G=re.get(w);G.__webglFramebuffer=N,G.__useDefaultFramebuffer=N===void 0};let Im=R.createFramebuffer();this.setRenderTarget=function(w,N=0,G=0){D=w,A=N,I=G;let W=!0,F=null,le=!1,_e=!1;if(w){let be=re.get(w);if(be.__useDefaultFramebuffer!==void 0)J.bindFramebuffer(R.FRAMEBUFFER,null),W=!1;else if(be.__webglFramebuffer===void 0)pe.setupRenderTarget(w);else if(be.__hasExternalTextures)pe.rebindTextures(w,re.get(w.texture).__webglTexture,re.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let Ue=w.depthTexture;if(be.__boundDepthTexture!==Ue){if(Ue!==null&&re.has(Ue)&&(w.width!==Ue.image.width||w.height!==Ue.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");pe.setupDepthRenderbuffer(w)}}let Be=w.texture;(Be.isData3DTexture||Be.isDataArrayTexture||Be.isCompressedArrayTexture)&&(_e=!0);let ke=re.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(ke[N])?F=ke[N][G]:F=ke[N],le=!0):w.samples>0&&pe.useMultisampledRTT(w)===!1?F=re.get(w).__webglMultisampledFramebuffer:Array.isArray(ke)?F=ke[G]:F=ke,C.copy(w.viewport),U.copy(w.scissor),z=w.scissorTest}else C.copy(Me).multiplyScalar(k).floor(),U.copy(Ne).multiplyScalar(k).floor(),z=Ve;if(G!==0&&(F=Im),J.bindFramebuffer(R.FRAMEBUFFER,F)&&W&&J.drawBuffers(w,F),J.viewport(C),J.scissor(U),J.setScissorTest(z),le){let be=re.get(w.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_CUBE_MAP_POSITIVE_X+N,be.__webglTexture,G)}else if(_e){let be=N;for(let Be=0;Be<w.textures.length;Be++){let ke=re.get(w.textures[Be]);R.framebufferTextureLayer(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0+Be,ke.__webglTexture,G,be)}}else if(w!==null&&G!==0){let be=re.get(w.texture);R.framebufferTexture2D(R.FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,be.__webglTexture,G)}b=-1},this.readRenderTargetPixels=function(w,N,G,W,F,le,_e,Ae=0){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=re.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&_e!==void 0&&(be=be[_e]),be){J.bindFramebuffer(R.FRAMEBUFFER,be);try{let Be=w.textures[Ae],ke=Be.format,Ue=Be.type;if(!$.textureFormatReadable(ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!$.textureTypeReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=w.width-W&&G>=0&&G<=w.height-F&&(w.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+Ae),R.readPixels(N,G,W,F,De.convert(ke),De.convert(Ue),le))}finally{let Be=D!==null?re.get(D).__webglFramebuffer:null;J.bindFramebuffer(R.FRAMEBUFFER,Be)}}},this.readRenderTargetPixelsAsync=async function(w,N,G,W,F,le,_e,Ae=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=re.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&_e!==void 0&&(be=be[_e]),be)if(N>=0&&N<=w.width-W&&G>=0&&G<=w.height-F){J.bindFramebuffer(R.FRAMEBUFFER,be);let Be=w.textures[Ae],ke=Be.format,Ue=Be.type;if(!$.textureFormatReadable(ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!$.textureTypeReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let et=R.createBuffer();R.bindBuffer(R.PIXEL_PACK_BUFFER,et),R.bufferData(R.PIXEL_PACK_BUFFER,le.byteLength,R.STREAM_READ),w.textures.length>1&&R.readBuffer(R.COLOR_ATTACHMENT0+Ae),R.readPixels(N,G,W,F,De.convert(ke),De.convert(Ue),0);let dt=D!==null?re.get(D).__webglFramebuffer:null;J.bindFramebuffer(R.FRAMEBUFFER,dt);let Ct=R.fenceSync(R.SYNC_GPU_COMMANDS_COMPLETE,0);return R.flush(),await dd(R,Ct,4),R.bindBuffer(R.PIXEL_PACK_BUFFER,et),R.getBufferSubData(R.PIXEL_PACK_BUFFER,0,le),R.deleteBuffer(et),R.deleteSync(Ct),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,N=null,G=0){let W=Math.pow(2,-G),F=Math.floor(w.image.width*W),le=Math.floor(w.image.height*W),_e=N!==null?N.x:0,Ae=N!==null?N.y:0;pe.setTexture2D(w,0),R.copyTexSubImage2D(R.TEXTURE_2D,G,0,0,_e,Ae,F,le),J.unbindTexture()};let Pm=R.createFramebuffer(),Dm=R.createFramebuffer();this.copyTextureToTexture=function(w,N,G=null,W=null,F=0,le=null){le===null&&(F!==0?(er("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),le=F,F=0):le=0);let _e,Ae,be,Be,ke,Ue,et,dt,Ct,_t=w.isCompressedTexture?w.mipmaps[le]:w.image;if(G!==null)_e=G.max.x-G.min.x,Ae=G.max.y-G.min.y,be=G.isBox3?G.max.z-G.min.z:1,Be=G.min.x,ke=G.min.y,Ue=G.isBox3?G.min.z:0;else{let In=Math.pow(2,-F);_e=Math.floor(_t.width*In),Ae=Math.floor(_t.height*In),w.isDataArrayTexture?be=_t.depth:w.isData3DTexture?be=Math.floor(_t.depth*In):be=1,Be=0,ke=0,Ue=0}W!==null?(et=W.x,dt=W.y,Ct=W.z):(et=0,dt=0,Ct=0);let mt=De.convert(N.format),Fe=De.convert(N.type),wt;N.isData3DTexture?(pe.setTexture3D(N,0),wt=R.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(pe.setTexture2DArray(N,0),wt=R.TEXTURE_2D_ARRAY):(pe.setTexture2D(N,0),wt=R.TEXTURE_2D),R.pixelStorei(R.UNPACK_FLIP_Y_WEBGL,N.flipY),R.pixelStorei(R.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),R.pixelStorei(R.UNPACK_ALIGNMENT,N.unpackAlignment);let st=R.getParameter(R.UNPACK_ROW_LENGTH),hn=R.getParameter(R.UNPACK_IMAGE_HEIGHT),Ns=R.getParameter(R.UNPACK_SKIP_PIXELS),un=R.getParameter(R.UNPACK_SKIP_ROWS),Nr=R.getParameter(R.UNPACK_SKIP_IMAGES);R.pixelStorei(R.UNPACK_ROW_LENGTH,_t.width),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,_t.height),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Be),R.pixelStorei(R.UNPACK_SKIP_ROWS,ke),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Ue);let Tt=w.isDataArrayTexture||w.isData3DTexture,Rn=N.isDataArrayTexture||N.isData3DTexture;if(w.isDepthTexture){let In=re.get(w),Qt=re.get(N),rn=re.get(In.__renderTarget),Ac=re.get(Qt.__renderTarget);J.bindFramebuffer(R.READ_FRAMEBUFFER,rn.__webglFramebuffer),J.bindFramebuffer(R.DRAW_FRAMEBUFFER,Ac.__webglFramebuffer);for(let ns=0;ns<be;ns++)Tt&&(R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,re.get(w).__webglTexture,F,Ue+ns),R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,re.get(N).__webglTexture,le,Ct+ns)),R.blitFramebuffer(Be,ke,_e,Ae,et,dt,_e,Ae,R.DEPTH_BUFFER_BIT,R.NEAREST);J.bindFramebuffer(R.READ_FRAMEBUFFER,null),J.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else if(F!==0||w.isRenderTargetTexture||re.has(w)){let In=re.get(w),Qt=re.get(N);J.bindFramebuffer(R.READ_FRAMEBUFFER,Pm),J.bindFramebuffer(R.DRAW_FRAMEBUFFER,Dm);for(let rn=0;rn<be;rn++)Tt?R.framebufferTextureLayer(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,In.__webglTexture,F,Ue+rn):R.framebufferTexture2D(R.READ_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,In.__webglTexture,F),Rn?R.framebufferTextureLayer(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,Qt.__webglTexture,le,Ct+rn):R.framebufferTexture2D(R.DRAW_FRAMEBUFFER,R.COLOR_ATTACHMENT0,R.TEXTURE_2D,Qt.__webglTexture,le),F!==0?R.blitFramebuffer(Be,ke,_e,Ae,et,dt,_e,Ae,R.COLOR_BUFFER_BIT,R.NEAREST):Rn?R.copyTexSubImage3D(wt,le,et,dt,Ct+rn,Be,ke,_e,Ae):R.copyTexSubImage2D(wt,le,et,dt,Be,ke,_e,Ae);J.bindFramebuffer(R.READ_FRAMEBUFFER,null),J.bindFramebuffer(R.DRAW_FRAMEBUFFER,null)}else Rn?w.isDataTexture||w.isData3DTexture?R.texSubImage3D(wt,le,et,dt,Ct,_e,Ae,be,mt,Fe,_t.data):N.isCompressedArrayTexture?R.compressedTexSubImage3D(wt,le,et,dt,Ct,_e,Ae,be,mt,_t.data):R.texSubImage3D(wt,le,et,dt,Ct,_e,Ae,be,mt,Fe,_t):w.isDataTexture?R.texSubImage2D(R.TEXTURE_2D,le,et,dt,_e,Ae,mt,Fe,_t.data):w.isCompressedTexture?R.compressedTexSubImage2D(R.TEXTURE_2D,le,et,dt,_t.width,_t.height,mt,_t.data):R.texSubImage2D(R.TEXTURE_2D,le,et,dt,_e,Ae,mt,Fe,_t);R.pixelStorei(R.UNPACK_ROW_LENGTH,st),R.pixelStorei(R.UNPACK_IMAGE_HEIGHT,hn),R.pixelStorei(R.UNPACK_SKIP_PIXELS,Ns),R.pixelStorei(R.UNPACK_SKIP_ROWS,un),R.pixelStorei(R.UNPACK_SKIP_IMAGES,Nr),le===0&&N.generateMipmaps&&R.generateMipmap(wt),J.unbindTexture()},this.initRenderTarget=function(w){re.get(w).__webglFramebuffer===void 0&&pe.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?pe.setTextureCube(w,0):w.isData3DTexture?pe.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?pe.setTexture2DArray(w,0):pe.setTexture2D(w,0),J.unbindTexture()},this.resetState=function(){A=0,I=0,D=null,J.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Vn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};function $d(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new pt,c=0;for(let h=0;h<n.length;++h){let u=n[h],f=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let d in u.attributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let d in u.morphAttributes){if(!s.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(u.morphAttributes[d])}if(e){let d;if(t)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(t){let h=0,u=[];for(let f=0;f<n.length;++f){let d=n[f].index;for(let g=0;g<d.count;++g)u.push(d.getX(g)+h);h+=n[f].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Jd(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){let d=[];for(let x=0;x<o[h].length;++x)d.push(o[h][x][f]);let g=Jd(d);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Jd(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){let h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let o=new e(r),a=new kt(o,t,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let f=0,d=h.count;f<d;f++)for(let g=0;g<t;g++){let x=h.getComponent(f,g);a.setComponent(f+u,g,x)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/var _n=Uint8Array,_r=Uint16Array,Oy=Int32Array,Kd=new _n([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),jd=new _n([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),By=new _n([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Qd=function(n,e){for(var t=new _r(31),i=0;i<31;++i)t[i]=e+=1<<n[i-1];for(var s=new Oy(t[30]),i=1;i<30;++i)for(var r=t[i];r<t[i+1];++r)s[r]=r-t[i]<<5|i;return{b:t,r:s}},ep=Qd(Kd,2),tp=ep.b,zy=ep.r;tp[28]=258,zy[258]=28;var np=Qd(jd,0),ky=np.b,bw=np.r,tu=new _r(32768);for(at=0;at<32768;++at)bi=(at&43690)>>1|(at&21845)<<1,bi=(bi&52428)>>2|(bi&13107)<<2,bi=(bi&61680)>>4|(bi&3855)<<4,tu[at]=((bi&65280)>>8|(bi&255)<<8)>>1;var bi,at,Uo=(function(n,e,t){for(var i=n.length,s=0,r=new _r(e);s<i;++s)n[s]&&++r[n[s]-1];var o=new _r(e);for(s=1;s<e;++s)o[s]=o[s-1]+r[s-1]<<1;var a;if(t){a=new _r(1<<e);var l=15-e;for(s=0;s<i;++s)if(n[s])for(var c=s<<4|n[s],h=e-n[s],u=o[n[s]-1]++<<h,f=u|(1<<h)-1;u<=f;++u)a[tu[u]>>l]=c}else for(a=new _r(i),s=0;s<i;++s)n[s]&&(a[s]=tu[o[n[s]-1]++]>>15-n[s]);return a}),No=new _n(288);for(at=0;at<144;++at)No[at]=8;var at;for(at=144;at<256;++at)No[at]=9;var at;for(at=256;at<280;++at)No[at]=7;var at;for(at=280;at<288;++at)No[at]=8;var at,ip=new _n(32);for(at=0;at<32;++at)ip[at]=5;var at;var Vy=Uo(No,9,1);var Gy=Uo(ip,5,1),jh=function(n){for(var e=n[0],t=1;t<n.length;++t)n[t]>e&&(e=n[t]);return e},Yn=function(n,e,t){var i=e/8|0;return(n[i]|n[i+1]<<8)>>(e&7)&t},Qh=function(n,e){var t=e/8|0;return(n[t]|n[t+1]<<8|n[t+2]<<16)>>(e&7)},Hy=function(n){return(n+7)/8|0},iu=function(n,e,t){return(e==null||e<0)&&(e=0),(t==null||t>n.length)&&(t=n.length),new _n(n.subarray(e,t))};var Wy=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Nn=function(n,e,t){var i=new Error(e||Wy[n]);if(i.code=n,Error.captureStackTrace&&Error.captureStackTrace(i,Nn),!t)throw i;return i},Xy=function(n,e,t,i){var s=n.length,r=i?i.length:0;if(!s||e.f&&!e.l)return t||new _n(0);var o=!t,a=o||e.i!=2,l=e.i;o&&(t=new _n(s*3));var c=function(Ke){var ut=t.length;if(Ke>ut){var R=new _n(Math.max(ut*2,Ke));R.set(t),t=R}},h=e.f||0,u=e.p||0,f=e.b||0,d=e.l,g=e.d,x=e.m,m=e.n,p=s*8;do{if(!d){h=Yn(n,u,1);var y=Yn(n,u+1,3);if(u+=3,y)if(y==1)d=Vy,g=Gy,x=9,m=5;else if(y==2){var A=Yn(n,u,31)+257,I=Yn(n,u+10,15)+4,D=A+Yn(n,u+5,31)+1;u+=14;for(var b=new _n(D),S=new _n(19),C=0;C<I;++C)S[By[C]]=Yn(n,u+C*3,7);u+=I*3;for(var U=jh(S),z=(1<<U)-1,H=Uo(S,U,1),C=0;C<D;){var X=H[Yn(n,u,z)];u+=X&15;var M=X>>4;if(M<16)b[C++]=M;else{var V=0,Q=0;for(M==16?(Q=3+Yn(n,u,3),u+=2,V=b[C-1]):M==17?(Q=3+Yn(n,u,7),u+=3):M==18&&(Q=11+Yn(n,u,127),u+=7);Q--;)b[C++]=V}}var k=b.subarray(0,A),se=b.subarray(A);x=jh(k),m=jh(se),d=Uo(k,x,1),g=Uo(se,m,1)}else Nn(1);else{var M=Hy(u)+4,v=n[M-4]|n[M-3]<<8,E=M+v;if(E>s){l&&Nn(0);break}a&&c(f+v),t.set(n.subarray(M,E),f),e.b=f+=v,e.p=u=E*8,e.f=h;continue}if(u>p){l&&Nn(0);break}}a&&c(f+131072);for(var ge=(1<<x)-1,Me=(1<<m)-1,Ne=u;;Ne=u){var V=d[Qh(n,u)&ge],Ve=V>>4;if(u+=V&15,u>p){l&&Nn(0);break}if(V||Nn(2),Ve<256)t[f++]=Ve;else if(Ve==256){Ne=u,d=null;break}else{var Qe=Ve-254;if(Ve>264){var C=Ve-257,Oe=Kd[C];Qe=Yn(n,u,(1<<Oe)-1)+tp[C],u+=Oe}var Z=g[Qh(n,u)&Me],ee=Z>>4;Z||Nn(3),u+=Z&15;var se=ky[ee];if(ee>3){var Oe=jd[ee];se+=Qh(n,u)&(1<<Oe)-1,u+=Oe}if(u>p){l&&Nn(0);break}a&&c(f+131072);var Se=f+Qe;if(f<se){var Pe=r-se,Te=Math.min(se,Se);for(Pe+f<0&&Nn(3);f<Te;++f)t[f]=i[Pe+f]}for(;f<Se;++f)t[f]=t[f-se]}}e.l=d,e.p=Ne,e.b=f,e.f=h,d&&(h=1,e.m=x,e.d=g,e.n=m)}while(!h);return f!=t.length&&o?iu(t,0,f):t.subarray(0,f)};var qy=new _n(0);var ri=function(n,e){return n[e]|n[e+1]<<8},Zn=function(n,e){return(n[e]|n[e+1]<<8|n[e+2]<<16|n[e+3]<<24)>>>0},eu=function(n,e){return Zn(n,e)+Zn(n,e+4)*4294967296};function Yy(n,e){return Xy(n,{i:2},e&&e.out,e&&e.dictionary)}var nu=typeof TextDecoder<"u"&&new TextDecoder,Zy=0;try{nu.decode(qy,{stream:!0}),Zy=1}catch{}var Jy=function(n){for(var e="",t=0;;){var i=n[t++],s=(i>127)+(i>223)+(i>239);if(t+s>n.length)return{s:e,r:iu(n,t-1)};s?s==3?(i=((i&15)<<18|(n[t++]&63)<<12|(n[t++]&63)<<6|n[t++]&63)-65536,e+=String.fromCharCode(55296|i>>10,56320|i&1023)):s&1?e+=String.fromCharCode((i&31)<<6|n[t++]&63):e+=String.fromCharCode((i&15)<<12|(n[t++]&63)<<6|n[t++]&63):e+=String.fromCharCode(i)}};function jl(n,e){if(e){for(var t="",i=0;i<n.length;i+=16384)t+=String.fromCharCode.apply(null,n.subarray(i,i+16384));return t}else{if(nu)return nu.decode(n);var s=Jy(n),r=s.s,t=s.r;return t.length&&Nn(8),r}}var $y=function(n,e){return e+30+ri(n,e+26)+ri(n,e+28)},Ky=function(n,e,t){var i=ri(n,e+28),s=jl(n.subarray(e+46,e+46+i),!(ri(n,e+8)&2048)),r=e+46+i,o=Zn(n,e+20),a=t&&o==4294967295?jy(n,r):[o,Zn(n,e+24),Zn(n,e+42)],l=a[0],c=a[1],h=a[2];return[ri(n,e+10),l,c,s,r+ri(n,e+30)+ri(n,e+32),h]},jy=function(n,e){for(;ri(n,e)!=1;e+=4+ri(n,e+2));return[eu(n,e+12),eu(n,e+4),eu(n,e+20)]};function sp(n,e){for(var t={},i=n.length-22;Zn(n,i)!=101010256;--i)(!i||n.length-i>65558)&&Nn(13);var s=ri(n,i+8);if(!s)return{};var r=Zn(n,i+16),o=r==4294967295||s==65535;if(o){var a=Zn(n,i-12);o=Zn(n,a)==101075792,o&&(s=Zn(n,a+32),r=Zn(n,a+48))}for(var l=e&&e.filter,c=0;c<s;++c){var h=Ky(n,r,o),u=h[0],f=h[1],d=h[2],g=h[3],x=h[4],m=h[5],p=$y(n,m);r=x,(!l||l({name:g,size:f,originalSize:d,compression:u}))&&(u?u==8?t[g]=Yy(n.subarray(p,p+f),{out:new _n(d)}):Nn(14,"unknown compression type "+u):t[g]=iu(n,p,p+f))}return t}var ne=n=>document.getElementById(n),Is=ne("stage"),Xt=ne("scene"),Mt=Xl.clamp,$e=Xl.lerp,Dt=Math.PI*2,assetResponse=await fetch('/assets/depart-duo/scene.bin');
if(!assetResponse.ok)throw new Error('Décor indisponible');
var gc=sp(new Uint8Array(await assetResponse.arrayBuffer())),Pt=JSON.parse(jl(gc["index.json"])),En=new $l({canvas:Xt,antialias:!0,alpha:!1,powerPreference:"high-performance",preserveDrawingBuffer:!0});En.setPixelRatio(Math.min(devicePixelRatio||1,1.5));En.outputColorSpace=Ut;En.shadowMap.enabled=!0;En.shadowMap.type=To;En.shadowMap.autoUpdate=!1;var li=new no,qe=new Zt(48,1,.07,180),$n=new St,$i=new St;li.add($n,$i);var Rr=.087173,tM=new P(0,0,2.48944),xc=new P(-.65,.047,10.72),Wo=new Ze().makeRotationY(Math.PI+Math.atan(Rr));Wo.setPosition(xc.clone().sub(tM.clone().applyMatrix4(Wo)));var nM=Wo.clone().invert(),rp=new Ze;$n.matrixAutoUpdate=$i.matrixAutoUpdate=!1;li.add(new So(16774879,14204066,1.48));var sn=new hr(16770490,1.65);sn.position.set(-4,7,3);li.add(sn);sn.castShadow=!0;sn.shadow.mapSize.set(768,768);sn.shadow.camera.left=-6;sn.shadow.camera.right=6;sn.shadow.camera.top=6;sn.shadow.camera.bottom=-6;sn.shadow.camera.near=.2;sn.shadow.camera.far=23;sn.shadow.bias=-7e-4;sn.shadow.normalBias=.012;li.add(sn.target);var Ap=new hr(12835309,.36);Ap.position.set(3,2,-4);li.add(Ap);var su=new Map,iM=[],Ep=[];function Ir(n,e=!0){if(su.has(n))return su.get(n);let t=URL.createObjectURL(new Blob([gc[n]],{type:"image/webp"}));iM.push(t);let i=new Image,s=new Gt(i);e&&(s.colorSpace=Ut),s.anisotropy=Math.min(4,En.capabilities.getMaxAnisotropy());let r=new Promise((o,a)=>{i.onload=()=>{s.needsUpdate=!0,o()},i.onerror=()=>a(new Error("Texture illisible"))});return Ep.push(r),i.src=t,su.set(n,s),s}const memberReturn=document.querySelector('.brand');
if(document.referrer){
  const previous=new URL(document.referrer);
  if(previous.origin===location.origin&&/^\/membre(?:\.html)?\/?$/.test(previous.pathname)&&history.length>1){
    memberReturn.addEventListener('click',event=>{
      if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){
        event.preventDefault();history.back();
      }
    });
  }
}
function Ai(n,e){let t=gc[n];return new e(t.buffer.slice(t.byteOffset,t.byteOffset+t.byteLength))}function gt(n,e){return new kt(n,e)}function Pr(n,e=1e4){let t=new pt;return t.setAttribute("position",gt(Float32Array.from(Ai(n.p,Int16Array),i=>i/e),3)),t.setAttribute("normal",gt(Float32Array.from(Ai(n.n,Int8Array),i=>i/127),3)),n.uv&&t.setAttribute("uv",gt(Float32Array.from(Ai(n.uv,Uint16Array),i=>i/65535),2)),t.setIndex(gt(Ai(n.i,Uint16Array),1)),t.computeBoundingSphere(),t}function it(n){return new It({color:n,roughness:.93})}function nt(n,e,t,i=0,s=0,r=0){let o=new Ht(n,e);return o.position.set(i,s,r),t.add(o),o}var sM=new ki;function ln(n,e,t,i,s,r,o,a){let l=nt(sM,a,n,e,t,i);return l.scale.set(s,r,o),l}function Dr(n){return()=>{n|=0,n=n+1831565813|0;let e=Math.imul(n^n>>>15,1|n);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function gu(n){let e=document.createElement("canvas");e.width=e.height=256;let t=e.getContext("2d"),i=t.createImageData(256,256),s=Dr(147+n.length);for(let o=0;o<256;o++)for(let a=0;a<256;a++){let l=4*(a+256*o),c=s(),h=s(),u;if(n==="wood"){let f=o%36<1.2||(a+Math.floor(o/36)*82)%224<1,d=Math.sin(a*.13+Math.sin(o*.042)*3+Math.sin(a*.029))*2+Math.sin(o*1.5+Math.sin(a*.028)*1.5)*2,g=c*6+d-(f?22:0);u=[202+g,166+g,123+g]}else{let f=c<.085?-(20+h*15):h*20-7;u=n==="path"?[213+f,193+f,160+f]:[132+f,140+f,99+f]}for(let f=0;f<3;f++)i.data[l+f]=u[f];i.data[l+3]=255}if(t.putImageData(i,0,0),n!=="wood")for(let o=0;o<1300;o++){let a=s()*256,l=s()*256,c=.4+s()*1.2;t.fillStyle=s()<.5?"rgba(80,64,46,.18)":"rgba(254,244,211,.38)",t.beginPath(),t.ellipse(a,l,c,c*.5,s()*3,0,Dt),t.fill()}let r=new vi(e);return r.colorSpace=Ut,r.wrapS=r.wrapT=Ks,r.anisotropy=4,r}var rM=gu("wood"),op=Ir("floor.webp",!1),Zo=[],Cp=[];for(let n of Pt.room){let e=Pr(n,1800),t=e.attributes.position,i;if(n.cat==="floor"){let r=[],o=[];for(let a=0;a<t.count;a++){let l=t.getX(a),c=t.getZ(a);r.push(l*.7,c*.7),o.push((l+3.9)/8,1-(c+3.8)/8)}e.setAttribute("uv",gt(new Float32Array(r),2)),e.setAttribute("uv1",gt(new Float32Array(o),2)),op.channel=1,i=new It({map:rM,aoMap:op,aoMapIntensity:.8,side:rt,roughness:.9})}else if(n.cat==="glass")i=new It({color:13230559,transparent:!0,opacity:.075,roughness:.2,depthWrite:!1,side:Gn});else{let r=Ai(n.c,Uint8Array),o=new Float32Array(r.length);for(let a=0;a<r.length;a++)o[a]=tt.colorSpaceToWorking(new Le(r[a]/255,0,0),Ut).r;e.setAttribute("color",gt(o,3)),i=new It({vertexColors:!0,side:rt,roughness:n.cat==="glass"?.3:.9}),n.cat==="rug"&&(i.polygonOffset=!0,i.polygonOffsetFactor=-2)}let s=nt(e,i,$n);s.castShadow=!n.wall&&n.cat!=="floor"&&n.cat!=="rug",s.receiveShadow=!0,s.userData.wall=n.wall,s.userData.kind=n.cat,Zo.push(s),n.cat==="glass"&&(Cp.push(s),s.receiveShadow=!1)}var Rp=ln($n,-2.25,1.5,-3.12,2.15,3,.1,it(14669246));Rp.userData.wall=1;Zo.push(Rp);var Lr=new _i;Lr.moveTo(-3.27,-3.16);Lr.lineTo(3.27,-3.16);Lr.lineTo(3.27,2.8);Lr.lineTo(-3.27,2.23);Lr.closePath();var Ip=nt(new vo(Lr),new It({color:15327181,roughness:1,side:rt}),$n,0,3.009,0);Ip.rotation.x=Math.PI/2;function oM(){let n=document.createElement("canvas");n.width=n.height=96;let e=n.getContext("2d"),t=e.createRadialGradient(48,48,1,48,48,46);return t.addColorStop(0,"rgba(42,36,25,.72)"),t.addColorStop(.5,"rgba(42,36,25,.22)"),t.addColorStop(1,"rgba(42,36,25,0)"),e.fillStyle=t,e.fillRect(0,0,96,96),new vi(n)}var aM=new Ln({map:oM(),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-3});function xu(n,e,t,i,s,r=.024){let o=nt(new an(i,s),aM,n,e,r,t);return o.rotation.x=-Math.PI/2,o}var vc=Pr(Pt.bag),ap=0;Pt.bag.groups.forEach((n,e)=>{vc.addGroup(ap,n,e),ap+=n});var As={},Pp={pin:{z:-2.57,yaw:-1.5,tilt:-.12},ocre:{z:-1.94,yaw:-1.65,tilt:.09}},ru=new mn,lM=new P;function lp(n){n.updateMatrix(),ru.makeEmpty();let e=n.geometry.attributes.position;for(let t=0;t<e.count;t++)ru.expandByPoint(lM.fromBufferAttribute(e,t).applyMatrix4(n.matrix));return ru}function Dp(n,e){n.scale.setScalar(.88),n.position.set(0,0,e.z),n.rotation.set(.13,e.yaw,e.tilt,"YXZ");let t=lp(n);n.position.x+=-3.218-t.min.x,n.position.y+=.004-t.min.y,lp(n);let i=t.getCenter(new P);n.userData.pinAt=new P(i.x,t.max.y+.09,i.z),n.userData.restBounds=t.clone();let s=n.userData.shadow;s&&(s.position.set(i.x,.01,i.z),s.visible=!0),n.updateMatrixWorld(!0)}var cM=it(3489337),hM=new It({color:7497043,roughness:.55,metalness:.47}),uM=Ir("bag/normal.webp",!1);for(let[n,e]of Object.entries(Pp)){let t=new It({map:Ir("bag/"+n+".webp"),normalMap:uM,normalScale:new fe(.5,.5),roughness:.85,side:rt}),i=nt(vc,[t,cM,hM],$n);i.userData.bag=n,As[n]=i,i.receiveShadow=i.castShadow=!0,i.userData.shadow=xu($n,0,0,.67,.5),Dp(i,e)}var fM=[{id:"sofa",pos:[-2.56,0,.24],yaw:Math.PI/2,pose:8},{id:"chair",pos:[-.57,0,.17],yaw:-Math.PI/2,pose:9}],An={},Cn="f",ot="salon",vu=null,nn=null,bn=null;function dM(n){let e=new St,t=new St,i=[];e.add(t),li.add(e),e.scale.setScalar(n==="m"?1.075:1.04);for(let r of Pt[n].parts){let o=Pr(r),a=Ir(Pt[n].tex[r.tex]),l=/hair|short02|lash|brow/.test(r.name),c=o.attributes.position.array.slice(),h=new It({map:a,roughness:.89,alphaTest:l?.36:.12,side:rt}),u=nt(o,h,t);u.castShadow=!0,u.receiveShadow=!1,o.attributes.position.setUsage(Do),o.boundingSphere.radius+=1;let f=r.units.map((d,g)=>({delta:Ai(r.anim+g,Int8Array),unit:d/1e4}));i.push({obj:u,base:c,poses:f})}let s=xu(e,0,0,.82,.54,.03);return{id:n,root:e,body:t,parts:i,shadow:s,phase:0,speed:0,stamp:"",sit:0}}for(let n of["f","m"])An[n]=dM(n);function Lp(){An.f.root.position.set(-1.41,0,-2.3),An.f.root.rotation.y=-.7,An.m.root.position.set(-.6,0,-1.82),An.m.root.rotation.y=-1.12;for(let n of Object.values(An))n.root.visible=!0,n.sit=0,n.speed=0,n.phase=0,n.stamp="",Ds(n,0,0)}Lp();var pM=JSON.parse(jl(gc["fit.json"])),Ps=vc.clone(),ou=Ps.attributes.position;Ps.setIndex(gt(Ai(Pt.wornBag.i,Uint16Array),1));Ps.clearGroups();var cp=0;Pt.wornBag.groups.forEach((n,e)=>{Ps.addGroup(cp,n,e),cp+=n});for(let n=0;n<ou.count;n++){let e=ou.getZ(n);e>-.019&&ou.setZ(n,-.019+.02*Math.tanh((e+.019)/.02))}Ps.computeVertexNormals();Ps.computeBoundingSphere();var mM=it(3753790),gM=it(2240297),Ew=it(3490620),xM=it(10129771);function vM(n,e){let t=e.c,i=e.p,s=i[0].length/t,r=i.map(f=>Float32Array.from(f.flat(),d=>d/1e4)),o=new pt,a=gt(r[0].slice(),3);a.setUsage(Do),o.setAttribute("position",a);let l=[];for(let f=0;f<s;f++)for(let d=0;d<t;d++){let g=t===4&&(d===0||d===3),x=new Le(g?3225901:t===4?6910817:4475968);l.push(x.r,x.g,x.b)}o.setAttribute("color",gt(new Float32Array(l),3));let c=[];for(let f=1;f<s;f++)for(let d=1;d<t;d++){let g=f*t+d;c.push(g-t-1,g-1,g,g-t-1,g,g-t)}o.setIndex(c),o.computeVertexNormals(),o.computeBoundingSphere(),o.boundingSphere.radius+=.2;let h=new It({vertexColors:!0,roughness:.85,side:rt}),u=nt(o,h,n);return{frames:r,coords:a,g:o,cols:t,rows:s}}function Ql(n){let e=new pt;e.setIndex([0,1,2,1,3,2]);let t=gt(new Float32Array(12),3);e.setAttribute("position",t);let i=mM.clone();i.side=rt;let s=nt(e,i,n);return s.frustumCulled=!1,{a:t,g:e}}function _M(n){let e=pM[n.id],t=new St,i=new St;n.root.add(t),t.add(i),t.visible=!1;let s=it(3425084),r=new ds(1,14,14);for(let u of[-1,1])nt(r,s,i,u*.066,1.105,e.back-.022).scale.set(.077,.242,.047);let o=[Ql(t),Ql(t)],a=e.straps.map(u=>vM(t,u)),l=[Ql(t),Ql(t)],c=ln(t,0,1.21,.1,.045,.027,.01,xM),h=ln(t,0,0,0,.022,.013,.009,gM);return{shape:e,h:t,mount:i,risers:o,patches:a,links:l,clasp:c,slot:h,poses:e.frames.map(u=>({p:new P(...u.slice(0,3)),q:new pn(...u.slice(3))})),stamp:""}}var yM=new pn,hp=new pn;function uc(n,e=!1){let t=n.harness;if(!t?.h.visible)return;let i=n.phase*8,s=Math.floor(i)%8,r=(s+1)%8,o=i%1,a=n.speed,l=Math.round(i*50)+"-"+Math.round(a*48);if(!e&&(t.stamp===l||!a&&t.stamp==="idle"))return;t.stamp=a>.01?l:"idle";let c=t.poses[s+1],h=t.poses[r+1];t.mount.position.copy(c.p).lerp(h.p,o).multiplyScalar(a),hp.copy(c.q).slerp(h.q,o),t.mount.quaternion.copy(yM).slerp(hp,a);for(let d of t.patches){let g=d.coords.array,x=d.frames[0],m=d.frames[s+1],p=d.frames[r+1];for(let y=0;y<g.length;y++)g[y]=x[y]+($e(m[y],p[y],o)-x[y])*a;d.coords.needsUpdate=!0,d.g.computeVertexNormals()}for(let d=0;d<2;d++){let g=t.patches[d*2],x=t.patches[1+d*2],m=t.links[d],p=g.coords.array,y=x.coords.array;m.a.array.set(p.subarray(p.length-9,p.length-6),0),m.a.array.set(p.subarray(p.length-6,p.length-3),3),m.a.array.set(y.subarray(0,6),6),m.a.needsUpdate=!0,m.g.computeVertexNormals()}for(let d=0;d<2;d++){let g=t.patches[d*2].coords.array,x=216,m=d===0?-1:1,p=t.risers[d],y=new P(m*.096,n.id==="f"?1.345:1.37,t.shape.back-.089).applyQuaternion(t.mount.quaternion).add(t.mount.position);p.a.array.set(g.subarray(x+3,x+6),0),p.a.array.set(g.subarray(x+6,x+9),3),p.a.array.set([y.x-m*.012,y.y,y.z,y.x+m*.012,y.y,y.z],6),p.a.needsUpdate=!0,p.g.computeVertexNormals()}let u=t.patches[4].coords.array,f=Math.floor(u.length/6/2)*6;t.clasp.position.set(u[f],(u[f+1]+u[f+4])/2,u[f+2]+.004),t.slot.position.copy(t.clasp.position),t.slot.position.z+=.006}function up(n,e){e.userData.shadow.visible=!1,n.harness||(n.harness=_M(n));let t=n.harness;t.h.visible=!0,t.mount.add(e),e.geometry=Ps;let i=n.id==="f"?.65:.67;e.scale.set(i,i,i*.93),e.rotation.set(0,0,0),e.position.set(0,n.id==="f"?.8:.81,t.shape.back+.007),n.bag=e,t.stamp="",uc(n,!0)}function MM(n){if(!n.bag)return;let e=n.bag;$n.add(e),e.geometry=vc,Dp(e,Pp[e.userData.bag]),n.bag=null,n.harness.h.visible=!1}function Ds(n,e,t,i=0){n.phase=(n.phase+i*(1.02+e*.1))%1;let s=n.phase*8,r=Math.floor(s),o=(r+1)%8,a=s-r,l=t?t.pose:0,c=t?"seat"+l+Math.round(n.sit*42):e>.01?"walk"+Math.floor(s*12)+"/"+Math.round(e*25):"idle";if(n.stamp!==c){n.stamp=c;for(let h of n.parts){let u=h.obj.geometry.attributes.position,f=h.base,d=h.poses[r],g=h.poses[o];if(t){let x=h.poses[l],m=n.sit*x.unit;for(let p=0;p<f.length;p++)u.array[p]=f[p]+x.delta[p]*m}else if(e>.01){let x=(1-a)*d.unit*e,m=a*g.unit*e;for(let p=0;p<f.length;p++)u.array[p]=f[p]+d.delta[p]*x+g.delta[p]*m}else u.array.set(f);u.needsUpdate=!0}}}var SM=gu("land"),bM=gu("path"),_u=new It({map:SM,roughness:1,side:rt}),Up=new It({map:bM,roughness:1,side:rt}),yu=it(14336160),Cw=it(10969671),ko=it(15194042),Rw=it(4350292),Iw=it(6850693),Pw=it(5199689),Bt=new St,Jo=new St;$i.add(Bt,Jo);function Ei(n,e,t,i,s,r,o=yu){return ln(Bt,n,e,t,i,s,r,o)}function wM(){Ei(-5.83,3.15/2,-7.6,10.36,3.15,.38),Ei(6.35,3.15/2,-7.6,9.8,3.15,.38);let r=new _i;r.moveTo(-1.05,3.15),r.lineTo(1.05,3.15),r.lineTo(1.05,1.6),r.absarc(0,1.6,1.05,0,Math.PI,!1),r.lineTo(-1.05,3.15),nt(new cr(r,{depth:.39,bevelEnabled:!1,curveSegments:28}),yu,Bt,.4,0,-7.6-.19);for(let o=0;o<17;o++){let a=o*Math.PI/17+.009,l=(o+1)*Math.PI/17-.009,c=new _i;c.absarc(0,0,1.05+.14,a,l,!1),c.absarc(0,0,1.05,l,a,!0),c.closePath(),nt(new cr(c,{depth:.42,bevelEnabled:!1,curveSegments:8}),ko,Bt,.4,1.6,-7.6-.205)}for(let o of[-1,1])for(let a=0;a<5;a++)Ei(.4+o*(1.05+.072),1.6*(a+.5)/5,-7.6,.145,1.6/5-.008,.44,ko);Ei(0,3.15+.04,-7.6,22,.09,.47,ko)}wM();var Mu=new ds(125,32,16),Np=[],fp=Mu.attributes.position,TM=new Le(9812677),AM=new Le(15920089);for(let n=0;n<fp.count;n++){let e=AM.clone().lerp(TM,Mt(fp.getY(n)/72,0,1));Np.push(e.r,e.g,e.b)}Mu.setAttribute("color",gt(new Float32Array(Np),3));nt(Mu,new Ln({vertexColors:!0,side:Wt,fog:!1,depthWrite:!1}),Jo);var Fp=new St;Bt.add(Fp);var Ki={plaster:it(15127734),limestone:it(13351326),oak:it(10846296),frame:it(5268061)};function EM(){let n=document.createElement("canvas");n.width=128,n.height=256;let e=n.getContext("2d"),t=e.createLinearGradient(0,0,18,256);t.addColorStop(0,"#c4d7d7"),t.addColorStop(.48,"#8da5a5"),t.addColorStop(.57,"#839691"),t.addColorStop(1,"#59746a"),e.fillStyle=t,e.fillRect(0,0,128,256);for(let s=0;s<3;s++)e.fillStyle="rgba(225,238,225,.08)",e.beginPath(),e.moveTo(s*61,-5),e.lineTo(s*61+12,-5),e.lineTo(s*61-47,260),e.lineTo(s*61-62,260),e.fill();let i=new vi(n);return i.colorSpace=Ut,new It({map:i,side:rt,roughness:.34,metalness:.16})}Ki.glass=EM();Ki.door=Ki.glass;Ki.terrace=Ki.limestone;var _c=[];for(let[n,e]of Object.entries(Pt.house)){let t=Pr(e,1e3);if(n==="glass"||n==="door"){let r=[],o=t.attributes.position;for(let a=0;a<o.count;a++)r.push((o.getX(a)+5.5)/11,o.getY(a)/4.6);t.setAttribute("uv",gt(new Float32Array(r),2))}let i=Ki[n];i.side=rt;let s=nt(t,i,Fp);s.receiveShadow=!0,s.castShadow=n!=="glass",n!=="oak"&&n!=="terrace"&&_c.push(s)}var Su=3.22*Math.hypot(1,Rr),CM=xc.x-Su,RM=xc.x+Su;for(let[n,e]of[[-4.66,CM],[RM,2.96]]){let t=Ei((n+e)/2,1.55,10.77,e-n,3.1,.23,Ki.plaster);_c.push(t)}_c.push(Ei(xc.x,3.085,10.78,Su*2,.079,.23,Ki.plaster));Ei(.1,.025,7.48,2.02,.06,1.04,ko);Ei(-3.5,.37,-5.25,2.05,.13,.56,ko);for(let n of[-4.18,-2.83])Ei(n,.175,-5.25,.22,.35,.39,yu);var Et=n=>n>=-9?.4+.6*Math.sin((n+7.6)*.45):.4+.6*Math.sin((-9+7.6)*.45)+1.75*Math.sin((n+9)*.12)+1.16*Math.sin((n+9)*.055),Vo=n=>n>6?1.72:1.3+.13*Math.sin(n*.42);function dp(n,e,t=!1){let i=[],s=[],r=[],o=[],a=Math.ceil((e-n)/.7);for(let c=0;c<=a;c++){let h=$e(n,e,c/a),u=Et(h),f=t?28:Vo(h);for(let d of[-1,1]){let g=u+d*f+(t?0:.035*Math.sin(18*h+d));i.push(g,t?-.023:0,h),s.push(g*.8,h*.8),o.push(.95,.95,.95)}if(c){let d=c*2;r.push(d-2,d,d-1,d-1,d,d+1)}}let l=new pt;return l.setAttribute("position",gt(new Float32Array(i),3)),l.setAttribute("uv",gt(new Float32Array(s),2)),l.setIndex(r),l.computeVertexNormals(),nt(l,t?_u:Up,new St)}var ci={maple:[7.8,Pt.maple],abelia:[1.25,Pt.abelia],cistus:[1.04,Pt.cistus],grass:[.34,Pt.grass],flowers:[.3,Pt.flowers],tuft:[.17,Pt.tuft],vine:[2.85,Pt.vine]};Object.assign(ci,{maple2:[8.5,Pt.maple2],abelia2:[1.42,Pt.abelia2],spike:[3.88,Pt.spike],sedge:[.52,Pt.sedge],weed:[.38,Pt.weed]});var yc={};for(let n in ci)yc[n]=new Ln({map:Ir(n+".webp"),alphaTest:.36,side:rt,color:16777215});var bu=new an(1,1);bu.translate(0,.5,0);var Op=[],Zi=new Map,Fn=2,IM=.22;function wu(n,e){return n==="maple"||n==="maple2"?.2*e:n==="spike"?.49*e:n==="abelia"||n==="abelia2"||n==="cistus"?ci[n][0]*ci[n][1]*e*.46:0}function Xo(n,e,t,i,s){var u;if(!i)return e;let r=Et(t),o=e-r,a=i+1.13;Math.abs(o)<a&&(e=r+(o<0?-a:a));let l={x:e,z:t,r:i+IM,height:s||i*1.45},c=l.r,h=[];for(let f=Math.floor((e-c)/Fn);f<=Math.floor((e+c)/Fn);f++)for(let d=Math.floor((t-c)/Fn);d<=Math.floor((t+c)/Fn);d++){let g=f+","+d;Zi.has(g)||Zi.set(g,new Set),Zi.get(g).add(l),h.push(g)}return((u=n.userData).solids??(u.solids=[])).push({c:l,keys:h}),e}function PM(n){for(let{c:e,keys:t}of n.userData.solids||[])for(let i of t){let s=Zi.get(i);s.delete(e),s.size||Zi.delete(i)}}function Bp(n,e){let t=Zi.get(Math.floor(n/Fn)+","+Math.floor(e/Fn));if(t){for(let i of t)if((n-i.x)**2+(e-i.z)**2<i.r**2)return!1}return!0}function DM(n,e,t){let i=e-n.x,s=t-n.z,r=i*i+s*s;if(!r)return Bp(e,t);for(let o=Math.floor(Math.min(n.x,e)/Fn);o<=Math.floor(Math.max(n.x,e)/Fn);o++)for(let a=Math.floor(Math.min(n.z,t)/Fn);a<=Math.floor(Math.max(n.z,t)/Fn);a++){let l=Zi.get(o+","+a);if(l)for(let c of l){let h=Mt(((c.x-n.x)*i+(c.z-n.z)*s)/r,0,1);if((n.x+h*i-c.x)**2+(n.z+h*s-c.z)**2<c.r**2)return!1}}return!0}function $o(n,e,t,i,s=1,r=!1,o=0){t=Xo(n,t,i,wu(e,s),ci[e][0]*s);let[a,l]=ci[e],c=nt(bu,yc[e],n,t,o,i);return c.scale.set(a*l*s,a*s,1),r||Op.push(c),c}var Ur=Pr(Pt.agave),Go=Ur.attributes.position,LM=Ur.attributes.normal,zp=[];for(let n=0;n<Go.count;n++){let e=Mt(.28+Go.getY(n)*.29+LM.getY(n)*.18,0,1),t=new Le(5274481).lerp(new Le(10730672),e);zp.push(t.r,t.g,t.b)}Ur.setAttribute("color",gt(new Float32Array(zp),3));var kp=new It({vertexColors:!0,side:rt,roughness:.82}),fc=0;for(let n=0;n<Go.count;n++)fc=Math.max(fc,Math.hypot(Go.getX(n),Go.getZ(n)));function UM(n,e,t,i){e=Xo(n,e,t,fc*i*.91);let s=nt(Ur,kp,n,e,0,t);return s.scale.setScalar(i),s.rotation.y=t*2.75,s}for(let[n,e,t]of[[-2.65,1.3,.78],[2.5,1.08,.76],[-2.28,-1.52,.5],[3.2,-3.7,.77],[-2.8,-5.82,.56]])UM(Bt,n,e,t);for(let[n,e,t]of[[-3.7,-2,1.03],[5.6,-5,.87],[-5,4,.84],[6,3,.68],[-3.6,-12,.77]])$o(Bt,"maple",n,e,t);$o(Bt,"vine",3.45,-7.25,1.04,!0);$o(Bt,"vine",-7.4,-7.25,.9,!0);function Vp(n,e,t,i){let s=xu(n,e,t,2*i,.99*i,.008);s.rotation.z=.4}for(let[n,e,t]of[[-3.7,-2,2.7],[5.6,-5,2.5],[-3,1.3,.9],[2.5,1.08,.7],[-3.5,-5.25,1.2]])Vp(Bt,n,e,t);function NM(){let n=document.createElement("canvas");n.width=n.height=256;let e=n.getContext("2d"),t=Dr(82);for(let i=0;i<3600;i++){let s=t()*Dt,r=Math.sqrt(t())*118,o=128+Math.cos(s)*r,a=128+Math.sin(s)*r,l=t()*6+1;e.fillStyle="rgba(48,54,34,"+(.018+(1-r/120)*.05)+")",e.beginPath(),e.ellipse(o,a,l,l*(.3+t()*.6),t()*Dt,0,Dt),e.fill()}return new Ln({map:new vi(n),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2})}var FM=NM();for(let[n,e,t,i]of[[-1.25,-1.2,8.1,6.6],[3.65,-4.15,6.9,5.9],[-2.1,3.1,4.5,4.5],[-1.8,-11,5.1,4.7]]){let s=nt(new an(t,i),FM,Bt,n,.017,e);s.rotation.x=-Math.PI/2}var Gp=new xo(1,0),OM=it(16777215),pp=[12692876,14602676,12232072,11707277,13549470,11181181].map(n=>new Le(n)),BM=new Le(9213804),zM=new Le(10791549),kM=new It({vertexColors:!0,roughness:1,side:rt}),VM=nt(new an(354,354),it(9542519),Jo,0,-.57,0);VM.rotation.x=-Math.PI/2;function mp(n,e){return-.18+Mt((Math.abs(n-Et(e))-11)/33,0,1)*(2.1+1.4*Math.sin(n*.092+e*.039)+1.05*Math.cos(e*.131-n*.066))}function Hp(n,e){let t=e*18,i=t+18,s=[],r=[],o=[],a=36,l=4;for(let f=0;f<=l;f++)for(let d=0;d<=a;d++){let g=(d/a-.5)*164,x=$e(t,i,f/l),m=mp(g,x);s.push(g,m,x);let p=.43+.25*Math.sin(.13*g+.12*x)+.12*Math.cos(g*.24-.3*x),y=BM.clone().lerp(zM,p);if(r.push(y.r,y.g,y.b),d&&f){let M=f*(a+1)+d;o.push(M-a-2,M-1,M-a-1,M-a-1,M-1,M)}}let c=new pt;c.setAttribute("position",gt(new Float32Array(s),3)),c.setAttribute("color",gt(new Float32Array(r),3)),c.setIndex(o),c.computeVertexNormals(),nt(c,kM,n);let h=Dr(83*e+151),u=[];for(let f=0;f<49;f++){let d=f%2?1:-1,g=(13+Math.pow(h(),1.23)*56)*d,x=t+h()*18;if(!(Math.sin(g*.12+x*.081)+Math.cos(x*.115-g*.078)<-.6))for(let m=0;m<5;m++){let p=g+(h()-.5)*6,y=x+(h()-.5)*5;if(Math.abs(p-Et(y))<=11.6)continue;let M=1.2+h()*1.8,v=h()<.18;u.push([p,mp(p,y),y,M,v,h(),h()])}}for(let[f,d]of[["maple",!1],["maple2",!0]]){let g=u.filter((y,M)=>!!(M%2)===d);if(!g.length)continue;let x=new an(1,1);x.translate(0,.5,0);let m=new ni(x,yc[f],g.length*2),p=new Rt;g.forEach(([y,M,v,E,A,I,D],b)=>{let S=E*(A?2.3:1.88),C=S*ci[f][1]*(A?.83:1.17),U=new Le().setRGB(.81+I*.13,.84+D*.13,.75+D*.15);for(let z=0;z<2;z++)p.position.set(y,M-.05,v),p.rotation.y=I*Math.PI/2+z*Math.PI/2,p.scale.set(C,S,1),p.updateMatrix(),m.setMatrixAt(2*b+z,p.matrix),m.setColorAt(2*b+z,U)}),m.computeBoundingSphere(),n.add(m)}}var ec=new Map,hu=18,Nt=new Rt;function Wp(n,e,t){if(!t.length)return;let[i,s]=ci[e],r=bu.clone(),o=yc[e],a=new ni(r,o,t.length);for(let l=0;l<t.length;l++){let[c,h,u,f]=t[l];Nt.position.set(c,0,h),Nt.rotation.set(0,f||0,0),Nt.scale.set(i*s*u,i*u,1),Nt.updateMatrix(),a.setMatrixAt(l,Nt.matrix),a.setColorAt(l,new Le().setRGB(.89+.11*Math.abs(Math.sin(c*7)),.91+.085*Math.abs(Math.cos(h*3)),.86+.12*Math.abs(Math.sin(c+h))))}a.computeBoundingSphere(),n.add(a)}function GM(n){let e=new St,t=n*hu,i=t+hu,s=Dr(n*71371+1977),r=Math.min(i,8.85);if(t>=r)return e;Hp(e,n),e.add(dp(t,r,!0),dp(t,r));let o={};for(let l of["maple","maple2","abelia","abelia2","cistus","grass","sedge","weed","flowers","tuft"])o[l]=[];for(let l=0;l<470;l++){let c=$e(t,r,s()),h=s()<.5?-1:1,u=Vo(c)+.22+s()**1.8*8.75,f=Et(c)+h*u;if(c>5.7&&Math.abs(f)<4.5||Math.abs(c+7.6)<.62)continue;let d=l<24&&u>3.6?s()<.5?"maple":"maple2":l<125&&u>1.9?s()<.35?"cistus":s()<.55?"abelia2":"abelia":s()<.31?"grass":s()<.36?"sedge":s()<.36?"weed":s()<.62?"flowers":"tuft",g=(d==="maple"?.66:.65)+s()*(d==="maple"?.3:.82),x=s()*.65-.325,m=Xo(e,f,c,wu(d,g),ci[d][0]*g);o[d].push([m,c,g,x]),d!=="maple"&&d!=="maple2"&&o[d].push([m+.012,c,g,x+1.33])}for(let l in o)Wp(e,l,o[l]);if(n<-1){let l=[];for(let u=0;u<5;u++){let f=$e(t,i,s());l.push([Et(f)+(u%2?1:-1)*(2+s()*2.9),f,.43+s()*.43])}let h=new ni(Ur,kp,5);for(let u=0;u<5;u++){let[f,d,g]=l[u];Nt.position.set(Xo(e,f,d,fc*g*.91),0,d),Nt.rotation.set(0,s()*Dt,0),Nt.scale.setScalar(g),Nt.updateMatrix(),h.setMatrixAt(u,Nt.matrix)}e.add(h)}let a=new ni(Gp,OM,900);for(let l=0;l<a.count;l++){let c=$e(t,r,s()),h=s(),u=Et(c)+(s()<.5?1:-1)*(h<.64?Vo(c)+(.5-s())*.76:s()*Vo(c)),f=.008+s()*(h<.64?.052:.02);Nt.position.set(u,.003,c),Nt.scale.set(f*(.9+s()*.62),f*.24,f*(.6+s()*.42)),Nt.rotation.set(0,s()*Dt,0),Nt.updateMatrix(),a.setMatrixAt(l,Nt.matrix),a.setColorAt(l,pp[Math.floor(s()*pp.length)])}return e.add(a),e.children.forEach(l=>{(l.material===_u||l.material===Up)&&(l.receiveShadow=!0)}),$i.add(e),e}function Tu(n){let e=Math.floor(n/hu);for(let t=e-4;t<=Math.min(0,e+3);t++)ec.has(t)||ec.set(t,GM(t));for(let[t,i]of ec)(t<e-4||t>e+3)&&(PM(i),$i.remove(i),i.traverse(s=>{s.isInstancedMesh&&s.dispose(),s.userData.disposeMat&&s.material.dispose(),s.geometry&&s.geometry!==Ur&&s.geometry!==Gp&&s.geometry.dispose()}),ec.delete(t))}for(let n=1;n<=4;n++)Hp(Bt,n);Tu(3);var Xp=new an(116,66),tc=Xp.attributes.uv;for(let n=0;n<tc.count;n++)tc.setXY(n,tc.getX(n)*85,tc.getY(n)*50);var qp=nt(Xp,_u,Bt,0,-.04,14);qp.rotation.x=-Math.PI/2;qp.receiveShadow=!0;for(let[n,e,t]of[[-4.8,-4,.94],[5.4,-1.7,.92],[-5.7,4.6,.75],[5.9,6.9,.91],[-6.2,9.3,.84],[7.1,10.7,.83],[-6.5,-10,1.05],[8.5,-15,1.05],[-9.3,17,.93],[10,19,1.11]])$o(Bt,"maple2",n,e,t),Vp(Bt,n,e,2.2*t);for(let[n,e,t]of[[-3.55,-3.4,.88],[3.94,-5.15,.78],[-3.53,2.52,.69],[4.6,3.7,.64],[-5.9,6.5,.7]])$o(Bt,"spike",n,e,t);var yn=Dr(9407),dc={sedge:[],weed:[],flowers:[],abelia2:[],cistus:[]};for(let n=0;n<34;n++){let e=-7+yn()*15,t=n%2?1:-1,i=1.7+yn()*2.9,s=Et(e)+t*i;if(e>6.9&&Math.abs(s)<2.6)continue;let r=i>3?n%3?"abelia2":"cistus":n%2?"sedge":"weed";for(let o=0;o<(r==="cistus"||r==="abelia2"?3:17);o++){let a=s+(yn()-.5)*1.6,l=e+(yn()-.5)*1.9;if(Math.abs(a-Et(l))<Vo(l)+.05||Math.abs(l+7.6)<.38)continue;let c=.65+yn()*.68;dc[r].push([Xo(Bt,a,l,wu(r,c),ci[r][0]*c),l,c,(yn()-.5)*1.5]),(r==="sedge"||r==="weed")&&dc.flowers.push([a+.06,l-.09,.75+yn()*1.45,(yn()-.5)*1.5])}}for(let n in dc)Wp(Bt,n,dc[n]);function HM(){let n=new pt,e=[],t=[];function i(l,c,h,u,f,d){for(let g=0;g<5;g++){let x=g*Dt/5,m=(g+1)*Dt/5,p=(y,M,v)=>[y[0]+Math.cos(v)*M,y[1],y[2]+Math.sin(v)*M];e.push(...p(l,h,x),...p(c,u,x),...p(l,h,m),...p(l,h,m),...p(c,u,x),...p(c,u,m));for(let y of[f,d,f,f,d,d])t.push(y.r,y.g,y.b)}}let s=new Le(5401411),r=new Le(9805415),o=new Le(8547744),a=new Le(11902139);for(let l=0;l<5;l++){let c=l*2.39,h=.25+yn()*.22,u=.1*Math.cos(c),f=.12*Math.sin(c);i([0,0,0],[u,h,f],.006,.003,s,r);for(let d=0;d<5;d++){let g=h+.018*d;i([u,g,f],[u+.003,g+.026,f],.015-d*.001,.008,o,a)}}return n.setAttribute("position",gt(new Float32Array(e),3)),n.setAttribute("color",gt(new Float32Array(t),3)),n.computeVertexNormals(),n}var WM=HM(),uu=new ni(WM,new It({vertexColors:!0,side:rt,roughness:1}),190);for(let n=0;n<uu.count;n++){let e=n%16,t=-6.7+e*.86+(yn()-.5)*.91,i=Et(t)+(e%2?1:-1)*(1.52+.75*Math.abs(Math.sin(e))+.5*yn());Nt.position.set(i,0,t),Nt.rotation.set(0,yn()*Dt,0),Nt.scale.setScalar(.7+yn()*.7),Nt.updateMatrix(),uu.setMatrixAt(n,Nt.matrix)}Bt.add(uu);var Yp=new St;$i.add(Yp);var XM=new Ln({map:Ir("papillon-blanc.webp"),side:rt,alphaTest:.22,color:16777215}),sc={},Zp=76,rc=[],fu=[];for(let[n,e]of Object.entries(Pt.butterfly)){let t=new ni(Pr(e),XM,Zp);t.instanceMatrix.setUsage(Do),t.frustumCulled=!1,Yp.add(t),sc[n]=t}var oi=Dr(71523);for(let n=0;n<7;n++)rc.push({angle:oi()*Dt,time:oi()*13,period:11+oi()*9,offset:oi()*3,side:n%2?-1:1,pos:new P});for(let n=0;n<Zp;n++)fu.push({group:n%7,r:oi(),a:oi()*Dt,phase:oi()*Dt,size:.08+oi()*.073,beat:5+oi()*3,prev:new P,heading:oi()*Dt});var yr=new Rt,nc=new Rt,gp=new Ze,Jp=new P(Et(3),0,3),qM=new P(Et(3)+.78,0,3.42),xp=0,oc=!0;function YM(n){xp+=n;let e=xp,t=ot==="jardin",i=t?bt().root.position:Jp,s=t?es().root.position:qM;for(let r=0;r<rc.length;r++){let o=rc[r],a=o.angle,l=(e+o.time)*Dt/o.period,c=(1+Math.cos(l))*.5,h=c*c*(3-2*c),u=r%2?i:s,f=Math.sin(a)*3.6-1.8,d=Et(i.z+f)+o.side*(2.9+o.offset),g=i.z+f,x=u.x+o.side*(.56+Math.sin(e*.63+a)*.24),m=u.z-.28+.43*Math.sin(e*.69+a),p=$e(d,x,h),y=Math.min(7.65,$e(g,m,h));oc?o.pos.set(p,0,y):(o.pos.x=$e(o.pos.x,p,1-Math.exp(-n*2)),o.pos.z=$e(o.pos.z,y,1-Math.exp(-n*2))),o.pos.y=$e(.45+.21*Math.sin(e+o.time),1.24+.38*Math.sin(e*.74+r),h)}for(let r=0;r<fu.length;r++){let o=fu[r],a=rc[o.group],l=e*(.93+o.r*.65)+o.a,c=.34+o.r*.57,h=a.pos.x+c*Math.cos(l)+.16*Math.sin(l*2.5),u=a.pos.y+.28*Math.sin(l*1.7+o.phase)+.08*Math.sin(l*4.7),f=a.pos.z+c*Math.sin(l*1.14+o.phase);if(!oc){let g=h-o.prev.x,x=f-o.prev.z;if(Math.abs(g)+Math.abs(x)>1e-5){let m=Math.atan2(g,x);o.heading+=Math.atan2(Math.sin(m-o.heading),Math.cos(m-o.heading))*Math.min(1,n*10)}}o.prev.set(h,u,f),yr.position.set(h,u,f),yr.rotation.set(.17*Math.sin(2*l),o.heading,.25*Math.sin(l*1.7),"YXZ"),yr.scale.setScalar(o.size),yr.updateMatrix(),sc.Body.setMatrixAt(r,yr.matrix);let d=.28+.81*Math.sin(e*Dt*o.beat+o.phase);for(let[g,x]of[["Wing_Left",-1],["Wing_Right",1]])nc.position.set(0,0,0),nc.rotation.set(0,0,x*d),nc.updateMatrix(),gp.multiplyMatrices(yr.matrix,nc.matrix),sc[g].setMatrixAt(r,gp)}oc=!1;for(let r of Object.values(sc))r.instanceMatrix.needsUpdate=!0}for(let n=0;n<2;n++){let e=[],t=[],s=70+n*24;for(let o=0;o<=144;o++){let a=o/144*Dt,l=Math.sin(a)*s,c=Math.cos(a)*s,h=2+n*1.6+1.9*Math.sin(3*a+n)+1.35*Math.sin(7*a+1)+.7*Math.sin(12*a+.7);if(e.push(l,-4,c,l,h,c),o){let u=2*o;t.push(u-2,u-1,u,u,u-1,u+1)}}let r=new pt;r.setAttribute("position",gt(new Float32Array(e),3)),r.setIndex(t),nt(r,new Ln({color:n?11319718:9479308,side:rt}),Jo)}var lt=new Set,Vt={x:0,y:0,id:null},ce={angle:1.07,pitch:.23,radius:3.6,focus:new P(-2.19,.78,-1.78),follow:!1},bt=()=>An[Cn],Mn=new P,Mr=new wo,vp=new fe,ac=performance.now(),Au=0;var $p=0,Mc=null,Kp=!1,wi={pin:ne("pin"),ocre:ne("ocre")},jp=[...document.querySelectorAll("[data-role]")],es=()=>An[Cn==="f"?"m":"f"],tn=[],br=0,wn=!1,jt=!1,ws=!1;function Eu(){let n=ne("lookHome"),e=ot==="jardin"?"Se retourner vers la maison":jt?"Reprendre la vue du salon":"Regarder par la baie vitr\xE9e";n.title=e,n.setAttribute("aria-label",e),n.setAttribute("aria-pressed",String(ot==="jardin"?wn:jt))}var Qp=null;function em(){jt||(Qp={angle:ce.angle,pitch:ce.pitch,follow:ce.follow,focus:ce.focus.clone(),from:bt().root.position.clone()}),jt=!0,ce.pitch=.025,ce.angle=Math.PI-Math.atan(Rr),ce.follow=!0,Eu(),Kn()}function Ls(){wn=jt=!1,Eu(),Kn()}function tm(){let n=Qp;Ls(),n&&(ce.angle=n.angle,ce.pitch=n.pitch,ce.follow=n.follow||n.from.distanceTo(bt().root.position)>.3,ce.follow||ce.focus.copy(n.focus)),ji(1)}function ZM(){let n=bt(),e=es(),t=n.root.position;tn.length=0,br=0,tn.push({x:t.x,z:t.z,s:0}),e.root.visible=!0;let i=[[.78,.42],[-.78,.42],[0,.8],[0,-.8],[0,.38]].find(([s,r])=>Ko(t.x+s,t.z+r)&&Ci(t,t.x+s,t.z+r))||[0,0];e.root.position.set(t.x+i[0],0,t.z+i[1]),e.root.rotation.y=Math.PI+.1,e.phase=.47,e.speed=e.sit=0,e.stamp="",Ds(e,0,0)}function Ci(n,e,t){if(ot==="jardin"&&!DM(n,e,t))return!1;let i=Math.max(1,Math.ceil(Math.hypot(e-n.x,t-n.z)/.13));for(let s=1;s<=i;s++)if(!Ko($e(n.x,e,s/i),$e(n.z,t,s/i)))return!1;return!0}function JM(n){if(ot!=="jardin")return;let e=bt(),t=es(),i=e.root.position,s=t.root.position,r=tn[tn.length-1],o=Math.hypot(i.x-r.x,i.z-r.z);if(o>.09)for(br+=o,tn.push({x:i.x,z:i.z,s:br});tn.length>2&&tn[1].s<br-10;)tn.shift();let a=Math.max(0,br-.84),l=tn.findIndex(C=>C.s>=a);l<0&&(l=tn.length-1);let c=tn[Math.max(0,l-1)],h=tn[l],u=Mt((a-c.s)/(h.s-c.s||1),0,1),f=$e(c.x,h.x,u),d=$e(c.z,h.z,u),g=h.x-c.x,x=h.z-c.z,m=Math.hypot(g,x);m<.001&&(g=Math.sin(e.root.rotation.y),x=Math.cos(e.root.rotation.y),m=1);let p=.68*Mt((Math.abs(d+7.6)-.55)/1.5,0,1),y=f-x/m*p,M=d+g/m*p;if(Ko(y,M)&&Ci(s,y,M)&&(f=y,d=M),!Ci(s,f,d))for(let C=l;C>=0;C--){let U=tn[C];if(Math.hypot(s.x-U.x,s.z-U.z)>.12&&Ci(s,U.x,U.z)){f=U.x,d=U.z;break}}let v=f-s.x,E=d-s.z,A=Math.hypot(v,E),I=Math.min(2.25,Math.max(0,(A-.1)*4)),D=Math.min(A,I*n),b=t.root.rotation.y,S=!1;if(A>.13&&D>0){let C=s.x+v/A*D,U=s.z+E/A*D;Ci(s,C,U)&&(s.x=C,s.z=U,S=!0,b=Math.atan2(v,E))}else(Sr||e.speed<.08)&&(b=Math.atan2(i.x-s.x,i.z-s.z));t.root.rotation.y+=Math.atan2(Math.sin(b-t.root.rotation.y),Math.cos(b-t.root.rotation.y))*Math.min(1,n*7),t.speed=$e(t.speed,S?Math.min(1,I/1.5):0,Math.min(1,n*10)),t.speed<.018&&(t.speed=0),Ds(t,t.speed,null,n*t.speed),uc(t),uc(e)}function $M(){if(Qo(),On&&wc(!1),ot==="salon"){jt?tm():(em(),ji(1));return}wn=!wn;let n=bt().root.position;ce.angle=wn?Math.atan2(n.x-.28,n.z-14.1):.23,ce.pitch=wn?.155:.2,ce.radius=wn?4.15:3.68,ce.follow=!0,ne("lookHome").setAttribute("aria-pressed",String(wn)),ji(1)}var Cu=[[-.49,1.62,-2.58,-2.16],[-3.08,-2.18,-1.17,1.64],[-2.79,-2.35,-1.56,-1.1],[-1.84,-1.14,.83,1.93],[-1,.02,-.34,.66],[.96,1.74,-.71,1.04],[2.54,3.15,-.43,.79]];for(let n of[.42,2.3])for(let e of[-.12,.51])Cu.push([n-.2,n+.2,e-.2,e+.2]);Cu.push([1.13,1.61,-1.47,-1.08],[1.2,1.64,1.41,1.88]);function Ko(n,e){if(ot==="salon"){if(n<-3||n>3||e<-2.4||e>2.01+(n+3)*.09)return!1;for(let t of Object.values(As)){let i=t.userData.restBounds;if(n>i.min.x-.12&&n<i.max.x+.12&&e>i.min.z-.12&&e<i.max.z+.12)return!1}return!Cu.some(([t,i,s,r])=>n>t-.1&&n<i+.1&&e>s-.1&&e<r+.1)}return e>10.38||Math.abs(n-Et(e))>11.4||Math.abs(e+7.6)<.39&&Math.abs(n-.4)>.83?!1:Bp(n,e)&&!(Math.abs(n+3.5)<1.18&&Math.abs(e+5.25)<.46)}function KM(n){if(!(ot!=="salon"||n===Cn)){On&&wc(!1),nn&&Sc(),An[Cn].body.visible=!0,Ls(),ws=!1,Cn=n,dm(),bn=null,lt.clear();for(let e of Object.values(An))e.sit=0,e.speed=0,e.stamp="",Ds(e,0,0);jp.forEach(e=>e.setAttribute("aria-pressed",String(e.dataset.role===n))),ce.follow=!1,Kn()}}jp.forEach(n=>n.onclick=()=>KM(n.dataset.role));function Ru(n){ot=n?"jardin":"salon",On=!1,ne("shelves").hidden=n,ne("shelfLabel").textContent="Biblioth\xE8que",ne("shelves").setAttribute("aria-pressed","false"),ne("shelfActions").hidden=!0,Qi(),$n.matrix.copy(n?Wo:rp),$i.matrix.copy(n?rp:nM),$n.updateMatrixWorld(!0),$i.updateMatrixWorld(!0);for(let e of _c)e.visible=n;for(let e of Zo)e.visible=!0;n||(Tu(3),bt().root.position.z<-24&&(oc=!0)),Is.dataset.place=ot,document.body.dataset.place=ot,li.background=new Le(n?14477279:14866370),li.fog=new to(14870747,.014),ne("place").textContent=n?"Le jardin":"Le salon",ne("return").hidden=!n,ne("actors").hidden=n;for(let e of Object.values(wi))e.hidden=n;ne("rise").hidden=!0,bn=null,nn=null,Mc=null,ne("lookHome").hidden=!1,wn=jt=ws=!1,Eu(),lt.clear(),Us(),Kn(),ne("notice").textContent=n?"Le sac est sur ton dos. Tu es dans le jardin.":"De retour au salon."}function Iu(n){if(ot!=="salon"||!As[n])return;let e=bt();vu=n,Ru(!0);let t=As[n];e.root.position.set(Et(3),0,3),e.root.rotation.y=Math.PI,e.body.position.y=0,e.sit=e.speed=e.phase=0,e.stamp="",Ds(e,0,0),ZM(),up(e,t),up(es(),As[n==="pin"?"ocre":"pin"]),Ri=performance.now(),ce.angle=Math.PI+.06,ce.pitch=.15,ce.radius=3.66,ce.follow=!0,ce.focus.copy(e.root.position).add(new P(.22,1.04,-.32)),$p=performance.now()+240,ji(1),Xt.focus({preventScroll:!0})}function nm(){if(ot==="jardin"){Qo(),vm();for(let n of Object.values(An))MM(n);vu=null,Ru(!1),Lp(),im(),Xt.focus({preventScroll:!0})}}function im(){ce.follow=!1,ce.angle=1.07,ce.pitch=.23,ce.radius=3.6,ce.focus.set(-2.19,.78,-1.78),ji(1)}var jM=ne("hint");function Kn(){jM.textContent=On?"Touche un livre pour le d\xE9couvrir.":B.mode==="landing"?"Le duo rejoint l\u2019all\xE9e.":ai()?"Dirige le vol avec le joystick.":B.mode==="ready"?"Un grand battement pour d\xE9coller.":jt?"Glisse pour regarder autour de toi.":ot==="salon"?nn?"Touche \xAB Se lever \xBB pour repartir.":"Touche un sac pour le mettre et sortir.":"Suis l\u2019all\xE9e et passe sous l\u2019arche."}function Sc(){if(!nn)return;let n=bt(),e=nn.pos,t=nn.yaw;n.root.position.set(e[0]+Math.sin(t)*.71,0,e[2]+Math.cos(t)*.71),nn=null,Mc=null,n.sit=0,n.stamp="",ne("rise").hidden=!0,Kn(),Ds(n,0,0)}function QM(n){if(ot!=="salon")return;Ls();let e=bt();e.root.position.set(...n.pos),e.root.rotation.y=n.yaw,nn=n,Mc=n,e.sit=0,e.speed=0,bn=null,ne("rise").hidden=!1,ce.follow=!0,Kn()}Object.entries(wi).forEach(([n,e])=>e.onclick=()=>Iu(n));ne("return").onclick=nm;ne("rise").onclick=Sc;ne("fullscreen").onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{ne("notice").textContent="Le plein \xE9cran n\u2019est pas disponible dans ce lecteur."}};document.addEventListener("fullscreenchange",()=>{ne("fullscreen").setAttribute("aria-label",document.fullscreenElement?"Quitter le plein \xE9cran":"Plein \xE9cran")});var Es=ne("help");ne("helpButton").onclick=()=>Es.showModal();ne("closeHelp").onclick=()=>Es.close();Es.addEventListener("click",n=>{n.target===Es&&Es.close()});function ji(n){let e=bt(),t=ot==="jardin",i=Is.clientWidth,s=Is.clientHeight;if(t&&Ri!==null){let f=(performance.now()-Ri)/1e3,g=window.matchMedia("(prefers-reduced-motion: reduce)").matches?f>1.35?1:0:Tn((f-1.05)/2.65);ce.angle=$e(Math.PI+.06,.08,g),ce.pitch=.145+.17*Math.sin(Math.PI*g),ce.radius=3.85-1.58*Math.sin(Math.PI*g),g>=1&&(Ri=null)}if(ce.follow){let f=e.root.position.clone();if(f.y=nn?1.02:t?.98:.9,ai()&&(f.y+=e.root.position.y+(B.figure?.type==="loop"?.62:0)),t){let d=es().root.position;f.x+=(d.x-f.x)*(ai()?.46:.36),f.z+=(d.z-f.z)*(ai()?.46:.32),f.x+=.12*Math.cos(ce.angle)-.4*Math.sin(ce.angle),f.z-=.19*Math.sin(ce.angle)+.4*Math.cos(ce.angle)}ce.focus.lerp(f,Math.min(1,n*8))}let r=!t&&ce.follow&&!nn?Mt((e.root.position.z-1.02)/1.05,0,1):0,o=i<s,a=(ai()?Math.max(ce.radius,o?6.6:4.85):ce.radius)*(o?t?1.13:1.23:1),l=a*Math.cos(ce.pitch);qe.position.set(ce.focus.x+Math.sin(ce.angle)*l,ce.focus.y+Math.sin(ce.pitch)*a,ce.focus.z+Math.cos(ce.angle)*l),t&&qe.position.z>10.22&&Math.abs(qe.position.x)<5.3&&(qe.position.z=10.22);let c=48;if(t&&B.mode!=="off")c=ES(qe,o?55:49,i/s);else if(On){let f=new P(.53,1.14,-2.4);c=i<s?51:44;let g=Math.max(3.02,2.44/Math.max(.38,i/s));qe.position.set(.64,1.36,f.z+g),qe.lookAt(f)}else if(t&&wn){let f=e.root.position.z>-9,d=i<s,g=new P(.58,f?2.18:1.54,f?10.35:e.root.position.z+4.1),x=f?new P(Et(d?-6.35:-3.15),2.52,d?-6.35:-3.15):new P(e.root.position.x-.48,2.05,e.root.position.z-3.9);c=f?d?67:54:48,qe.position.copy(x),qe.lookAt(g)}else if(jt){let f=e.root.position,d=-Math.sin(ce.angle),g=-Math.cos(ce.angle);qe.position.set(Mt(f.x+g*.25-d*.12,-3.08,3.08),nn?1.17:1.57,f.z-d*.25-g*.12),qe.lookAt(qe.position.x+d*8,qe.position.y-Math.tan(ce.pitch)*8,qe.position.z+g*8)}else if(r>0&&Math.cos(ce.angle)<-.1){let f=ce.focus.y+(1.52-ce.focus.y)*r;qe.position.y=Math.max(qe.position.y,f),qe.lookAt(ce.focus.x,f,ce.focus.z+r*.8)}else qe.lookAt(ce.focus);bt().body.visible=!jt,qe.fov!==c&&(qe.fov=c,qe.updateProjectionMatrix()),qe.updateMatrixWorld();let h=t?qe.position:Mn.copy(qe.position).applyMatrix4(Wo);for(let f of Op)f.rotation.y=Math.atan2(h.x-f.position.x,h.z-f.position.z);let u=t?e.root.position:Jp;if(Jo.position.set(u.x,0,u.z),t&&Tu(u.z),Ip.visible=t||qe.position.y<2.92&&qe.position.x>-3.2&&qe.position.x<3.2&&qe.position.z>-3.08&&qe.position.z<2.48+Rr*qe.position.x,!t){for(let x of Zo){let m=x.userData.wall;x.visible=!(m===1&&qe.position.z<-2.57||m===2&&qe.position.x>3.21||m===3&&qe.position.x<-3.2||m===4&&qe.position.z>2.489+Rr*qe.position.x)}let f={};for(let[x,m]of Object.entries(wi)){let p=As[x];Mn.copy(p.userData.pinAt).project(qe);let y=(Mn.x*.5+.5)*i,M=(-Mn.y*.5+.5)*s;f[x]=[y,M],m.hidden=On||jt||Mn.z>1||Mn.z<-1||y<10||y>i-10||M<0||M>s-10}let d=f.pin,g=f.ocre;!wi.pin.hidden&&!wi.ocre.hidden&&Math.abs(d[0]-g[0])<(wi.pin.offsetWidth+wi.ocre.offsetWidth)/2+5&&Math.abs(d[1]-g[1])<35&&(d[1]<g[1]?d[1]-=36:g[1]-=36);for(let[x,[m,p]]of Object.entries(f))wi[x].style.left=Mt(m,34,i-34)+"px",wi[x].style.top=Mt(p,37,s-15)+"px"}}function sm(){let n=Is.getBoundingClientRect();if(!n.width||!n.height)return;let e=En.getSize(new fe);Math.abs(e.x-n.width)<.01&&Math.abs(e.y-n.height)<.01||(En.setSize(n.width,n.height,!1),qe.aspect=n.width/n.height,qe.updateProjectionMatrix(),ji(0),document.body.classList.contains("ready")&&En.render(li,qe))}new ResizeObserver(sm).observe(Is);function eS(n){let e=bt();if(ai()){Tp(n);return}On&&(Vt.x||Vt.y||lt.size)&&wc(!1),Ri!==null&&(Vt.x||Vt.y||lt.size)&&Qo();let t=Vt.x,i=-Vt.y;(lt.has("arrowup")||lt.has("w")||lt.has("z"))&&(i+=1),(lt.has("arrowdown")||lt.has("s"))&&(i-=1),(lt.has("arrowright")||lt.has("d"))&&(t+=1),(lt.has("arrowleft")||lt.has("a")||lt.has("q"))&&(t-=1);let s=Math.hypot(t,i),r=0,o=0;if(s>.04){wn&&Ls(),nn&&Sc(),bn=null;let l=Math.max(1,s);t/=l,i/=l;let c=Math.cos(ce.angle),h=Math.sin(ce.angle);r=t*c-i*h,o=-t*h-i*c,s=Math.min(1,s)}else if(bn){r=bn.x-e.root.position.x,o=bn.z-e.root.position.z;let l=Math.hypot(r,o);l<.12?bn=null:(r/=l,o/=l,s=1)}let a=!1;if(s>.04){let l=ot==="jardin"?1.58:1.02,c=l*n,h=e.root.position,u=h.x+r*c,f=h.z+o*c;Ci(h,u,f)?(h.x=u,h.z=f,a=!0):Math.abs(r)>.03&&Ci(h,u,h.z)?(h.x=u,a=!0):Math.abs(o)>.03&&Ci(h,h.x,f)?(h.z=f,a=!0):bn=null;let d=Math.atan2(r,o),g=Math.atan2(Math.sin(d-e.root.rotation.y),Math.cos(d-e.root.rotation.y));e.root.rotation.y+=g*Math.min(1,n*13),ce.follow=!0}if(ot==="salon"){let l=e.root.position,c=2.48944+Rr*l.x-l.z;c>1.05&&(ws&&jt&&a&&o<0&&tm(),ws=!1),!nn&&!ws&&c<.84&&(a&&o>.38&&Math.cos(ce.angle)<-.3||!a&&e.speed>.04)&&(ws=!0,em())}e.speed=$e(e.speed,a?s:0,Math.min(1,n*11)),e.speed<.015&&(e.speed=0),nn&&(e.sit=Math.min(1,e.sit+n*2.6)),Ds(e,e.speed,Mc,n*e.speed),vu&&Ri===null&&(B.mode!=="ready"||e.speed>.05)&&JM(n),B.mode!=="off"&&Tp(n)}function Us(){Vt.x=Vt.y=0,Vt.id=null,ne("thumb").style.transform="translate(0,0)"}var Cs=ne("pad");function rm(n){let e=Cs.getBoundingClientRect(),t=(n.clientX-e.left-e.width/2)/(e.width*.34),i=(n.clientY-e.top-e.height/2)/(e.height*.34),s=Math.max(1,Math.hypot(t,i));Vt.x=t/s,Vt.y=i/s,ne("thumb").style.transform="translate("+Vt.x*22+"px,"+Vt.y*22+"px)"}Cs.onpointerdown=n=>{n.preventDefault(),Vt.id=n.pointerId,Cs.setPointerCapture(n.pointerId),rm(n)};Cs.onpointermove=n=>{n.pointerId===Vt.id&&rm(n)};Cs.onpointerup=Cs.onpointercancel=Cs.onlostpointercapture=n=>{n.pointerId===Vt.id&&Us()};var Jn=new Map,cn=null,Fo=null,lc=0,om=()=>{let[n,e]=Jn.values();return Math.hypot(n.x-e.x,n.y-e.y)};Xt.addEventListener("pointerdown",n=>{n.button>0||(Ri!==null&&Qo(),Xt.focus(),Xt.setPointerCapture(n.pointerId),Jn.set(n.pointerId,{x:n.clientX,y:n.clientY}),Jn.size===2?(lc=om(),cn&&(cn.moved=!0)):cn={x:n.clientX,y:n.clientY,moved:!1})});Xt.addEventListener("pointermove",n=>{let e=Jn.get(n.pointerId);if(!e)return;let t=n.clientX-e.x,i=n.clientY-e.y;if(Jn.set(n.pointerId,{x:n.clientX,y:n.clientY}),Jn.size===2){let s=om();s>0&&lc>0&&(ce.radius=Mt(ce.radius*lc/s,1.7,5.8)),lc=s;return}cn&&!cn.moved&&Math.hypot(n.clientX-cn.x,n.clientY-cn.y)>5&&(cn.moved=!0),cn?.moved&&(jt?ws=!0:wn&&Ls(),ce.angle-=t*.007,ce.pitch=Mt(ce.pitch+i*.004,jt?-.62:-.06,jt?.68:.93))});var tS=new Dn(new P(0,1,0),0),Oo=new P;function nS(n){if(performance.now()<$p)return;let e=Xt.getBoundingClientRect();if(vp.set((n.clientX-e.left)/e.width*2-1,1-(n.clientY-e.top)/e.height*2),Mr.setFromCamera(vp,qe),ot==="salon"){let s=Mr.intersectObjects(xm,!1)[0];if(s&&(On||bt().root.position.distanceTo(s.point)<1.85)){Am(s.object.userData.book);return}if(On)return;let r=Mr.intersectObjects(Object.values(As),!1)[0];if(r){Iu(r.object.userData.bag);return}}else{if(B.mode!=="off")return;if(Mr.intersectObjects(Cp,!1).length&&bt().root.position.z>4.9){nm();return}}let t=performance.now(),i=Fo&&t-Fo.t<410&&Math.hypot(n.clientX-Fo.x,n.clientY-Fo.y)<22;if(Fo={t,x:n.clientX,y:n.clientY},!!i){if(ot==="salon"){let s=Mr.intersectObjects(Zo.filter(r=>r.visible),!1)[0];if(s){let r=fM.find(o=>Math.abs(s.point.x-o.pos[0])<.55&&Math.abs(s.point.z-o.pos[2])<(o.id==="sofa"?1.15:.52)&&s.point.y<1.3);if(r){QM(r);return}}}Mr.ray.intersectPlane(tS,Oo)&&Ko(Oo.x,Oo.z)&&(nn&&Sc(),bn={x:Oo.x,z:Oo.z})}}Xt.onpointerup=n=>{if(!Jn.has(n.pointerId))return;let e=Jn.size===1&&cn&&!cn.moved;Jn.delete(n.pointerId),e&&nS(n),cn=null};Xt.onpointercancel=n=>{Jn.delete(n.pointerId),cn=null};Xt.onwheel=n=>{n.preventDefault(),ce.radius=Mt(ce.radius*Math.exp(n.deltaY*.001),1.7,5.8)};Xt.addEventListener("wheel",n=>n.preventDefault(),{passive:!1});var iS=new Set(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d","z","q"]);window.addEventListener("keydown",n=>{if(n.target.closest?.("input,textarea,select,[contenteditable=true]")||document.querySelector("dialog[open]")||n.ctrlKey||n.metaKey||n.altKey)return;let e=n.key.toLowerCase();iS.has(e)?(n.preventDefault(),lt.add(e)):ot==="salon"&&!n.repeat&&["1","2"].includes(e)&&Iu(e==="1"?"pin":"ocre")});window.addEventListener("keyup",n=>lt.delete(n.key.toLowerCase()));window.addEventListener("blur",()=>{lt.clear(),Us(),Jn.clear(),cn=null});Es.addEventListener("close",()=>Xt.focus());document.addEventListener("visibilitychange",()=>{ac=performance.now(),document.hidden&&(lt.clear(),Us())});var ic=35,_p=0;function sS(n){if(!Number.isFinite(n)||n<=0||document.hidden||(ic=ic*.9+Math.min(220,n)*.1,++_p<20))return;_p=0;let e=En.getPixelRatio(),t=Math.min(1.5,devicePixelRatio||1),i=ic>59?Math.max(.74,e-.18):ic<24?Math.min(t,e+.09):e;Math.abs(e-i)>.035&&En.setPixelRatio(i)}var au=-1;function am(n){if(Kp)return;let e=ot==="jardin"?bt().root.position:{x:-1,z:-1};sn.position.set(e.x-3.6,7,e.z+4.8),sn.target.position.set(e.x,0,e.z),(n-au>145||au<0)&&(En.shadowMap.needsUpdate=!0,au=n),sS(n-ac);let t=Math.min(.065,Math.max(0,(n-ac)/1e3));ac=n,!Es.open&&!Ji.open&&(eS(t),YM(t)),ji(t),dS(),En.render(li,qe),Au=requestAnimationFrame(am)}Xt.addEventListener("webglcontextlost",n=>{n.preventDefault(),Kp=!0,cancelAnimationFrame(Au),window.failure("Le navigateur a interrompu la 3D.")});var Sr=!1,Ho=!0,wr=null,Rs="local",Ar=!1,zo=0,Tr=null,du={f:{id:"199",name:"Jean-Michel"},m:{id:"75",name:"C\xE9line"}},lu=new Map,Er={me:"",them:""},qo={me:ne("myBubble"),them:ne("theirBubble")},Kt=ne("words"),rS=ne("chatPanel"),Pu=ne("send"),lm="le-depart-duo-dialogue-2",pc={};try{pc=JSON.parse(localStorage.getItem(lm)||"{}")||{}}catch{}var cm={expectedInputs:[{type:"text",languages:["fr"]}],expectedOutputs:[{type:"text",languages:["fr"]}]},oS={75:"\xC0 Metz, quand je pars trois jours, les gar\xE7ons me demandent combien \xE7a fait de dodos. Je sais expliquer mon absence dans leur unit\xE9 de mesure. Pour la dire dans la mienne, j\u2019ai eu plus de mal. Je suis partie avec Floriane. On a pli\xE9 nos affaires, on a v\xE9rifi\xE9 les lacets, j\u2019ai pens\xE9 aux enfants jusqu\u2019\xE0 la gare et puis, dans le train, j\u2019ai dormi comme une morte. J\u2019en avais presque oubli\xE9 ce que \xE7a fait de s\u2019\xE9veiller sans que personne attende qu\u2019on lui pr\xE9pare quelque chose. Avec mes fils j\u2019ai appris \xE0 marcher en tenant une capuche d\u2019une main et un go\xFBter de l\u2019autre. Sur le chemin, mes bras tout \xE0 coup disponibles balancent beaucoup. J\u2019ai le visage qui prend vite le soleil et une voix qui descend d\u2019un ton quand je parle de leur p\xE8re. Si je dis \xAB attends \xBB, j\u2019ai souvent besoin de deux pas de plus avant de continuer. \xC0 Saint-S\xE9bastien, on a du pain de ma\xEFs, du fromage et du jambon. Thomas nous pr\xE9sente Ahmed. Je coupe le pain sur mon genou. J\u2019ai le joli r\xF4le ce soir-l\xE0, celle qui partage, qui a de bonnes choses dans son sac. Le lendemain, apr\xE8s avoir mal dormi, il faut qu\u2019on attende pendant que quelqu\u2019un cherche des feuilles \xE0 rouler. Je sens tr\xE8s bien que ma figure change. On peut conna\xEEtre les deux C\xE9line pour le prix d\u2019une \xE9tape. Mes fils les connaissent depuis longtemps. Leur p\xE8re est pompier. En racontant ma s\xE9paration, j\u2019ai pris l\u2019habitude de commencer par l\xE0. Les gens imaginent tout de suite quelqu\u2019un \xE0 qui ils ouvriraient la porte dans une mauvaise nuit. Je l\u2019aurais ouverte, moi aussi. J\u2019ai aim\xE9 cet homme. Mais \xE0 la maison, quand je posais mon sac, il restait encore \xE0 entendre ce que j\u2019aurais d\xFB faire autrement. Le plus fatigant, c\u2019\xE9tait de finir par lui r\xE9pondre dans ma t\xEAte avant m\xEAme de rentrer. Sur le chemin, je peux dire les deux choses \xE0 quelqu\u2019un qui ne conna\xEEt ni le p\xE8re des petits ni ma cuisine. Je parle en regardant mes pieds. \xC0 c\xF4t\xE9, les pas continuent. Je vais jusqu\u2019au bout de ce que je voulais dire. Le soir, je cherche comment raconter la journ\xE9e aux gar\xE7ons. Je leur parlerai du type qui a laiss\xE9 sa camionnette pour venir marcher avec nous. Ce que j\u2019ai dit \xE0 Ahmed, je le garde pour moi. J\u2019ai trouv\xE9 un homme devant qui je pouvais prononcer le pr\xE9n",199:"Une nuit de halte finit souvent par une conversation sur les \xE9tapes. Moi je les demande d\xE8s l\u2019arriv\xE9e. Je me d\xE9chausse lentement tout en \xE9coutant, les chaussettes marqu\xE9es aux talons. Il para\xEEt que je pose mes questions comme des pi\xE8ges. Quand l\u2019homme a r\xE9pondu, j\u2019ai tout \xE0 coup tr\xE8s envie de lui parler du littoral. Il pourrait avec raison me faire un peu attendre. J\u2019ai mon guide dans une pochette \xE0 fermeture, \xE0 l\u2019abri des intemp\xE9ries et des avis contraires. C\u2019est bien pratique, sauf quand je rencontre quelqu\u2019un qui pourrait m\u2019apprendre un chemin que mon guide ignore."},aS=["tectonique-des-ames.com","www.tectonique-des-ames.com","tectonique-des-ames.netlify.app","tectonic-d-am.com","www.tectonic-d-am.com"];location.protocol==="https:"&&aS.includes(location.hostname)&&ne("chatMode").add(new Option("Personnage du livre \xB7 IA en ligne","livre"));window.LanguageModel?.availability&&window.LanguageModel.availability(cm).then(n=>{n==="available"&&ne("chatMode").add(new Option("Personnage du livre \xB7 IA de l\u2019appareil","native"))}).catch(()=>{});function hm(){ne("chatMode").hidden=ne("chatMode").options.length<2,ne("modeLabel").hidden=!ne("chatMode").hidden}hm();new MutationObserver(hm).observe(ne("chatMode"),{childList:!0});function jo(){let n=Cn+"-"+Rs;if(!lu.has(n)){let e=pc[n];lu.set(n,Array.isArray(e)?e.filter(t=>typeof t?.q=="string"&&typeof t?.a=="string").slice(-18):[])}return lu.get(n)}function lS(){pc[Cn+"-"+Rs]=jo().slice(-18);try{localStorage.setItem(lm,JSON.stringify(pc))}catch{}}function cc(){return Rs!=="local"?du[Cn].name:Cn==="f"?"Ton compagnon":"Ta compagne"}function bc(){ne("speaker").textContent=cc(),qo.them.querySelector("b").textContent=cc();let n=ne("talkHistory");n.replaceChildren();for(let e of jo())for(let[t,i]of[["Toi",e.q],[cc(),e.a]]){let s=document.createElement("p"),r=document.createElement("b");r.textContent=t+" \xB7 ",s.append(r,document.createTextNode(i)),n.append(s)}n.scrollTop=n.scrollHeight,Pu.disabled=Ar||!Kt.value.trim()}function Cr(n,e){Er[n]=e,qo[n].querySelector("span").textContent=e,qo[n].hidden=!Ho||!e}function um(){let n=jo().at(-1);Cr("me",n?.q||""),Cr("them",n?.a||""),bc()}function fm(){Sr=!Sr,rS.hidden=!Sr,ne("talk").setAttribute("aria-expanded",String(Sr)),lt.clear(),Us(),Fu(),Sr?(bc(),Kt.focus({preventScroll:!0})):(Du(),Kt.blur(),Xt.focus({preventScroll:!0}))}function Du(){if(wr)try{wr.stop()}catch{}}function cS(n){return n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g," ")}var hS={greet:["Je suis l\xE0. On prend une minute ici ou tu as d\xE9j\xE0 envie de marcher ?","Salut ! J\u2019ai gard\xE9 une place pr\xE8s de moi. Comment tu arrives aujourd\u2019hui ?"],wing:["Tu as vu celui qui a tourn\xE9 pr\xE8s de ton \xE9paule ? Si on ralentit, on le voit repartir vers les fleurs.","Regarde le groupe pr\xE8s des herbes. De loin, on dirait des p\xE9tales. Puis ils changent tous de direction."],pack:["La sangle passe sur le haut de l\u2019\xE9paule. Tu veux qu\u2019on s\u2019arr\xEAte le temps de r\xE9gler la tienne ?","Je sens surtout le poids quand je repars. Apr\xE8s quelques pas, je trouve mon rythme. Et toi ?"],home:["Retourne-toi avec moi. D\u2019ici, on reconna\xEEt la terrasse et les grandes baies. Tu voudrais d\xE9j\xE0 rentrer ?","Je garderais bien cette maison comme point de retour. \xC7a change ma fa\xE7on de partir."],salon:["On peut rester ici un moment. Tu pr\xE9f\xE8res le canap\xE9 ou le fauteuil ?","J\u2019aime bien ce moment juste avant de prendre les sacs. \xC0 quoi tu penses ?"],garden:["Prenons le temps. Au bord du gravier, on voit mieux les petites fleurs entre les feuilles.","L\u2019all\xE9e reste d\xE9gag\xE9e. Si tu t\u2019arr\xEAtes pr\xE8s des massifs, je m\u2019arr\xEAte avec toi."],walk:["Je te suis. Choisis ton allure, on peut continuer \xE0 parler en marchant.","Allons jusqu\u2019\xE0 l\u2019arche. On d\xE9cidera de la suite une fois de l\u2019autre c\xF4t\xE9."],tired:["On peut ralentir. Tu pr\xE9f\xE8res faire une pause ici ou retrouver le canap\xE9 ?","Arr\xEAtons-nous un instant. Qu\u2019est-ce qui te p\xE8se le plus aujourd\u2019hui ?"],feeling:["Je t\u2019\xE9coute. Tu veux me raconter ce qui s\u2019est pass\xE9 ?","On a du temps devant nous. Quel moment te revient quand tu dis \xE7a ?"],joy:["\xC7a me fait sourire de t\u2019entendre dire \xE7a. Qu\u2019est-ce qui t\u2019a fait le plus plaisir ?","Gardons ce moment. Tu aimerais t\u2019en souvenir comment ?"],silence:["D\u2019accord. Je marche avec toi.","On peut regarder autour de nous un moment."],yes:["D\u2019accord. Je reste avec toi.","Allons-y \xE0 ton rythme."],no:["D\u2019accord. Qu\u2019est-ce qui te conviendrait mieux ?","Je t\u2019\xE9coute. On peut aussi changer de sujet."],thanks:["Avec plaisir. \xC7a me pla\xEEt de faire un bout de chemin avec toi.","Merci \xE0 toi de m\u2019avoir invit\xE9 \xE0 marcher."],name:["Ici, je suis ton compagnon de marche. Et toi, comment aimerais-tu que je t\u2019appelle ?","Tu peux m\u2019appeler comme tu veux pour cette promenade."],free:["Qu\u2019est-ce qui te fait dire \xE7a ?","Tu veux me raconter un moment pr\xE9cis auquel tu penses ?","Je t\u2019\xE9coute. Qu\u2019est-ce qui compte le plus pour toi l\xE0-dedans ?"]};function uS(n){let e=cS(n),t=jo(),i=t.at(-1),s=i?.topic,r=n.match(/(?:je m[’']appelle|mon prénom est|appelle[- ]moi)\s+([\p{L}-]{2,24})/iu);if(r)return{a:"Enchant\xE9"+(Cn==="m"?"e":"")+", "+r[1]+". O\xF9 voudrais-tu aller ensemble ?",topic:"nom",name:r[1]};if(/mon (pre)?nom|je m appelle comment|comment je m appelle/.test(e)){let h=t.slice().reverse().find(u=>u.name);if(h)return{a:"Tu m\u2019as dit que tu t\u2019appelles "+h.name+".",topic:"nom"}}if(/de quoi (on|nous)|on parlait|tu te souviens/.test(e)&&i)return{a:"Juste avant, tu m\u2019as dit \xAB "+i.q.slice(0,130)+" \xBB. Tu veux qu\u2019on reprenne l\xE0 ?",topic:s};let o=/papillon|aile|blanc|envol/.test(e)?"wing":/bretelle|sangle|sac |sacs|poids du sac/.test(e)?"pack":/maison|terrasse|rentrer|demeure/.test(e)?ot==="salon"?"salon":"home":/fleur|jardin|arbre|plante|herbe|vegetation/.test(e)?"garden":/salon|assis|canape|fauteuil/.test(e)?"salon":/fatigu|epuis|besoin de souffler/.test(e)?"tired":/trist|peur|inquiet|seul|malheureu/.test(e)?"feeling":/heureu|content|joyeu|aime|souri/.test(e)?"joy":/silence|tais.toi/.test(e)?"silence":/chemin|march|partir|arche|dehors|suivre/.test(e)?"walk":/ton nom|tu t appelles|qui es.tu/.test(e)?"name":/merci/.test(e)?"thanks":/^(bonjour|coucou|salut|bonsoir)/.test(e)?"greet":/^(oui|ouais|ok|volontiers)\b/.test(e)?"yes":/^non\b/.test(e)?"no":"free";if(s==="tired"&&o==="yes")return{a:"Alors faisons une pause. Je reste l\xE0, et on reprend quand tu veux.",topic:o};if(s==="wing"&&o==="yes")return{a:"L\xE0, \xE0 c\xF4t\xE9 du chemin. Tu le vois se poser puis reprendre son vol ?",topic:"wing"};let a=hS[o],l=t.filter(h=>h.topic===o).length,c=a[l%a.length];return o==="wing"&&ot==="salon"&&(c="Approche-toi de la baie vitr\xE9e. Tu vois les papillons blancs au-dessus de l\u2019all\xE9e ?"),o==="home"&&ot==="jardin"&&bt().root.position.z<-35&&(c="Nous avons d\xE9j\xE0 avanc\xE9. La maison est derri\xE8re nous, au bout de l\u2019all\xE9e."),o==="walk"&&ot==="salon"&&(c="Prends le sac qui te convient. Je viens avec toi et on reprend cette conversation dehors."),o==="salon"&&ot==="jardin"&&(c="Le canap\xE9 est rest\xE9 au salon. On peut y retourner ensemble si tu veux."),o==="name"&&Cn==="m"&&(c=c.replace("ton compagnon","ta compagne")),{a:c,topic:o}}async function fS(n){n.preventDefault();let e=Kt.value.trim().slice(0,1600);if(!e||Ar)return;let t=++zo,i=jo();Ar=!0,Kt.value="",Pu.disabled=!0,Cr("me",e),Cr("them",""),ne("chatState").textContent=Rs==="livre"?"R\xE9ponse du personnage\u2026":"";let s;try{if(Rs==="livre"){Tr=new AbortController;let r=setTimeout(()=>Tr?.abort(),18e3);try{let o=await fetch("https://ahmed-marie-double.meguiniahmed16.workers.dev/personnages/"+du[Cn].id+"/chat",{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json"},signal:Tr.signal,body:JSON.stringify({message:e,history:i.slice(-8).map(l=>({question:l.q,answer:l.a}))})});if(!o.ok)throw Error();let a=await o.json();if(typeof a.answer!="string"||!a.answer.trim())throw Error();s={a:a.answer.trim(),topic:"livre"}}finally{clearTimeout(r)}}else if(Rs==="native"){let r=du[Cn],o="Tu improvises en fran\xE7ais une conversation avec le lecteur, dans le r\xF4le de "+r.name+". R\xE9ponds naturellement en une ou deux phrases. Le duo se trouve dans "+(ot==="jardin"?"le jardin parmi les papillons blancs":"le salon avant la promenade")+". Appuie-toi sur ces \xE9l\xE9ments de personnage : "+oS[r.id],a=await window.LanguageModel.create({...cm,initialPrompts:[{role:"system",content:o},...i.slice(-5).flatMap(l=>[{role:"user",content:l.q},{role:"assistant",content:l.a}])]});try{if(s={a:(await a.prompt(e)).trim(),topic:"livre"},!s.a)throw Error()}finally{a.destroy()}}else s=uS(e),await new Promise(r=>setTimeout(r,260));if(t!==zo)return;i.push({q:e,...s}),lS(),Cr("them",s.a),ne("chatState").textContent="",ne("notice").textContent=cc()+" dit : "+s.a}catch{t===zo&&(Kt.value=e,ne("chatState").textContent="La r\xE9ponse de l\u2019IA est indisponible. R\xE9essaie ou choisis le dialogue local.")}finally{t===zo&&(Tr=null,Ar=!1,bc())}}function dm(){zo++,Tr?.abort(),Tr=null,Ar=!1,ne("chatState").textContent="",Kt.value="",Du(),um()}ne("talk").onclick=fm;ne("chatClose").onclick=fm;ne("chatForm").onsubmit=fS;Kt.oninput=()=>{Pu.disabled=Ar||!Kt.value.trim()};ne("chatMode").onchange=n=>{Rs=n.target.value,dm(),Kt.focus()};ne("bubbleSwitch").onclick=()=>{Ho=!Ho,ne("bubbleSwitch").setAttribute("aria-pressed",String(Ho));for(let n in Er)Cr(n,Er[n])};ne("past").onclick=()=>{let n=ne("historyPane");n.hidden=!n.hidden,ne("past").setAttribute("aria-expanded",String(!n.hidden)),bc()};var yp=window.SpeechRecognition||window.webkitSpeechRecognition;yp&&(ne("dictate").hidden=!1,ne("dictate").onclick=()=>{if(wr){Du();return}try{let n=wr=new yp;n.lang="fr-FR",n.interimResults=!1,n.continuous=!1,n.onresult=e=>{let t=e.results[e.results.length-1][0].transcript;Kt.setRangeText(t+" ",Kt.selectionStart,Kt.selectionEnd,"end"),Kt.oninput(),Kt.focus()},n.onend=()=>{wr=null,ne("dictate").setAttribute("aria-pressed","false")},n.onerror=()=>{ne("chatState").textContent="La dict\xE9e du navigateur est indisponible. Tu peux utiliser le micro du clavier."},n.start(),ne("dictate").setAttribute("aria-pressed","true")}catch{wr=null,Kt.focus()}});function dS(){if(!Ho||!Er.me&&!Er.them)return;if(On){for(let s of Object.values(qo))s.hidden=!0;return}let n=Is.clientWidth,e=Is.clientHeight,t={};for(let[s,r]of[["me",bt()],["them",es()]]){let o=qo[s];if(!Er[s]){o.hidden=!0;continue}let a=r.root.position;ai()&&r.angel?(r.angel.load.updateWorldMatrix(!0,!1),Mn.set(0,1.74,0).applyMatrix4(r.angel.load.matrixWorld)):Mn.set(a.x,a.y+(r.sit>.3?1.2:1.65)*r.root.scale.y+.1,a.z),Mn.project(qe);let l=(Mn.x*.5+.5)*n,c=(-Mn.y*.5+.5)*e;if(Mn.z>1||Mn.z<0||l<-40||l>n+40){o.hidden=!0;continue}o.hidden=!1,t[s]={x:l,y:c,n:o}}let i=t.me&&t.them;for(let[s,{n:r,x:o,y:a}]of Object.entries(t)){let l=r.offsetWidth,c=r.offsetHeight,h=t[s==="me"?"them":"me"],u=i?o===h.x?s==="me":o<h.x:o<n/2,f=u?o-l+10:o-10;i&&(f=u?Math.min(f,n/2-l-4):Math.max(f,n/2+4)),r.style.left=Mt(f,5,Math.max(5,n-l-5))+"px",r.style.top=Mt(a-c-14,7,Math.max(7,e-c-55))+"px"}}var $t=new St;$t.position.set(.56,0,-2.35);$n.add($t);var Lu=[["La Sainte Bible","Ancien et Nouveau Testament","#354638","La Bible r\xE9unit les livres de l\u2019Ancien et du Nouveau Testament."],["Les quatre \xC9vangiles","Matthieu \u2022 Marc \u2022 Luc \u2022 Jean","#7a3d35","Quatre r\xE9cits de la vie, de la Passion et de la R\xE9surrection du Christ."],["Magnifica Humanitas","L\xE9on XIV","#41566a","Lettre encyclique du 15 mai 2026 sur la protection de la personne humaine \xE0 l\u2019\xE8re de l\u2019intelligence artificielle."],["Les Contemplations","Victor Hugo","#57445c","Un recueil de po\xE8mes sur le souvenir, le deuil et la vie int\xE9rieure."],["Les Fleurs du mal","Charles Baudelaire","#5b443c","Baudelaire y fait dialoguer la beaut\xE9, la ville et le spleen."],["Apologie de Socrate","Platon","#455765","Platon pr\xEAte la parole \xE0 Socrate au moment o\xF9 celui-ci se d\xE9fend devant ses juges."],["Le Monde comme volont\xE9 et comme repr\xE9sentation","Arthur Schopenhauer","#3d4945","Schopenhauer y interroge le d\xE9sir, la souffrance et la contemplation."],["Manuel","\xC9pict\xE8te","#7b6249","Un texte sto\xEFcien sur ce qui d\xE9pend de nous et sur ce qui nous \xE9chappe."],["Pens\xE9es pour moi-m\xEAme","Marc Aur\xE8le","#4e5f4a","Des notes que Marc Aur\xE8le s\u2019adresse \xE0 lui-m\xEAme pour exercer son jugement."],["Lettres \xE0 Lucilius","S\xE9n\xE8que","#78504a","Des lettres sur l\u2019amiti\xE9, la libert\xE9 int\xE9rieure et l\u2019usage du temps."]],pS="https://www.vatican.va/content/leo-xiv/fr/encyclicals/documents/20260515-magnifica-humanitas.html",Bo=it(6637618),mS=it(9529411),pu=new It({color:12493162,metalness:.44,roughness:.49}),gS=it(14733229),mu=it(15261386),Mp=it(13147509),xS=it(6440505),cu=it(5864851),vS=it(14933455),_S=new ds(1,16,12);function Sn(n,e,t,i,s,r,o,a){let l=nt(_S,a,n,e,t,i);return l.scale.set(s,r,o),l}function Yo(n,e,t,i){let s=new St;return s.position.set(e,t,i),n.add(s),s}function Ts(n,e,t,i,s,r){let o=new P(...e),a=new P(...t),l=o.clone().lerp(a,.5),c=a.sub(o),h=nt(new Gi(s,i,c.length(),12),r,n,...l.toArray());return h.quaternion.setFromUnitVectors(new P(0,1,0),c.normalize()),h}function pm(n,e,t,i=10){let s=[],r=[];for(let[l,c,h,u,f=0,d=0]of e)for(let g=0;g<48;g++){let x=g/48*Dt,m=1+u*(Math.sin(i*x+.4*l)+.26*Math.sin(3*x+l));s.push(f+c*m*Math.cos(x),l,d+h*m*Math.sin(x))}for(let l=1;l<e.length;l++)for(let c=0;c<48;c++){let h=(l-1)*48+c,u=(l-1)*48+(c+1)%48;r.push(h,h+48,u,u,h+48,u+48)}let a=new pt;return a.setAttribute("position",gt(new Float32Array(s),3)),a.setIndex(r),a.computeVertexNormals(),t.side=rt,nt(a,t,n)}function mm(n,e,t,i,s,r,o,a=!1){let l=Yo(n,e,t,i);l.scale.setScalar(s),l.rotation.x=.13,Sn(l,0,0,0,.073,.09,.066,r),Sn(l,0,-.006,.062,.012,.023,.013,r);for(let c of[-1,1])Sn(l,c*.027,.013,.061,.013,.0029,.003,o).rotation.z=c*.11;if(Sn(l,.003,-.034,.062,.014,.0026,.003,o),a){Sn(l,0,.048,-.005,.078,.059,.065,o),Sn(l,0,-.052,.019,.058,.048,.047,o);for(let c of[-1,1])Sn(l,c*.063,-.005,-.01,.022,.093,.049,o)}return l}function yS(){let n=Yo($t,-.69,.828,.015);n.rotation.y=.12;let e=it(14668472),t=nt(new Gi(.145,.16,.045,32),e,n,0,.023,0);nt(new Gi(.125,.142,.035,32),pu,n,0,.055,0),pm(n,[[.072,.139,.086,.065],[.12,.151,.087,.08],[.32,.105,.064,.1],[.45,.074,.059,.08],[.49,.111,.054,.04],[.55,.062,.04,.03]],mu,11);let i=[],s=[],r=42;for(let[d,g,x,m]of[[.08,.166,.1,.62],[.21,.136,.09,.59],[.42,.111,.076,.42],[.49,.131,.069,.32],[.56,.075,.06,.21]])for(let p=0;p<=r;p++){let y=Math.PI/2+m+(Dt-m*2)*p/r,M=1+.062*Math.cos(y*11-d*3);i.push(g*M*Math.cos(y),d+.009*Math.sin(y*4),x*M*Math.sin(y))}for(let d=0;d<4;d++)for(let g=0;g<r;g++){let x=d*(r+1)+g;s.push(x,x+r+1,x+1,x+1,x+r+1,x+r+2)}let o=new pt;o.setAttribute("position",gt(new Float32Array(i),3)),o.setIndex(s),o.computeVertexNormals(),cu.side=rt,nt(o,cu,n);let a=mm(n,0,.596,.015,.86,Mp,xS);a.rotation.z=-.095;let l=it(7901092);l.side=rt;let c=[],h=[];for(let d=0;d<22;d++){let g=d/21,x=.025+g*1.73,m=.2+.56*g;for(let p=0;p<=32;p++){let y=Math.PI/2+m+(Dt-2*m)*p/32;c.push(.083*Math.sin(x)*Math.cos(y),.597+.095*Math.cos(x),.013+.084*Math.sin(x)*Math.sin(y))}}for(let d=0;d<21;d++)for(let g=0;g<32;g++){let x=d*33+g;h.push(x,x+33,x+1,x+1,x+33,x+34)}let u=new pt;u.setAttribute("position",gt(new Float32Array(c),3)),u.setIndex(h),u.computeVertexNormals(),nt(u,l,n);for(let d of[-1,1])Sn(n,d*.073,.555,.018,.027,.087,.042,vS).rotation.z=-d*.16,Ts(n,[d*.106,.49,0],[d*.094,.385,.06],.04,.038,cu),Ts(n,[d*.094,.385,.06],[d*.023,.462,.111],.036,.023,mu),Sn(n,d*.013,.481,.117,.012,.036,.015,Mp).rotation.z=d*.2;let f=nt(new _o(.112,.0033,6,56),pu,n,0,.605,-.055);f.rotation.x=.1}function MS(){let n=Yo($t,.02,1.75,-.155),e=it(5323565),t=it(11635555),i=it(7098428);ln(n,0,0,.014,.069,.94,.045,e),ln(n,0,.193,.016,.6,.065,.047,e);let s=Yo(n,0,.003,.068);Sn(s,0,.075,0,.077,.103,.036,t),Sn(s,0,-.034,.003,.051,.095,.029,t);for(let a of[-1,1])Ts(s,[a*.054,.13,.002],[a*.155,.148,.011],.027,.017,t),Ts(s,[a*.155,.148,.011],[a*.247,.191,.006],.02,.011,t),Sn(s,a*.258,.193,.008,.021,.012,.014,t),Ts(s,[a*.032,-.118,0],[a*.035,-.21,.017],.034,.021,t),Ts(s,[a*.035,-.21,.017],[a*.009,-.348,.006],.023,.012,t),Sn(s,a*.008,-.347,.018,.015,.015,.029,t);pm(s,[[-.151,.058,.034,.12],[-.112,.066,.042,.09],[-.073,.056,.035,.07]],mu,7);let r=mm(s,.014,.177,.019,.61,t,i,!0);r.rotation.z=-.37,r.rotation.x=.39;let o=gm("INRI","","#d4c09a",!0);nt(new an(.1,.042),o,n,0,.363,.04)}function gm(n,e,t,i=!1){let s=document.createElement("canvas");s.width=384,s.height=i?146:512;let r=s.getContext("2d"),o=s.width,a=s.height;if(r.fillStyle=t,r.fillRect(0,0,o,a),i)r.textAlign="center",r.textBaseline="middle",r.fillStyle="#40352a",r.font="bold 88px Georgia",r.fillText(n,o/2,a/2);else{r.strokeStyle="#c8ae79",r.lineWidth=3,r.strokeRect(17,18,o-34,a-36),r.lineWidth=1,r.strokeRect(24,26,o-48,a-52),r.textAlign="center",r.fillStyle="#f2e6c1";let c=n.split(" ");r.font="bold 39px Georgia";let h=[],u="";for(let f of c)u&&r.measureText(u+" "+f).width>o-72?(h.push(u),u=f):u=u?u+" "+f:f;h.push(u),h.forEach((f,d)=>r.fillText(f,o/2,a*.44+(d-(h.length-1)/2)*47,o-58)),r.fillRect(o/2-28,a*.67,56,2),r.font="24px Georgia",r.fillText(e,o/2,a*.78,o-54)}let l=new vi(s);return l.colorSpace=Ut,l.anisotropy=4,new It({map:l,roughness:.83})}var xm=[];function SS(){ln($t,0,.805,0,2.02,.048,.35,Bo),ln($t,0,.775,0,2.02-.026,.02,.326,mS),ln($t,0,.187,0,2.02-.07,.045,.3,Bo),ln($t,0,.435,-.116,2.02-.09,.48,.026,Bo);for(let s of[-1,1]){ln($t,s*.954,.448,0,.048,.69,.275,Bo);for(let r of[-.09,.09])Ts($t,[s*.954,.033,r],[s*.954,.17,r],.021,.031,Bo),nt(new Gi(.023,.02,.032,12),pu,$t,s*.954,.028,r)}for(let[s,[r,o,a]]of Lu.entries()){let l=s<3,c=l?-.25+.39*s:-.755+(s-3)*.239,h=l?s===0?.365:.327:.325+s%3*.021,u=l?.262:.197,f=s===0?.066:.046,d=Yo($t,c,l?.836:.216,l?.026:.055);d.rotation.x=l?-.16:-.065,d.rotation.z=l?0:(s%3-1)*.025;let g=it(new Le(a));ln(d,0,h*.5,0,u-.012,h-.013,f,gS);for(let m of[-1,1])ln(d,0,h*.5,m*(f*.5+.003),u,h,.006,g);ln(d,-u*.49,h*.5,0,.012,h,f+.012,g);let x=nt(new an(u-.006,h-.005),gm(r,o,a),d,0,h/2,f/2+.0066);x.userData.book=s,xm.push(x)}yS(),MS(),$t.updateWorldMatrix(!0,!0);let e=$t.matrixWorld.clone().invert(),t=new Map,i=[];$t.traverse(s=>{if(!s.isMesh||s.userData.book!==void 0)return;let r=s.geometry,o=r.index?r.toNonIndexed():r.clone();o.applyMatrix4(new Ze().multiplyMatrices(e,s.matrixWorld));for(let a of Object.keys(o.attributes))a!=="normal"&&a!=="position"&&a!=="uv"&&o.deleteAttribute(a);o.attributes.uv||o.setAttribute("uv",gt(new Float32Array(o.attributes.position.count*2),2)),t.has(s.material)||t.set(s.material,[]),t.get(s.material).push(o),i.push(s)});for(let s of i)s.removeFromParent();for(let[s,r]of t){let o=$d(r),a=nt(o,s,$t);a.receiveShadow=!0;for(let l of r)l.dispose()}}SS();function TnWing(value){const t=Mt(value,0,1);return t*t*(3-2*t)}
function Sp(n){let e=[],t=[],i=[],s=[],r=[];function o(x,m,p,y){
let M=Math.max(0,x), v=M<.54?0:M<.97?1:2;
let start=[.20,.54,.97],end=[.54,.97,1.55];
let E=TnWing((M-start[v])/(end[v]-start[v])),A=new Le(y);return e.push(x*n,m,p),t.push(A.r,A.g,A.b),s.push(v,v+1,0,0),r.push(1-E,E,0,0),e.length/3-1}function a(x,m,p){n>0?i.push(x,m,p):i.push(x,p,m)}let l=n<0?"l":"r",c=Ai("wings/"+l+"p",Int16Array),h=Ai("wings/"+l+"i",Uint16Array);for(let x=0;x<c.length;x+=3){let m=Mt((Math.abs(c[x])*1e-4-.055)/.92,0,1),p=c[x+1]*1e-4-1.28;o(m*.99,.025+Math.sin(m*2.1)*.37+p*.74,(c[x+2]*1e-4+.1)*.62-m*.18,15328729)}for(let x=0;x<h.length;x+=3)i.push(h[x],h[x+1],h[x+2]);let u=[16775913,16117724,16184555,15130833,15329507],f=16643807;function d(x,m,p,y,M){let v=m[0]-x[0],E=m[1]-x[1],A=Math.hypot(v,E),I=-E/A,D=v/A,b=17,S=[-1,-.52,-.055,0,.055,.54,1],C=e.length/3;for(let U=0;U<=b;U++){let z=U/b,H=Math.sin(z*Math.PI),X=p*(.016+Math.pow(H,.69))*(1-.16*z),V=$e(x[0],m[0],z)+I*H*.045,Q=$e(x[1],m[1],z)+D*H*.045;for(let k=0;k<S.length;k++){let se=S[k],ge=se<0?.83:1.08,Me=U>6&&U<15&&(U+y*7)%7===0&&Math.abs(se)>.94?.74:1,Ne=se*X*ge*Me,Qe=k===3?f:k===0||k===6?M===0?12894389:14209991:u[(y+M+(k===1?2:0))%u.length];if(o(V+I*Ne,Q+D*Ne,$e(x[2],m[2],z)-H*.072+se*se*X*.32-(k===3?.01:0),Qe),U&&k){let Oe=C+U*S.length+k;a(Oe-S.length-1,Oe-S.length,Oe),a(Oe-S.length-1,Oe,Oe-1)}}}}for(let x=0;x<11;x++){let m=x/10;d([.69-.39*m,.38-.17*m,-.24+.13*m],[1.68-.86*m,.67-.99*m,-.44-.095*Math.sin(Math.PI*m)],.071+x*.0025,x,0)}for(let x=0;x<9;x++){let m=x/8;d([.55*(1-m)+.04,.3*(1-m)+.07,-.21+.12*m],[.82*(1-m)+.22*m,-.32-.12*Math.sin(Math.PI*m),-.39+.15*m],.087,x,1)}for(let x=0;x<2;x++)for(let m=0;m<13;m++){let p=m/12,y=p*.86,M=.045+Math.sin(p*1.6)*.4,v=x?.22:.36;d([y,M,-.14-y*.23-x*.028],[y+v*(.28+p*1.1),M-v*(.95-.7*p),-.23-y*.24-x*.034],x?.061:.075,m,x+2)}let g=new pt;return g.setAttribute("position",gt(new Float32Array(e),3)),g.setAttribute("color",gt(new Float32Array(t),3)),g.setAttribute("skinIndex",new us(s,4)),g.setAttribute("skinWeight",new ht(r,4)),g.setIndex(i),g.computeVertexNormals(),g.computeBoundingSphere(),g}var bS=new It({vertexColors:!0,side:rt,roughness:.86,metalness:.009,emissive:15264998,emissiveIntensity:.16}),wS=[Sp(-1),Sp(1)];function TS(n){if(n.angel)return n.angel;prepareAirPose(n);let e=new St,t=new St;e.rotation.order="YXZ",e.position.y=.97,t.position.y=-.97,n.root.add(e),e.add(t),t.add(n.body,n.harness.h);let i=[];for(let[s,r]of[-1,1].entries()){let o=new io(wS[s],bS),a=new Vi,l=new Vi,c=new Vi,tip=new Vi;o.position.set(r*.117,n.id==="f"?1.29:1.31,-.088),a.rotation.order=l.rotation.order=c.rotation.order=tip.rotation.order="YXZ",l.position.set(r*.4,.2,-.08),c.position.set(r*.43,.15,-.095),tip.position.set(r*.37,.08,-.10),a.add(l),l.add(c),c.add(tip),o.add(a),o.updateMatrixWorld(!0),o.bind(new ro([a,l,c,tip])),t.add(o),o.frustumCulled=!1,o.castShadow=!0,i.push({wing:o,side:r,shoulder:a,elbow:l,wrist:c,tip})}return n.angel={pivot:e,load:t,wings:i,phase:0}}
// Eight equally spaced samples of a complete beat, starting midway through recovery.
// A positive sweep carries the outer wing behind the back. Pitch lets air pass on recovery.
const wingTracks = {
  shoulder: [8,35,48,39,8,-42,-62,-32],
  elbow:    [-10,-19,-8,5,12,6,-5,-12],
  wrist:    [-13,-22,-15,-6,6,13,6,-5],
  tip:      [-8,-12,-16,-12,0,12,14,6],
  fold:     [28,34,21,5,1,4,13,23],
  sweep:    [19,32,27,12,3,6,13,21],
  twist:    [16,26,27,10,-5,-12,-3,9]
};
function wingSample(track,phase){
  const position=((phase/Dt)%1+1)%1*8;
  const index=Math.floor(position)%8, mix=position-Math.floor(position);
  const prev=track[(index+7)%8], from=track[index], to=track[(index+1)%8], next=track[(index+2)%8];
  const tangent=(a,b)=>a*b>0?2*a*b/(a+b):0;
  const m0=tangent(from-prev,to-from), m1=tangent(to-from,next-to);
  const f2=mix*mix, f3=f2*mix;
  return ((2*f3-3*f2+1)*from+(f3-2*f2+mix)*m0+(-2*f3+3*f2)*to+(f3-f2)*m1)*Math.PI/180;
}
function mc(actor,spread,phase,power){
  if(!actor.angel)return;
  const amount=power*spread;
  const roll=wingSample(wingTracks.shoulder,phase), elbow=wingSample(wingTracks.elbow,phase);
  const wrist=wingSample(wingTracks.wrist,phase), tip=wingSample(wingTracks.tip,phase);
  const fold=wingSample(wingTracks.fold,phase), sweep=wingSample(wingTracks.sweep,phase);
  const twist=wingSample(wingTracks.twist,phase);
  for(const joint of actor.angel.wings){
    const {wing,side}=joint;
    wing.visible=spread>.002;
    if(!wing.visible)continue;
    joint.shoulder.rotation.set(-.08-(actor.angel.lean||0)*.72*spread-.22*twist*amount,side*$e(1.1,.09,spread),side*($e(-1.36,.13,spread)+roll*amount),'YXZ');
    joint.elbow.rotation.set(.03,side*($e(.45,.03,spread)+fold*amount),side*($e(-.2,.02,spread)+elbow*amount),'YXZ');
    joint.wrist.rotation.set(twist*.65*amount,side*($e(.58,.03,spread)+sweep*amount),side*($e(-.25,-.04,spread)+wrist*amount),'YXZ');
    joint.tip.rotation.set(twist*.35*amount,side*sweep*.15*amount,side*tip*amount,'YXZ');
    wing.scale.setScalar(.46+.54*spread);
  }
}
function wingThrust(phase){
  const cycle=((phase/Dt)%1+1)%1;
  return cycle>.28&&cycle<.78?Math.sin(Math.PI*(cycle-.28)/.5)**2:0;
}

var B={mode:"off",spread:0,phase:0,power:0,v:0,alt:0,heading:Math.PI,bank:0,time:0,boost:!1,down:!1,downPulse:0,pulse:0,queued:null,figure:null,landing:null,hover:0},bp=23,AS=ne("flightControls"),hc=ne("angelMode"),Ri=null,On=!1,Ss=null,Tn=n=>(n=Mt(n,0,1),n*n*(3-2*n));function Qo(){Ri!==null&&(Ri=null,ce.angle=.08,ce.pitch=.16,ce.radius=3.9)}function ai(){return B.mode==="flying"||B.mode==="landing"}function Qi(){let n=B.mode!=="off",e=ot==="jardin",t=B.mode==="flying",i=B.mode==="landing";hc.hidden=!e,hc.setAttribute("aria-pressed",String(n)),ne("angelLabel").textContent=i?"Atterrissage":t?"Atterrir":n?"Replier":"Mode ange",hc.disabled=i||B.mode==="folding",AS.hidden=!e||!n||i,ne("beat").textContent=t?"Battre des ailes":"D\xE9coller",ne("descent").hidden=ne("tricks").hidden=!t,ne("tricks").disabled=!t||!!B.figure,ne("altitude").hidden=!ai(),(!t||B.figure)&&(ne("trickList").hidden=!0),ne("lookHome").hidden=e&&n,e||(ne("altitude").hidden=!0)}function vm(){for(let n of Object.values(An)){let e=n.angel;e&&(airPose(n,0,0),e.lean=0,e.pivot.position.set(0,.97,0),e.pivot.rotation.set(0,0,0),mc(n,0,0,0)),n.root.position.y=0,n.shadow.position.y=.03,n.shadow.scale.set(1,1,1)}Object.assign(B,{mode:"off",spread:0,phase:0,power:0,v:0,alt:0,boost:!1,down:!1,downPulse:0,pulse:0,queued:null,bank:0,time:0,figure:null,landing:null,hover:0}),Qi()}function _m(){if(ot==="jardin"){if(Qo(),B.mode==="off"){wn&&Ls();for(let n of Object.values(An))TS(n);B.mode="ready",B.heading=bt().root.rotation.y,B.phase=0,B.spread=0,B.time=0,bn=null,ce.follow=!0,ce.angle=B.heading-Math.PI-.14,ce.pitch=.16,ce.radius=4.6}else B.mode==="ready"?B.mode="folding":B.mode==="flying"&&Mm();Qi(),Kn()}}function ym(){if(B.mode==="ready")B.mode="flying",B.alt=0,B.v=0,B.phase=0,B.launch=true,B.power=.12,B.heading=bt().root.rotation.y,bn=null,ce.follow=!0,ce.radius=5.25,Qi(),Kn();else if(B.mode!=="flying")return;B.pulse=Math.max(B.pulse,.86),B.down=!1}function Uu(n){if(B.mode!=="flying"||B.figure)return;let e=bt().root.position;if((Nu(e.x,e.z)||Math.abs(e.z+7.6)<.5)&&B.alt<3.8){ne("hint").textContent="\xC9loigne-toi du toit ou de l\u2019arche pour faire une figure.";return}if(B.alt<1.28){B.queued=n,B.pulse=1.05,B.down=!1;return}B.queued=null,B.figure={type:n,clock:0,duration:n==="loop"?2.75:1.85},B.pulse=0,B.boost=B.down=!1,ne("trickList").hidden=!0,ne("tricks").setAttribute("aria-expanded","false"),Qi()}function ES(n,e,t){let i=bt(),s=es(),r=i.root.position,o=s.root.position,a=Mt(ce.pitch,-.04,.78),l=ce.angle,c=(r.z+o.z)*.5,h=(r.y+o.y)*.5;c>5.32&&h<6.3&&Math.cos(l)>.35&&(l=ce.angle=Math.PI-.19);let u=new P(Math.sin(l)*Math.cos(a),Math.sin(a),Math.cos(l)*Math.cos(a)),f=new P(Math.cos(l),0,-Math.sin(l)),d=new P().crossVectors(u,f),g=r.clone().lerp(o,.5);g.y+=1.14+(B.figure?.type==="loop"?1.1:0);let x=Math.tan(e*Math.PI/360),m=[],p=ce.radius*.92;for(let M of[r,o])for(let v of[-1,1])for(let E of[-1,1])for(let A of[-1,1]){let I=.47+1.45*B.spread,D=B.figure?2.02:.78,b=new P(M.x+v*I,M.y+(A<0?-.12:2.52)+(B.figure?.type==="loop"&&A>0?2.65:0),M.z+E*D).sub(g),S=b.dot(u),C=Math.abs(b.dot(f))/(t*.87),U=Math.abs(b.dot(d))/.82;m.push([S,Math.max(C,U)]),p=Math.max(p,S+Math.max(C,U)/x)}u.z>.04&&Math.abs(g.x)<6&&h<6.3&&(p=Math.min(p,Math.max(2.5,(6.9-g.z)/u.z))),n.position.copy(g).addScaledVector(u,p),n.lookAt(g);let y=x;for(let[M,v]of m)y=Math.max(y,v/Math.max(.6,p-M));return Math.min(98,Math.atan(y)*360/Math.PI)}function Ti(n,e){let t=0,i=Zi.get(Math.floor(n/Fn)+","+Math.floor(e/Fn));if(i)for(let s of i)(n-s.x)**2+(e-s.z)**2<s.r*s.r&&(t=Math.max(t,s.height));return Math.abs(e+7.6)<.44&&Math.abs(n-.4)>.8&&(t=Math.max(t,3.29)),Math.abs(n+3.5)<1.23&&Math.abs(e+5.25)<.5&&(t=Math.max(t,.52)),t}function Nu(n,e){return e>7.05&&n>-4.75&&n<3.13}function bs(n,e,t,i){if(t>10.38&&t>=n.z||Math.abs(e-Et(t))>11.4&&Math.abs(e-Et(t))>=Math.abs(n.x-Et(n.z)))return!1;let s=Math.max(1,Math.ceil(Math.hypot(e-n.x,t-n.z)/.17));for(let r=1;r<=s;r++){let o=$e(n.x,e,r/s),a=$e(n.z,t,r/s),l=Ti(o,a);if(l>0&&i<l+.2||Nu(o,a)&&i>1.14&&i<3.78||Math.abs(a+7.6)<.44&&Math.abs(o-.4)<=.8&&i>.38&&i<3.4)return!1}return n.x=e,n.z=t,!0}function Mm(){if(B.mode!=="flying")return;let n=bt().root.position,e=Math.min(n.z,5.3),t=Math.abs(e+7.6)<2.6?-4.7:e,i=Ko(n.x,n.z)&&!Ti(n.x,n.z)&&Math.abs(n.x-Et(n.z))<1.2&&Math.abs(n.z+7.6)>2.7,s=new P(i?n.x:Et(t),0,i?n.z:t),r=s.z+(s.z>4?-1.32:1.32),o=new P(Et(r)+.33,0,r);B.landing={target:s,other:o},B.mode="landing",B.queued=null,B.figure=null,B.pulse=0,B.boost=B.down=!1,B.v=0,Qi(),Kn()}
// Only the neck and lower legs change locally. Both arms, hands and sleeves keep the authored rest pose.
const fullNeckPitch=.65;
function prepareAirPose(actor){
  for(const part of actor.parts){
    const mesh=part.obj, geometry=mesh.geometry, base=part.base, normal=geometry.attributes.normal;
    const legs=new Float32Array(base.length), head=new Float32Array(base.length);
    const headNormal=new Float32Array(base.length);
    for(let i=0;i<base.length;i+=3){
      const x=base[i],y=base[i+1],z=base[i+2];
      const leg=1-Tn((y-.05)/.56), foot=1-Tn((y-.07)/.34);
      legs[i]=Math.sign(x)*leg*.009;
      legs[i+1]=leg*.045+foot*.035;
      legs[i+2]=-leg*.085-foot*(x>0?.10:.15);
      const neck=actor.id==='f'?1.375:1.39;
      const bend=fullNeckPitch*Tn((y-neck+.025)/.105)*(1-Tn((Math.abs(x)-.095)/.055));
      if(!bend)continue;
      const dy=y-neck,dz=z+.008,co=Math.cos(bend)-1,si=Math.sin(bend);
      head[i+1]=co*dy+si*dz; head[i+2]=-si*dy+co*dz;
      const ny=normal.array[i+1],nz=normal.array[i+2];
      headNormal[i+1]=co*ny+si*nz;headNormal[i+2]=-si*ny+co*nz;
    }
    geometry.morphTargetsRelative=true;
    geometry.morphAttributes.position=[gt(legs,3),gt(head,3)];
    geometry.morphAttributes.normal=[gt(new Float32Array(base.length),3),gt(headNormal,3)];
    mesh.updateMorphTargets();
    mesh.material.needsUpdate=true;
  }
}
function airPose(actor,legs,neckPitch){
  for(const {obj} of actor.parts){
    if(!obj.morphTargetInfluences)continue;
    obj.morphTargetInfluences[0]=legs;
    obj.morphTargetInfluences[1]=Mt(neckPitch/fullNeckPitch,0,1);
  }
}

function wp(n,e,t,i,s,r,o){let a=n.angel,l=B.figure;a.lean=$e(a.lean??0,.13+.54*o,1-Math.exp(-e*3));let c=0,h=a.lean,u=0,f=0;if(l){let g=Mt((l.clock-i)/l.duration,0,1),x=Tn(g)*Dt;l.type==="loop"?(h-=x,u=1.18*Math.sin(x),f=1.18*(1-Math.cos(x))):(c=(l.type==="left"?-1:1)*x,f=.23*Math.sin(g*Math.PI))}let d=.042*Math.sin(s-2.7)*Tn(t/.7)*r;a.pivot.position.set(0,.97+d+f,u),a.pivot.rotation.set(h*Tn(t/.85),0,c+B.bank*.24,"YXZ"),n.root.position.y=t,n.shadow.position.y=.03-t/n.root.scale.y,n.shadow.scale.setScalar(1/(1+t*.38)),n.speed=0,Ds(n,0,0),airPose(n,Tn(t/1.25),Math.max(0,a.lean-.025)*Tn(t/.85)),uc(n),mc(n,B.spread,s,r)}function Tp(n){let e=bt(),t=es(),i=e.root.position,s=t.root.position;B.time+=n;let r=B.mode==="folding";if(B.spread=Mt(B.spread+n*(r?-1.25:1.12),0,1),!ai()){if(B.mode==="ready"&&e.speed<.05){let f=Math.min(6.3,i.z+1.24),d=Et(f)+.78,g=1-Math.exp(-n*1.55),x=$e(s.x,d,g),m=$e(s.z,f,g);Ci(s,x,m)&&(s.x=x,s.z=m);let p=e.root.rotation.y,y=Math.atan2(Math.sin(p-t.root.rotation.y),Math.cos(p-t.root.rotation.y));t.root.rotation.y+=y*Math.min(1,n*4)}mc(e,Tn(B.spread),B.time*.9,.09),mc(t,Tn(B.spread),B.time*.9-.24,.09),r&&B.spread===0&&vm();return}let o=B.mode==="landing",a=!o&&!B.figure&&(B.pulse>0||B.boost),l=!o&&!B.figure&&(B.down||B.downPulse>0);B.downPulse=Math.max(0,B.downPulse-n),B.pulse=Math.max(0,B.pulse-n),B.power=$e(B.power,a||B.launch?1:l?.23:.54,1-Math.exp(-n*5)),B.phase+=n*Dt*(o?.65:a||B.launch?.86:.73)*Tn((B.spread-.20)/.70);let c=0,h=B.alt;if(o){let{target:f,other:d}=B.landing,g=Math.hypot(i.x-f.x,i.z-f.z),x=Math.hypot(s.x-d.x,s.z-d.z);if(Math.max(g,x)>.055){let p=function(v,E,A){if(A<=.045)return!0;let I=Math.min(1,n*3.9/A);return bs(v,$e(v.x,E.x,I),$e(v.z,E.z,I),B.alt)},y=p(i,f,g),M=p(s,d,x);(!y||!M)&&(B.alt=Math.min(bp,B.alt+n*3.2))}else B.alt=Math.max(0,B.alt-n*(B.alt>2?2.95:.92));let m=Ti(s.x,s.z);if(h=Math.max(B.alt,m?m+.2:0),B.alt<=.001&&Math.max(g,x)<.06){B.mode="folding",B.figure=null,B.alt=0,e.root.position.y=t.root.position.y=0;for(let p of[e,t])airPose(p,0,0),p.angel.lean=0,p.angel.pivot.position.set(0,.97,0),p.angel.pivot.rotation.set(0,0,0),p.shadow.position.y=.03,p.shadow.scale.setScalar(1);tn.length=0,br=0,tn.push({x:i.x,z:i.z,s:0}),ce.radius=3.9,Qi(),Kn();return}}else{let f=Vt.x,d=-Vt.y;(lt.has("arrowup")||lt.has("z")||lt.has("w"))&&(d+=1),(lt.has("arrowdown")||lt.has("s"))&&(d-=1),(lt.has("arrowleft")||lt.has("q")||lt.has("a"))&&(f-=1),(lt.has("arrowright")||lt.has("d"))&&(f+=1);let g=Math.hypot(f,d);g>1&&(f/=g,d/=g);let x=wingThrust(B.phase);
if(B.launch&&B.phase>=Dt*.85)B.launch=false;
let m=l?-2.65:(a||B.launch)?(B.launch?5.8*x:1.1+3.2*x):0;B.v=$e(B.v,m,1-Math.exp(-n*(a?5:3.8)));let p=Ti(i.x,i.z),y=Nu(i.x,i.z),M=Math.abs(i.z+7.6)<.44,v=y?1.14:.38,E=y?3.78:3.4,A=(y||M)&&B.alt<E;if(B.alt=Mt(B.alt+B.v*n,Math.max(0,p?p+.2:0,(y||M)&&!A?E:0),A?v:bp),l&&B.alt<.42){Mm();return}let I=Math.cos(ce.angle),D=Math.sin(ce.angle),b=f*I-d*D,S=-f*D-d*I;c=Math.min(1,g);let C=n*(3.95+B.alt*.035)*Math.min(1,B.alt*1.5);if(c>.04){let Ve=i.x+b*C,Qe=i.z+S*C;bs(i,Ve,Qe,B.alt)||bs(i,Ve,i.z,B.alt)||bs(i,i.x,Qe,B.alt);let Oe=Math.atan2(b,S),Z=Math.atan2(Math.sin(Oe-B.heading),Math.cos(Oe-B.heading));B.heading+=Z*Math.min(1,n*3),B.bank=$e(B.bank,Mt(Z,-1,1),n*3)}else B.bank*=Math.exp(-n*3);e.root.rotation.y=B.heading;let U=1.8*Tn(B.alt/2)+.62,z=1.22+.92*Tn(B.alt/2),H=i.x-Math.cos(B.heading)*U-Math.sin(B.heading)*z,X=i.z+Math.sin(B.heading)*U-Math.cos(B.heading)*z,V=Ti(H,X);(V>B.alt-.18||Math.hypot(s.x-i.x,s.z-i.z)>4.4)&&(H=i.x-Math.sin(B.heading)*1.12,X=i.z-Math.cos(B.heading)*1.12,V=Ti(H,X));let Q=1-Math.exp(-n*2.6),k=$e(s.x,H,Q),se=$e(s.z,X,Q);h=Math.max(B.alt*.97,Ti(s.x,s.z)?Ti(s.x,s.z)+.2:0);let ge=Ti(k,se),Me=Math.max(h,ge?ge+.22:0,V?V+.22:0);h=$e(s.y,Me,1-Math.exp(-n*4.25)),bs(s,k,se,h)||bs(s,k,s.z,h)||bs(s,s.x,se,h);let Ne=Math.atan2(Math.sin(B.heading-t.root.rotation.y),Math.cos(B.heading-t.root.rotation.y));t.root.rotation.y+=Ne*Math.min(1,n*3)}B.queued&&B.alt>=1.28&&!o&&Uu(B.queued),B.figure&&(B.figure.clock+=n),wp(e,n,B.alt,0,B.phase,B.power,c),wp(t,n,h,.14,B.phase-.62,B.power*.96,c),B.figure&&B.figure.clock>=B.figure.duration+.14&&(B.figure=null,Qi());let u=Math.round(B.alt)+" m";ne("altitude").textContent!==u&&(ne("altitude").textContent=u)}hc.onclick=()=>{_m(),Xt.focus({preventScroll:!0})};function Sm(n,e,t,i){n.addEventListener("touchstart",s=>s.preventDefault(),{passive:!1}),n.addEventListener("pointerdown",s=>{s.button===0&&(s.preventDefault(),n.setPointerCapture(s.pointerId),e(),t())});for(let s of["pointerup","pointercancel","lostpointercapture"])n.addEventListener(s,i);n.addEventListener("click",s=>{s.detail===0&&e()})}Sm(ne("beat"),ym,()=>{B.boost=!0},()=>{B.boost=!1});Sm(ne("descent"),()=>{ai()&&(B.downPulse=.51)},()=>{B.down=!0},()=>{B.down=!1});ne("tricks").onclick=()=>{let n=ne("trickList");n.hidden=!n.hidden,ne("tricks").setAttribute("aria-expanded",String(!n.hidden))};for(let n of document.querySelectorAll("[data-trick]"))n.onclick=()=>Uu(n.dataset.trick);window.addEventListener("keydown",n=>{if(!(n.target.closest?.("input,textarea,select,[contenteditable=true]")||document.querySelector("dialog[open]")||n.ctrlKey||n.altKey||n.metaKey||ot!=="jardin")){if(n.code==="KeyG"&&!n.repeat){n.preventDefault(),_m();return}["ready","flying"].includes(B.mode)&&(n.code==="Space"&&!n.target.closest?.("button")&&(n.preventDefault(),n.repeat||ym(),B.boost=!0),n.code==="KeyC"&&(n.preventDefault(),B.down=!0),!n.repeat&&["Digit1","Digit2","Digit3"].includes(n.code)&&(n.preventDefault(),Uu({Digit1:"left",Digit2:"right",Digit3:"loop"}[n.code])))}});window.addEventListener("keyup",n=>{n.code==="Space"&&(B.boost=!1),n.code==="KeyC"&&(B.down=!1)});function Fu(){B.boost=B.down=!1,B.pulse=B.downPulse=0}window.addEventListener("blur",Fu);document.addEventListener("visibilitychange",()=>{document.hidden&&Fu()});var bm=ne("shelves"),Ji=ne("bookcase"),wm=ne("bookList");function wc(n){ot==="salon"&&(n?(Ss={angle:ce.angle,pitch:ce.pitch,radius:ce.radius,follow:ce.follow,focus:ce.focus.clone()},jt&&Ls(),lt.clear(),Us(),bn=null):Ss&&(Object.assign(ce,{angle:Ss.angle,pitch:Ss.pitch,radius:Ss.radius,follow:Ss.follow}),ce.focus.copy(Ss.focus)),On=n,bm.setAttribute("aria-pressed",String(n)),ne("shelfActions").hidden=!n,ne("shelfLabel").textContent=n?"Vue du salon":"Biblioth\xE8que",Kn(),ji(1))}function Tm(n){for(let r of wm.children)r.setAttribute("aria-pressed",String(Number(r.dataset.volume)===n));let[e,t,i,s]=Lu[n];ne("bookName").textContent=e,ne("bookAuthor").textContent=t,ne("bookNote").textContent=s,ne("bookCard").style.setProperty("--binding",i),ne("official").hidden=n!==2}function Am(n=0){lt.clear(),Us(),Tm(n),Ji.open||Ji.showModal()}for(let[n,[e,t]]of Lu.entries()){let i=document.createElement("button");i.type="button",i.dataset.volume=String(n),i.textContent=e,i.title=t,i.onclick=()=>Tm(n),wm.append(i)}ne("official").href=pS;ne("openBooks").onclick=()=>Am();ne("bookClose").onclick=()=>Ji.close();Ji.addEventListener("click",n=>{n.target===Ji&&Ji.close()});Ji.addEventListener("close",()=>Xt.focus());bm.onclick=()=>wc(!On);ne("lookHome").onclick=$M;um();Ru(!1);im();sm();Promise.all(Ep).then(()=>{document.body.classList.add("ready"),ne("loading").hidden=!0,Au=requestAnimationFrame(am)}).catch(n=>window.failure(n.message));})().catch(error=>window.failure(/WebGL context/i.test(error.message)?'La 3D nécessite un navigateur compatible avec WebGL 2.':'Le salon n’a pas pu se charger.'));
