const mayaDialogue = {
  start: "citystop",

  nodes: {
    citystop: {
      segments: [
        { speaker: "maya", text: "Wait, hold up", voice: "city_01" },
        { speaker: "maya", text: "Be honest with me. You were the one who wrote that poem right?", voice: "city_02" },
      ],
      choices: [
        { label: "I did", next: "did" },
        { label: "No I didn't", next: "didnt" },
      ],
    },
    did: {
      onEnter: (state) => {
        state.flags.add("cutscene_maya_leaves");
      },
      set: { flagsAdd: ["maya_scene_complete"] },
      segments: [
        { speaker: "maya", text: "I knew it. A loser like him couldn't have written that.", voice: "city_leave_02" },
        { text: "(Maya leaves)" },
      ],
      choices: [{ label: "[End conversation]", next: "end" },]
    },
    didnt: {
      onEnter: (state) => {
        state.flags.add("cutscene_maya_leaves");
      },
      set: { flagsAdd: ["maya_scene_complete"] },
      segments: [
        { speaker: "maya", text: "Hm, really. Well that's all, see you later.", voice: "city_leave_01" },
        { text: "(Maya leaves)" },
      ],
      choices: [{ label: "[End conversation]", next: "end" },]
    },

    end: {
      segments: [],
      end: true,
    },
  },
};

export default mayaDialogue;
