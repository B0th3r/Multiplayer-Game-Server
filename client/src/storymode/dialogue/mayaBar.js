const mayaDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "maya", text: "Hey detective", voice: "maya_bar_01", requires: {notFlags: ["you_screwed_lucas", "hayes_screwed_lucas", "flower_delivered_lucas"]} },

      ],
      choices: [
        { label: "I have flowers for you.", next: "flower", requires:  {notFlags: ["flower_delivered_lucas"], flagsAll: ["flower_purchased"]} },
        { label: "[Leave]", next: "end" },
      ],
    },
    flower: {
      segments: [
        { speaker: "maya", text: "Oh you have flowers who are they from.", voice: "flowers_from_you" },
      ],
      choices: [
        { label: "They're from Hayes.", next: "hayes" },
        { label: "They're from me.", next: "you" },
        { label: "[Leave]", next: "end" },
      ],
    },
    hayes: {
      set: {
        flagsAdd: ["hayes_screwed_lucas"]
      },
      segments: [
        { speaker: "maya", text: "Haye's? Huh", voice: "hayes" },
        { speaker: "maya", text: "Well, thank you for giving them to me", voice: "thanks" },
      ],
      choices: [
        { label: "[Leave]", next: "end" },
      ],
    },

    you: {
      set: {
        flagsAdd: ["you_screwed_lucas"]
      },
      segments: [
        { speaker: "maya", text: "there from you? Well thank you.", voice: "protag" },
      ],
      choices: [
        { label: "[Leave]", next: "end" },
      ],
    },

    end: {
      segments: [],
      end: true,
    },
  },
};

export default mayaDialogue;
