import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DIALOGUE } from "./dialogue/index.js";
import { GAME, MAPS, SPRITE } from "./environment/gameConfig.js";
import { loadTMJ, loadImage, gidToDrawInfo, loadNpcImages } from "./environment/tmjLoader.js";
import ObjectivesPanel from './objectives';
import { playVoice, stopVoice, getVoiceDuration } from "./environment/audioManager.js";
import { playCutscene } from './environment/cutsceneManager.js';

const hasFlag = (f) => GAME.flags.has(f);
const hasClue = (c) => GAME.clues.has(c);
const addFlag = (f) => GAME.flags.add(f);
const addClue = (c) => GAME.clues.add(c);
GAME.metadata.set("playerName", "detective");

function canShow(choice) {
  const r = choice.requires;
  if (!r) return true;
  if (r.flagsAll && !r.flagsAll.every(hasFlag)) return false;
  if (r.flagsAny && !r.flagsAny.some(hasFlag)) return false;
  if (r.cluesAll && !r.cluesAll.every(hasClue)) return false;
  if (r.cluesAny && !r.cluesAny.some(hasClue)) return false;
  if (r.notFlags && r.notFlags.some(hasFlag)) return false;
  if (r.notClues && r.notClues.some(hasClue)) return false;
  return true;
}


const BASE_SCALE = 2;
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
        ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", "e",
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

function createNpc({ id, name, x, y, gid, dialogueId }) {
  return { id, name, x, y, gid, dialogueId, cooldownMs: 400, };
}

