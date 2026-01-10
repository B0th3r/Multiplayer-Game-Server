export const CUTSCENES = {
  leave_office: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Leaving the Lieutenant's office...", duration: 1500 },
      { type: "loadMap", mapName: "pd", spawn: { x: 10, y: 15 } },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },
};

export async function playCutscene(cutsceneId, context) {
  const cutscene = CUTSCENES[cutsceneId];
  if (!cutscene) {
    console.error(`Cutscene not found: ${cutsceneId}`);
    return;
  }

  for (const step of cutscene.steps) {
    await executeStep(step, context);
  }
}

async function executeStep(step, context) {
  switch (step.type) {
    case "fade":
      return new Promise(resolve => {
        document.body.style.transition = `background-color ${step.duration}ms`;
        document.body.style.backgroundColor = step.color;
        setTimeout(resolve, step.duration);
      });

    case "text":
      context.setTransitionMessage(step.content);
      return new Promise(resolve => {
        setTimeout(() => {
          context.setTransitionMessage(null);
          resolve();
        }, step.duration);
      });

    case "loadMap":
      await context.loadNamedMap(step.mapName);
      if (step.spawn) {
        context.playerRef.current.x = step.spawn.x;
        context.playerRef.current.y = step.spawn.y;
      }
      break;

    

    default:
      console.warn(`Unknown cutscene step type: ${step.type}`);
  }
}