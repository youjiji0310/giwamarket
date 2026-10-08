import { useEffect, useRef } from 'react';

// Liquid-chrome background rendered with a small WebGL shader (no library).
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
 vec2 q=uv*.95+(m-.5)*.28;
 float T=t*.04;
 vec2 w=vec2(fbm(q+T),fbm(q+vec2(5.2,1.3)-T));
 vec2 w2=vec2(fbm(q+3.*w+vec2(1.7,9.2)+T*1.3),fbm(q+3.*w+vec2(8.3,2.8)-T));
 float f=fbm(q+3.4*w2);
 float b=.5+.5*cos(6.2831*(f*2.3+w2.x*.7)+T*2.4);
 float v=pow(b,2.6)*.32+pow(b,18.)*.95;
 float vig=smoothstep(1.25,.1,length((uv-vec2(.25,.08))*vec2(.85,1.1)));
 v*=vig*k;
 vec3 c=vec3(v)*vec3(1.,.982,.955);
 gl_FragColor=vec4(mix(vec3(.01),c,.94),1.);
}`;

export default function ChromeCanvas({ intensity = 1, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) { canvas.classList.add('no-gl'); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.classList.add('no-gl'); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm'), uK = gl.getUniformLocation(pr, 'k');

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.55;
    let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, raf, visible = true, start = performance.now();
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * scale)); canvas.height = Math.max(1, Math.round(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = now => {
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (now - start) / 1000 + 12);
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uK, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = now => { if (visible) draw(now); raf = requestAnimationFrame(loop); };
    const onMove = e => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    resize(); io.observe(canvas);
    addEventListener('resize', resize);
    if (still) draw(performance.now()); else { addEventListener('mousemove', onMove); raf = requestAnimationFrame(loop); }
    requestAnimationFrame(() => canvas.classList.add('is-on'));
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', resize); removeEventListener('mousemove', onMove); };
  }, [intensity]);
  return <canvas ref={ref} className={`chrome ${className}`} aria-hidden="true" />;
}
