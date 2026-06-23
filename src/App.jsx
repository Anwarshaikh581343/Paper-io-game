import { useState, useEffect, useRef } from "react";

const GRID = 120;
const CELL = 7;
const CANVAS_SIZE = GRID * CELL;

const COUNTRIES = [
  { id:"us", name:"USA", flag:"🇺🇸", color:"#3b82f6", dark:"#1d4ed8", trail:"#3b82f688" },
  { id:"mx", name:"Mexico", flag:"🇲🇽", color:"#22c55e", dark:"#15803d", trail:"#22c55e88" },
  { id:"br", name:"Brazil", flag:"🇧🇷", color:"#eab308", dark:"#a16207", trail:"#eab30888" },
  { id:"uk", name:"UK", flag:"🇬🇧", color:"#ef4444", dark:"#b91c1c", trail:"#ef444488" },
  { id:"fr", name:"France", flag:"🇫🇷", color:"#8b5cf6", dark:"#6d28d9", trail:"#8b5cf688" },
  { id:"de", name:"Germany", flag:"🇩🇪", color:"#f97316", dark:"#c2410c", trail:"#f9731688" },
  { id:"jp", name:"Japan", flag:"🇯🇵", color:"#ec4899", dark:"#be185d", trail:"#ec489988" },
  { id:"cn", name:"China", flag:"🇨🇳", color:"#ff073a", dark:"#b91c1c", trail:"#ff073a88" },
  { id:"ru", name:"Russia", flag:"🇷🇺", color:"#06b6d4", dark:"#0e7490", trail:"#06b6d488" },
  { id:"au", name:"Australia", flag:"🇦🇺", color:"#10b981", dark:"#065f46", trail:"#10b98188" },
  { id:"ca", name:"Canada", flag:"🇨🇦", color:"#f43f5e", dark:"#be123c", trail:"#f43f5e88" },
  { id:"kr", name:"South Korea", flag:"🇰🇷", color:"#a78bfa", dark:"#7c3aed", trail:"#a78bfa88" },
  { id:"it", name:"Italy", flag:"🇮🇹", color:"#34d399", dark:"#059669", trail:"#34d39988" },
  { id:"es", name:"Spain", flag:"🇪🇸", color:"#fb923c", dark:"#ea580c", trail:"#fb923c88" },
  { id:"ar", name:"Argentina", flag:"🇦🇷", color:"#38bdf8", dark:"#0284c7", trail:"#38bdf888" },
  { id:"ng", name:"Nigeria", flag:"🇳🇬", color:"#4ade80", dark:"#16a34a", trail:"#4ade8088" },
  { id:"in", name:"India", flag:"🇮🇳", color:"#fb7185", dark:"#e11d48", trail:"#fb718588" },
  { id:"sa", name:"Saudi Arabia", flag:"🇸🇦", color:"#86efac", dark:"#16a34a", trail:"#86efac88" },
  { id:"za", name:"South Africa", flag:"🇿🇦", color:"#fde68a", dark:"#d97706", trail:"#fde68a88" },
  { id:"tr", name:"Turkey", flag:"🇹🇷", color:"#fca5a5", dark:"#dc2626", trail:"#fca5a588" },
];

const CHARACTERS = [
  { id:"knight",  name:"Knight",   emoji:"⚔️",  skin:"#c0c0c0", speed:8,  power:"Shield Bash",   powerDesc:"Stun nearby enemies", icon:"🛡️" },
  { id:"ninja",   name:"Ninja",    emoji:"🥷",  skin:"#1a1a1a", speed:6,  power:"Shadow Dash",   powerDesc:"Speed boost for 3s",   icon:"⚡" },
  { id:"wizard",  name:"Wizard",   emoji:"🧙",  skin:"#7c3aed", speed:9,  power:"Magic Expand",  powerDesc:"Instant territory +10", icon:"✨" },
  { id:"robot",   name:"Robot",    emoji:"🤖",  skin:"#64748b", speed:7,  power:"Laser Trail",   powerDesc:"Triple trail speed",    icon:"🔴" },
  { id:"alien",   name:"Alien",    emoji:"👽",  skin:"#4ade80", speed:7,  power:"Teleport",      powerDesc:"Warp back to base",     icon:"🌀" },
  { id:"viking",  name:"Viking",   emoji:"⚡",  skin:"#fbbf24", speed:8,  power:"Berserker",     powerDesc:"Unstoppable for 2s",    icon:"💪" },
  { id:"samurai", name:"Samurai",  emoji:"🗡️",  skin:"#ef4444", speed:6,  power:"Katana Slash",  powerDesc:"Cut enemy territory",   icon:"🗡️" },
  { id:"pirate",  name:"Pirate",   emoji:"🏴‍☠️", skin:"#92400e", speed:8,  power:"Cannonball",    powerDesc:"Explode enemy trail",   icon:"💣" },
  { id:"astronaut",name:"Astronaut",emoji:"👨‍🚀",skin:"#e2e8f0", speed:7, power:"Zero Gravity",  powerDesc:"Float over trails",     icon:"🚀" },
  { id:"dragon",  name:"Dragon",   emoji:"🐉",  skin:"#dc2626", speed:6,  power:"Fire Breath",   powerDesc:"Burn nearby territory", icon:"🔥" },
  { id:"cat",     name:"Cat",      emoji:"🐱",  skin:"#fde68a", speed:7,  power:"Nine Lives",    powerDesc:"Survive one death",     icon:"❤️" },
  { id:"ghost",   name:"Ghost",    emoji:"👻",  skin:"#f1f5f9", speed:7,  power:"Phase Through", powerDesc:"Pass through trails",   icon:"👁️" },
];

function createGrid() { return new Uint8Array(GRID * GRID); }
function idx(x, y) { return y * GRID + x; }
function inBounds(x, y) { return x >= 0 && x < GRID && y >= 0 && y < GRID; }

function floodFill(grid, playerIdx) {
  const visited = new Uint8Array(GRID * GRID);
  const queue = [];
  for (let x = 0; x < GRID; x++) { pushIfValid(x, 0); pushIfValid(x, GRID-1); }
  for (let y = 1; y < GRID-1; y++) { pushIfValid(0, y); pushIfValid(GRID-1, y); }
  function pushIfValid(x, y) {
    const bi = idx(x, y);
    const v = grid[bi];
    if (!visited[bi] && v !== playerIdx && v !== playerIdx + 10) { visited[bi]=1; queue.push(bi); }
  }
  let qi = 0;
  while (qi < queue.length) {
    const ci = queue[qi++];
    const cx = ci % GRID, cy = Math.floor(ci / GRID);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
      const nx=cx+dx, ny=cy+dy;
      if (!inBounds(nx,ny)) return;
      const ni = idx(nx,ny);
      if (visited[ni]) return;
      const nv = grid[ni];
      if (nv === playerIdx || nv === playerIdx+10) return;
      visited[ni]=1; queue.push(ni);
    });
  }
  const enclosed = [];
  for (let i=0;i<GRID*GRID;i++) if (!visited[i] && grid[i]!==playerIdx) enclosed.push(i);
  return enclosed;
}

