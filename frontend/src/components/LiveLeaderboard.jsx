import { T } from "../constants/theme";

export default function LiveLeaderboard({ onSelect, selected }) {
  const lbData = [
    { code:"VER", gap:"LEADER", interval:"—",     tyre:"HARD",   lap:32, color:"#3671C6", drs:false },
    { code:"NOR", gap:"+1.8s",  interval:"+1.8s", tyre:"HARD",   lap:32, color:"#FF8000", drs:true  },
    { code:"LEC", gap:"+6.2s",  interval:"+4.4s", tyre:"MEDIUM", lap:31, color:"#E8002D", drs:false },
    { code:"PIA", gap:"+11.1s", interval:"+4.9s", tyre:"HARD",   lap:32, color:"#FF8000", drs:false },
    { code:"RUS", gap:"+14.3s", interval:"+3.2s", tyre:"MEDIUM", lap:31, color:"#27F4D2", drs:false },
    { code:"HAM", gap:"+18.7s", interval:"+4.4s", tyre:"SOFT",   lap:30, color:"#E8002D", drs:true  },
  ];
  const tyreColors = { SOFT:"#e10600", MEDIUM:"#ffc107", HARD:"#bbb" };
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:T.green, animation:"pulse 1.5s infinite" }} />
        <span style={{ fontSize:12, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:T.muted }}>Live — Lap 32/58</span>
      </div>
      {lbData.map((d, i)=>(
        <div key={d.code} onClick={()=>onSelect(d.code===selected?null:d.code)}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderBottom:i<lbData.length-1?`1px solid ${T.border}`:"none", cursor:"pointer", background:selected===d.code?`${d.color}11`:"transparent", transition:"background 0.2s", borderLeft:selected===d.code?`3px solid ${d.color}`:"3px solid transparent" }}
          onMouseEnter={e=>selected!==d.code&&(e.currentTarget.style.background=T.cardHover)}
          onMouseLeave={e=>selected!==d.code&&(e.currentTarget.style.background="transparent")}>
          <span style={{ width:20, fontWeight:900, fontSize:14, color:i===0?T.gold:T.muted, textAlign:"center" }}>{i+1}</span>
          <div style={{ width:3, height:30, background:d.color, borderRadius:2, flexShrink:0 }} />
          <span style={{ flex:1, fontWeight:700, fontSize:13, color:T.text }}>{d.code}</span>
          {d.drs&&<span style={{ fontSize:9, background:T.greenDim, border:`1px solid ${T.green}44`, color:T.green, padding:"1px 5px", borderRadius:4, fontWeight:700 }}>DRS</span>}
          <div style={{ width:10, height:10, borderRadius:"50%", background:tyreColors[d.tyre]||T.muted, flexShrink:0, boxShadow:`0 0 4px ${tyreColors[d.tyre]}66` }} title={d.tyre} />
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:i===0?T.green:T.muted, minWidth:52, textAlign:"right" }}>{d.gap}</span>
        </div>
      ))}
    </div>
  );
}