import { useState } from "react";
import { T } from "../constants/theme";

export default function RaceTimeline({ events, totalLaps = 58 }) {
  const [active, setActive] = useState(null);
  const typeColors = { start:T.green, sc:"#FF9800", incident:"#ff5252", pit:T.teal, drs:T.green, fastest:T.gold, finish:T.text, overtake:T.red };
  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <div style={{ position:"relative", height:64, marginBottom:8 }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:2, background:T.border, transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", top:"50%", left:0, width:"52%", height:2, background:`linear-gradient(to right,${T.red},${T.red}99)`, transform:"translateY(-50%)" }} />
        {events.map((e, i) => {
          const left = `${(e.lap/totalLaps)*100}%`;
          const col = typeColors[e.type] || T.muted;
          return (
            <div key={i} style={{ position:"absolute", left, top:"50%", transform:"translate(-50%,-50%)", zIndex:2 }}
              onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:col, border:`2px solid ${col}`, boxShadow:`0 0 8px ${col}`, cursor:"pointer", transition:"transform 0.2s", transform:active===i?"scale(1.8)":"scale(1)" }} />
              {active===i && (
                <div style={{ position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)", background:T.card, border:`1px solid ${col}44`, borderRadius:8, padding:"8px 12px", whiteSpace:"nowrap", zIndex:10, pointerEvents:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize:10, color:col, fontWeight:700, marginBottom:2 }}>LAP {e.lap}</div>
                  <div style={{ fontSize:12, color:T.text }}>{e.icon} {e.desc}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:4 }}>
        {[0,10,20,30,40,50,58].map(lap=>(
          <span key={lap} style={{ fontSize:10, color:T.muted, fontFamily:"'DM Mono',monospace" }}>L{lap}</span>
        ))}
      </div>
      <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:6 }}>
        {events.map((e, i) => {
          const col = typeColors[e.type] || T.muted;
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:8, background:active===i?`${col}11`:"transparent", border:`1px solid ${active===i?col+"33":"transparent"}`, transition:"all 0.2s" }}
              onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)}>
              <div style={{ width:42, fontFamily:"'DM Mono',monospace", fontSize:11, color:col, fontWeight:700, flexShrink:0 }}>L{e.lap}</div>
              <div style={{ width:6, height:6, borderRadius:"50%", background:col, flexShrink:0 }} />
              <span style={{ fontSize:13, color:T.text }}>{e.icon} {e.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}