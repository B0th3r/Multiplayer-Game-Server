import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';

const OBJECTIVES_CONFIG = {
  talk_to_ace: {
    id: 'talk_to_ace',
    title: 'Talk to Ace to begin your investigation',
    startsActive: true,
    completesWhen: { flagsAny: ['started_investigation'] },
    waypoint: { type: "npc", id: "ace" }
  },
  talk_to_officers: {
    id: "talk_to_officers",
    title: "Talk to your fellow officers",
    description: "Chat with Lucas, Bobby, and Jack & Alex",
    optional: true,
    startsActive: true,
    completesWhen: { flagsAll: ["talkedToLucas", "talkedToBobby", "talkedToJackAlex"] },
    waypoints: [
    { type: "npc", id: "lucas", hideWhenFlag: "talkedToLucas" },
    { type: "npc", id: "bobby", hideWhenFlag: "talkedToBobby" },
    { type: "npc", id: "jackAlex", hideWhenFlag: "talkedToJackAlex" },
  ],
  },

  talk_to_jim: {
    id: 'talk_to_jim',
    title: 'Talk to Jim and Donna',
    description: 'Interview the couple about the missing twenty dollars',
    appearsWhen: { flagsAll: ["debriefed"], },
    completesWhen: { flagsAny: ['talkedToJim', 'talkedToDonna'] }
  },
  talk_to_john: {
    id: 'talk_to_john',
    title: 'Talk to John',
    appearsWhen: { flagsAll: ["debriefed"], },
    description: 'Interview the other neighbor about his missing money',
    completesWhen: { flagsAny: ['talkedToJohn'] }
  },
  talk_to_sam: {
    id: 'talk_to_sam',
    title: 'Interview Sam',
    appearsWhen: { flagsAll: ["debriefed"], },
    description: 'Talk to the neighbor who found the wallet',
    completesWhen: { flagsAny: ['talkedToSam'] }
  },
  travel_to_city: {
    id: 'travel_to_city',
    title: '(OPTIONAL) Travel to the City',
    description: 'Travel to the city to find Jane',
    optional: true,
    appearsWhen: { flagsAll: ["janes_location_city"], },
    completesWhen: { flagsAny: ['arrivedInCity'] }
  },
  find_jane: {
    id: 'find_jane',
    title: '(OPTIONAL) Find Jane',
    description: "Find out where Jane ran off to",
    optional: true,
    appearsWhen: { flagsAny: ['john_argument', 'arrivedIniCty'] },
    completesWhen: { flagsAny: ['foundJane'] }
  },
  end_investigation: {
    id: 'end_investigation',
    title: 'End Investigation',
    description: 'Talk to Detective Hayes to conclude the investigation',
    appearsWhen: { flagsAll: ['talkedToJim', 'talkedToDonna', 'talkedToJohn', 'talkedToSam'] },
    completesWhen: { flagsAny: ['investigationConcluded'] }
  }
};

function ObjectivesPanel({ gameState, isMinimized, onToggle, onActiveObjectives }) {
  const [activeObjectives, setActiveObjectives] = useState([]);
  const [completedObjectives, setCompletedObjectives] = useState([]);

  useEffect(() => {
    const active = [];
    const completed = [];

    Object.values(OBJECTIVES_CONFIG).forEach(objective => {
      const shouldAppear = checkObjectiveAppears(objective, gameState);
      if (!shouldAppear) return;

      const isComplete = checkObjectiveComplete(objective, gameState);

      if (isComplete) {
        completed.push(objective);
      } else {
        active.push(objective);
      }
    });

    setActiveObjectives(active);
    setCompletedObjectives(completed);
    onActiveObjectives?.(active);
  }, [gameState]);

  function checkObjectiveAppears(objective, state) {
    // Always appear if startsActive is true
    if (objective.startsActive) return true;

    const cond = objective.appearsWhen;
    if (!cond) return true;

    if (cond.flagsAll && !cond.flagsAll.every(f => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some(f => state.flags.has(f))) return false;

    if (cond.cluesAll && !cond.cluesAll.every(c => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some(c => state.clues.has(c))) return false;

    return true;
  }

  function checkObjectiveComplete(objective, state) {
    const cond = objective.completesWhen;
    if (!cond) return false;

    if (cond.flagsAll && !cond.flagsAll.every(f => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some(f => state.flags.has(f))) return false;

    if (cond.cluesAll && !cond.cluesAll.every(c => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some(c => state.clues.has(c))) return false;

    return true;
  }

  if (isMinimized) {
    return (
      <div className="absolute top-3 left-3 z-50">
        <button
          onClick={onToggle}
          className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/70 backdrop-blur-md ring-1 ring-white/10 shadow-lg hover:bg-slate-800/70 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/70 ring-1 ring-white/10 group-hover:bg-slate-700/70 transition-colors">
            <ClipboardList className="w-4 h-4 text-emerald-300" />
          </div>

          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-slate-100">Objectives</span>
            <span className="text-xs text-slate-400">
              {activeObjectives.length} active
              {completedObjectives.length ? ` • ${completedObjectives.length} done` : ""}
            </span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-3 left-3 z-50 w-80">
      <div className="bg-slate-800/95 backdrop-blur rounded-xl ring-1 ring-white/10 shadow-xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">Objectives</h3>
          </div>
          <button
            onClick={onToggle}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Minimize
          </button>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto">
          {activeObjectives.length === 0 && completedObjectives.length === 0 && (
            <div className="text-sm text-slate-400 text-center py-4">
              No objectives yet
            </div>
          )}

          {/* Active Objectives */}
          {activeObjectives.map(obj => {
            const isOptional = !!obj.optional;
            return (
              <div
                key={obj.id}
                className={[
                  "flex gap-2 p-2 rounded-lg bg-slate-900/50 ring-1 transition-colors",
                  isOptional ? "ring-amber-400/30" : "ring-emerald-500/20",
                ].join(" ")}
              >
                <Circle
                  className={[
                    "w-5 h-5 mt-0.5 flex-shrink-0",
                    isOptional ? "text-amber-300" : "text-emerald-400",
                  ].join(" ")}
                />
                <div>
                  <div className="font-medium text-sm text-slate-100">
                    {obj.title}
                    {isOptional ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-300/90">
                        Optional
                      </span>
                    ) : null}
                  </div>

                  {obj.description ? (
                    <div className="text-xs text-slate-400 mt-0.5">
                      {obj.description}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}


          {/* Completed Objectives */}
          {completedObjectives.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Completed
              </div>
              {completedObjectives.map(obj => (
                <div
                  key={obj.id}
                  className="flex gap-2 p-2 rounded-lg bg-slate-900/30 ring-1 ring-white/5 opacity-60"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-slate-300 line-through">
                      {obj.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {obj.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ObjectivesPanel;