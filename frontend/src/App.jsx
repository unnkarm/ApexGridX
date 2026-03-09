import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM  — Motorsport Engineering Aesthetic
   Dark carbon-fibre base · Electric red accent · Telemetry green data
   Font: Barlow Condensed (display) + DM Mono (data) + Outfit (body)
═══════════════════════════════════════════════════════════════════════════ */
const T = {
  bg:        "#050507",
  surface:   "#0d0d10",
  card:      "#111115",
  cardHover: "#161620",
  border:    "#1e1e28",
  borderBright:"#2e2e3e",
  red:       "#e10600",
  redDim:    "#e1060018",
  redGlow:   "#e1060033",
  green:     "#00e676",
  greenDim:  "#00e67614",
  teal:      "#00bcd4",
  gold:      "#ffc107",
  silver:    "#90a4ae",
  text:      "#f0f0f6",
  muted:     "rgba(240,240,246,0.45)",
  dim:       "rgba(240,240,246,0.12)",
};

/* ═══════════════════════════════════════════════════════════════════════════
   DATA LAYER  — mirrors Ergast + FastF1 API shapes
═══════════════════════════════════════════════════════════════════════════ */
const DRIVERS = [
  { pos:1,  code:"VER", name:"Max Verstappen",   team:"Red Bull",   pts:77,  wins:2, podiums:3,  champs:4, nat:"🇳🇱", color:"#3671C6", style:"Aggressive late braking",  pace:98, racecraft:96, consistency:95, starts:200 },
  { pos:2,  code:"NOR", name:"Lando Norris",      team:"McLaren",    pts:62,  wins:1, podiums:3,  champs:0, nat:"🇬🇧", color:"#FF8000", style:"High-speed apex precision", pace:95, racecraft:93, consistency:91, starts:125 },
  { pos:3,  code:"LEC", name:"Charles Leclerc",   team:"Ferrari",    pts:56,  wins:1, podiums:2,  champs:0, nat:"🇲🇨", color:"#E8002D", style:"Ultra-late braking",        pace:96, racecraft:91, consistency:89, starts:142 },
  { pos:4,  code:"PIA", name:"Oscar Piastri",     team:"McLaren",    pts:49,  wins:0, podiums:2,  champs:0, nat:"🇦🇺", color:"#FF8000", style:"Methodical tyre management", pace:92, racecraft:90, consistency:92, starts:55  },
  { pos:5,  code:"RUS", name:"George Russell",    team:"Mercedes",   pts:37,  wins:0, podiums:1,  champs:0, nat:"🇬🇧", color:"#27F4D2", style:"Clinical consistency",       pace:91, racecraft:90, consistency:94, starts:133 },
  { pos:6,  code:"HAM", name:"Lewis Hamilton",    team:"Ferrari",    pts:30,  wins:0, podiums:1,  champs:7, nat:"🇬🇧", color:"#E8002D", style:"Adaptive tyre whisperer",    pace:97, racecraft:98, consistency:96, starts:335 },
  { pos:7,  code:"ANT", name:"Kimi Antonelli",    team:"Mercedes",   pts:22,  wins:0, podiums:0,  champs:0, nat:"🇮🇹", color:"#27F4D2", style:"Fearless overtaker",         pace:88, racecraft:85, consistency:82, starts:18  },
  { pos:8,  code:"SAI", name:"Carlos Sainz",      team:"Williams",   pts:18,  wins:0, podiums:0,  champs:0, nat:"🇪🇸", color:"#37BEDD", style:"Smooth racecraft",           pace:89, racecraft:88, consistency:90, starts:198 },
  { pos:9,  code:"ALO", name:"Fernando Alonso",   team:"Aston Martin",pts:14, wins:0, podiums:0,  champs:2, nat:"🇪🇸", color:"#358C75", style:"Chess grandmaster",          pace:93, racecraft:97, consistency:91, starts:392 },
  { pos:10, code:"TSU", name:"Yuki Tsunoda",      team:"Red Bull",   pts:10,  wins:0, podiums:0,  champs:0, nat:"🇯🇵", color:"#3671C6", style:"High risk / reward",         pace:87, racecraft:86, consistency:84, starts:98  },
];

