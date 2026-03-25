import { useState, useEffect, useRef } from "react";
import { T } from "../constants/theme";
import { NEXT_RACE } from "../constants/data";

export default function Hero({ onCTA }) {
  const [countdown, setCountdown] = useState({d:NEXT_RACE.days,h:NEXT_RACE.hours,m:NEXT_RACE.mins,s:0});
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(()=>{
    const timer = setInterval(()=>{
      setCountdown(prev=>{
        let {d,h,m,s} = prev; s--;
        if(s<0){s=59;m--;} if(m<0){m=59;h--;} if(h<0){h=23;d--;}
        return {d:Math.max(0,d),h:Math.max(0,h),m:Math.max(0,m),s:Math.max(0,s)};
      });
    },1000);
    return ()=>clearInterval(timer);
  },[]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    particlesRef.current = Array.from({length:80},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      speed:1+Math.random()*4, length:20+Math.random()*80,
      opacity:0.05+Math.random()*0.15, width:0.5+Math.random()*1.5,
    }));
    let raf;
    const animate = ()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particlesRef.current.forEach(p=>{
        p.x -= p.speed;
        if(p.x+p.length<0) p.x=canvas.width+p.length;
        const grad = ctx.createLinearGradient(p.x,p.y,p.x+p.length,p.y);
        grad.addColorStop(0,`rgba(225,6,0,0)`);
        grad.addColorStop(0.5,`rgba(225,6,0,${p.opacity})`);
        grad.addColorStop(1,`rgba(225,6,0,0)`);
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.length,p.y);
        ctx.strokeStyle=grad; ctx.lineWidth=p.width; ctx.stroke();
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const pad = n => String(n).padStart(2,"0");

  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"80px 20px" }}>
      <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`, backgroundSize:"60px 60px", opacity:0.4, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle,${T.redGlow} 0%,transparent 70%)`, pointerEvents:"none", animation:"heroPulse 4s ease-in-out infinite" }}/>
      <div style={{ marginBottom:32, background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:100, padding:"10px 24px", display:"flex", alignItems:"center", gap:10, animation:"fadeDown 0.6s ease forwards" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:T.red, animation:"pulse 1.5s infinite" }}/>
        <span style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.text }}>
          {NEXT_RACE.country} {NEXT_RACE.name} — {pad(countdown.d)}d {pad(countdown.h)}h {pad(countdown.m)}m {pad(countdown.s)}s
        </span>
      </div>
      <h1 style={{ fontFamily:"'Barlow Condensed','Impact',sans-serif", fontSize:"clamp(56px,10vw,120px)", fontWeight:900, textTransform:"uppercase", textAlign:"center", lineHeight:0.9, marginBottom:24, animation:"fadeUp 0.8s 0.1s ease both", letterSpacing:"-1px" }}>
        <span style={{ display:"block", color:T.text }}>APEX</span>
        <span style={{ display:"block", background:`linear-gradient(135deg,${T.red} 0%,#ff4d4d 50%,${T.red} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>GRID</span>
      </h1>
      <p style={{ fontSize:"clamp(16px,2.5vw,22px)", color:T.muted, textAlign:"center", maxWidth:600, lineHeight:1.5, marginBottom:40, animation:"fadeUp 0.8s 0.2s ease both" }}>
        The visual intelligence platform for Formula 1.<br/>
        <span style={{ color:T.text }}>Live telemetry · Tyre strategy · AI race analysis · Community</span>
      </p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:44, animation:"fadeUp 0.8s 0.3s ease both" }}>
        {[["🗺️","Track Replay"],["📊","Tyre Strategy"],["🤖","AI Analysis"],["👥","Community"],["⏱️","Telemetry"],["💨","DRS Zones"]].map(([e,l])=>(
          <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:100, padding:"8px 16px", fontSize:13, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>
            <span>{e}</span><span>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", animation:"fadeUp 0.8s 0.4s ease both" }}>
        <button onClick={()=>onCTA("dashboard")}
          style={{ background:T.red, border:"none", color:"#fff", borderRadius:12, padding:"14px 32px", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:`0 0 30px ${T.redGlow},0 4px 20px rgba(0,0,0,0.4)`, transition:"all 0.3s" }}
          onMouseEnter={e=>{e.target.style.transform="translateY(-2px)";e.target.style.boxShadow=`0 0 50px ${T.red}55,0 8px 30px rgba(0,0,0,0.5)`;}}
          onMouseLeave={e=>{e.target.style.transform="none";e.target.style.boxShadow=`0 0 30px ${T.redGlow},0 4px 20px rgba(0,0,0,0.4)`;}}>
          🏎️ Explore Dashboard
        </button>
        <button onClick={()=>onCTA("ai")}
          style={{ background:"transparent", border:`1.5px solid ${T.borderBright}`, color:T.text, borderRadius:12, padding:"14px 32px", fontSize:15, fontWeight:600, cursor:"pointer", transition:"all 0.3s" }}
          onMouseEnter={e=>{e.target.style.borderColor=T.red;e.target.style.background=T.redDim;}}
          onMouseLeave={e=>{e.target.style.borderColor=T.borderBright;e.target.style.background="transparent";}}>
          🤖 Ask GridBot
        </button>
      </div>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:`linear-gradient(90deg,transparent,${T.red},transparent)` }}/>
    </div>
  );
}