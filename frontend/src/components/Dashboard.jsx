import { useState, useEffect, useRef } from "react";
import { T } from "../constants/theme";
import { DRIVERS, CONSTRUCTORS, PTS_DATA, TYRE_STRATEGIES, RACE_EVENTS, COMMUNITY_POSTS, TEAM_COMMUNITIES, PREDICTIONS, NEXT_RACE } from "../constants/data";
import TrackMap from "./TrackMap";
import TyreStrategyBar from "./TyreStrategyBar";
import RaceTimeline from "./RaceTimeline";
import PlaybackControls from "./PlaybackControls";
import LiveLeaderboard from "./LiveLeaderboard";
import TelemetryPanel from "./TelemetryPanel";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

export default function Dashboard() {
  const [lap, setLap] = useState(32);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState("VER");
  const [activeTab, setActiveTab] = useState("replay");
  const playRef = useRef(null);

  useEffect(()=>{
    if(isPlaying){
      playRef.current = setInterval(()=>{
        setLap(prev=>{
          if(prev>=58){setIsPlaying(false);return 58;}
          return prev+(speed*0.1>1?Math.floor(speed*0.1):1);
        });
      },200/speed);
    }
    return ()=>clearInterval(playRef.current);
  },[isPlaying,speed]);

  const tabs = [
    {id:"replay",label:"Track Replay",icon:"🗺️"},
    {id:"strategy",label:"Tyre Strategy",icon:"📊"},
    {id:"timeline",label:"Race Timeline",icon:"📋"},
    {id:"telemetry",label:"Telemetry",icon:"📡"},
  ];

  return (
    <div style={{ maxWidth:1400, margin:"0 auto", padding:"24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, textTransform:"uppercase", color:T.text }}>Australian GP — Race Dashboard</div>
          <div style={{ fontSize:12, color:T.muted }}>Melbourne · Round 1/24 · Mar 16, 2026 · 58 Laps</div>
        </div>
        <div style={{ marginLeft:"auto" }}>
          <div style={{ background:T.greenDim, border:`1px solid ${T.green}44`, borderRadius:8, padding:"6px 14px", fontSize:12, color:T.green, fontWeight:700 }}>FINISHED</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"flex", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)}
                style={{ flex:1, background:activeTab===t.id?T.red:"transparent", color:activeTab===t.id?"#fff":T.muted, border:"none", padding:"10px 6px", cursor:"pointer", fontWeight:activeTab===t.id?700:400, fontSize:13, transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span>{t.icon}</span><span>{t.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {activeTab==="replay"&&(
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ aspectRatio:"16/7", position:"relative" }}>
                <TrackMap animated={isPlaying}/>
                <div style={{ position:"absolute", top:12, left:12, background:"rgba(5,5,7,0.85)", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px" }}>
                  <div style={{ fontSize:10, color:T.muted, letterSpacing:1 }}>BAHRAIN INT. CIRCUIT</div>
                  <div style={{ fontSize:13, fontWeight:700, color:T.text }}>Lap {lap} / 58</div>
                </div>
              </div>
              <div style={{ padding:"12px 16px" }}>
                <PlaybackControls lap={lap} totalLaps={58} isPlaying={isPlaying}
                  onToggle={()=>setIsPlaying(p=>!p)} onRestart={()=>{setLap(1);setIsPlaying(false);}}
                  speed={speed} onSpeedChange={setSpeed}/>
              </div>
            </div>
          )}

          {activeTab==="strategy"&&(
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, textTransform:"uppercase", color:T.text, marginBottom:6 }}>Tyre Strategy · Australian GP</h3>
              <p style={{ fontSize:12, color:T.muted, marginBottom:20 }}>Bayesian state-space degradation model — compound choices and deg rates</p>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {TYRE_STRATEGIES["Australian GP"].map(d=>{
                  const dr = DRIVERS.find(x=>x.code===d.driver);
                  return (
                    <div key={d.driver} style={{ display:"grid", gridTemplateColumns:"100px 1fr", gap:14, alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:3, height:28, background:dr?.color||T.muted, borderRadius:2 }}/>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:T.text }}>{d.driver}</div>
                          <div style={{ fontSize:11, color:T.muted }}>{dr?.team}</div>
                        </div>
                      </div>
                      <TyreStrategyBar stints={d.stints} totalLaps={58}/>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:28 }}>
                <div style={{ fontSize:11, color:T.muted, marginBottom:12, textTransform:"uppercase", letterSpacing:1 }}>Season Points Progression</div>
                <div style={{ height:200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PTS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                      <XAxis dataKey="race" tick={{fill:T.muted,fontSize:11}} axisLine={false}/>
                      <YAxis tick={{fill:T.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12}}/>
                      {["VER","NOR","LEC","PIA","RUS"].map(code=>{
                        const d = DRIVERS.find(x=>x.code===code);
                        return <Line key={code} type="monotone" dataKey={code} stroke={d?.color} strokeWidth={2.5} dot={{r:4,fill:d?.color}} name={code}/>;
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab==="timeline"&&(
            <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:24 }}>
              <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, textTransform:"uppercase", color:T.text, marginBottom:6 }}>Race Timeline · Australian GP</h3>
              <p style={{ fontSize:12, color:T.muted, marginBottom:20 }}>Hover events to see details</p>
              <RaceTimeline events={RACE_EVENTS} totalLaps={58}/>
            </div>
          )}

          {activeTab==="telemetry"&&(
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {DRIVERS.slice(0,6).map(d=>(
                  <button key={d.code} onClick={()=>setSelectedDriver(d.code)}
                    style={{ background:selectedDriver===d.code?d.color:T.surface, border:`1px solid ${selectedDriver===d.code?d.color:T.border}`, borderRadius:8, padding:"6px 14px", color:selectedDriver===d.code?"#fff":T.muted, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>
                    {d.code}
                  </button>
                ))}
              </div>
              <TelemetryPanel driverCode={selectedDriver}/>
              {(()=>{
                const d = DRIVERS.find(x=>x.code===selectedDriver);
                if(!d) return null;
                const radarData = [
                  {attr:"Pace",value:d.pace},{attr:"Racecraft",value:d.racecraft},
                  {attr:"Consistency",value:d.consistency},{attr:"Experience",value:Math.min(100,d.starts/4)},
                  {attr:"Championships",value:d.champs*14+20},
                ];
                return (
                  <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:20 }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, textTransform:"uppercase", color:T.text, marginBottom:16 }}>{d.name} · Driver Profile</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"center" }}>
                      <div style={{ height:220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke={T.border}/>
                            <PolarAngleAxis dataKey="attr" tick={{fill:T.muted,fontSize:11}}/>
                            <Radar dataKey="value" stroke={d.color} fill={d.color} fillOpacity={0.25} strokeWidth={2}/>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        {[["Nationality",d.nat],["Team",d.team],["Championships",d.champs],["Race Wins",d.wins],["Podiums",d.podiums],["Driving Style",d.style]].map(([k,v])=>(
                          <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:8, paddingBottom:8, borderBottom:`1px solid ${T.border}` }}>
                            <span style={{ fontSize:12, color:T.muted }}>{k}</span>
                            <span style={{ fontSize:12, fontWeight:600, color:T.text, textAlign:"right" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <LiveLeaderboard selected={selectedDriver} onSelect={setSelectedDriver}/>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:T.muted, letterSpacing:2, fontWeight:700, marginBottom:12, textTransform:"uppercase" }}>🌡️ Track Conditions · Lap 32</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[["Air Temp","28°C","🌡️"],["Track Temp","44°C","🛣️"],["Humidity","42%","💧"],["Wind","12 NNW","🌬️"]].map(([l,v,e])=>(
                <div key={l} style={{ background:T.surface, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:T.muted, marginBottom:3 }}>{e} {l}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:"'DM Mono',monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:16 }}>
            <div style={{ fontSize:11, color:T.muted, letterSpacing:2, fontWeight:700, marginBottom:14, textTransform:"uppercase" }}>Race Results</div>
            {[["P1","VER","1:31:48.192","🏆"],["P2","NOR","+1.8s","🥈"],["P3","LEC","+6.2s","🥉"],["FL","NOR","1:19.421","⏱️"]].map(([p,c,t,e])=>{
              const d = DRIVERS.find(x=>x.code===c);
              return (
                <div key={p} style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:10, marginBottom:10, borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ width:24, fontSize:11, color:T.muted, fontWeight:700 }}>{p}</span>
                  <div style={{ width:3, height:24, background:d?.color||T.muted, borderRadius:2 }}/>
                  <span style={{ flex:1, fontSize:13, fontWeight:700, color:T.text }}>{c}</span>
                  <span style={{ fontSize:12, color:T.muted, fontFamily:"'DM Mono',monospace" }}>{t}</span>
                  <span style={{ fontSize:14 }}>{e}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}