const CONSTRUCTORS = [
  { pos:1, name:"McLaren",       pts:111, color:"#FF8000", drivers:["NOR","PIA"], change:+1 },
  { pos:2, name:"Red Bull",      pts:87,  color:"#3671C6", drivers:["VER","TSU"], change:-1 },
  { pos:3, name:"Ferrari",       pts:86,  color:"#E8002D", drivers:["LEC","HAM"], change:0  },
  { pos:4, name:"Mercedes",      pts:59,  color:"#27F4D2", drivers:["RUS","ANT"], change:0  },
  { pos:5, name:"Williams",      pts:18,  color:"#37BEDD", drivers:["SAI","ALB"], change:+2 },
  { pos:6, name:"Aston Martin",  pts:14,  color:"#358C75", drivers:["ALO","STR"], change:-1 },
  { pos:7, name:"Alpine",        pts:8,   color:"#FF87BC", drivers:["GAS","DOO"], change:0  },
  { pos:8, name:"Haas",          pts:6,   color:"#B6BABD", drivers:["BEA","OCO"], change:+1 },
];

const PTS_DATA = [
  { race:"AUS", VER:25, NOR:18, LEC:15, PIA:12, RUS:10, HAM:8  },
  { race:"CHN", VER:37, NOR:43, LEC:27, PIA:27, RUS:22, HAM:14 },
  { race:"JPN", VER:49, NOR:55, LEC:43, PIA:38, RUS:29, HAM:21 },
];

const TYRE_STRATEGIES = {
  "Australian GP": [
    { driver:"VER", stints:[{compound:"SOFT",laps:22,deg:68},{compound:"HARD",laps:36,deg:31}] },
    { driver:"NOR", stints:[{compound:"SOFT",laps:20,deg:72},{compound:"HARD",laps:38,deg:28}] },
    { driver:"LEC", stints:[{compound:"MEDIUM",laps:18,deg:55},{compound:"HARD",laps:22,deg:42},{compound:"SOFT",laps:18,deg:85}] },
  ]
};

const RACE_EVENTS = [
  { lap:1,   type:"start",    desc:"Lights out — Verstappen leads into T1",     icon:"🚦" },
  { lap:8,   type:"incident", desc:"Gasly retires — hydraulic failure",          icon:"⚠️" },
  { lap:15,  type:"sc",       desc:"Safety Car deployed — debris on track",      icon:"🚨" },
  { lap:18,  type:"pit",      desc:"Verstappen pits under SC — Soft→Hard",       icon:"🔧" },
  { lap:20,  type:"pit",      desc:"Norris pits — fresh Mediums fitted",         icon:"🔧" },
  { lap:22,  type:"overtake", desc:"Leclerc passes Russell into Turn 3",         icon:"⚡" },
  { lap:32,  type:"drs",      desc:"Norris opens DRS — closes on Verstappen",    icon:"💨" },
  { lap:41,  type:"fastest",  desc:"Norris sets fastest lap — 1:19.421",         icon:"⏱️" },
  { lap:58,  type:"finish",   desc:"Verstappen takes the chequered flag",        icon:"🏁" },
];

