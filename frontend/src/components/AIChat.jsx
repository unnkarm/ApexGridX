import { useState, useEffect, useRef } from "react";
import { T } from "../constants/theme";

export default function AIChat() {
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