import { useState } from "react";
import { T } from "../constants/theme";
import { COMMUNITY_POSTS, TEAM_COMMUNITIES, PREDICTIONS } from "../constants/data";

export default function CommunitySection() {
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