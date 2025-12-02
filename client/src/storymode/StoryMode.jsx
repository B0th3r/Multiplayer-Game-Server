import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { DIALOGUE } from "./dialogue/index.js";
import { GAME, MAPS, SPRITE } from "./environment/gameConfig.js";
import { loadTMJ, loadImage, gidToDrawInfo } from "./environment/tmjLoader.js";
import ObjectivesPanel from './objectives';

const hasFlag = (f) => GAME.flags.has(f);
const hasClue = (c) => GAME.clues.has(c);
const addFlag = (f) => GAME.flags.add(f);
const addClue = (c) => GAME.clues.add(c);

function canShow(choice) {
  const r = choice.requires;
  if (!r) return true;
  if (r.flagsAll && !r.flagsAll.every(hasFlag)) return false;
  if (r.flagsAny && !r.flagsAny.some(hasFlag)) return false;
  if (r.cluesAll && !r.cluesAll.every(hasClue)) return false;
  if (r.cluesAny && !r.cluesAny.some(hasClue)) return false;
  if (r.notFlags && r.notFlags.some(hasFlag)) return false;
  return true;
}


const SCALE = 2;
const VIEW_COLS = 20;
const VIEW_ROWS = 15;
const MOVE_COOLDOWN_MS = 110;
const TILE_SIZE_FALLBACK = 16;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));


function useKeyboard() {
  const keysRef = useRef(new Set());

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (
        ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", "e", "p",
          "escape",].includes(k)
      ) {
        e.preventDefault();
      }
      keysRef.current.add(k);
    };

    const up = (e) => keysRef.current.delete(e.key.toLowerCase());

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return keysRef;
}

function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0
    );
  }, []);

  return isTouch;
}

function triggerTalk() {
  const event = new KeyboardEvent("keydown", { key: "e" });
  window.dispatchEvent(event);
}

function MobileControls({ onPress, onRelease, show = true }) {
  if (!show) return null;

  const press = (k) => (e) => {
    e.preventDefault();
    onPress(k);
    try {
      navigator.vibrate?.(10);
    } catch {
    }
  };

  const release = (k) => (e) => {
    e.preventDefault();
    onRelease(k);
  };

  const bind = (k) => ({
    onPointerDown: press(k),
    onPointerUp: release(k),
    onPointerCancel: release(k),
    onPointerLeave: release(k),
  });

  const btn =
    "min-w-12 h-12 rounded-xl bg-slate-800/70 ring-1 ring-white/15 backdrop-blur text-slate-100 text-lg flex items-center justify-center select-none";

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* D-Pad */}
      <div className="absolute left-3 bottom-3 pointer-events-auto select-none touch-none">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button aria-label="Up" className={btn} {...bind("w")}>
            ▲
          </button>
          <div />
          <button aria-label="Left" className={btn} {...bind("a")}>
            ◀
          </button>
          <button aria-label="Down" className={btn} {...bind("s")}>
            ▼
          </button>
          <button aria-label="Right" className={btn} {...bind("d")}>
            ▶
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-3 bottom-3 flex gap-2 pointer-events-auto select-none touch-none">
        <button
          aria-label="Talk (E)"
          className={btn + " px-4"}
          onPointerDown={(e) => {
            e.preventDefault();
            triggerTalk();
          }}
        >
          Talk
        </button>
      </div>
    </div>
  );
}

// UI helpers 

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

function TilesetPreview({ tilesets }) {
  if (!tilesets?.length) return null;
  return (
    <div className="absolute top-14 right-2 bg-slate-900/90 backdrop-blur rounded-xl p-2 ring-1 ring-white/10 max-h-[70vh] overflow-auto">
      {tilesets.map((ts, i) => (
        <div key={i} className="mb-2">
          <div className="text-xs opacity-80 mb-1">
            {ts.name} (firstgid {ts.firstgid})
          </div>
          <img
            src={ts.img.src}
            className="block border border-white/10 rounded"
            style={{ imageRendering: "pixelated", maxWidth: 256 }}
          />
        </div>
      ))}
    </div>
  );
}

