import { T } from "../constants/theme";
import { DRIVERS } from "../constants/data";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

export default function TelemetryPanel({ driverCode }) {
  const d = DRIVERS.find(x=>x.code===driverCode)||DRIVERS[0];
  const telData = Array.from({length:60},(_,i)=>({
    dist:i*100,
    speed:120+200*Math.abs(Math.sin(i*0.3+1))+Math.random()*20,
  }));
  const currentSpeed = Math.round(telData[30].speed);
  const currentGear = Math.floor(currentSpeed/45)+1;
  return (
    <div style={{ background:T.surface, border:`1px solid ${d.color}33`, borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{ width:4, height:36, background:d.color, borderRadius:3 }} />
        <div>
          <div style={{ fontWeight:800, fontSize:16, color:T.text }}>{d.name}</div>
          <div style={{ fontSize:11, color:T.muted }}>{d.team} · Current Lap Telemetry</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, fontWeight:700, color:d.color }}>{currentSpeed}</div>
          <div style={{ fontSize:10, color:T.muted }}>km/h</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:14 }}>
        {[["GEAR",`${Math.min(currentGear,8)}`,d.color],["DRS",driverCode==="NOR"?"OPEN":"CLOSED",driverCode==="NOR"?T.green:T.muted],["TYRE","HARD","#bbb"],["LAP","32/58",T.muted]].map(([label,val,col])=>(
          <div key={label} style={{ background:T.card, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:10, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{label}</div>
            <div style={{ fontSize:15, fontWeight:700, color:col, fontFamily:"'DM Mono',monospace" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ height:80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={telData} margin={{top:0,right:0,bottom:0,left:0}}>
            <defs>
              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={d.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={d.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="speed" stroke={d.color} fill="url(#speedGrad)" strokeWidth={1.5} dot={false}/>
            <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:6,fontSize:11,color:T.text}} formatter={v=>[`${Math.round(v)} km/h`,"Speed"]}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}