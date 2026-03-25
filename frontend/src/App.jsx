import { useState } from "react";
import { T } from "./constants/theme";
import { DRIVERS } from "./constants/data";
import Hero from "./components/Hero";
import CommunitySection from "./components/CommunitySection";
import Dashboard from "./components/Dashboard";
import AIChat from "./components/AIChat";

const NAV_ITEMS = [
  {id:"home",label:"Home",icon:"🏠"},
  {id:"dashboard",label:"Dashboard",icon:"📊"},
  {id:"community",label:"Community",icon:"👥"},
  {id:"ai",label:"GridBot",icon:"🤖"},
  {id:"drivers",label:"Drivers",icon:"🧑‍✈️"},
];

export default function ApexGrid() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"'Outfit','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Mono:wght@400;500&family=Outfit:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:${T.bg};} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(0.85)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes heroPulse{0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.9;transform:translate(-50%,-50%) scale(1.1)}}
        .fade-in{animation:fadeUp 0.4s ease forwards;}
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(5,5,7,0.92)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1400, margin:"0 auto", padding:"0 20px", height:60, display:"flex", alignItems:"center" }}>
          <button onClick={()=>setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, marginRight:32, padding:0 }}>
            <div style={{ background:T.red, width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, boxShadow:`0 0 16px ${T.redGlow}` }}>⬡</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:20, letterSpacing:1, textTransform:"uppercase", color:T.text }}>APEX<span style={{ color:T.red }}>GRID</span></div>
          </button>
          <div style={{ display:"flex", flex:1 }}>
            {NAV_ITEMS.map(n=>(
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{ background:"none", border:"none", color:page===n.id?T.text:T.muted, padding:"0 14px", height:60, cursor:"pointer", fontWeight:page===n.id?700:400, fontSize:14, borderBottom:`2px solid ${page===n.id?T.red:"transparent"}`, transition:"all 0.2s", display:"flex", alignItems:"center", gap:6 }}>
                {page===n.id&&<span>{n.icon}</span>}{n.label}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ background:T.redDim, border:`1px solid ${T.red}44`, borderRadius:20, padding:"5px 12px", fontSize:11, color:T.red, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:T.red, animation:"pulse 1.5s infinite" }}/>
              R4 Bahrain · 35 days
            </div>
            <button style={{ background:T.red, border:"none", borderRadius:8, padding:"7px 16px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:`0 0 12px ${T.redGlow}` }}>Sign Up</button>
          </div>
        </div>
      </nav>

      <div className="fade-in" key={page}>
        {page==="home"&&(
          <>
            <Hero onCTA={setPage}/>
            {/* Feature cards */}
            <div style={{ padding:"80px 20px", maxWidth:1200, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:56 }}>
                <div style={{ fontSize:11, color:T.red, fontWeight:800, letterSpacing:3, textTransform:"uppercase", marginBottom:12 }}>Platform Features</div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(36px,6vw,64px)", fontWeight:900, textTransform:"uppercase", color:T.text }}>Intelligence at Every Lap</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
                {[
                  {id:"dashboard",emoji:"🗺️",title:"Race Replay",color:T.teal,desc:"Watch any race unfold with live driver positions on an animated track map. DRS zones, safety car periods, and pit windows — all visualized in real time."},
                  {id:"dashboard",emoji:"📊",title:"Strategy Visualizer",color:T.gold,desc:"Bayesian tyre degradation models reveal the true story behind every pit stop. Compare stint lengths, compound choices, and undercut windows."},
                  {id:"ai",emoji:"🤖",title:"AI Race Assistant",color:T.red,desc:"GridBot explains race strategies, predicts outcomes, and compares drivers with the precision of a race engineer and the clarity of a broadcaster."},
                ].map((f,i)=>(
                  <div key={i} onClick={()=>setPage(f.id)}
                    style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:32, cursor:"pointer", transition:"all 0.3s", position:"relative", overflow:"hidden" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=f.color+"55";e.currentTarget.style.background=T.cardHover;e.currentTarget.style.transform="translateY(-4px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;e.currentTarget.style.transform="none";}}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:f.color }}/>
                    <div style={{ fontSize:40, marginBottom:20 }}>{f.emoji}</div>
                    <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:800, textTransform:"uppercase", color:T.text, marginBottom:12 }}>{f.title}</h3>
                    <p style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>{f.desc}</p>
                    <div style={{ marginTop:24, fontSize:13, color:f.color, fontWeight:700 }}>Explore →</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Standings strip */}
            <div style={{ background:T.surface, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, padding:"32px 20px" }}>
              <div style={{ maxWidth:1200, margin:"0 auto" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:800, textTransform:"uppercase" }}>2026 Driver Standings</div>
                  <button onClick={()=>setPage("drivers")} style={{ background:"none", border:`1px solid ${T.border}`, color:T.muted, borderRadius:8, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>View All →</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
                  {DRIVERS.slice(0,6).map((d,i)=>(
                    <div key={d.code} onClick={()=>setPage("drivers")}
                      style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"all 0.2s", borderTop:`3px solid ${d.color}` }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=d.color+"66";e.currentTarget.style.background=T.cardHover;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.card;e.currentTarget.style.borderTopColor=d.color;}}>
                      <span style={{ fontSize:18, fontWeight:900, color:i===0?T.gold:i===1?T.silver:i===2?"#cd7f32":T.muted, minWidth:24 }}>{d.pos}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                        <div style={{ fontSize:11, color:T.muted }}>{d.team}</div>
                      </div>
                      <div style={{ fontSize:20, fontWeight:900, color:d.color }}>{d.pts}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <CommunitySection/>
            <footer style={{ background:T.surface, borderTop:`1px solid ${T.border}`, padding:"40px 20px" }}>
              <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:18, letterSpacing:1, textTransform:"uppercase" }}>APEX<span style={{ color:T.red }}>GRID</span></div>
                <div style={{ display:"flex", gap:20 }}>
                  {["GitHub","API Docs","Newsletter","Twitter"].map(l=>(
                    <a key={l} href="#" style={{ fontSize:13, color:T.muted, textDecoration:"none" }}>{l}</a>
                  ))}
                </div>
                <div style={{ fontSize:12, color:T.muted }}>© 2026 ApexGrid · F1 data for fans</div>
              </div>
            </footer>
          </>
        )}
        {page==="dashboard"&&<Dashboard/>}
        {page==="ai"&&(
          <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 20px" }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, color:T.red, fontWeight:800, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>AI Race Intelligence</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:900, textTransform:"uppercase", color:T.text }}>GridBot</h2>
              <p style={{ color:T.muted, marginTop:6 }}>Race engineer precision · Broadcaster clarity · 2026 season data</p>
            </div>
            <div style={{ background:T.card, border:`1px solid ${T.red}33`, borderRadius:16, overflow:"hidden", height:600, boxShadow:`0 0 60px ${T.redGlow}` }}>
              <AIChat/>
            </div>
          </div>
        )}
        {page==="community"&&(
          <div style={{ padding:"32px 20px" }}>
            <div style={{ maxWidth:1200, margin:"0 auto", marginBottom:32 }}>
              <div style={{ fontSize:11, color:T.red, fontWeight:800, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>Fan Community</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:900, textTransform:"uppercase", color:T.text }}>The Grid Talks</h2>
            </div>
            <CommunitySection/>
          </div>
        )}
        {page==="drivers"&&(
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 20px" }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, color:T.red, fontWeight:800, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>2026 Grid</div>
              <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:900, textTransform:"uppercase", color:T.text }}>Driver Profiles</h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
              {DRIVERS.map((d,i)=>(
                <div key={d.code} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:22, cursor:"pointer", transition:"all 0.3s", position:"relative", overflow:"hidden" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=d.color+"66";e.currentTarget.style.transform="translateY(-3px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="none";}}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:d.color }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                    <div>
                      <div style={{ fontSize:11, color:T.muted }}>{d.nat} · P{d.pos}</div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, textTransform:"uppercase", color:T.text, marginTop:3 }}>{d.name}</div>
                      <div style={{ fontSize:12, color:T.muted }}>{d.team}</div>
                    </div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:38, fontWeight:900, color:d.color, opacity:0.8 }}>{d.code}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                    {[["PTS",d.pts,d.color],["Wins",d.wins,T.green],["Pods",d.podiums,T.gold]].map(([k,v,col])=>(
                      <div key={k} style={{ background:T.surface, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:20, fontWeight:700, color:col }}>{v}</div>
                        <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:0.5 }}>{k}</div>
                      </div>
                    ))}
                  </div>
                  {[["Pace",d.pace,d.color],["Racecraft",d.racecraft,T.teal]].map(([k,v,col])=>(
                    <div key={k} style={{ marginBottom:6 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:0.5 }}>{k}</span>
                        <span style={{ fontSize:10, color:col, fontFamily:"'DM Mono',monospace" }}>{v}</span>
                      </div>
                      <div style={{ height:3, background:T.border, borderRadius:2 }}>
                        <div style={{ width:`${v}%`, height:"100%", background:col, borderRadius:2, transition:"width 0.8s ease" }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:12, fontSize:12, color:T.muted, fontStyle:"italic" }}>"{d.style}"</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