function createNpc({ id, name, x, y, gid, dialogueId }) {
  return { id, name, x, y, gid, dialogueId, cooldownMs: 400, };
}

export default function App() {
  const currentMapNameRef = useRef("neighborhood");
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [npcs, setNpcs] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const visitedNodesRef = useRef(new Set());
  const playerRef = useRef({ x: 3, y: 3 });
  const lastStepRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0 });
  const [objectivesMinimized, setObjectivesMinimized] = useState(false);
  const [objectivesRefresh, setObjectivesRefresh] = useState(0);
  const keysRef = useKeyboard();
  const isTouch = useIsTouch();
  const press = (k) => keysRef.current.add(k);
  const release = (k) => keysRef.current.delete(k);

  // Sprite images and animation state
  const spriteRef = useRef({ idle: null, walk: null });
  const animRef = useRef({
    dir: "down",
    state: "idle",
    frame: 0,
    lastFrameAt: 0,
    flipX: false,
    _prevState: "idle",
    _prevDir: "down",
  });

  const leave = () => {
    if (!confirm("Leave this room?")) return;
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [idle, walk] = await Promise.all([
          loadImage(SPRITE.src.idle),
          loadImage(SPRITE.src.walk),
        ]);
        if (!cancelled) spriteRef.current = { idle, walk };
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  function applySet(set) {
    if (!set) return;
    set.flagsAdd?.forEach(addFlag);
    set.cluesAdd?.forEach(addClue);
    if (set.claimAdd) {
      const { npcId, claimId } = set.claimAdd;
      (GAME.claims[npcId] ??= new Set()).add(claimId);
    }
    setObjectivesRefresh(prev => prev + 1);
  }

  function DialogueOverlay({ dialogue, setDialogue, setPresenting }) {
    if (!dialogue) return null;

    const dlg = DIALOGUE[dialogue.dlgId];
    const node = dlg?.nodes[dialogue.nodeId];

    const segments = node?.segments;
    const choices = (node?.choices || []).filter(canShow);

    const displaySegments =
      Array.isArray(segments) && segments.length > 0
        ? segments
        : node?.text
          ? [{ speaker: dialogue.npcName, text: node.text }]
          : [];

    return (
      <div className="absolute inset-0 pointer-events-none z-[60]">
        <div className="absolute left-0 right-0 bottom-3 flex justify-center">
          <div className="pointer-events-auto w-full max-w-3xl mx-4 p-4 rounded-xl bg-slate-900/95 ring-1 ring-white/10">
            <div className="text-xs opacity-60 mb-1">{dialogue.npcName}</div>

            {/* Segments block */}
            <div className="mb-3 space-y-1">
              {displaySegments.map((seg, i) => (
                <div key={i} className="text-slate-100 leading-snug">
                  {seg.speaker && (
                    <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {seg.speaker}
                    </span>
                  )}
                  <span>{seg.text}</span>
                </div>
              ))}
            </div>

            {/* Choices */}
            {choices.length ? (
              <div className="grid gap-2">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className="text-left px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 ring-1 ring-white/10"
                    onClick={() => {
                      if (c.present) {
                        setPresenting(true);
                        return;
                      }
                      if (c.set) applySet(c.set);
                      const next = dlg.nodes[c.next];
                      if (next?.end) {
                        setDialogue(null);
                      } else {
                        setDialogue((d) => ({
                          ...d,
                          nodeId: c.next,
                        }));
                      }
                    }}
                  >
                    <span className="opacity-60 mr-2">{i + 1}.</span>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs opacity-60">Press Esc to close</div>
            )}

            <button
              onClick={() => setDialogue(null)}
              className="mt-3 text-sm text-slate-400 hover:text-slate-200"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function loadNamedMap(name) {
    const def = MAPS[name];
    if (!def) throw new Error(`Unknown map: ${name}`);

    const loaded = await loadTMJ(def.path);
    setMap(loaded);

    // Spawn this map’s NPCs
    setNpcs(
      def.npcs.map((n) =>
        createNpc({
          id: n.id, name: n.name, x: n.x, y: n.y, gid: n.gid, dialogueId: n.dialogueId,
        })
      )
    );

    playerRef.current.x = def.start.x;
    playerRef.current.y = def.start.y;

    currentMapNameRef.current = name;
    updateCamera();
  }
  function updateCamera() {
    if (!map) return;

    const p = playerRef.current;
    const effCols = Math.min(VIEW_COLS, map.width);
    const effRows = Math.min(VIEW_ROWS, map.height);

    cameraRef.current.x = clamp(
      p.x - Math.floor(effCols / 2),
      0,
      map.width - effCols
    );
    cameraRef.current.y = clamp(
      p.y - Math.floor(effRows / 2),
      0,
      map.height - effRows
    );
  }

  function checkMapExit() {
    const def = MAPS[currentMapNameRef.current];
    if (!def?.exits) return;

    const p = playerRef.current;
    for (const ex of def.exits) {
      if (p.x === ex.x && p.y === ex.y) {
        document.body.style.setProperty(
          "transition",
          "background-color 150ms"
        );
        document.body.style.backgroundColor = "#000";
        setTimeout(async () => {
          try {
            await loadNamedMap(ex.to);
            playerRef.current.x = ex.toStart.x;
            playerRef.current.y = ex.toStart.y;
          } catch (e) {
            console.error("[map-exit]", e);
            alert("Failed to load area. Try again.");
          } finally {
            document.body.style.backgroundColor = "";
          }
        }, 120);
        break;
      }
    }
  }

  function getCollisionLayer() {
    if (!map) return null;
    const named = map.layers[1];
    if (!named) {
      console.warn(
        "[collision] Missing collision layer; blocking out-of-bounds only."
      );
    }
    return named || null;
  }

  function isBlocked(nx, ny) {
    const layer = getCollisionLayer();
    if (layer) {
      if (ny < 0 || nx < 0 || ny >= layer.height || nx >= layer.width)
        return true;
      if (layer.grid[ny][nx] !== 0) return true;
    }

    // NPCs blocks player
    for (const npc of npcs) {
      if (npc.x === nx && npc.y === ny) return true;
    }

    return false;
  }

  function tryStep(dx, dy) {
    if (!map) return;
    const p = playerRef.current;
    const nx = clamp(p.x + dx, 0, map.width - 1);
    const ny = clamp(p.y + dy, 0, map.height - 1);
    if (!isBlocked(nx, ny)) {
      p.x = nx;
      p.y = ny;
    }
  }

  function handleMovement(now) {
    const anim = animRef.current;

    if (dialogue || presenting) {
      anim.state = "idle";
      return;
    }

    // reset animation if state or direction changed
    if (anim.state !== anim._prevState || anim.dir !== anim._prevDir) {
      anim.frame = 0;
      anim.lastFrameAt = now;
      anim._prevState = anim.state;
      anim._prevDir = anim.dir;
    }

    const k = keysRef.current;
    const up = k.has("w") || k.has("arrowup");
    const left = k.has("a") || k.has("arrowleft");
    const down = k.has("s") || k.has("arrowdown");
    const right = k.has("d") || k.has("arrowright");

    // set facing regardless of cooldown
    if (up && !down) {
      anim.dir = "up";
      anim.flipX = false;
    } else if (down && !up) {
      anim.dir = "down";
      anim.flipX = false;
    } else if (left && !right) {
      anim.dir = "left";
      anim.flipX = false;
    } else if (right && !left) {
      anim.dir = "left";
      anim.flipX = true; // mirror for right
    }

    anim.state = up || down || left || right ? "walk" : "idle";

    if (now - lastStepRef.current < MOVE_COOLDOWN_MS) return;

    const p = playerRef.current;
    const ox = p.x;
    const oy = p.y;

    if (up && !down) tryStep(0, -1);
    else if (down && !up) tryStep(0, 1);
    else if (left && !right) tryStep(-1, 0);
    else if (right && !left) tryStep(1, 0);
    else return;

    if (p.x !== ox || p.y !== oy) {
      lastStepRef.current = now;
      checkMapExit();
    }
  }

  useEffect(() => {
    if (!dialogue) return;
    const dlg = DIALOGUE[dialogue.dlgId];
    if (!dlg) return;
    const node = dlg.nodes[dialogue.nodeId];
    if (!node) return;

    const key = `${dialogue.dlgId}:${dialogue.nodeId}`;
    if (!visitedNodesRef.current.has(key)) {
      visitedNodesRef.current.add(key);
      applySet(node.set);
    }

    if (node.gate) {
      const ok =
        (!node.gate.cluesAll ||
          node.gate.cluesAll.every(hasClue)) &&
        (!node.gate.flagsAll ||
          node.gate.flagsAll.every(hasFlag));
      if (!ok) {
        const fallback = node.nextFail || "root";
        setDialogue((d) => ({ ...d, nodeId: fallback }));
      }
    }
  }, [dialogue]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();

      if (k === "p") {
        setShowPalette((v) => !v);
        return;
      }

      if (k === "escape") {
        setDialogue(null);
        setPresenting(false);
        return;
      }

      // dialogue numeric shortcuts
      if (dialogue && /^[1-9]$/.test(k)) {
        const dlg = DIALOGUE[dialogue.dlgId];
        const node = dlg?.nodes[dialogue.nodeId];
        if (!node) return;
        const visible = (node.choices || []).filter(canShow);
        const idx = Number(k) - 1;
        const choice = visible[idx];
        if (choice) {
          if (choice.present) {
            setPresenting(true);
            return;
          }
          const nextNode = dlg.nodes[choice.next];
          if (nextNode?.end) setDialogue(null);
          else setDialogue((d) => ({ ...d, nodeId: choice.next }));
        }
        return;
      }

      if (k !== "e") return;

      if (dialogue) return;
      for (const npc of npcs) {
        if (isAdjacentToPlayer(npc.x, npc.y)) {
          const now = performance.now();
          if (now - npc._lastTalkAt < npc.cooldownMs) return;
          npc._lastTalkAt = now;

          if (npc.dialogueId && DIALOGUE[npc.dialogueId]) {
            setDialogue({
              npcId: npc.id,
              npcName: npc.name,
              dlgId: npc.dialogueId,
              nodeId: DIALOGUE[npc.dialogueId].start,
            });
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [npcs, dialogue]);
 
  function isAdjacentToPlayer(tx, ty) {
    const p = playerRef.current;
    return Math.abs(p.x - tx) + Math.abs(p.y - ty) === 1;
  }

  useEffect(() => {
    loadNamedMap("neighborhood").catch(console.error);
  }, []);

  useEffect(() => {
    if (!map) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let rafId;
    const draw = (now) => {
      handleMovement(now);
      updateCamera();

      const tw = map.tilewidth;
      const th = map.tileheight;

      ctx.save();
      ctx.scale(SCALE, SCALE);
      ctx.fillStyle = "#202c39";
      ctx.fillRect(0, 0, c.width / SCALE, c.height / SCALE);

      const cam = cameraRef.current;

      // Draw tile layers
      for (const layer of map.layers) {
        for (let ry = 0; ry < effRows; ry++) {
          const my = cam.y + ry;
          if (my < 0 || my >= map.height) continue;
          for (let rx = 0; rx < effCols; rx++) {
            const mx = cam.x + rx;
            if (mx < 0 || mx >= map.width) continue;
            const rawGid = layer.grid[my][mx];
            if (!rawGid) continue;
            const info = gidToDrawInfo(rawGid, map.tilesets);
            if (!info) continue;
            ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, rx * tw, ry * th, tw, th);
          }
        }
      }

      // Draw NPCs with proximity glow
      for (const npc of npcs) {
        const info = gidToDrawInfo(npc.gid, map.tilesets);
        if (!info) continue;

        const rx = (npc.x - cam.x) * tw;
        const ry = (npc.y - cam.y) * th;
        const close = isAdjacentToPlayer(npc.x, npc.y);

        ctx.save();
        if (close) {
          ctx.filter = "brightness(1.35)";
          ctx.shadowColor = "rgba(255,255,255,0.35)";
          ctx.shadowBlur = 6;
        } else {
          ctx.filter = "brightness(0.95)";
        }

        ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, rx, ry, tw, th);
        ctx.restore();
      }

      // Draw player
      const p = playerRef.current;
      const px = (p.x - cam.x) * tw;
      const py = (p.y - cam.y) * th;

      const sprites = spriteRef.current;
      const anim = animRef.current;
      const sheet = anim.state === "walk" ? sprites.walk : sprites.idle;
      const cols =
        anim.state === "walk" ? SPRITE.walkCols : SPRITE.idleCols;
      const row =
        anim.dir === "down"
          ? SPRITE.rows.down
          : anim.dir === "up"
            ? SPRITE.rows.up
            : SPRITE.rows.side;

      if (sheet) {
        const period = SPRITE.msPerFrame[anim.state];
        if (now - anim.lastFrameAt >= period) {
          anim.frame = (anim.frame + 1) % cols;
          anim.lastFrameAt = now;
        }

        const sx = anim.frame * SPRITE.fw;
        const sy = row * SPRITE.fh;
        if (anim.flipX) {
          ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, px + tw, py, -tw, th);
        } else {
          ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, px, py, tw, th);
        }
      } else {
        const size = tw * 0.8;
        const ox = px + (tw - size) / 2;
        const oy = py + (th - size) / 2;
        roundRect(ctx, ox, oy, size, size, 6, "#2dd4bf", "#0f766e");
      }

      // UI text
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = "16px ui-sans-serif, system-ui, -apple-system";
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(
        "WASD/Arrows: Move • E: Talk • 1-9: Choose • Esc: Close",
        12,
        22
      );

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [map, npcs, dialogue, presenting]);

  const tileW = map?.tilewidth ?? TILE_SIZE_FALLBACK;
  const tileH = map?.tileheight ?? TILE_SIZE_FALLBACK;
  const effCols = Math.min(VIEW_COLS, map?.width ?? VIEW_COLS);
  const effRows = Math.min(VIEW_ROWS, map?.height ?? VIEW_ROWS);

  const width = effCols * tileW * SCALE;
  const height = effRows * tileH * SCALE;


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl relative">
        <header className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            SinglePlayer — Detective Demo
          </h1>
          <div className="text-xs opacity-70">
            Map: {currentMapNameRef.current}
          </div>
        </header>

        <div className="rounded-2xl shadow-xl ring-1 ring-white/10 overflow-hidden bg-slate-900 relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block w-full h-auto"
          />
          {!map && (
            <div className="absolute inset-0 grid place-items-center text-sm text-slate-300">
              Loading…
            </div>
          )}
          {isTouch && (
            <MobileControls
              onPress={press}
              onRelease={release}
              show={true}
            />
          )}
          <DialogueOverlay
            dialogue={dialogue}
            setDialogue={setDialogue}
            setPresenting={setPresenting}
          />
          <ObjectivesPanel
            gameState={GAME}
            isMinimized={objectivesMinimized}
            onToggle={() => setObjectivesMinimized(!objectivesMinimized)}
            key={objectivesRefresh}
          />

          {showPalette && (
            <div className="absolute top-14 right-2 bg-slate-900/90 backdrop-blur rounded-xl p-3 ring-1 ring-white/10 text-xs text-slate-100">
              <div className="mb-2">
                <strong>Player:</strong> x: {playerRef.current.x}, y:{" "}
                {playerRef.current.y}
              </div>
              <div className="mb-2">
                <strong>Camera:</strong> x: {cameraRef.current.x}, y:{" "}
                {cameraRef.current.y}
              </div>
              <TilesetPreview tilesets={map?.tilesets} />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={leave}
            className="rounded border border-emerald-700/60 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/10 inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