export default function App() {
  const currentMapNameRef = useRef("neighborhood");
  const [transitionMessage, setTransitionMessage] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [npcs, setNpcs] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const visitedNodesRef = useRef(new Set());
  const playerRef = useRef({ x: 3, y: 3 });
  const lastStepRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0 });
  const [objectivesMinimized, setObjectivesMinimized] = useState(true);
  const viewColsRef = useRef(VIEW_COLS);
  const viewRowsRef = useRef(VIEW_ROWS);
  const [creditsOverlay, setCreditsOverlay] = useState({
    visible: false,
    credits: null,
    onContinue: null,
  });

  const [objectivesRefresh, setObjectivesRefresh] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const keysRef = useKeyboard();
  const isTouch = useIsTouch();

  const viewportRef = useRef(null);
  const [viewportPx, setViewportPx] = useState({ w: 0, h: 0 });
  const [isShortHeight, setIsShortHeight] = useState(false);
  const worldBufferRef = useRef(null);
  const worldBufferMetaRef = useRef({ mapName: null, w: 0, h: 0 });
  const [fadeOverlay, setFadeOverlay] = useState({ visible: false, color: "#000", duration: 0 });
  const [isAutoDialogue, setIsAutoDialogue] = useState(true);
  const [autoSpeed] = useState(1.0);

  const autoTimerRef = useRef(null);

  const mapBufferRef = useRef(null);
  const mapBufferInfoRef = useRef({ name: null, w: 0, h: 0 });
  function buildWorldBuffer({ map, mapName }) {
    if (!map) return;

    const tw = map.tilewidth;
    const th = map.tileheight;
    const w = map.width * tw;
    const h = map.height * th;

    const buf =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });

    const bctx = buf.getContext("2d");
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, w, h);

    for (const layer of map.layers) {
      if (layer?.visible === false) continue;

      const lname = (layer?.name || "").toLowerCase();
      if (lname.includes("collision")) continue;

      for (let my = 0; my < map.height; my++) {
        for (let mx = 0; mx < map.width; mx++) {
          const rawGid = layer.grid?.[my]?.[mx] ?? 0;
          if (!rawGid) continue;

          const info = gidToDrawInfo(rawGid, map.tilesets);
          if (!info) continue;

          bctx.drawImage(
            info.img,
            info.sx,
            info.sy,
            info.sw,
            info.sh,
            mx * tw,
            my * th,
            tw,
            th
          );
        }
      }
    }

    worldBufferRef.current = buf;
    worldBufferMetaRef.current = { mapName, w, h };
  }
  function toggleObjectives() {
    setObjectivesMinimized((v) => !v);
  }
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const landscape = w > h;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      setIsShortHeight(isTouch && landscape && h < 520);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect;
      if (!cr) return;
      setViewportPx({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const press = (k) => keysRef.current.add(k);
  const release = (k) => keysRef.current.delete(k);
  const suppressNextVoiceRef = useRef(false);
  const skipNextSegmentResetRef = useRef(false);
  const pendingSegmentRestoreRef = useRef(null);
  const playedSegmentCutscenesRef = useRef(new Set());
  const [activeObjectives, setActiveObjectives] = useState([]);


  function resolveWaypointTile(waypoint, npcs, mapName, mapDef) {
    if (!waypoint) return null;

    if (waypoint.type === "npc") {
      const npc = npcs.find(n => n.id === waypoint.id);
      if (!npc) return null;
      return { x: npc.x, y: npc.y };
    }

    if (waypoint.type === "exit") {
      const ex = (mapDef?.exits ?? []).find(e => e.to === waypoint.to);
      if (!ex) return null;
      return { x: ex.x, y: ex.y };
    }

    if (waypoint.type === "tile") {
      if (waypoint.map && waypoint.map !== mapName) return null;
      return { x: waypoint.x, y: waypoint.y };
    }

    return null;
  }

  function drawWaypointMarker(ctx, px, py, tileSize, isOptional) {
    const cx = px + tileSize / 2;
    const cy = py - tileSize * 0.35;

    ctx.save();
    ctx.font = `${Math.floor(tileSize * 0.9)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.strokeText("!", cx, cy);

    ctx.fillStyle = isOptional ? "#fbbf24" : "white";
    ctx.fillText("!", cx, cy);

    ctx.restore();
  }

  // Sprite images and animation state
  const spriteRef = useRef({ sheet: null });

  const animRef = useRef({
    dir: "down",
    state: "idle",
    frame: 0,
    lastFrameAt: 0,
    flipX: false,
    _prevState: "idle",
    _prevDir: "down",
  });

  function goToMainMenu() {
    navigate("/");
  }
  useEffect(() => {
    loadNamedMap("office").catch(console.error);
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const img = await loadImage(SPRITE.src);
        if (!cancelled) spriteRef.current = { sheet: img };
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {

    const cutsceneTriggers = [
      { flag: "cutscene_leave_office", cutsceneId: "leave_office" },
      { flag: "cutscene_going_to_maya", cutsceneId: "going_to_maya" },
      { flag: "cutscene_marcus_enters", cutsceneId: "marcus_enters" },
      { flag: "cutscene_maya_leaves", cutsceneId: "maya_leaves" },
      { flag: "cutscene_leave_pd", cutsceneId: "leave_pd" },
      { flag: "cutscene_accuse_sam", cutsceneId: "accuse_sam" },
      { flag: "cutscene_accuse_tim", cutsceneId: "accuse_tim" },
      { flag: "cutscene_accuse_john", cutsceneId: "accuse_john" },
      { flag: "cutscene_accuse_jane", cutsceneId: "accuse_jane" },
      { flag: "cutscene_accuse_florist", cutsceneId: "accuse_florist" },
      { flag: "cutscene_accuse_jim", cutsceneId: "accuse_jim" },
      { flag: "cutscene_accuse_donna", cutsceneId: "accuse_donna" },
      { flag: "cutscene_lucas_goes_to_maya", cutsceneId: "lucas_goes_to_maya" },
      { flag: "cutscene_marcus_leaves", cutsceneId: "marcus_leaves" },
      { flag: "cutscene_bobby_comes", cutsceneId: "bobby_comes" },
      { flag: "cutscene_bobby_moves_to_bartender", cutsceneId: "bobby_moves_to_bartender" },
      { flag: "cutscene_ending_master", cutsceneId: "ending_master" },

    ];

    const context = {
      loadNamedMap,
      playerRef,
      setTransitionMessage,
      setDialogue,
      npcs,
      setNpcs,
      DIALOGUE,
      flags: GAME.flags,
      setFadeOverlay,
      setCreditsOverlay,
      __resolveCreditsClose: null,
      goToMainMenu,
    };

    for (const { flag, cutsceneId } of cutsceneTriggers) {
      if (GAME.flags.has(flag)) {
        GAME.flags.delete(flag);
        playCutscene(cutsceneId, context);
        break;
      }
    }
  }, [dialogue]);
  useEffect(() => {
    if (!dialogue) return;
    if (pendingSegmentRestoreRef.current == null) return;

    setSegmentIndex(pendingSegmentRestoreRef.current);
    pendingSegmentRestoreRef.current = null;
  }, [dialogue?.dlgId, dialogue?.nodeId]);

  function applySet(set) {
    if (!set) return;
    set.flagsAdd?.forEach(addFlag);
    set.cluesAdd?.forEach(addClue);
    set.flagsRemove?.forEach(f => GAME.flags.delete(f));
    if (set.claimAdd) {
      const { npcId, claimId } = set.claimAdd;
      (GAME.claims[npcId] ??= new Set()).add(claimId);
    }
    if (set.metadataAdd) {
      GAME.metadata.set(set.metadataAdd.key, set.metadataAdd.value);
    }
    setObjectivesRefresh(prev => prev + 1);
  }

  const PROVOKE_TOKEN = "__PROVOKE__";
  const PROVOKE_RETURN_TOKEN = "__PROVOKE_RETURN__";

  function runChoice(choice) {
    if (!dialogue) return;

    const dlg = DIALOGUE[dialogue.dlgId];
    if (!dlg) return;

    if (choice.present) {
      setPresenting(true);
      return;
    }

    if (choice.set) applySet(choice.set);
    if (choice.cutscene) {
      playCutscene(choice.cutscene, {
        loadNamedMap,
        playerRef,
        setTransitionMessage,
        setDialogue,
        npcs,
        setNpcs,
        flags: GAME.flags,
        setFadeOverlay
      });
    }

    if (choice.next === PROVOKE_RETURN_TOKEN) {
      const returnNodeKey = `provokeReturnNode_${dialogue.npcId}`;
      const returnSegKey = `provokeReturnSeg_${dialogue.npcId}`;

      const savedNodeId = GAME.metadata.get(returnNodeKey) ?? dlg.start;
      const savedSegIndex = GAME.metadata.get(returnSegKey) ?? 0;

      skipNextSegmentResetRef.current = true;
      suppressNextVoiceRef.current = true;
      pendingSegmentRestoreRef.current = savedSegIndex;

      setDialogue(d => ({ ...d, nodeId: savedNodeId }));
      return;
    }

    if (choice.provoke || choice.next === PROVOKE_TOKEN) {
      const returnNodeKey = `provokeReturnNode_${dialogue.npcId}`;
      const returnSegKey = `provokeReturnSeg_${dialogue.npcId}`;

      GAME.metadata.set(returnNodeKey, dialogue.nodeId);
      GAME.metadata.set(returnSegKey, segmentIndex);

      const strikesKey = `provokeStrikes_${dialogue.npcId}`;
      const strikes = (GAME.metadata.get(strikesKey) ?? 0) + 1;
      GAME.metadata.set(strikesKey, strikes);

      if (dialogue.npcId === "tim") {
        const provokeNode =
          strikes >= 3 ? "tim_provoke_done" :
            strikes === 1 ? "tim_provoke_warn1" : "tim_provoke_warn2";

        setDialogue(d => ({ ...d, nodeId: provokeNode }));
        return;
      }
    }
    const nextId = choice.next;
    const next = dlg.nodes[nextId];
    if (next?.end) {
      if (next.endCutscene) {
        playCutscene(next.endCutscene, {
          loadNamedMap,
          playerRef,
          setTransitionMessage,
          setDialogue,
          npcs,
          setNpcs,
          DIALOGUE,
          flags: GAME.flags,
          setFadeOverlay
        });
      }
      setDialogue(null);
    } else {
      setDialogue((d) => ({ ...d, nodeId: nextId }));
    }
  }

  function DialogueOverlay({ dialogue, setDialogue }) {
    if (!dialogue) return null;

    const dlg = DIALOGUE[dialogue.dlgId];
    const node = dlg?.nodes[dialogue.nodeId];

    const segments = node?.segments;
    const choices = (node?.choices || []).filter(canShow);

    const hasSegments = Array.isArray(segments) && segments.length > 0;

    const visibleSegments = hasSegments
      ? segments.filter(seg => {
        if (!seg.requires) return true;
        return canShow({ requires: seg.requires });
      })
      : [];

    const totalSegments = visibleSegments.length;
    const atLastSegment = totalSegments <= 0 ? true : segmentIndex >= totalSegments - 1;

    function formatText(text) {
      if (!text) return text;
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return GAME.metadata.get(key) ?? "";
      });
    }

    let currentSeg = null;
    if (visibleSegments.length > 0) {
      const idx = Math.min(segmentIndex, visibleSegments.length - 1);
      currentSeg = visibleSegments[idx];
    } else if (node?.text) {
      currentSeg = { speaker: dialogue.npcName, text: node.text };
    }

    const currentText = formatText(currentSeg?.text ?? "");


    function clearAutoTimer() {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }

    function advanceSegment() {
      clearAutoTimer();
      if (hasSegments && !atLastSegment) {
        setSegmentIndex((i) => Math.min(i + 1, totalSegments - 1));
        return;
      }

      if (!choices.length) {
        setDialogue(null);
      }
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-[60]">
        <div className="absolute left-0 right-0 bottom-3 flex justify-center">
          <div
            className="pointer-events-auto w-full max-w-3xl mx-4 p-4 rounded-xl bg-slate-900/95 ring-1 ring-white/10"
            onClick={() => {
              if (choices.length) return;
              advanceSegment();
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="text-xs opacity-60">{dialogue.npcName}</div>

              {/* Auto controls */}
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700/70 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAutoTimer();
                    setIsAutoDialogue(v => !v);
                  }}
                  title="Toggle Auto"
                >
                  {isAutoDialogue ? "Auto: ON" : "Auto: OFF"}
                </button>
              </div>
            </div>

            {/* Single current segment */}
            <div className="mb-3 space-y-1">
              {currentSeg && (
                <div className="text-slate-100 leading-snug">
                  {currentSeg.speaker && (
                    <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {currentSeg.speaker}
                    </span>
                  )}
                  <span>{currentText}</span>
                </div>
              )}
            </div>

            {/* Next / Choices */}
            {hasSegments && !atLastSegment ? (
              <div className="flex justify-between items-center">
                <div className="text-xs opacity-50">
                  Click/Tap to advance
                </div>

                <button
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceSegment();
                  }}
                >
                  Next
                </button>
              </div>
            ) : choices.length ? (
              <div className="grid gap-2">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className="text-left px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 ring-1 ring-white/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAutoTimer();
                      runChoice(c);
                    }}
                  >
                    <span className="opacity-60 mr-2">{i + 1}.</span>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs opacity-60">Click to close • Press Esc to close</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function loadNamedMap(name) {
    const def = MAPS[name];
    if (!def) throw new Error(`Unknown map: ${name}`);
    setMap(null);
    mapBufferRef.current = null;
    mapBufferInfoRef.current = { name: null, w: 0, h: 0 };

    const loaded = await loadTMJ(def.path);

    buildWorldBuffer({ map: loaded, mapName: name });


    setMap(loaded);

    setNpcs(
      def.npcs.map((n) =>
        createNpc({
          id: n.id, name: n.name, x: n.x, y: n.y, gid: n.gid, dialogueId: n.dialogueId,
        })
      )
    );

    if (def.autoStartDialogue) {
      const ok =
        !def.autoStartRequires ||
        (def.autoStartRequires.flagsAny &&
          def.autoStartRequires.flagsAny.some((f) => GAME.flags.has(f))) ||
        (def.autoStartRequires.flagsAll &&
          def.autoStartRequires.flagsAll.every((f) => GAME.flags.has(f)));

      if (ok) {
        let npcToStart = null;
        if (GAME.flags.has("poem_passed") && !GAME.flags.has("maya_scene_complete")) {
          npcToStart = def.npcs.find((n) => n.id === "maya");
        } else if ((GAME.flags.has("BobbyDirty") || GAME.flags.has("BobbyGood")) && !GAME.flags.has("marcus_comforts_bobby_bar")) {
          npcToStart = def.npcs.find((n) => n.id === "marcus");
        }

      if (npcToStart && DIALOGUE[npcToStart.dialogueId]) {
        setDialogue({
          npcId: npcToStart.id,
          dlgId: npcToStart.dialogueId,
          nodeId: DIALOGUE[npcToStart.dialogueId].start,
        });
      }
    }

  }
  let spawnList = [...(def.npcs ?? [])];

  const movedToBar = GAME.flags.has("bobby_investigation_bar");
  const johnTimActive = GAME.flags.has("talkedToJane");
  const marcusActive =
  (GAME.flags.has("BobbyDirty") || GAME.flags.has("BobbyGood")) &&
  !GAME.flags.has("marcus_comforts_bobby_bar");
  const comfortScene = GAME.flags.has("marcus_comforts_bobby_bar");
  const mayaActive = GAME.flags.has("poem_passed") && !GAME.flags.has("maya_scene_complete");

  if (name === "bar") {
    if (comfortScene) {

      spawnList = spawnList.filter(n => n.id !== "marcus" && n.id !== "bobby");

      spawnList.push(
        {
          id: "marcus",
          x: 9, y: 14,
          gid: 1109,
          dialogueId: "marcusBar",
        },
        {
          id: "bobby",
          x: 9, y: 15,
          gid: 3586,
          dialogueId: "marcusBar",
        }
      );
    }
  }

  if (name === "city") {
    if (marcusActive) {
      spawnList = spawnList.filter(n => n.id !== "marcus");
      spawnList.push({
        id: "marcus",
        name: "Marcus",
        x: 12, y: 8,
        gid: 106,
        dialogueId: "marcus",
      });
    }
    if (mayaActive) {
      spawnList = spawnList.filter(n => n.id !== "maya");
      spawnList.push({
        id: "maya",
        name: "maya",
        x: 2, y: 8,
        gid: 106,
        dialogueId: "maya",
      });
    }
  }

  if (johnTimActive && name == "neighborhood") {

    spawnList = spawnList.filter(n => n.id !== "john" && n.id !== "tim");

    spawnList.push(
      { id: "john", name: "John", x: 31, y: 19, gid: 451, dialogueId: "johnTim" },
      { id: "tim", name: "Tim", x: 32, y: 19, gid: 451, dialogueId: "johnTim" }
    );
  }


  if (movedToBar) {
    if (name === "bar") {
      spawnList = spawnList.filter(n => n.id !== "bobby");
      spawnList.push({
        id: "bobby",
        x: 4,
        y: 14,
        gid: 3586,
        dialogueId: "bobbyBartender",
      });
    }

    if (name === "neighborhood") {
      spawnList = spawnList.filter(n => n.id !== "delivery_girl");
      spawnList.push({
        id: "delivery_girl",
        x: 60,
        y: 21,
        gid: 106,
        dialogueId: "delivery_girl",
      });
    }
    if (name === "city") {
      spawnList = spawnList.filter(n => n.id !== "bobby" && n.id !== "delivery_girl");
    }
  }
  const npcObjs = spawnList.map(n =>
    createNpc({
      id: n.id,
      name: n.name,
      x: n.x,
      y: n.y,
      gid: n.gid,
      dialogueId: n.dialogueId,
    })
  );

  await loadNpcImages(npcObjs);

  setNpcs(npcObjs);

  playerRef.current.x = def.start.x;
  playerRef.current.y = def.start.y;

  currentMapNameRef.current = name;
  updateCamera();
}


function updateCamera() {
  if (!map) return;

  const p = playerRef.current;
  const effCols = Math.min(viewColsRef.current, map.width);
  const effRows = Math.min(viewRowsRef.current, map.height);

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
function TopObjectiveBanner({ objective }) {
  if (!objective) return null;

  return (
    <div className="fixed z-[150] left-0 right-0 pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      <div className="mx-auto w-fit max-w-[92vw]">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur px-4 py-2 ring-1 ring-white/10 shadow-lg">
          <span className="text-xs uppercase tracking-wide text-emerald-300/90">
            Objective
          </span>
          <span className="text-sm text-slate-100 font-medium truncate">
            {objective.title}
          </span>
          {objective.optional ? (
            <span className="text-[10px] uppercase tracking-wide text-amber-300/90">
              Optional
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getObjectiveWaypoints(obj, gameState) {
  const list = [];

  if (obj.waypoint) list.push(obj.waypoint);
  if (Array.isArray(obj.waypoints)) list.push(...obj.waypoints);

  return list.filter((wp) => {
    if (!wp) return false;
    if (wp.hideWhenFlag && gameState.flags.has(wp.hideWhenFlag)) return false;
    return true;
  });
}


function checkMapExit() {
  const def = MAPS[currentMapNameRef.current];
  if (!def?.exits) return;

  const p = playerRef.current;
  for (const ex of def.exits) {
    if (p.x === ex.x && p.y === ex.y) {
      setTransitionMessage("Traveling...");
      document.body.style.setProperty(
        "transition",
        "background-color 400ms ease-in-out"
      );
      setTransitionMessage("Traveling...");
      setFadeOverlay({ visible: true, color: "#000", duration: 400 });

      setTimeout(async () => {
        try {
          await loadNamedMap(ex.to);
          playerRef.current.x = ex.toStart.x;
          playerRef.current.y = ex.toStart.y;

          setTimeout(() => {
            setTransitionMessage(null);
            setFadeOverlay({ visible: false, color: "#000", duration: 300 });
          }, 300);

        } catch (e) {
          console.error("[map-exit]", e);
          alert("Failed to load area. Try again.");
          setTransitionMessage(null);
          setFadeOverlay({ visible: false, color: "#000", duration: 300 });
        }
      }, 400);

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
    anim.flipX = true;
  } else if (right && !left) {
    anim.dir = "left";
    anim.flipX = false;
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
  if (!dialogue) {
    stopVoice();
    return;
  }
  const dlg = DIALOGUE[dialogue.dlgId];
  if (!dlg) return;
  const node = dlg.nodes[dialogue.nodeId];
  if (!node) return;

  const key = `${dialogue.dlgId}:${dialogue.nodeId}`;
  if (!visitedNodesRef.current.has(key)) {
    visitedNodesRef.current.add(key);
    applySet(node.set);
  }
  if (node.onEnter) {
    node.onEnter(GAME);
  }
  if (node.gate) {
    const g = node.gate;

    const ok =
      (!g.flagsAll || g.flagsAll.every(hasFlag)) &&
      (!g.flagsAny || g.flagsAny.some(hasFlag)) &&
      (!g.notFlags || !g.notFlags.some(hasFlag)) &&
      (!g.cluesAll || g.cluesAll.every(hasClue)) &&
      (!g.cluesAny || g.cluesAny.some(hasClue)) &&
      (!g.notClues || !g.notClues.some(hasClue));

    if (!ok) {
      setDialogue(d => ({ ...d, nodeId: node.nextFail || "root" }));
      return;
    }
  }


  let played = false;

  const segs = node.segments;
  if (Array.isArray(segs) && segs.length > 0) {
    const visible = segs.filter(seg => !seg.requires || canShow({ requires: seg.requires }));
    const total = visible.length;
    const idx = Math.min(segmentIndex, Math.max(total - 1, 0));
    const seg = total > 0 ? visible[idx] : null;
    if (seg?.cutscene) {
      const key = `${dialogue.dlgId}:${dialogue.nodeId}:${idx}:${seg.cutscene}`;
      if (!playedSegmentCutscenesRef.current.has(key)) {
        playedSegmentCutscenesRef.current.add(key);

        playCutscene(seg.cutscene, {
          loadNamedMap,
          playerRef,
          setTransitionMessage,
          setDialogue,
          npcs,
          setNpcs,
          DIALOGUE,
          flags: GAME.flags,
          setFadeOverlay,
        });
      }
    }
    if (seg?.voice && seg?.speaker) {
      if (suppressNextVoiceRef.current) {
        suppressNextVoiceRef.current = false;
        stopVoice();
        return;
      }

      playVoice(seg.speaker.toLowerCase(), seg.voice, { interrupt: true });
      played = true;
    }
  }

  if (!played) stopVoice();

}, [dialogue, segmentIndex]);
useEffect(() => {
  playCutscene("intro_boot", {
    loadNamedMap,
    playerRef,
    setTransitionMessage,
    setDialogue,
    npcs,
    setNpcs,
    DIALOGUE,
    flags: GAME.flags,
    GAME,
    setFadeOverlay
  });
}, []);

useEffect(() => {
  const dlg = dialogue ? DIALOGUE[dialogue.dlgId] : null;
  const node = dlg ? dlg.nodes[dialogue.nodeId] : null;
  const segs = node?.segments;
  const hasSegments = Array.isArray(segs) && segs.length > 0;

  if (!hasSegments) return;

  const visible = segs.filter(seg => !seg.requires || canShow({ requires: seg.requires }));
  const total = visible.length;

  setSegmentIndex(i => Math.min(i, Math.max(total - 1, 0)));
}, [dialogue, objectivesRefresh]);
useEffect(() => {
  if (skipNextSegmentResetRef.current) {
    skipNextSegmentResetRef.current = false;
    return;
  }
  setSegmentIndex(0);
}, [dialogue?.dlgId, dialogue?.nodeId]);

useEffect(() => {
  const onKey = (e) => {
    const k = e.key.toLowerCase();

    if (k === "o") {
      toggleObjectives();
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
      if (choice) runChoice(choice);
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
          const dlg = DIALOGUE[npc.dialogueId];

          const resumeFlag = `resume_${npc.id}`;
          const resumeNode = GAME.metadata.get(resumeFlag);

          if (resumeNode && dlg.nodes[resumeNode]) {
            // Resume an ongoing conversation
            GAME.metadata.delete(resumeFlag); // Clear resume point
            setDialogue({
              npcId: npc.id,
              npcName: npc.name,
              dlgId: npc.dialogueId,
              nodeId: resumeNode,
            });
            return;
          }

          const metFlag = `met_${npc.id}`;
          const hasMetBefore = GAME.flags.has(metFlag);

          let startNode = dlg.start;
          if (hasMetBefore && dlg.nodes.return_visit) {
            startNode = "return_visit";
          } else {
            GAME.flags.add(metFlag);
          }

          if (npc.id === "tim" && GAME.flags.has("tim_shutdown") && dlg.nodes.shutdown) {
            startNode = "shutdown";
          }
          if (npc.dialogueId === "marcusBar") {
            if (GAME.flags.has("GainedMarcusTrust") && GAME.flags.has("BobbyDirty") && dlg.nodes.bar_dirty_pass) {
              startNode = "bar_dirty_pass";
            } else if (GAME.flags.has("BobbyDirty") && dlg.nodes.bar_dirty_failed) {
              startNode = "bar_dirty_failed";
            } else if (GAME.flags.has("BobbyGood") && dlg.nodes.bar_clean_praise) {
              startNode = "bar_clean_praise";
            }
          }

          setDialogue({
            npcId: npc.id,
            npcName: npc.name,
            dlgId: npc.dialogueId,
            nodeId: startNode,
          });
        }
        return;
      }
    }
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [npcs, dialogue]);
function computeDialogueDelayMs(text, speed = 1.0) {
  const t = (text ?? "").trim();

  const base = 650;

  const perChar = 26;

  const punct = (t.match(/[.!?]/g)?.length ?? 0) * 180
    + (t.match(/[,;]/g)?.length ?? 0) * 90;

  const raw = base + t.length * perChar + punct;

  const clamped = Math.max(450, Math.min(raw, 6500));

  return Math.round(clamped / Math.max(0.25, speed));
}

useEffect(() => {
  if (!dialogue) {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    return;
  }

  const dlg = DIALOGUE[dialogue.dlgId];
  const node = dlg?.nodes[dialogue.nodeId];
  const segments = node?.segments;
  const choices = (node?.choices || []).filter(canShow);

  const hasSegments = Array.isArray(segments) && segments.length > 0;
  const visibleSegments = hasSegments
    ? segments.filter(seg => !seg.requires || canShow({ requires: seg.requires }))
    : [];

  const totalSegments = visibleSegments.length;
  const atLastSegment = totalSegments <= 0 || segmentIndex >= totalSegments - 1;

  const canAutoAdvance =
    isAutoDialogue &&
    hasSegments &&
    !atLastSegment;

  if (autoTimerRef.current) {
    clearTimeout(autoTimerRef.current);
    autoTimerRef.current = null;
  }

  if (!canAutoAdvance) {
    return;
  }

  let currentSeg = null;
  if (visibleSegments.length > 0) {
    const idx = Math.min(segmentIndex, visibleSegments.length - 1);
    currentSeg = visibleSegments[idx];
  }

  const currentText = currentSeg?.text ?? "";


  async function scheduleAdvance() {
    let delay;

    if (currentSeg?.speaker && currentSeg?.voice) {
      try {
        const audioDuration = await getVoiceDuration(
          currentSeg.speaker.toLowerCase(),
          currentSeg.voice
        );

        if (audioDuration && audioDuration > 0) {
          delay = Math.round((audioDuration + 300) / autoSpeed);
        } else {
          console.warn('Audio duration invalid, using text timing');
        }
      } catch (err) {
        console.warn('Failed to get audio duration, using text timing', err);
      }
    }

    if (!delay) {
      delay = computeDialogueDelayMs(currentText, autoSpeed, currentSeg?.speaker);
    }

    autoTimerRef.current = setTimeout(() => {
      setSegmentIndex((i) => Math.min(i + 1, totalSegments - 1));
    }, delay);
  }

  scheduleAdvance();
  return () => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };
}, [dialogue?.dlgId, dialogue?.nodeId, segmentIndex, isAutoDialogue, autoSpeed]);
function isAdjacentToPlayer(tx, ty) {
  const p = playerRef.current;
  if (currentMapNameRef.current === "shop") {
    if (p.x === tx && Math.abs(p.y - ty) === 4) return true;
  }
  return Math.abs(p.x - tx) + Math.abs(p.y - ty) === 1;
}

const tileW = map?.tilewidth ?? TILE_SIZE_FALLBACK;
const tileH = map?.tileheight ?? TILE_SIZE_FALLBACK;

const maxCols = map?.width ?? VIEW_COLS;
const maxRows = map?.height ?? VIEW_ROWS;

// Available screen space
const availW = viewportPx.w || VIEW_COLS * tileW * BASE_SCALE;
const availH = viewportPx.h || VIEW_ROWS * tileH * BASE_SCALE;

// Camera window in tiles
const effCols = Math.max(
  10,
  Math.min(maxCols, Math.floor(availW / (tileW * BASE_SCALE)))
);
const effRows = Math.max(
  8,
  Math.min(maxRows, Math.floor(availH / (tileH * BASE_SCALE)))
);

const scaleW = Math.floor(availW / (effCols * tileW));
const scaleH = Math.floor(availH / (effRows * tileH));
const renderScale = Math.max(1, Math.min(scaleW, scaleH));

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
    ctx.scale(renderScale, renderScale);
    ctx.fillStyle = "#202c39";
    ctx.fillRect(0, 0, c.width / renderScale, c.height / renderScale);


    let markerIndex = 0;
    const mapName = currentMapNameRef.current;
    const mapDef = MAPS[mapName];
    const cam = cameraRef.current;
    const buf = worldBufferRef.current;

    if (buf && worldBufferMetaRef.current.mapName === mapName) {
      const sx = cam.x * tw;
      const sy = cam.y * th;
      const sw = effCols * tw;
      const sh = effRows * th;

      ctx.drawImage(buf, sx, sy, sw, sh, 0, 0, sw, sh);
    }

    if (mapDef?.exits) {
      for (const exit of mapDef.exits) {
        const rx = (exit.x - cam.x) * tw;
        const ry = (exit.y - cam.y) * th;

        // Pulsing glow animation
        const pulseSpeed = 0.002;
        const pulseValue = Math.sin(now * pulseSpeed) * 0.5 + 0.5;

        ctx.save();

        // Outer glow
        const gradient = ctx.createRadialGradient(
          rx + tw / 2, ry + th / 2, 0,
          rx + tw / 2, ry + th / 2, tw * (1.2 + pulseValue * 0.3)
        );
        gradient.addColorStop(0, `rgba(34, 211, 238, ${0.4 + pulseValue * 0.3})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 238, ${0.2 + pulseValue * 0.2})`);
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(rx - tw, ry - th, tw * 3, th * 3);

        // Rotating border effect
        const rotation = (now * 0.001) % (Math.PI * 2);
        ctx.translate(rx + tw / 2, ry + th / 2);
        ctx.rotate(rotation);

        // Draw rotating corners
        const cornerSize = tw * 0.3;
        const offset = tw * 0.35;
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.7 + pulseValue * 0.3})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((Math.PI / 2) * i);
          ctx.beginPath();
          ctx.moveTo(offset, -offset);
          ctx.lineTo(offset + cornerSize, -offset);
          ctx.lineTo(offset, -offset + cornerSize);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();

        // Draw arrow pointing up with shimmer
        ctx.save();
        const arrowX = rx + tw / 2;
        const arrowY = ry + th / 2;

        ctx.shadowColor = 'rgba(34, 211, 238, 0.8)';
        ctx.shadowBlur = 8 + pulseValue * 4;
        ctx.fillStyle = `rgba(34, 211, 238, ${0.9 + pulseValue * 0.1})`;

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY - th * 0.25);
        ctx.lineTo(arrowX - tw * 0.2, arrowY + th * 0.1);
        ctx.lineTo(arrowX + tw * 0.2, arrowY + th * 0.1);
        ctx.closePath();
        ctx.fill();

        // Add small particles floating up
        const particleY = (now * 0.05) % th;
        ctx.fillStyle = `rgba(34, 211, 238, ${1 - particleY / th})`;
        for (let i = 0; i < 3; i++) {
          const px = arrowX + (Math.sin(now * 0.003 + i) * tw * 0.15);
          const py = arrowY + th * 0.2 - particleY + (i * th * 0.15);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }
    // Draw NPCs with proximity glow
    for (const npc of npcs) {
      const rx = (npc.x - cam.x) * tw;
      const ry = (npc.y - cam.y) * th;
      const close = isAdjacentToPlayer(npc.x, npc.y);

      ctx.save();
      if (close) {
        ctx.filter = "brightness(1.35)";
        ctx.shadowColor = "rgba(255,255,255,0.35)";
        ctx.shadowBlur = 6;
      }

      if (npc._img) {
        ctx.drawImage(npc._img, 0, 0, 16, 32, rx, ry, tw, th * 2);
      }
      else {
        const info = gidToDrawInfo(npc.gid, map.tilesets);
        if (info) {
          ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, rx, ry, tw, th);
        }
      }

      ctx.restore();
    }
    for (const obj of activeObjectives) {
      const waypoints = getObjectiveWaypoints(obj, GAME);

      for (const wp of waypoints) {
        const tile = resolveWaypointTile(wp, npcs, mapName, mapDef);
        if (!tile) continue;

        const screenX = (tile.x - cam.x) * tw;
        const screenY = (tile.y - cam.y) * th;

        drawWaypointMarker(
          ctx,
          screenX,
          screenY - (markerIndex % 3) * 8,
          tw,
          obj.optional
        );

        markerIndex++;
      }
    }

    // Draw player
    const p = playerRef.current;
    const px = (p.x - cam.x) * tw;
    const py = (p.y - cam.y) * th;

    const sprites = spriteRef.current;
    const anim = animRef.current;
    const sheet = sprites.sheet;
    const cols = anim.state === "walk" ? SPRITE.walkCols : SPRITE.idleCols;

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

      const frame = anim.state === "idle" ? 0 : anim.frame; // idle freezes on frame 0
      const sx = frame * SPRITE.fw;
      const sy = row * SPRITE.fh;

      ctx.save();
      if (anim.flipX) {
        ctx.scale(-1, 1);
        ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, -px - tw, py, tw, th * 2);
      } else {
        ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, px, py, tw, th * 2);
      }
      ctx.restore();
    }


    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.font = "16px ui-sans-serif, system-ui, -apple-system";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(
      "WASD/Arrows: Move • E: Talk",
      12,
      22
    );

    rafId = requestAnimationFrame(draw);
  };

  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}, [map, npcs, dialogue, presenting, viewportPx.w, viewportPx.h, effCols, effRows, renderScale]);
// Keep camera math consistent everywhere
useEffect(() => {
  viewColsRef.current = effCols;
  viewRowsRef.current = effRows;
}, [effCols, effRows]);

const width = effCols * tileW * renderScale;
const height = effRows * tileH * renderScale;

return (
  <div className="fixed inset-0 bg-slate-950 text-slate-100 overflow-hidden">
    <TopObjectiveBanner objective={activeObjectives?.[0]} />
    <div
      ref={viewportRef}
      className="absolute inset-0"
      style={{
        paddingTop: isShortHeight
          ? "env(safe-area-inset-top)"
          : "calc(3.25rem + env(safe-area-inset-top))",
      }}
    >
      <div className="w-full h-full grid place-items-center">
        <ObjectivesPanel
          gameState={GAME}
          refreshToken={objectivesRefresh}
          isMinimized={objectivesMinimized}
          onToggle={toggleObjectives}
          defaultOpen={false}
          onActiveObjectives={setActiveObjectives}
        />
        <div className="relative">
          <div className="rounded-2xl shadow-xl ring-1 ring-white/10 overflow-hidden bg-slate-900 relative">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              style={{ width, height }}
              className="block"
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
                show={!presenting}
              />
            )}
            {transitionMessage && (
              <div className="absolute inset-0 z-[1000] pointer-events-none grid place-items-center">
                <div className="max-w-xl mx-4 rounded-2xl bg-slate-900/80 ring-1 ring-white/10 px-5 py-3 text-center">
                  <div className="text-sm text-slate-100 whitespace-pre-line">
                    {transitionMessage}
                  </div>
                </div>
              </div>
            )}

            <DialogueOverlay dialogue={dialogue} setDialogue={setDialogue} />
            {creditsOverlay.visible && (
              <div className="fixed inset-0 z-[9999] bg-black/95 text-white flex items-center justify-center p-6">
                <div className="w-full max-w-xl">
                  <div className="text-center text-2xl font-bold mb-6">
                    {creditsOverlay.credits?.title ?? "CREDITS"}
                  </div>

                  <div className="space-y-5 max-h-[65vh] overflow-auto px-2">
                    {(creditsOverlay.credits?.sections ?? []).map((sec, i) => (
                      <div key={i}>
                        <div className="font-semibold mb-2">{sec.heading}</div>
                        <div className="text-sm opacity-90 space-y-1">
                          {sec.lines.map((line, j) => (
                            <div key={j}>{line}</div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 text-center text-sm opacity-80">
                      {(creditsOverlay.credits?.footerLines ?? ["Thanks for playing."]).map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                      onClick={() => {
                        const cb = creditsOverlay.onContinue;
                        setCreditsOverlay({ visible: false, credits: null, onContinue: null });
                        if (typeof cb === "function") cb();
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              className="absolute inset-0 pointer-events-none z-[999]"
              style={{
                backgroundColor: fadeOverlay.color,
                opacity: fadeOverlay.visible ? 1 : 0,
                transition: `opacity ${fadeOverlay.duration}ms linear`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

