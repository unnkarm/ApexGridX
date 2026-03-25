
export default function TyreStrategyBar({ stints, totalLaps = 58 }) {
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