const COMMUNITY_POSTS = [
  { id:1, user:"RacingNerd_88", avatar:"🏎️", title:"Ferrari's lap 19 pit call was a disaster — analysis inside", upvotes:284, comments:47, tag:"Strategy Debate", hot:true, team:"Ferrari", time:"2h ago" },
  { id:2, user:"PapayaNation",  avatar:"🟠", title:"McLaren's rear wing update is worth +0.3s per lap. Here's why.", upvotes:196, comments:31, tag:"Tech Analysis", hot:true, team:"McLaren", time:"4h ago" },
  { id:3, user:"SilverArrows",  avatar:"⭐", title:"Antonelli is the real deal — lap comparison vs Hamilton rookie year", upvotes:142, comments:58, tag:"Driver Analysis", hot:false, team:"Mercedes", time:"6h ago" },
  { id:4, user:"TifosiFanatic", avatar:"🔴", title:"Hamilton admits Ferrari needs 3 more races to find the sweet spot", upvotes:118, comments:82, tag:"Team News", hot:false, team:"Ferrari", time:"8h ago" },
  { id:5, user:"ApexHunter",    avatar:"💙", title:"Verstappen's braking telemetry at Suzuka is otherworldly", upvotes:97,  comments:24, tag:"Telemetry", hot:false, team:"Red Bull", time:"12h ago" },
];

const TEAM_COMMUNITIES = [
  { name:"Red Bull Garage",    color:"#3671C6", members:"124k", posts:892,  emoji:"🏆" },
  { name:"Ferrari Tifosi",     color:"#E8002D", members:"198k", posts:1241, emoji:"🔴" },
  { name:"McLaren Papaya Hub", color:"#FF8000", members:"89k",  posts:634,  emoji:"🟠" },
  { name:"Mercedes Pitwall",   color:"#27F4D2", members:"76k",  posts:521,  emoji:"⭐" },
  { name:"Williams Grove",     color:"#37BEDD", members:"34k",  posts:289,  emoji:"🔵" },
  { name:"Aston Martin HQ",    color:"#358C75", members:"28k",  posts:201,  emoji:"💚" },
];

const PREDICTIONS = [
  { user:"GridMaster",   pts:340, correct:14, rank:1 },
  { user:"PitWallPro",   pts:295, correct:12, rank:2 },
  { user:"ApexAnalyst",  pts:271, correct:11, rank:3 },
  { user:"RacingNerd_88",pts:248, correct:10, rank:4 },
  { user:"You",          pts:183, correct:7,  rank:5, isMe:true },
];

const NEXT_RACE = { name:"Bahrain GP", circuit:"Bahrain International Circuit", country:"🇧🇭", date:"Apr 13, 2026", days:35, hours:14, mins:22, round:4 };

