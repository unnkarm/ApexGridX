import { T } from "../constants/theme";
import { RACE_EVENTS } from "../constants/data";

export default function PlaybackControls({ lap, totalLaps, isPlaying, onToggle, onRestart, speed, onSpeedChange }) {
  const progress = (lap/totalLaps)*100;
  const speeds = [0.5,1,2,4,8];
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 20px" }}>
      <div style={{ marginBottom:12 }}>
        <div style={{ height:4, background:T.border, borderRadius:4, position:"relative", overflow:"visible" }}>
          <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(to right,${T.red},${T.red}cc)`, borderRadius:4, transition:"width 0.3s" }} />
          <div style={{ position:"absolute", left:`${progress}%`, top:"50%", transform:"translate(-50%,-50%)", width:12, height:12, borderRadius:"50%", background:T.red, border:"2px solid #fff", boxShadow:`0 0 8px ${T.red}` }} />
          {RACE_EVENTS.map((e,i)=>(
            <div key={i} style={{ position:"absolute", left:`${(e.lap/totalLaps)*100}%`, top:-3, width:2, height:10, background:e.type==="sc"?"#FF9800":e.type==="pit"?T.teal:T.border, borderRadius:1 }} title={e.desc} />
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          <span style={{ fontSize:11, color:T.muted, fontFamily:"'DM Mono',monospace" }}>LAP {lap}/{totalLaps}</span>
          <span style={{ fontSize:11, color:T.muted }}>Race Time: 1:32:14</span>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={onRestart} style={{ background:T.border, border:"none", color:T.muted, width:34, height:34, borderRadius:8, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>⏮</button>
        <button onClick={onToggle} style={{ background:T.red, border:"none", color:"#fff", width:40, height:40, borderRadius:10, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 0 12px ${T.redGlow}` }}>
          {isPlaying?"⏸":"▶"}
        </button>
        <div style={{ flex:1, height:2, background:T.border, borderRadius:2 }} />
        <span style={{ fontSize:11, color:T.muted, marginRight:6 }}>Speed:</span>
        {speeds.map(s=>(
          <button key={s} onClick={()=>onSpeedChange(s)} style={{ background:speed===s?T.red:T.border, border:"none", color:speed===s?"#fff":T.muted, borderRadius:6, padding:"4px 9px", fontSize:11, cursor:"pointer", fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{s}x</button>
        ))}
      </div>
    </div>
  );
}