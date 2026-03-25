export const DRIVERS = [
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

export const CONSTRUCTORS = [
  { pos:1, name:"McLaren",       pts:111, color:"#FF8000", drivers:["NOR","PIA"], change:+1 },
  { pos:2, name:"Red Bull",      pts:87,  color:"#3671C6", drivers:["VER","TSU"], change:-1 },
  { pos:3, name:"Ferrari",       pts:86,  color:"#E8002D", drivers:["LEC","HAM"], change:0  },
  { pos:4, name:"Mercedes",      pts:59,  color:"#27F4D2", drivers:["RUS","ANT"], change:0  },
  { pos:5, name:"Williams",      pts:18,  color:"#37BEDD", drivers:["SAI","ALB"], change:+2 },
  { pos:6, name:"Aston Martin",  pts:14,  color:"#358C75", drivers:["ALO","STR"], change:-1 },
  { pos:7, name:"Alpine",        pts:8,   color:"#FF87BC", drivers:["GAS","DOO"], change:0  },
  { pos:8, name:"Haas",          pts:6,   color:"#B6BABD", drivers:["BEA","OCO"], change:+1 },
];

export const PTS_DATA = [
  { race:"AUS", VER:25, NOR:18, LEC:15, PIA:12, RUS:10, HAM:8  },
  { race:"CHN", VER:37, NOR:43, LEC:27, PIA:27, RUS:22, HAM:14 },
  { race:"JPN", VER:49, NOR:55, LEC:43, PIA:38, RUS:29, HAM:21 },
];

export const TYRE_STRATEGIES = {
  "Australian GP": [
    { driver:"VER", stints:[{compound:"SOFT",laps:22,deg:68},{compound:"HARD",laps:36,deg:31}] },
    { driver:"NOR", stints:[{compound:"SOFT",laps:20,deg:72},{compound:"HARD",laps:38,deg:28}] },
    { driver:"LEC", stints:[{compound:"MEDIUM",laps:18,deg:55},{compound:"HARD",laps:22,deg:42},{compound:"SOFT",laps:18,deg:85}] },
  ]
};

export const RACE_EVENTS = [
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

export const COMMUNITY_POSTS = [
  { id:1, user:"RacingNerd_88", avatar:"🏎️", title:"Ferrari's lap 19 pit call was a disaster — analysis inside", upvotes:284, comments:47, tag:"Strategy Debate", hot:true, team:"Ferrari", time:"2h ago" },
  { id:2, user:"PapayaNation",  avatar:"🟠", title:"McLaren's rear wing update is worth +0.3s per lap. Here's why.", upvotes:196, comments:31, tag:"Tech Analysis", hot:true, team:"McLaren", time:"4h ago" },
  { id:3, user:"SilverArrows",  avatar:"⭐", title:"Antonelli is the real deal — lap comparison vs Hamilton rookie year", upvotes:142, comments:58, tag:"Driver Analysis", hot:false, team:"Mercedes", time:"6h ago" },
  { id:4, user:"TifosiFanatic", avatar:"🔴", title:"Hamilton admits Ferrari needs 3 more races to find the sweet spot", upvotes:118, comments:82, tag:"Team News", hot:false, team:"Ferrari", time:"8h ago" },
  { id:5, user:"ApexHunter",    avatar:"💙", title:"Verstappen's braking telemetry at Suzuka is otherworldly", upvotes:97,  comments:24, tag:"Telemetry", hot:false, team:"Red Bull", time:"12h ago" },
];

export const TEAM_COMMUNITIES = [
  { name:"Red Bull Garage",    color:"#3671C6", members:"124k", posts:892,  emoji:"🏆" },
  { name:"Ferrari Tifosi",     color:"#E8002D", members:"198k", posts:1241, emoji:"🔴" },
  { name:"McLaren Papaya Hub", color:"#FF8000", members:"89k",  posts:634,  emoji:"🟠" },
  { name:"Mercedes Pitwall",   color:"#27F4D2", members:"76k",  posts:521,  emoji:"⭐" },
  { name:"Williams Grove",     color:"#37BEDD", members:"34k",  posts:289,  emoji:"🔵" },
  { name:"Aston Martin HQ",    color:"#358C75", members:"28k",  posts:201,  emoji:"💚" },
];

export const PREDICTIONS = [
  { user:"GridMaster",   pts:340, correct:14, rank:1 },
  { user:"PitWallPro",   pts:295, correct:12, rank:2 },
  { user:"ApexAnalyst",  pts:271, correct:11, rank:3 },
  { user:"RacingNerd_88",pts:248, correct:10, rank:4 },
  { user:"You",          pts:183, correct:7,  rank:5, isMe:true },
];

export const NEXT_RACE = { name:"Bahrain GP", circuit:"Bahrain International Circuit", country:"🇧🇭", date:"Apr 13, 2026", days:35, hours:14, mins:22, round:4 };