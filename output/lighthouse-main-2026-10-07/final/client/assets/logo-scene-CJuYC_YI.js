import{W as Re,m as ze,k as Fe,C as We,S as Ve,r as Ee,s as D,G as ke,P as Ie,j as I,t as _e,i as oe,u as Be,d as Ge,v as qe,e as De}from"./three-Cx9mw_FF.js";import{c as Oe,q as Ye}from"./event-quality-DDZgF50D.js";const R=6,ne=Math.PI*2,ie=5.8,Ze=I.clamp,Te=()=>new Promise(a=>window.setTimeout(a,0)),je=`
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uCameraZ;
  uniform vec2 uViewport;
  uniform vec2 uPointer;
  attribute vec3 aStart;
  attribute vec4 aMotion;
  varying float vAlpha;

  void main() {
    float progress = min(uTime / ${ie.toFixed(1)}, 1.0);
    float formation = clamp((progress - 0.03) / 0.62, 0.0, 1.0);
    float arrival = clamp((formation - aMotion.x) / 0.55, 0.0, 1.0);
    float ease = 1.0 - pow(1.0 - arrival, 4.0);
    float reveal = clamp((progress - 0.45) / 0.2, 0.0, 1.0);
    vec3 start = vec3(aStart.xy * max(uViewport.x, uViewport.y), aStart.z);
    vec3 target = position;
    target.xy += uPointer;
    vec3 p = mix(start, target, ease);
    // Depth collapses with the assembly, leaving the original silhouette exact.
    p.z += sin(uTime * 0.3 + aMotion.z) * 0.18 * (1.0 - ease);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(aMotion.y * (1.6 - 0.7 * ease) * 2.0 * uPixelRatio
      * uCameraZ / -view.z, 1.0, 12.0 * uPixelRatio);
    float twinkle = 0.0;
    vAlpha = min(1.0, mix(aMotion.w, 1.0, ease) + twinkle * (1.0 - ease))
      * max(0.0, 1.0 - reveal * 1.2) * smoothstep(0.0, 0.3, uTime);
  }
`,He=`
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uCameraZ;
  uniform vec2 uViewport;
  uniform vec2 uPointer;
  attribute vec4 aMotion;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.xy = (fract(p.xy + aMotion.xy * uTime * 0.002) - 0.5) * uViewport * 1.5;
    p.xy += uPointer * (0.15 + p.z * 0.04);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    float twinkle = 0.0;
    gl_PointSize = clamp(aMotion.z * uPixelRatio * uCameraZ / -view.z,
      0.7 * uPixelRatio, 6.0 * uPixelRatio);
    vAlpha = (0.12 + twinkle * 0.2) * smoothstep(0.0, 0.8, uTime);
  }
`,Ue=`
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.45, 1.0, radius)) * vAlpha;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;function Xe(a){const c=document.createElement("canvas"),O=Math.min(1,1024/a.naturalWidth);c.width=Math.round(a.naturalWidth*O),c.height=Math.round(a.naturalHeight*O);const z=c.getContext("2d",{willReadFrequently:!0});if(!z)throw new Error("Logo sampling is unavailable");z.filter="blur(0.8px)",z.drawImage(a,0,0,c.width,c.height);const{data:y}=z.getImageData(0,0,c.width,c.height);let o=c.width,s=0,b=c.height,C=0;for(let i=0;i<c.height;i++){const A=i*c.width*4;for(let u=0;u<c.width;u++)y[A+u*4+3]<128||(u<o&&(o=u),u>s&&(s=u),i<b&&(b=i),i>C&&(C=i))}if(s<=o)throw new Error("The logo has no visible pixels");const _=R/(s-o),h=(o+s)/2,F=(b+C)/2,B=[],W=[];let g=0;const M=c.width*4;for(let i=Math.max(0,b-1);i<=Math.min(C,c.height-2);i++){const A=i*M,u=(i+1)*M;for(let p=Math.max(0,o-1);p<=Math.min(s,c.width-2);p++){const P=p*4,S=y[A+P+3],L=y[A+P+7],G=y[u+P+7],q=y[u+P+3],Y=(S>=128?1:0)|(L>=128?2:0)|(G>=128?4:0)|(q>=128?8:0);if(Y===0||Y===15)continue;const E=[S/255,L/255,G/255,q/255],T=[[p,i],[p+1,i],[p+1,i+1],[p,i+1]],r=[];for(let l=0;l<4;l++){const f=(l+1)%4;if(E[l]>=.5==E[f]>=.5)continue;const d=(.5-E[l])/(E[f]-E[l]);r.push([(I.lerp(T[l][0],T[f][0],d)-h)*_,(F-I.lerp(T[l][1],T[f][1],d))*_])}for(let l=0;l<r.length-1;l+=2){const[f,d]=[r[l],r[l+1]];B.push(f[0],f[1],0,d[0],d[1],0),g+=Math.hypot(d[0]-f[0],d[1]-f[1]),W.push(g)}}}return{segments:B,lengths:W,totalLength:g}}async function Qe(a,c,O,z){const y=new Image;y.src=c,await y.decode();const o=Xe(y);await Te();const s=new Re({antialias:!0,alpha:!0,powerPreference:"low-power"}),b=[],C=[],_=[];let h=0,F=!1,B=!1;const W=new ze,g=new Fe(40,1,.1,150),M=new oe,i=new oe,A=new oe,u=window.matchMedia("(pointer: coarse)"),p=Oe(u.matches?1:2,2);let P=0,S=0,L=!1,G=0,q=0;const Y=getComputedStyle(a),E=new We(16777215);s.setClearColor(Y.getPropertyValue("--bg").trim(),0),s.outputColorSpace=Ve,s.domElement.setAttribute("aria-hidden","true");let T=26;const r=()=>(T=Math.imul(T,1664525)+1013904223>>>0,T/4294967296),l={uTime:{value:0},uPixelRatio:{value:1},uCameraZ:{value:1},uViewport:{value:M},uPointer:{value:i},uColor:{value:E}};function f(e,t){const n=new _e({uniforms:l,vertexShader:t,fragmentShader:Ue,transparent:!0,depthWrite:!1,depthTest:!1});b.push(e),C.push(n);const v=new Be(e,n);return v.frustumCulled=!1,W.add(v),v}const d=a.clientWidth<768?900:1400,ae=new Float32Array(d*3),se=new Float32Array(d*3),re=new Float32Array(d*4);let V=0;for(let e=0;e<d;e++){const t=(e+.5)/d*o.totalLength;for(;o.lengths[V]<t;)V++;const n=V?o.lengths[V-1]:0,v=(t-n)/(o.lengths[V]-n),w=V*6,x=I.lerp(o.segments[w],o.segments[w+3],v),m=I.lerp(o.segments[w+1],o.segments[w+4],v);ae.set([x,m,0],e*3);const Ce=r()*ne,Ae=.5+r()*.6;se.set([Math.cos(Ce)*Ae,Math.sin(Ce)*Ae,(r()-.5)*10],e*3),re.set([Math.hypot(x,m)/R*.3+r()*.125,1+r()*.8,r()*ne,.25+r()*.25],e*4)}const Z=new Ee;Z.setAttribute("position",new D(ae,3)),Z.setAttribute("aStart",new D(se,3)),Z.setAttribute("aMotion",new D(re,4));const Se=f(Z,je),J=a.clientWidth<768?160:350,le=new Float32Array(J*3),ce=new Float32Array(J*4);for(let e=0;e<J;e++)le.set([r(),r(),(r()-.6)*10],e*3),ce.set([r()-.5,r()-.5,.6+Math.pow(r(),3)*3.6,r()*ne],e*4);const N=new Ee;N.setAttribute("position",new D(le,3)),N.setAttribute("aMotion",new D(ce,4)),f(N,He);const Q=new ke;W.add(Q);let $=1/0,K=-1/0;for(let e=1;e<o.segments.length;e+=3)$=Math.min($,o.segments[e]),K=Math.max(K,o.segments[e]);const ue=R+.3,me=K-$+.3,j=480*2/R,he=new Ie(ue,me);b.push(he);const pe=[];function Le(e){const t=document.createElement("canvas");t.width=Math.ceil(ue*j),t.height=Math.ceil(me*j);const n=t.getContext("2d");if(!n)throw new Error("Logo outline rendering is unavailable");n.setTransform(j,0,0,-j,t.width/2,t.height/2),n.strokeStyle="#fff",n.lineWidth=e*R/480,n.lineCap="round",n.lineJoin="round",n.beginPath();for(let m=0;m<o.segments.length;m+=6)n.moveTo(o.segments[m],o.segments[m+1]),n.lineTo(o.segments[m+3],o.segments[m+4]);n.stroke();const v=new Ge(t);_.push(v);const w=new qe({map:v,color:E,transparent:!0,opacity:0,depthWrite:!1,depthTest:!1});C.push(w);const x=new De(he,w);return x.frustumCulled=!1,x.visible=!1,Q.add(x),pe.push({canvas:t,context:n,texture:v,width:e,mesh:x}),w}const de=Le(6),ee=()=>{const e=u.matches&&U?2:p.level,t=Ye(e,P,S,window.devicePixelRatio,u.matches);l.uPixelRatio.value=t,s.setPixelRatio(t),s.setSize(P,S,!1)},fe=()=>{const e=a.clientWidth,t=a.clientHeight;if(!e||!t||e===P&&t===S)return;P=e,S=t,p.reset();const n=Math.min(480,e*.6,t*.55);M.set(e/n*R,t/n*R),g.aspect=e/t,g.position.z=M.y/(2*Math.tan(I.degToRad(g.fov/2))),g.position.y=-.07*M.y,g.updateProjectionMatrix(),l.uCameraZ.value=g.position.z,ee(),X()};let H=0,k=0,te=!1,U=!1;function X(){B&&!h&&!F&&!document.hidden&&!te&&(k=0,h=requestAnimationFrame(we))}const ve=new IntersectionObserver(([e])=>{te=!e.isIntersecting,cancelAnimationFrame(h),h=0,k=0,p.reset(),X()},{threshold:0});ve.observe(a);function we(e){if(h=0,F||document.hidden||te){h=0;return}const t=k?(e-k)/1e3:0,n=Math.min(t,.05);if(k=e,p.sample(t)!==null&&ee(),L){L=!1;const m=a.getBoundingClientRect();m.width&&m.height&&A.set(((G-m.left)/m.width-.5)*M.x*.035,(.5-(q-m.top)/m.height)*M.y*.035)}H+=n,l.uTime.value=H,i.lerp(A,1-Math.exp(-n*3.7));const v=Math.min(H/ie,1),w=Ze((v-.45)/.2,0,1);de.opacity=w*1,pe[0].mesh.visible=de.opacity>0,Q.position.set(i.x,i.y,0),Se.visible=w<.84;const x=!U&&w===1;x&&(U=!0,u.matches&&ee()),s.render(W,g),x&&z(),(!U||!u.matches)&&(h=requestAnimationFrame(we))}const ge=e=>{u.matches||e.pointerType!=="mouse"||H<ie*.55||(G=e.clientX,q=e.clientY,L=!0)},xe=()=>{L=!1,A.set(0,0)},ye=()=>{cancelAnimationFrame(h),h=0,k=0,p.reset(),X()},Me=e=>{e.preventDefault(),F=!0,cancelAnimationFrame(h),s.domElement.style.opacity="0",O()},Pe=new ResizeObserver(fe);function be(){F=!0,cancelAnimationFrame(h),ve.disconnect(),Pe.disconnect(),a.removeEventListener("pointermove",ge),a.removeEventListener("pointerleave",xe),document.removeEventListener("visibilitychange",ye),s.domElement.removeEventListener("webglcontextlost",Me),b.forEach(e=>e.dispose()),C.forEach(e=>e.dispose()),_.forEach(e=>e.dispose()),s.dispose(),s.forceContextLoss(),s.domElement.remove()}try{await Te(),fe(),a.appendChild(s.domElement),Pe.observe(a),a.addEventListener("pointermove",ge,{passive:!0}),a.addEventListener("pointerleave",xe),document.addEventListener("visibilitychange",ye),s.domElement.addEventListener("webglcontextlost",Me),B=!0,X()}catch(e){throw be(),e}return be}export{Qe as createLogoScene};
