const jackAlexDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "jack",
          text: "Well look who it is. You really messed up last case, huh?",
          voice: "intro_01",
        },
        {
          speaker: "alex",
          text: "Uh… I heard what happened. You okay?",
          voice: "intro_02",
        },
      ],
      choices: [
        { label: "odd", next: "odd_comment" },
        { label: "I'm good", next: "good" },
        { label: "...", next: "silence" },
      ]
    },
    odd_comment: {
      segments: [
        {
          speaker: "alex",
          text: "Huh? What is that supposed to mean?",
          voice: "odd_01",
        },
        {
          speaker: "jack",
          text: "Well if he's already joking like this, I assume it can't be all bad.",
          voice: "odd_02",
        },
      ],
      choices: [
        { label: "What's new around here", next: "office_news" },
        { label: "Bye.", next: "good_end" },
      ]
    },
    good: {
      segments: [
        {
          speaker: "alex",
          text: "Good. Wouldn't want them breaking you after all.",
          voice: "good",
        },
      ],
      choices: [
        { label: "What's new around here", next: "office_news" },
        { label: "Bye.", next: "good_end" },
      ]
    },
    silence: {
      segments: [
        {
          speaker: "alex",
          text: "Oh come on, it couldn't have been that bad.",
          voice: "silence_01",
        },
        {
          speaker: "alex",
          text: "One time Jack got chewed out so hard that—",
          voice: "silence_02",
        },
        {
          speaker: "jack",
          text: "Hey! I think he gets it.",
          voice: "silence_03",
        },
      ],
      choices: [
        { label: "What's new around here", next: "office_news" },
        { label: "Bye.", next: "good_end" },
      ]
    },
    office_news: {
      segments: [
        {
          speaker: "jack",
          text: "Besides what happened to you, nothing much. You're our main source of entertainment right now.",
          voice: "pd_news",
        },
      ],
      choices: [
        { label: "I am not news buddy", next: "bad_end" },
        { label: "Bye.", next: "good_end" },
      ]
    },
    bad_end: {
      segments: [
        {
          speaker: "jack",
          text: "Jeez man, relax. It's a joke.",
          voice: "bad_end_01",
        },
        {
          speaker: "alex",
          text: "Let's just go, man.",
          voice: "bad_end_02",
        },
        {
          speaker: "alex",
          text: "See you later.",
          voice: "exit",
        },
      ],
      choices: [
      ]
    },
    good_end: {
      segments: [
        {
          speaker: "alex",
          text: "See you later.",
          voice: "exit",
        },
      ],
      choices: []
    }
  }
};

export default jackAlexDialogue;