/* ═══════════════════════════════════════════════════════════════════════════
   TRACK MAP  — Animated SVG circuit with DRS zones
   Inspired by build_track_from_example_lap() from race_replay.py
═══════════════════════════════════════════════════════════════════════════ */
function TrackMap({ animated = true }) {
  const [carPos, setCarPos] = useState(0);
  const progressRef = useRef(0);

  const trackPoints = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const angle = t * 2 * Math.PI;
    const r1 = 140 + 30 * Math.cos(3 * angle) + 20 * Math.sin(2 * angle);
    const r2 = 90 + 20 * Math.cos(2 * angle) + 15 * Math.sin(3 * angle);
    const r = (r1 + r2) / 2;
    trackPoints.push({
      x: 320 + r * Math.cos(angle - Math.PI / 2),
      y: 200 + r * 0.6 * Math.sin(angle - Math.PI / 2),
    });
  }

  useEffect(() => {
    if (!animated) return;
    let frame;
    const animate = () => {
      progressRef.current = (progressRef.current + 0.002) % 1;
      setCarPos(progressRef.current);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const carIndex = Math.floor(carPos * 100);
  const car = trackPoints[carIndex] || trackPoints[0];
  const nextCar = trackPoints[(carIndex + 1) % 100];
  const angle = Math.atan2(nextCar.y - car.y, nextCar.x - car.x) * (180 / Math.PI);

  const ghostCars = [
    { offset: 0.15, color: "#E8002D", code: "LEC" },
    { offset: 0.28, color: "#FF8000", code: "NOR" },
    { offset: 0.42, color: "#27F4D2", code: "RUS" },
  ];

  return (
    <svg viewBox="0 80 640 260" style={{ width: "100%", height: "100%" }}>
      <defs>
        <filter id="redglow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polyline points={trackPoints.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#2a2a35" strokeWidth="34" />
      <polyline points={trackPoints.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#333340" strokeWidth="28" />
      {[{ start: 5, end: 18 }, { start: 55, end: 65 }].map((zone, zi) => (
        <polyline key={zi}
          points={trackPoints.slice(zone.start, zone.end).map(p => `${p.x},${p.y}`).join(" ")}
          fill="none" stroke="#00e676" strokeWidth="4" opacity="0.6"
          style={{ filter: "drop-shadow(0 0 4px #00e676)" }}
        />
      ))}
      {(() => {
        const p = trackPoints[0]; const next = trackPoints[1];
        const pa = Math.atan2(next.y - p.y, next.x - p.x) + Math.PI / 2;
        return <line x1={p.x + Math.cos(pa)*20} y1={p.y + Math.sin(pa)*20} x2={p.x - Math.cos(pa)*20} y2={p.y - Math.sin(pa)*20} stroke="white" strokeWidth="3" opacity="0.8" />;
      })()}
      {ghostCars.map((gc) => {
        const gIdx = Math.floor(((carPos + gc.offset) % 1) * 100);
        const gCar = trackPoints[gIdx] || trackPoints[0];
        return (
          <g key={gc.code}>
            <circle cx={gCar.x} cy={gCar.y} r="5" fill={gc.color} opacity="0.7" />
            <text x={gCar.x + 8} y={gCar.y + 4} fill={gc.color} fontSize="9" fontWeight="bold" opacity="0.9">{gc.code}</text>
          </g>
        );
      })}
      <g transform={`translate(${car.x},${car.y}) rotate(${angle})`} filter="url(#redglow)">
        <rect x="-8" y="-4" width="16" height="8" rx="3" fill={T.red} />
        <polygon points="8,0 12,-3 12,3" fill={T.red} />
      </g>
      <text x={car.x + 12} y={car.y - 8} fill={T.red} fontSize="10" fontWeight="900">VER</text>
      {[{ x:320,y:100,label:"T1" },{ x:480,y:200,label:"T5" },{ x:320,y:300,label:"T10" },{ x:155,y:200,label:"T15" }].map(c => (
        <text key={c.label} x={c.x} y={c.y} fill={T.muted} fontSize="11" textAnchor="middle">{c.label}</text>
      ))}
      <text x={370} y={95} fill={T.green} fontSize="10" fontWeight="700">DRS</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TYRE STRATEGY BAR — from bayesian_tyre_model.py degradation concepts
═══════════════════════════════════════════════════════════════════════════ */
function TyreStrategyBar({ stints, totalLaps = 58 }) {
  const compoundColors = {
    SOFT:   { bg: "#e10600", text: "S" },
    MEDIUM: { bg: "#ffc107", text: "M" },
    HARD:   { bg: "#e0e0e0", text: "H" },
    INTERMEDIATE: { bg: "#4caf50", text: "I" },
    WET:    { bg: "#2196f3", text: "W" },
  };
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", height: 28 }}>
      {stints.map((s, i) => {
        const c = compoundColors[s.compound] || compoundColors.HARD;
        return (
          <div key={i} title={`${s.compound} — ${s.laps} laps (${s.deg}% deg)`}
            style={{ width:`${(s.laps/totalLaps)*100}%`, height:28, background:c.bg, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", cursor:"default", minWidth:24, opacity:0.85+(0.15*(1-s.deg/100)) }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.3)"}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}>
            <span style={{ fontSize:11, fontWeight:900, color:s.compound==="HARD"?"#111":"#fff" }}>{c.text}</span>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"rgba(0,0,0,0.5)", borderRadius:"0 0 4px 4px" }}>
              <div style={{ width:`${s.deg}%`, height:"100%", background:s.deg>70?"#e10600":s.deg>40?"#ffc107":"#00e676", borderRadius:"0 0 4px 4px" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RACE TIMELINE — from extract_race_events() in ui_components.py
═══════════════════════════════════════════════════════════════════════════ */
function RaceTimeline({ events, totalLaps = 58 }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   PLAYBACK CONTROLS — from RaceControlsComponent in ui_components.py
═══════════════════════════════════════════════════════════════════════════ */
function PlaybackControls({ lap, totalLaps, isPlaying, onToggle, onRestart, speed, onSpeedChange }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   LIVE LEADERBOARD — from LeaderboardComponent in ui_components.py
═══════════════════════════════════════════════════════════════════════════ */
function LiveLeaderboard({ onSelect, selected }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   TELEMETRY PANEL — from DriverInfoComponent (speed/gear/DRS/throttle)
═══════════════════════════════════════════════════════════════════════════ */
function TelemetryPanel({ driverCode }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   AI CHAT — GridBot with Anthropic API
═══════════════════════════════════════════════════════════════════════════ */
function AIChat() {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"👋 I'm GridBot — your AI F1 analyst. I can explain strategies, predict outcomes, compare drivers, or give you a race breakdown. What do you want to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const send = async () => {
    const q = input.trim();
    if (!q||loading) return;
    setInput("");
    const newMessages = [...messages,{role:"user",content:q}];
    setMessages(newMessages);
    setLoading(true);
    try {
      const system = `You are GridBot — an elite F1 analyst embedded in ApexGrid. 2026 season: VER 77pts, NOR 62pts, LEC 56pts. McLaren leads constructors 111pts. Hamilton moved to Ferrari. Races done: AUS (VER), CHN (NOR), JPN (LEC). Next: Bahrain GP Apr 13. Max 100 words. 1-2 emojis. Be specific and insightful.`;
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system,
          messages:newMessages.map(m=>({role:m.role,content:m.content}))
        })
      });
      const data = await resp.json();
      const reply = data.content?.map(b=>b.text||"").join("")||"Signal lost — try again.";
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch {
      setMessages(prev=>[...prev,{role:"assistant",content:"Network timeout. Please retry."}]);
    }
    setLoading(false);
  };

  const quickQ = ["Why did Ferrari lose Australia?","Explain the undercut strategy","Who wins Bahrain GP?","Compare VER vs NOR pace"];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"82%", background:m.role==="user"?T.red:T.card, border:m.role==="assistant"?`1px solid ${T.border}`:"none", borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"10px 14px", fontSize:13, color:T.text, lineHeight:1.65 }}>
              {m.role==="assistant"&&<div style={{ fontSize:10, color:T.red, fontWeight:800, letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>⬡ GRIDBOT</div>}
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{ display:"flex", gap:5, padding:"10px 14px", background:T.card, border:`1px solid ${T.border}`, borderRadius:"16px 16px 16px 4px", maxWidth:70 }}>
            {[0,1,2].map(j=><div key={j} style={{ width:7, height:7, borderRadius:"50%", background:T.red, animation:`bounce 0.9s ${j*0.15}s infinite` }}/>)}
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{ padding:"8px 16px", borderTop:`1px solid ${T.border}`, display:"flex", gap:6, flexWrap:"wrap" }}>
        {quickQ.map(q=>(
          <button key={q} onClick={()=>setInput(q)}
            style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:20, padding:"4px 11px", fontSize:11, color:T.muted, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>{e.target.style.borderColor=T.red;e.target.style.color=T.text;}}
            onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}>
            {q}
          </button>
        ))}
      </div>
      <div style={{ padding:14, borderTop:`1px solid ${T.border}`, display:"flex", gap:10 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask about race strategy, telemetry, driver pace..."
          style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", color:T.text, fontSize:13, outline:"none", fontFamily:"inherit" }}/>
        <button onClick={send} disabled={loading||!input.trim()}
          style={{ background:T.red, border:"none", borderRadius:10, padding:"10px 20px", color:"#fff", fontWeight:700, cursor:"pointer", opacity:loading?0.5:1, boxShadow:`0 0 16px ${T.redGlow}`, transition:"opacity 0.2s" }}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════════════════════════════════ */
function Hero({ onCTA }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   COMMUNITY SECTION
═══════════════════════════════════════════════════════════════════════════ */
function CommunitySection() {
  const [activeTeam, setActiveTeam] = useState(null);
  return (
    <div style={{ padding:"80px 20px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:32, alignItems:"start" }}>
        <div>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, color:T.red, fontWeight:800, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>Community</div>
            <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:900, textTransform:"uppercase", color:T.text }}>The Grid Talks</h2>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {COMMUNITY_POSTS.map((p,i)=>(
              <div key={p.id} style={{ background:T.card, border:`1px solid ${p.hot?T.red+"33":T.border}`, borderRadius:12, padding:"16px 20px", transition:"all 0.2s", cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.background=T.cardHover;e.currentTarget.style.borderColor=T.borderBright;}}
                onMouseLeave={e=>{e.currentTarget.style.background=T.card;e.currentTarget.style.borderColor=p.hot?T.red+"33":T.border;}}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0, minWidth:40 }}>
                    <button style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:16, lineHeight:1, padding:2 }}
                      onMouseEnter={e=>e.target.style.color=T.red} onMouseLeave={e=>e.target.style.color=T.muted}>▲</button>
                    <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{p.upvotes}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                      {p.hot&&<span style={{ background:T.redDim, border:`1px solid ${T.red}44`, color:T.red, fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:4, letterSpacing:1 }}>🔥 HOT</span>}
                      <span style={{ background:T.surface, border:`1px solid ${T.border}`, color:T.muted, fontSize:10, padding:"2px 8px", borderRadius:4 }}>{p.tag}</span>
                      <span style={{ fontSize:12, color:T.muted }}>{p.user} · {p.time}</span>
                    </div>
                    <div style={{ fontSize:15, fontWeight:600, color:T.text, lineHeight:1.4, marginBottom:10 }}>{p.title}</div>
                    <span style={{ fontSize:12, color:T.muted }}>💬 {p.comments} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, fontWeight:700, fontSize:14, color:T.text }}>⚡ Team Communities</div>
            {TEAM_COMMUNITIES.slice(0,4).map(tc=>(
              <div key={tc.name} onClick={()=>setActiveTeam(tc.name===activeTeam?null:tc.name)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", borderBottom:`1px solid ${T.border}`, cursor:"pointer", background:activeTeam===tc.name?`${tc.color}11`:"transparent", transition:"background 0.2s", borderLeft:activeTeam===tc.name?`3px solid ${tc.color}`:"3px solid transparent" }}
                onMouseEnter={e=>activeTeam!==tc.name&&(e.currentTarget.style.background=T.cardHover)}
                onMouseLeave={e=>activeTeam!==tc.name&&(e.currentTarget.style.background="transparent")}>
                <span style={{ fontSize:18 }}>{tc.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{tc.name}</div>
                  <div style={{ fontSize:11, color:T.muted }}>{tc.members} members</div>
                </div>
                <span style={{ fontSize:11, color:T.muted }}>{tc.posts} posts</span>
              </div>
            ))}
          </div>
          <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, fontWeight:700, fontSize:14, color:T.text }}>🏆 Prediction League</div>
            {PREDICTIONS.map((p,i)=>(
              <div key={p.user} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 18px", borderBottom:i<PREDICTIONS.length-1?`1px solid ${T.border}`:"none", background:p.isMe?T.redDim:"transparent" }}>
                <span style={{ width:20, fontWeight:900, fontSize:13, color:i===0?T.gold:i===1?T.silver:i===2?"#cd7f32":T.muted, textAlign:"center" }}>{p.rank}</span>
                <span style={{ flex:1, fontSize:13, fontWeight:p.isMe?700:400, color:p.isMe?T.text:T.muted }}>{p.isMe?"⭐ ":""}{p.user}</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:i===0?T.gold:T.muted }}>{p.pts}pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
function Dashboard() {
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */
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
