const bobbyDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "bobby",
          text: "Are you sure you didn't hear any chatter on a secret gambling den?",
          voice: "city_01",
        },
        {
          speaker: "delivery girl",
          text:
            "Yes I'm sure. Can I leave already, detective? I still have a couple of deliveries to make in Patient Grove.",
          voice: "city_02",
        },
        {
          speaker: "bobby",
          text: "Oh no.",
          voice: "city_03",
          requires: { flagsAll: ["HasMetBobby"] },
        },
      ],
      choices: [
        { label: "Wait— did you say Patient Grove?", next: "grove" },
        { label: "What's happening here, Bobby?", next: "invest_intro" },
        { label: "[End conversation]", next: "end" },
      ],
    },
    
    return_visit: {
      segments: [
        {
          speaker: "bobby",
          text: "Oh detective, you're back. Please help me— she's not cracking.",
          voice: "city_04",
        },
      ],
      choices: [
        { label: "Let's do it.", next: "grove" },
        { label: "[End conversation]", next: "end" },
      ],
    },

    grove: {
      segments: [
        {
          speaker: "delivery girl",
          text: "Yes. That is where I'm going next.",
          voice: "grove_01",
        },
        {
          speaker: "bobby",
          text: "Wait a second, aren't you…",
          voice: "recognized_01",
          requires: { notFlags: ["HasMetBobby"] },
        },
        {
          speaker: "bobby",
          text: "Detective Marcus said you're nothing but trouble.",
          voice: "recognized_02",
          requires: { notFlags: ["HasMetBobby"] },
        },
      ],
      choices: [
        { label: "I need to ask you a few questions.", next: "questioning_block" },
        { label: "What's happening here, Bobby?", next: "invest_intro" },
        { label: "Okay, I'll go.", next: "late_leave" },
      ],
    },

    invest_intro: {
      segments: [
        {
          speaker: "bobby",
          text: "I'm currently on a case with Detective Marcus to find an illegal gambling den in the area.",
          voice: "case_01",
        },
        {
          speaker: "bobby",
          text: "This delivery girl knows something— I'm sure of it.",
          voice: "case_02",
        },
        {
          speaker: "bobby",
          text: "Wait a second, aren't you…",
          voice: "recognized_01",
          requires: { notFlags: ["HasMetBobby"] },
        },
        {
          speaker: "bobby",
          text: "Detective Marcus said you're nothing but trouble.",
          voice: "recognized_02",
          requires: { notFlags: ["HasMetBobby"] },
        },
      ],
      choices: [
        { label: "I need to ask her a few questions.", next: "questioning_block" },
        { label: "Where is Marcus now?", next: "marcus" },
        { label: "Okay, I'll go.", next: "late_leave" },
      ],
    },

    questioning_block: {
      segments: [
        {
          speaker: "bobby",
          text: "Wait— hold on, Detective. What about my case?",
          voice: "block_01",
        },
        {
          speaker: "bobby",
          text: "Come on, you have to ask her about my case too.",
          voice: "block_02",
        },
        {
          speaker: "bobby",
          text: "You owe it to me after getting me in trouble with Marcus.",
          voice: "block_03",
          requires: { flagsAll: ["HasMetBobby"] },
        },
      ],
      choices: [
        { label: "Okay, I'll help out.", next: "questioning" },
        { label: "Nah, I'm good.", next: "reject" },
      ],
    },

    questioning: {
      segments: [
        { speaker: "bobby", text: "Thank you.", voice: "thanks" },
        {
          speaker: "bobby",
          text: "I won't say anything to Marcus, I swear.",
          voice: "block_04",
          requires: { notFlags: ["HasMetBobby"] },
        },
        { speaker: "delivery girl", text: "Please hurry.", voice: "hurry" },
      ],
      choices: [
        { label: "So you make deliveries at Patient Grove, huh?", next: "grove_questioning" },
        { label: "You know any shady places around here?", next: "shady" },
        { label: "That's all for now.", next: "late_leave" },
      ],
    },

    shady: {
      segments: [
        { speaker: "delivery girl", text: "Shady places? I wouldn't know.", voice: "bar_lead_01" },
        { speaker: "delivery girl", text: "Maybe you would have some luck in the bar.", voice: "bar_lead_02" },
        { speaker: "bobby", text: "Interesting… that's something at least.", voice: "bar_lead_03" },
      ],
      set: { cluesAdd: ["clue_bobby_bar_lead"] },
      choices: [
        { label: "Good. We'll check the bar.", next: "invest_end" },
        { label: "Back up— ask her about Patient Grove.", next: "grove_questioning" },
        { label: "[Leave]", next: "end" },
      ],
    },

    grove_questioning: {
      segments: [
        { speaker: "delivery girl", text: "Yes, what about it?", voice: "grove_02" },
        { speaker: "delivery girl", text: "I do a couple times a week.", voice: "grove_03" },
      ],
      choices: [
        {
          label: "There's been a robbery there— have you seen anything suspicious lately?",
          next: "grove_questioning_01",
        },
        { label: "Ask about shady places instead.", next: "shady" },
        { label: "That's all for now.", next: "late_leave" },
      ],
    },

    grove_questioning_01: {
      segments: [
        { speaker: "delivery girl", text: "Nothing out of the ordinary.", voice: "grove_04" },
        { speaker: "bobby", text: "This is what I mean— she's holding out on you, detective.", voice: "holding" },
        { speaker: "delivery girl", text: "I'm not. I really don't see much there.", voice: "grove_05" },
      ],
      set: { cluesAdd: ["clue_delivery_girl_grove_nothing"] },
      choices: [
        { label: "Alright. Let's switch questions.", next: "questioning" },
        { label: "Okay, I'll go.", next: "late_leave" },
      ],
    },

    marcus: {
      segments: [{ speaker: "bobby", text: "He's… running late.", voice: "marcus" }],
      choices: [
        { label: "Then I'll handle this. Let me question her.", next: "questioning_block" },
        { label: "Okay, I'll go.", next: "late_leave" },
      ],
    },

    reject: {
      segments: [{ speaker: "bobby", text: "*sigh* Damn.", voice: "reject" }],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    invest_end: {
      segments: [
        { speaker: "bobby", text: "Alright— you can go.", voice: "case_03" },
        {
          speaker: "bobby",
          text: "Thank you for the help. I'll continue my investigation at the bar.",
          voice: "case_04",
        },
      ],
      set: { flagsAdd: ["bobby_investigation_bar"] },
      choices: [
        { label: "[End conversation]", next: "end" },
        { label: "Back— I want to ask one more thing.", next: "questioning" },
      ],
    },

    late_leave: {
      segments: [{ speaker: "bobby", text: "Fine. We'll talk later.", voice: "reject" }],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    end: {
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default bobbyDialogue;