function countTerritory(grid, id) { let c=0; for(let i=0;i<GRID*GRID;i++) if(grid[i]===id) c++; return c; }

export default function PaperIO() {
  const [screen, setScreen] = useState("menu");
  const [country, setCountry] = useState(null);
  const [character, setCharacter] = useState(null);
  const [score, setScore] = useState(0);
  const [percent, setPercent] = useState(0);
  const [kills, setKills] = useState(0);
  const [gameOver, setGameOver] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [powerReady, setPowerReady] = useState(true);
  const [powerActive, setPowerActive] = useState(false);
  const [powerCooldown, setPowerCooldown] = useState(0);
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  // ── FRIENDS (auto-saved forever) ──
  const [friends, setFriends] = useState(()=>{
    try{return JSON.parse(localStorage.getItem("paperio_friends")||"[]");}catch{return[];}
  });
  const [showFriends, setShowFriends] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [copyMsg, setCopyMsg] = useState(false);
  const [myNameInput, setMyNameInput] = useState(()=>localStorage.getItem("paperio_myname")||"Player");
  const myCode = useRef(()=>{
    let c=localStorage.getItem("paperio_mycode");
    if(!c){c=Math.random().toString(36).slice(2,8).toUpperCase();localStorage.setItem("paperio_mycode",c);}
    return c;
  }).current();

  function saveFriends(f){setFriends(f);try{localStorage.setItem("paperio_friends",JSON.stringify(f));}catch{}}
  function addFriend(){
    if(!addName.trim()||!addCode.trim()) return;
    const code=addCode.trim().toUpperCase();
    if(code===myCode){alert("That's your own code!");return;}
    if(friends.find(f=>f.code===code)){alert("Already added!");return;}
    saveFriends([...friends,{name:addName.trim(),code,addedAt:Date.now()}]);
    setAddName("");setAddCode("");
  }
  function removeFriend(code){saveFriends(friends.filter(f=>f.code!==code));}
  function copyCode(){
    navigator.clipboard.writeText(myCode).then(()=>{setCopyMsg(true);setTimeout(()=>setCopyMsg(false),2000);}).catch(()=>{});
  }
  function saveMyName(){localStorage.setItem("paperio_myname",myNameInput);}

  function initGame() {
    const grid = createGrid();
    const PLAYER_ID = 1;
    const px = Math.floor(GRID/2), py = Math.floor(GRID/2);
    // Give player a bigger starting territory so they don't die immediately
    for (let dy=-4;dy<=4;dy++) for (let dx=-4;dx<=4;dx++) if(inBounds(px+dx,py+dy)) grid[idx(px+dx,py+dy)]=PLAYER_ID;

    // Fixed spawn positions spread evenly around the map — far from each other and the player
    const spawnPositions = [
      [15, 15], [GRID-15, 15], [15, GRID-15], [GRID-15, GRID-15],
      [Math.floor(GRID/2), 12], [Math.floor(GRID/2), GRID-12],
    ];

    const botCountries = COUNTRIES.filter(c=>c.id!==country.id).sort(()=>Math.random()-0.5).slice(0,5);
    const botCharsShuffled = [...CHARACTERS].sort(()=>Math.random()-0.5).slice(0,5);

    const bots = botCountries.map((bc,i)=>{
      const [bx, by] = spawnPositions[i];
      const bid = i+2;
      // Give each bot a larger starting territory so they don't instantly trail
      for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++) if(inBounds(bx+dx,by+dy)) grid[idx(bx+dx,by+dy)]=bid;
      // Give each bot a different starting direction so they spread out
      const startDirs = [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1]];
      const sd = startDirs[i % startDirs.length];
      const startDir = [Math.sign(sd[0])||1, 0]; // always horizontal to start
      const startDirOptions = [[1,0],[-1,0],[0,1],[0,-1]];
      const assignedDir = startDirOptions[i % 4];
      return {
        id:bid, country:bc, char:botCharsShuffled[i]||CHARACTERS[0],
        x:bx, y:by, homeX:bx, homeY:by,
        dir:assignedDir, trail:[], alive:true,
        moveTimer: i * 20, // stagger start times so they don't all move at once
        speed:botCharsShuffled[i]?.speed||8,
        aiState:"expand", outSteps:0,
        startDelay: 60 + i * 30, // extra delay before each bot starts moving
      };
    });

    stateRef.current = {
      grid, PLAYER_ID,
      player: {
        id:PLAYER_ID, country, char:character,
        x:px, y:py, homeX:px, homeY:py,
        dir:[1,0], nextDir:[1,0],
        trail:[], alive:true,
        moveTimer:0, speed:character.speed,
        startDelay:0, // player starts immediately
        powerTimer:0, powerActive:false, powerCooldown:0,
        nineLives:character.id==="cat", shieldActive:false,
      },
      bots,
      running:true, kills:0,
      cameraX:0, cameraY:0,
      currentPct:0, currentCells:49, frameCount:0,
    };
  }

  const [gameKey, setGameKey] = useState(0);

  function startGame() {
    initGame();
    setScore(0); setPercent(0); setKills(0); setGameOver(null);
    setPowerReady(true); setPowerActive(false); setPowerCooldown(0);
    setGameKey(k => k + 1); // force useEffect to re-run even if already on game screen
    setScreen("game");
  }

  useEffect(()=>{
    if(screen!=="game") return;
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    const s=stateRef.current; if(!s) return;

    const onKey=e=>{
      const p=s.player; if(!p.alive) return;
      const c=p.dir;
      if((e.code==="ArrowUp"||e.code==="KeyW")&&c[1]!==1) p.nextDir=[0,-1];
      if((e.code==="ArrowDown"||e.code==="KeyS")&&c[1]!==-1) p.nextDir=[0,1];
      if((e.code==="ArrowLeft"||e.code==="KeyA")&&c[0]!==1) p.nextDir=[-1,0];
      if((e.code==="ArrowRight"||e.code==="KeyD")&&c[0]!==-1) p.nextDir=[1,0];
      if(e.code==="Space"||e.code==="KeyE") activatePower();
      e.preventDefault();
    };
    window.addEventListener("keydown",onKey);

    function activatePower() {
      const p=s.player;
      if(p.powerCooldown>0||p.powerActive) return;
      p.powerActive=true;
      p.powerTimer=180; // 3 seconds at 60fps
      setPowerActive(true);
      if(character.id==="ninja") p.speed=Math.max(3,character.speed-3);
      if(character.id==="wizard") {
        // Instant expand 10 cells in each direction
        for(let d=-5;d<=5;d++) {
          if(inBounds(p.x+d,p.y)) s.grid[idx(p.x+d,p.y)]=p.id;
          if(inBounds(p.x,p.y+d)) s.grid[idx(p.x,p.y+d)]=p.id;
        }
      }
      if(character.id==="alien") { p.x=p.homeX; p.y=p.homeY; p.trail=[]; for(let i=0;i<GRID*GRID;i++) if(s.grid[i]===p.id+10) s.grid[i]=0; }
    }

    function moveEntity(entity, grid) {
      if (!entity.alive) return;
      if (entity.startDelay > 0) { entity.startDelay--; return; }
      entity.moveTimer++;
      if (entity.moveTimer < entity.speed) return;
      entity.moveTimer = 0;

      const nx = entity.x + entity.dir[0];
      const ny = entity.y + entity.dir[1];

      // Hit wall — pick a new valid direction
      if (!inBounds(nx, ny)) {
        const options = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => inBounds(entity.x+dx, entity.y+dy));
        if (options.length > 0) entity.dir = options[Math.floor(Math.random()*options.length)];
        return;
      }

      const nextVal = grid[idx(nx, ny)];

      // About to step on own trail = death (only if trail exists)
      if (nextVal === entity.id + 10 && entity.trail.length > 0) {
        if (entity.nineLives) {
          entity.nineLives = false;
          // bounce instead of die
          entity.dir = [-entity.dir[0] || 1, -entity.dir[1] || 0];
        } else {
          entity.alive = false;
          for (let i = 0; i < GRID*GRID; i++) if (grid[i] === entity.id+10) grid[i] = 0;
          entity.trail = [];
        }
        return;
      }

      // Safe to move
      entity.x = nx;
      entity.y = ny;

      const landVal = grid[idx(entity.x, entity.y)];

      if (landVal === entity.id) {
        // Landed on own territory
        if (entity.trail.length > 0) {
          // Close the loop — convert trail to territory and flood fill
          entity.trail.forEach(ti => { grid[ti] = entity.id; });
          const enclosed = floodFill(grid, entity.id);
          enclosed.forEach(ei => { grid[ei] = entity.id; });
          entity.trail = [];
          entity.homeX = entity.x;
          entity.homeY = entity.y;
        }
        // else just walking inside own territory — do nothing
      } else {
        // On foreign/empty cell — mark as trail
        const cellIdx = idx(entity.x, entity.y);
        if (landVal !== entity.id + 10) {
          grid[cellIdx] = entity.id + 10;
          entity.trail.push(cellIdx); // only push if newly marked
        }
      }
    }

    function botAI(bot, grid) {
      if (!bot.alive) return;

      const curVal = grid[idx(bot.x, bot.y)];
      const onOwn = curVal === bot.id;

      // Count steps since leaving base
      if (!onOwn) bot.outSteps++;
      else if (bot.trail.length === 0) bot.outSteps = 0;

      // Return home after enough steps
      if (bot.outSteps > 20 + Math.random()*20) {
        bot.aiState = "return";
        bot.outSteps = 0;
      }
      if (bot.aiState === "return" && onOwn && bot.trail.length === 0) {
        bot.aiState = "expand";
      }

      if (bot.aiState === "return") {
        // Head toward home, but avoid own trail
        const dx = bot.homeX - bot.x, dy = bot.homeY - bot.y;
        const preferred = Math.abs(dx) >= Math.abs(dy)
          ? [dx > 0 ? 1 : -1, 0]
          : [0, dy > 0 ? 1 : -1];
        const prefNext = grid[idx(bot.x+preferred[0], bot.y+preferred[1])];
        if (inBounds(bot.x+preferred[0], bot.y+preferred[1]) && prefNext !== bot.id+10) {
          bot.dir = preferred;
        } else {
          // Preferred blocked by own trail, pick any safe direction toward home
          const options = [[1,0],[-1,0],[0,1],[0,-1]].filter(([ddx,ddy]) => {
            const nx2=bot.x+ddx, ny2=bot.y+ddy;
            return inBounds(nx2,ny2) && grid[idx(nx2,ny2)] !== bot.id+10;
          });
          if (options.length > 0) bot.dir = options[Math.floor(Math.random()*options.length)];
        }
      } else {
        // Expand — occasionally change direction, always avoid own trail
        if (Math.random() < 0.15) {
          // Prefer unclaimed cells, avoid own trail
          const options = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => {
            const nx2 = bot.x+dx, ny2 = bot.y+dy;
            if (!inBounds(nx2, ny2)) return false;
            if (grid[idx(nx2,ny2)] === bot.id+10) return false; // never go into own trail
            return true;
          });
          if (options.length > 0) {
            // Score: prefer empty > enemy territory > own territory
            const scored = options.map(d => {
              const v = grid[idx(bot.x+d[0], bot.y+d[1])];
              return { d, score: v === 0 ? 3 : (v !== bot.id ? 2 : 0) };
            });
            scored.sort((a,b) => b.score - a.score);
            bot.dir = scored[0].d;
          }
        }
      }

      // Safety check — if next cell is own trail, turn away
      const nnx = bot.x + bot.dir[0], nny = bot.y + bot.dir[1];
      if (!inBounds(nnx, nny) || grid[idx(nnx,nny)] === bot.id+10) {
        const safe = [[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy]) => {
          const nx2 = bot.x+dx, ny2 = bot.y+dy;
          return inBounds(nx2,ny2) && grid[idx(nx2,ny2)] !== bot.id+10;
        });
        if (safe.length > 0) bot.dir = safe[Math.floor(Math.random()*safe.length)];
      }
    }

    function checkCollisions(grid,player,bots) {
      const all=[player,...bots.filter(b=>b.alive)];
      all.forEach(entity=>{
        if(!entity.alive) return;
        // Don't check collisions during start delay
        if(entity.startDelay>0) return;
        // Only check if entity has actually left their base (has a trail)
        if(entity.trail.length===0) return;
        const cv=grid[idx(entity.x,entity.y)];
        if(cv>=11&&cv<=20&&cv!==entity.id+10) {
          const victimId=cv-10;
          const victim=all.find(e=>e.id===victimId);
          // Only kill victim if they also have a trail (not in their safe base)
          if(victim&&victim.alive&&victim.trail.length>0&&!(victim.powerActive&&victim.char?.id==="viking")) {
            victim.alive=false;
            for(let i=0;i<GRID*GRID;i++) { if(grid[i]===victim.id+10) grid[i]=0; }
            victim.trail=[];
            if(entity.id===player.id) { s.kills++; setKills(k=>k+1); }
          }
        }
      });
    }

    let lastTs=0;
    function loop(ts) {
      if(!s.running) return;
      lastTs=ts;
      const cw=canvas.width, ch=canvas.height;
      const p=s.player; const grid=s.grid;

      // Player update
      if(p.alive) {
        p.dir=p.nextDir;
        if(p.powerActive) {
          p.powerTimer--;
          if(p.powerTimer<=0) {
            p.powerActive=false; p.powerCooldown=600; p.speed=character.speed;
            setPowerActive(false);
          }
          setPowerCooldown(Math.round(p.powerTimer/180*100));
        }
        if(p.powerCooldown>0) {
          p.powerCooldown--;
          const pct=Math.round((1-p.powerCooldown/600)*100);
          setPowerCooldown(pct);
          if(p.powerCooldown===0) setPowerReady(true);
        }
        moveEntity(p,grid);
      }
      s.bots.forEach(b=>{ botAI(b,grid); moveEntity(b,grid); });
      checkCollisions(grid,p,s.bots);

      // Camera
      const tcx=p.x*CELL-cw/2, tcy=p.y*CELL-ch/2;
      s.cameraX+=(tcx-s.cameraX)*0.12;
      s.cameraY+=(tcy-s.cameraY)*0.12;
      s.cameraX=Math.max(0,Math.min(CANVAS_SIZE-cw,s.cameraX));
      s.cameraY=Math.max(0,Math.min(CANVAS_SIZE-ch,s.cameraY));

      // Leaderboard update (every 20 frames to avoid throttling)
      const pt=countTerritory(grid,p.id);
      const pct=Math.round(pt/(GRID*GRID)*1000)/10;
      // Store in ref for immediate HUD use
      s.currentPct = pct;
      s.currentCells = pt;
      // Update React state less frequently
      if(!s.frameCount) s.frameCount=0;
      s.frameCount++;
      if(s.frameCount%20===0) {
        setScore(pt);
        setPercent(pct);
        const lb=[
          {name:p.country.flag+" "+p.country.name, territory:pt, color:p.country.color, alive:p.alive, char:p.char},
          ...s.bots.map(b=>({name:b.country.flag+" "+b.country.name, territory:countTerritory(grid,b.id), color:b.country.color, alive:b.alive, char:b.char}))
        ].sort((a,b)=>b.territory-a.territory).slice(0,6);
        setLeaderboard(lb);
      }

      // Respawn dead bots with new country/character
      s.bots.forEach((bot,i)=>{
        if(!bot.alive) {
          // Pick a new spawn position far from player
          const candidates = [
            [12,12],[GRID-12,12],[12,GRID-12],[GRID-12,GRID-12],
            [Math.floor(GRID/2),12],[Math.floor(GRID/2),GRID-12],
            [12,Math.floor(GRID/2)],[GRID-12,Math.floor(GRID/2)],
          ];
          const pos = candidates.sort(()=>Math.random()-0.5).find(([cx,cy])=>{
            const dist = Math.sqrt((cx-p.x)**2+(cy-p.y)**2);
            return dist > 30;
          }) || candidates[0];
          const [bx,by] = pos;
          const newCountry = COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)];
          const newChar = CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)];
          const newId = bot.id;
          // Clear old territory if any
          for(let gi=0;gi<GRID*GRID;gi++) if(grid[gi]===newId||grid[gi]===newId+10) grid[gi]=0;
          // Give new starting territory
          for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++) if(inBounds(bx+dx,by+dy)) grid[idx(bx+dx,by+dy)]=newId;
          const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
          bot.country=newCountry; bot.char=newChar;
          bot.x=bx; bot.y=by; bot.homeX=bx; bot.homeY=by;
          bot.dir=dirs[Math.floor(Math.random()*dirs.length)];
          bot.trail=[]; bot.alive=true;
          bot.moveTimer=0; bot.speed=newChar.speed;
          bot.aiState="expand"; bot.outSteps=0;
          bot.startDelay=90;
        }
      });

      // Game over check
      if(!p.alive&&s.running) { s.running=false; setGameOver("dead"); return; }
      if(pct>=65) { s.running=false; setScore(pt); setPercent(pct); setGameOver("win"); return; }

      // ── DRAW ──
      ctx.fillStyle="#0f172a"; ctx.fillRect(0,0,cw,ch);
      ctx.save(); ctx.translate(-Math.floor(s.cameraX),-Math.floor(s.cameraY));

      // Background
      ctx.fillStyle="#111827"; ctx.fillRect(0,0,CANVAS_SIZE,CANVAS_SIZE);
      ctx.strokeStyle="rgba(255,255,255,0.03)"; ctx.lineWidth=0.5;
      for(let x=0;x<=GRID;x++){ctx.beginPath();ctx.moveTo(x*CELL,0);ctx.lineTo(x*CELL,CANVAS_SIZE);ctx.stroke();}
      for(let y=0;y<=GRID;y++){ctx.beginPath();ctx.moveTo(0,y*CELL);ctx.lineTo(CANVAS_SIZE,y*CELL);ctx.stroke();}

      // Territory + trails
      const all=[p,...s.bots];
      for(let y=0;y<GRID;y++) for(let x=0;x<GRID;x++) {
        const v=grid[idx(x,y)]; if(v===0) continue;
        const px2=x*CELL, py2=y*CELL;
        if(v>=1&&v<=7) {
          const ent=all.find(e=>e.id===v);
          const col=ent?.country?.color||"#fff";
          ctx.fillStyle=col+"2e"; ctx.fillRect(px2,py2,CELL,CELL);
          // Border
          const top=inBounds(x,y-1)?grid[idx(x,y-1)]:0;
          const bot2=inBounds(x,y+1)?grid[idx(x,y+1)]:0;
          const lft=inBounds(x-1,y)?grid[idx(x-1,y)]:0;
          const rgt=inBounds(x+1,y)?grid[idx(x+1,y)]:0;
          ctx.strokeStyle=col+"99"; ctx.lineWidth=1.5;
          if(top!==v){ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(px2+CELL,py2);ctx.stroke();}
          if(bot2!==v){ctx.beginPath();ctx.moveTo(px2,py2+CELL);ctx.lineTo(px2+CELL,py2+CELL);ctx.stroke();}
          if(lft!==v){ctx.beginPath();ctx.moveTo(px2,py2);ctx.lineTo(px2,py2+CELL);ctx.stroke();}
          if(rgt!==v){ctx.beginPath();ctx.moveTo(px2+CELL,py2);ctx.lineTo(px2+CELL,py2+CELL);ctx.stroke();}
        } else if(v>=11&&v<=20) {
          const ent=all.find(e=>e.id===v-10);
          const col=ent?.country?.color||"#fff";
          ctx.shadowColor=col; ctx.shadowBlur=5;
          ctx.fillStyle=col; ctx.fillRect(px2+1,py2+1,CELL-2,CELL-2);
          ctx.shadowBlur=0;
        }
      }

      // Players
      all.forEach(entity=>{
        if(!entity.alive) return;
        const ex=entity.x*CELL+CELL/2, ey=entity.y*CELL+CELL/2;
        const r=entity.id===p.id?CELL*0.85:CELL*0.7;
        const col=entity.country?.color||"#fff";

        // Power glow
        if(entity.powerActive) { ctx.shadowColor=col; ctx.shadowBlur=25; }

        // Outer circle (country color)
        ctx.fillStyle=col;
        ctx.beginPath(); ctx.arc(ex,ey,r,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;

        // Inner circle (character skin)
        ctx.fillStyle=entity.char?.skin||"#fff";
        ctx.beginPath(); ctx.arc(ex,ey,r*0.65,0,Math.PI*2); ctx.fill();

        // Character emoji
        ctx.font=`${Math.floor(r*1.1)}px serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(entity.char?.emoji||"😊",ex,ey+1);
        ctx.textBaseline="alphabetic";

        // Flag above head
        ctx.font=`${Math.floor(r*0.9)}px serif`; ctx.textAlign="center";
        ctx.fillText(entity.country?.flag||"",ex,ey-r-2);

        // Name tag
        const label=entity.country?.name||"";
        const tw=ctx.measureText(label).width+8;
        ctx.fillStyle="rgba(0,0,0,0.75)";
        ctx.beginPath(); ctx.roundRect(ex-tw/2,ey-r-22,tw,13,3); ctx.fill();
        ctx.fillStyle=col; ctx.font=`bold 8px monospace`; ctx.textAlign="center";
        ctx.fillText(label,ex,ey-r-12);
      });

      ctx.restore();

      // ── HUD ──
      // Use live values directly from game state (not React state which can lag)
      const livePct = s.currentPct || 0;
      const liveCells = s.currentCells || 0;
      const liveKills = s.kills || 0;
      // Score box - bigger and clearer
      ctx.fillStyle="rgba(0,0,0,0.88)"; ctx.beginPath(); ctx.roundRect(12,12,200,120,14); ctx.fill();
      ctx.strokeStyle=country.color; ctx.lineWidth=2; ctx.stroke();
      // Big percent number
      ctx.fillStyle=country.color; ctx.font="bold 36px monospace"; ctx.textAlign="left";
      ctx.fillText(`${livePct.toFixed(1)}%`,24,56);
      ctx.fillStyle="#64748b"; ctx.font="10px monospace";
      ctx.fillText("OF MAP CLAIMED",24,72);
      // Progress bar
      ctx.fillStyle="#1e293b"; ctx.beginPath(); ctx.roundRect(24,78,165,10,5); ctx.fill();
      ctx.fillStyle=country.color; ctx.beginPath(); ctx.roundRect(24,78,Math.min(165,165*(livePct/65)),10,5); ctx.fill();
      ctx.fillStyle="#475569"; ctx.font="9px monospace"; ctx.fillText("GOAL: 65%",24+165+4,87);
      // Cells + kills
      ctx.fillStyle="#94a3b8"; ctx.font="11px monospace";
      ctx.fillText(`📦 ${liveCells} cells   ⚔️ ${liveKills} kills`,24,105);
      // Flag + char
      ctx.font="20px serif"; ctx.textAlign="right";
      ctx.fillText(country.flag,208,42);
      ctx.fillText(character.emoji,208,66);

      // Power button HUD
      const pwx=12, pwy=130;
      ctx.fillStyle="rgba(0,0,0,0.85)"; ctx.beginPath(); ctx.roundRect(pwx,pwy,180,60,12); ctx.fill();
      ctx.strokeStyle=powerActive?"#ffd700":powerReady?country.color:"#334155"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle=powerActive?"#ffd700":powerReady?country.color:"#475569";
      ctx.font="bold 11px monospace"; ctx.textAlign="left";
      ctx.fillText(character.icon+" "+character.power,pwx+10,pwy+20);
      ctx.fillStyle="#64748b"; ctx.font="9px monospace";
      ctx.fillText(character.powerDesc,pwx+10,pwy+34);
      if(powerReady&&!powerActive) {
        ctx.fillStyle="#00ff88"; ctx.font="bold 10px monospace";
        ctx.fillText("SPACE / E to use",pwx+10,pwy+50);
      } else if(powerActive) {
        ctx.fillStyle="#ffd700"; ctx.font="bold 10px monospace";
        ctx.fillText("ACTIVE!",pwx+10,pwy+50);
      } else {
        ctx.fillStyle="#475569"; ctx.font="10px monospace";
        ctx.fillText(`Cooldown: ${powerCooldown}%`,pwx+10,pwy+50);
        // Cooldown bar
        ctx.fillStyle="#1e293b"; ctx.fillRect(pwx+10,pwy+52,158,4);
        ctx.fillStyle=country.color; ctx.fillRect(pwx+10,pwy+52,158*(powerCooldown/100),4);
      }

      // Leaderboard
      const lbx=cw-160, lby=12;
      ctx.fillStyle="rgba(0,0,0,0.85)"; ctx.beginPath(); ctx.roundRect(lbx-8,lby,155,12+leaderboard.length*22+8,12); ctx.fill();
      ctx.fillStyle="#475569"; ctx.font="9px monospace"; ctx.textAlign="left";
      ctx.fillText("LEADERBOARD",lbx,lby+14);
      leaderboard.forEach((e,i)=>{
        const ly=lby+24+i*22;
        ctx.fillStyle=e.alive?e.color:"#334155";
        ctx.font=`${i===0?"bold ":""}10px monospace`; ctx.textAlign="left";
        ctx.fillText(`${i+1}. ${e.name}`,lbx,ly);
        ctx.fillStyle=e.color; ctx.font="bold 10px monospace"; ctx.textAlign="right";
        ctx.fillText(`${e.territory}`,lbx+140,ly);
      });

      // Controls
      ctx.fillStyle="rgba(255,255,255,0.1)"; ctx.font="9px monospace"; ctx.textAlign="center";
      ctx.fillText("WASD/Arrows: Move  |  SPACE/E: Power",cw/2,ch-8);

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return ()=>{ s.running=false; window.removeEventListener("keydown",onKey); };
  },[screen, gameKey]);

  // Touch
  const touchStart=useRef(null);
  const onTouchStart=e=>{ touchStart.current={x:e.touches[0].clientX,y:e.touches[0].clientY}; };
  const onTouchEnd=e=>{
    if(!touchStart.current||!stateRef.current?.player) return;
    const dx=e.changedTouches[0].clientX-touchStart.current.x;
    const dy=e.changedTouches[0].clientY-touchStart.current.y;
    const p=stateRef.current.player; const c=p.dir;
    if(Math.abs(dx)>Math.abs(dy)) { if(dx>20&&c[0]!==-1) p.nextDir=[1,0]; if(dx<-20&&c[0]!==1) p.nextDir=[-1,0]; }
    else { if(dy>20&&c[1]!==-1) p.nextDir=[0,1]; if(dy<-20&&c[1]!==1) p.nextDir=[0,-1]; }
    touchStart.current=null;
  };
  function dpad(dir) {
    if(!stateRef.current?.player) return;
    const p=stateRef.current.player; const c=p.dir;
    if(dir==="UP"&&c[1]!==1) p.nextDir=[0,-1];
    if(dir==="DOWN"&&c[1]!==-1) p.nextDir=[0,1];
    if(dir==="LEFT"&&c[0]!==1) p.nextDir=[-1,0];
    if(dir==="RIGHT"&&c[0]!==-1) p.nextDir=[1,0];
    if(dir==="POWER") {
      const p2=stateRef.current.player;
      if(p2.powerCooldown<=0&&!p2.powerActive) {
        p2.powerActive=true; p2.powerTimer=180; p2.speed=character.speed;
        setPowerActive(true); setPowerReady(false);
        if(character.id==="ninja") p2.speed=Math.max(3,character.speed-3);
        if(character.id==="alien") { p2.x=p2.homeX; p2.y=p2.homeY; p2.trail=[]; for(let i=0;i<GRID*GRID;i++) if(stateRef.current.grid[i]===p2.id+10) stateRef.current.grid[i]=0; }
      }
    }
  }
  const DBtn=({label,dir,style={}})=>(
    <button onPointerDown={()=>dpad(dir)} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:10,width:50,height:50,fontSize:18,cursor:"pointer",userSelect:"none",touchAction:"none",display:"flex",alignItems:"center",justifyContent:"center",...style}}>{label}</button>
  );

  // ── MENU ──
  if(screen==="menu") return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"monospace",color:"#f1f5f9",padding:24,backgroundImage:"radial-gradient(ellipse at 50% 20%,rgba(0,255,136,0.07) 0%,transparent 60%)",position:"relative"}}>

      {/* Friends overlay */}
      {showFriends && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:20,padding:24,width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,fontSize:"1.3rem",color:"#00ff88"}}>👥 Friends</h2>
              <button onClick={()=>setShowFriends(false)} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:13}}>✕ Close</button>
            </div>

            {/* My profile */}
            <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:10,marginBottom:6,letterSpacing:2}}>YOUR PROFILE</div>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
                <input value={myNameInput} onChange={e=>setMyNameInput(e.target.value.slice(0,12))}
                  style={{flex:1,background:"#1e293b",border:"1px solid #334155",color:"#fff",borderRadius:8,padding:"6px 10px",fontFamily:"monospace",fontSize:13,outline:"none"}} placeholder="Your name"/>
                <button onClick={saveMyName} style={{background:"#334155",border:"none",color:"#94a3b8",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Save</button>
              </div>
              <div style={{color:"#64748b",fontSize:10,marginBottom:4}}>YOUR FRIEND CODE (share this!)</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{background:"#1e293b",border:"1px solid #00ff88",borderRadius:8,padding:"8px 14px",color:"#00ff88",fontWeight:900,fontSize:18,letterSpacing:4,flex:1,textAlign:"center"}}>{myCode}</div>
                <button onClick={copyCode} style={{background:copyMsg?"#00ff88":"#1e293b",color:copyMsg?"#0f172a":"#94a3b8",border:`1px solid ${copyMsg?"#00ff88":"#334155"}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
                  {copyMsg?"✓ Copied!":"📋 Copy"}
                </button>
              </div>
              <div style={{color:"#334155",fontSize:9,marginTop:6}}>Give this code to friends so they can add you</div>
            </div>

            {/* Add friend */}
            <div style={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{color:"#64748b",fontSize:10,marginBottom:8,letterSpacing:2}}>ADD A FRIEND</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input value={addName} onChange={e=>setAddName(e.target.value.slice(0,12))}
                  style={{background:"#1e293b",border:"1px solid #334155",color:"#fff",borderRadius:8,padding:"7px 10px",fontFamily:"monospace",fontSize:12,outline:"none"}} placeholder="Friend's name"/>
                <input value={addCode} onChange={e=>setAddCode(e.target.value.toUpperCase().slice(0,6))}
                  style={{background:"#1e293b",border:"1px solid #334155",color:"#00ff88",borderRadius:8,padding:"7px 10px",fontFamily:"monospace",fontSize:14,fontWeight:700,letterSpacing:3,outline:"none"}} placeholder="Friend's code (e.g. AB12CD)"/>
                <button onClick={addFriend} style={{background:"linear-gradient(135deg,#00ff88,#38bdf8)",color:"#0f172a",border:"none",borderRadius:8,padding:"8px",fontWeight:800,cursor:"pointer",fontSize:13}}>
                  ➕ Add Friend
                </button>
              </div>
            </div>

            {/* Play with friends */}
            <div style={{background:"#0f172a",border:"1px solid #00ff8833",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{color:"#00ff88",fontSize:10,marginBottom:8,letterSpacing:2,fontWeight:700}}>🎮 PLAY WITH FRIENDS</div>
              <div style={{color:"#64748b",fontSize:11,marginBottom:10,lineHeight:1.5}}>
                Share a <b style={{color:"#fff"}}>Room Code</b> with your friend. Both of you enter the same code to play together in the same game!
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{color:"#64748b",fontSize:10}}>CREATE A ROOM — share this code:</div>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:"#1e293b",border:"1px solid #00ff88",borderRadius:8,padding:"8px 14px",color:"#00ff88",fontWeight:900,fontSize:16,letterSpacing:4,flex:1,textAlign:"center"}}>{myCode}-ROOM</div>
                  <button onClick={()=>{navigator.clipboard.writeText(myCode+"-ROOM").catch(()=>{});setCopyMsg(true);setTimeout(()=>setCopyMsg(false),2000);}}
                    style={{background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:11,fontWeight:700}}>📋</button>
                </div>
                <div style={{color:"#64748b",fontSize:10,marginTop:4}}>— OR JOIN A FRIEND'S ROOM —</div>
                <input value={addCode} onChange={e=>setAddCode(e.target.value.toUpperCase())}
                  style={{background:"#1e293b",border:"1px solid #334155",color:"#00ff88",borderRadius:8,padding:"8px 12px",fontFamily:"monospace",fontSize:13,fontWeight:700,letterSpacing:2,outline:"none"}} placeholder="Enter friend's room code..."/>
                <button onClick={()=>{
                  if(!addCode.trim()) return;
                  setShowFriends(false);
                  alert(`Joining room: ${addCode.trim()}\n\n(Note: Real-time multiplayer requires a server. For now, you and your friend can play the same map by both entering code "${addCode.trim()}" — compare your scores!)`);
                  setAddCode("");
                  if(country&&character) startGame();
                }} style={{background:"linear-gradient(135deg,#00ff88,#38bdf8)",color:"#0f172a",border:"none",borderRadius:8,padding:"9px",fontWeight:800,cursor:"pointer",fontSize:13}}>
                  🎮 Join Room & Play
                </button>
              </div>
            </div>

            {/* Friends list */}
            <div>
              <div style={{color:"#64748b",fontSize:10,marginBottom:8,letterSpacing:2}}>YOUR FRIENDS ({friends.length})</div>
              {friends.length===0 ? (
                <div style={{color:"#334155",fontSize:12,textAlign:"center",padding:20}}>No friends yet — share your code!</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {friends.map(f=>(
                    <div key={f.code} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#00ff88,#38bdf8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#0f172a",flexShrink:0}}>
                        {f.name[0].toUpperCase()}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{f.name}</div>
                        <div style={{fontSize:10,color:"#475569",letterSpacing:2}}>{f.code}</div>
                      </div>
                      <button onClick={()=>removeFriend(f.code)} style={{background:"rgba(255,7,58,0.1)",border:"1px solid #ff073a22",color:"#ff073a",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11}}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <h1 style={{fontSize:"clamp(2.5rem,9vw,4.5rem)",fontWeight:900,margin:"0 0 4px",letterSpacing:-2,color:"#fff"}}>PAPER<span style={{color:"#00ff88"}}>.IO</span></h1>
      <p style={{color:"#334155",marginBottom:24,fontSize:12,letterSpacing:4,textTransform:"uppercase"}}>Countries · Characters · Domination</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:340}}>
        <button onClick={()=>setScreen("select_country")} style={{background:"linear-gradient(135deg,#00ff88,#38bdf8)",color:"#0f172a",border:"none",borderRadius:14,padding:16,fontSize:17,fontWeight:900,cursor:"pointer"}}>▶ PLAY</button>
        <button onClick={()=>setShowFriends(true)} style={{background:"#111827",border:"1.5px solid #334155",color:"#94a3b8",borderRadius:14,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          👥 Friends <span style={{background:"#1e293b",borderRadius:10,padding:"1px 8px",fontSize:11,color:friends.length>0?"#00ff88":"#475569"}}>{friends.length}</span>
        </button>
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:12,padding:14,fontSize:12,color:"#64748b"}}>
          <div style={{color:"#fff",fontWeight:700,marginBottom:8}}>HOW TO PLAY</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            <span>🗺️ Choose your <b style={{color:"#00ff88"}}>country</b> and <b style={{color:"#fbbf24"}}>character</b></span>
            <span>🟢 Move to claim territory for your country</span>
            <span>🔄 Return home to keep your territory</span>
            <span>⚔️ Cut enemy trails to eliminate them</span>
            <span>💀 Protect your trail — don't get cut!</span>
            <span>⚡ Use your character's special power</span>
            <span>🏆 Reach 65% of the map to win!</span>
            <span>👥 Add friends with their code — saved forever!</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── SELECT COUNTRY ──
  if(screen==="select_country") return (
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"monospace",color:"#f1f5f9",padding:20}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <h2 style={{fontSize:"1.8rem",fontWeight:900,margin:"0 0 4px",color:"#fff"}}>🌍 Choose Your Country</h2>
        <p style={{color:"#475569",fontSize:12,margin:0}}>Your territory will represent this nation</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,maxWidth:800,margin:"0 auto 24px"}}>
        {COUNTRIES.map(c=>(
          <button key={c.id} onClick={()=>setCountry(c)}
            style={{background:country?.id===c.id?`${c.color}22`:"#111827",border:`2px solid ${country?.id===c.id?c.color:"#1e293b"}`,borderRadius:14,padding:14,cursor:"pointer",textAlign:"center",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <span style={{fontSize:32}}>{c.flag}</span>
            <span style={{fontSize:12,fontWeight:700,color:country?.id===c.id?c.color:"#94a3b8"}}>{c.name}</span>
            <div style={{width:24,height:4,borderRadius:2,background:c.color}}/>
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button onClick={()=>setScreen("menu")} style={{background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:12,padding:"10px 24px",cursor:"pointer",fontSize:13,fontWeight:700}}>← Back</button>
        <button onClick={()=>{ if(country) setScreen("select_char"); }} disabled={!country}
          style={{background:country?"linear-gradient(135deg,#00ff88,#38bdf8)":"#1e293b",color:country?"#0f172a":"#475569",border:"none",borderRadius:12,padding:"10px 28px",cursor:country?"pointer":"default",fontSize:13,fontWeight:900}}>
          Next: Choose Character →
        </button>
      </div>
    </div>
  );

  // ── SELECT CHARACTER ──
  if(screen==="select_char") return (
    <div style={{minHeight:"100vh",background:"#0f172a",fontFamily:"monospace",color:"#f1f5f9",padding:20}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:28,marginBottom:4}}>{country?.flag}</div>
        <h2 style={{fontSize:"1.8rem",fontWeight:900,margin:"0 0 4px",color:country?.color}}>Choose Your Character</h2>
        <p style={{color:"#475569",fontSize:12,margin:0}}>Each character has a unique special power</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,maxWidth:900,margin:"0 auto 24px"}}>
        {CHARACTERS.map(c=>{
          const sel=character?.id===c.id;
          return (
            <button key={c.id} onClick={()=>setCharacter(c)}
              style={{background:sel?`${country?.color}18`:"#111827",border:`2px solid ${sel?country?.color:"#1e293b"}`,borderRadius:14,padding:14,cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:28}}>{c.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:sel?country?.color:"#fff"}}>{c.name}</div>
                  <div style={{fontSize:9,color:"#475569"}}>Speed: {"▪".repeat(Math.round((11-c.speed)/1.5))}</div>
                </div>
              </div>
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"6px 8px"}}>
                <div style={{fontSize:10,fontWeight:700,color:country?.color}}>{c.icon} {c.power}</div>
                <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{c.powerDesc}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        <button onClick={()=>setScreen("select_country")} style={{background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:12,padding:"10px 24px",cursor:"pointer",fontSize:13,fontWeight:700}}>← Back</button>
        <button onClick={()=>{ if(character) startGame(); }} disabled={!character}
          style={{background:character?`linear-gradient(135deg,${country?.color},#38bdf8)`:"#1e293b",color:character?"#0f172a":"#475569",border:"none",borderRadius:12,padding:"10px 32px",cursor:character?"pointer":"default",fontSize:14,fontWeight:900}}>
          {country?.flag} PLAY AS {character?.name?.toUpperCase()||"?"} →
        </button>
      </div>
    </div>
  );

  // ── GAME OVER ──
  if(screen==="game"&&gameOver) return (
    <div style={{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"monospace",color:"#f1f5f9",padding:24}}>
      <div style={{fontSize:60,marginBottom:8}}>{gameOver==="win"?"🏆":"💀"}</div>
      <div style={{fontSize:28,marginBottom:4}}>{country?.flag} {character?.emoji}</div>
      <h2 style={{fontSize:"2rem",fontWeight:900,margin:"0 0 4px",color:gameOver==="win"?"#00ff88":"#ff073a"}}>
        {gameOver==="win"?"VICTORY!":"ELIMINATED!"}
      </h2>
      <p style={{color:"#475569",marginBottom:24,fontSize:12}}>{gameOver==="win"?`${country?.name} dominates the map!`:`${country?.name} was eliminated!`}</p>
      <div style={{background:"#111827",border:`1px solid ${country?.color}44`,borderRadius:14,padding:20,marginBottom:20,width:"100%",maxWidth:320}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center",marginBottom:16}}>
          <div><div style={{color:country?.color,fontSize:22,fontWeight:800}}>{percent}%</div><div style={{color:"#475569",fontSize:10}}>TERRITORY</div></div>
          <div><div style={{color:"#fbbf24",fontSize:22,fontWeight:800}}>{score}</div><div style={{color:"#475569",fontSize:10}}>CELLS</div></div>
          <div><div style={{color:"#f43f5e",fontSize:22,fontWeight:800}}>{kills}</div><div style={{color:"#475569",fontSize:10}}>KILLS</div></div>
        </div>
        <div style={{borderTop:"1px solid #1e293b",paddingTop:12}}>
          <div style={{color:"#475569",fontSize:10,marginBottom:8}}>FINAL STANDINGS</div>
          {leaderboard.map((e,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
              <span style={{color:"#475569",fontSize:11,width:16}}>{i+1}</span>
              <div style={{width:10,height:10,borderRadius:"50%",background:e.color}}/>
              <span style={{fontSize:11,color:e.alive?"#fff":"#334155",flex:1}}>{e.name}</span>
              <span style={{fontSize:10,color:e.color,fontWeight:700}}>{e.territory}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>{ setGameOver(null); startGame(); }} style={{background:`linear-gradient(135deg,${country?.color},#38bdf8)`,color:"#0f172a",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:800,cursor:"pointer"}}>🔄 Play Again</button>
        <button onClick={()=>setScreen("select_country")} style={{background:"#1e293b",color:"#94a3b8",border:"1px solid #334155",borderRadius:12,padding:"12px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Change Country</button>
        <button onClick={()=>setScreen("menu")} style={{background:"#111827",color:"#64748b",border:"1px solid #1e293b",borderRadius:12,padding:"12px 18px",fontSize:13,cursor:"pointer"}}>Menu</button>
      </div>
    </div>
  );

  // ── GAME ──
  return (
    <div style={{width:"100vw",height:"100vh",background:"#0f172a",position:"relative",overflow:"hidden"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{display:"block"}}/>
      {/* D-pad */}
      <div style={{position:"absolute",bottom:20,left:14,display:"flex",flexDirection:"column",alignItems:"center",gap:4,zIndex:10}}>
        <DBtn label="▲" dir="UP"/>
        <div style={{display:"flex",gap:4}}><DBtn label="◀" dir="LEFT"/><DBtn label="▼" dir="DOWN"/><DBtn label="▶" dir="RIGHT"/></div>
      </div>
      {/* Power button */}
      <div style={{position:"absolute",bottom:20,right:14,zIndex:10}}>
        <DBtn label={character?.icon||"⚡"} dir="POWER" style={{width:64,height:64,fontSize:26,background:powerActive?"rgba(255,215,0,0.3)":powerReady?`${country?.color}33`:"rgba(0,0,0,0.5)",borderColor:powerActive?"#ffd700":powerReady?country?.color:"#334155",color:powerActive?"#ffd700":powerReady?country?.color:"#475569"}}/>
        <div style={{textAlign:"center",fontSize:9,color:"#475569",marginTop:4,fontFamily:"monospace"}}>{powerReady&&!powerActive?"READY":powerActive?"ACTIVE!":"COOLDOWN"}</div>
      </div>
      {/* Menu */}
      <button onClick={()=>{stateRef.current.running=false;setScreen("menu");}} style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",background:"rgba(0,0,0,0.7)",color:"#475569",border:"1px solid #1e293b",borderRadius:8,padding:"4px 16px",fontFamily:"monospace",cursor:"pointer",fontSize:11,zIndex:10}}>☰ Menu</button>
    </div>
  );
}
