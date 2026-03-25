import { useState, useEffect, useRef } from "react";
import { T } from "../constants/theme";

export default function TrackMap({ animated = true }) {
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