const marcusDialogue = {
  start: "intro",
  nodes: {
    intro: {
      set: { flagsAdd: ["marcus_comforts_bobby_bar"] },
      segments: [
        { speaker: "marcus", text: "fancy seeing you here detective...", voice: "intro_01" },
        { speaker: "marcus", text: "What are you doing here?", voice: "intro_02" },
      ],
      choices: [
        {
          label: "My case led me here",
          next: "case",
          requires: { flagsAny: ["jane_location_known", "TalkedToJane"] },
        },
        {
          label: "Quick, come in! Bobby is running an illegal gambling den!",
          next: "pinned_on_bobby_01",
          requires: { flagsAll: ["BobbyDirty"] },
        },
        {
          label: "Quick, come in! Bobby and I solved the gambling den case!",
          next: "broke_case",
          requires: { flagsAll: ["BobbyGood"] },
        },
        { label: "Bobby isn't here I think I saw him head into the flower shop", next: "sent_away", requires: { flagsAll: ["BobbyDirty", "GainedMarcusTrust"] } },
      ],
    },

    sent_away: {
      set: { flagsAdd: ["marcus_sent_away"] },
      onEnter: (state) => {
        state.flags.add("cutscene_marcus_leaves");
      },
      segments: [
        { speaker: "marcus", text: "Really?", voice: "really" },
        { speaker: "marcus", text: "Well, I'll go over to the flower shop then.", voice: "sent_away" }],
      choices: [
        { label: "[Leave]", next: "end_01" },
      ],
    },
    case: {
      set: { flagsAdd: ["GainedMarcusTrust"] },
      segments: [{ speaker: "marcus", text: "*sighs* I suppose that makes sense.", voice: "case" }],
      choices: [
        {
          label: "Quick, come in! Bobby is running an illegal gambling den!",
          next: "pinned_on_bobby_01",
          requires: { flagsAll: ["BobbyDirty"] },
        },
        {
          label: "Quick, come in! Bobby and I solved the gambling den case!",
          next: "broke_case",
          requires: { flagsAll: ["BobbyGood"] },
        },
        { label: "[Leave]", next: "end_01" },
      ],
    },
    pinned_on_bobby_01: {
      segments: [
        { speaker: "marcus", text: "He what!!!!", voice: "dirty_told" },
        { speaker: "marcus", text: "..." },

        { speaker: "marcus", text: "Wait this isn't adding up", voice: "not_adding", requires: { notFlags: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "What are you doing here?", voice: "intro_02", requires: { notFlags: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "Damn it Bobby.", voice: "bobbyMad", requires: { flagsAll: ["GainedMarcusTrust"] } },
        { speaker: "marcus", text: "I have to see this for myself.", voice: "pinned", requires: { flagsAll: ["GainedMarcusTrust"] } },
      ],
      choices: [
        {
          label: "My case led me here",
          next: "pinned_on_bobby_02",
          requires: {
            notFlags: ["GainedMarcusTrust"],
            flagsAny: ["jane_location_known", "TalkedToJane"],
          },
        },
        { label: "Came for a drink, of course", next: "failed", requires: { notFlags: ["GainedMarcusTrust"] } },
        { label: "Just doing some exploring", next: "failed", requires: { notFlags: ["GainedMarcusTrust"] } },
        { label: "I don't have to tell you", next: "failed", requires: { notFlags: ["GainedMarcusTrust"] } },
        { label: "[Leave]", next: "end_01", requires: { flagsAll: ["GainedMarcusTrust"] } },
      ],
    },
    pinned_on_bobby_02: {
      segments: [
        { speaker: "marcus", text: "*sighs* I suppose that makes sense.", voice: "case" },
        { speaker: "marcus", text: "Damn it Bobby.", voice: "bobbyMad" },
        { text: "(Marcus runs into the bar.)" },
      ],
      choices: [
        { label: "[Leave]", next: "end_01" },
      ],
    },
    broke_case: {
      onEnter: (state) => {
        state.flags.add("cutscene_marcus_leaves");
      },
      segments: [
        { speaker: "marcus", text: "Really?", voice: "really" },
        { speaker: "marcus", text: "...", voice: "" },
        { speaker: "marcus", text: "I have to see this for myself.", voice: "pinned" },
      ],
      choices: [{ label: "[Leave]", next: "end_01" }],
    },

    failed: {
      onEnter: (state) => {
        state.flags.add("cutscene_marcus_leaves");
      },
      set: { flagsAdd: ["marcus_caught"] },
      segments: [
        { speaker: "marcus", text: "..." },
        { speaker: "marcus", text: "Look I know you're involved in this somehow after I interrogate Bobby I'll arrest you both.", voice: "caught" },
        { text: "(Marcus runs into the bar.)" },

      ],
      choices: [{ label: "[Leave]", next: "end_01" }],
    },

    end_01: {
      onEnter: (state) => {
        state.flags.add("cutscene_marcus_leaves");
      },
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default marcusDialogue;
