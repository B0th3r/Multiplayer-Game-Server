const jimDonnaDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "donna",
          text: "Oh, detective, right? Your partner said you'd be by. Please, come in.",
          voice: "intro_01",
        },
        {
          speaker: "jim",
          text: "Hey, detective.",
          voice: "intro_02"
        },
      ],
      choices: [
        {
          label: "I want your side of things, from the beginning.",
          next: "from_beginning",
          set: { flagsAdd: ["talkedToJim", "talkedToDonna"] },
        },
        {
          label: "I heard your neighbor John also got robbed. What do you know?",
          next: "john",
          set: { flagsAdd: ["talkedToJim", "talkedToDonna"] },
        },
        { label: "[Leave]", next: "end_02" },
      ],
    },

    timeline_menu: {
      segments: [],
      choices: [
        { label: "You think you dropped it?", next: "drop_explain", requires: { notFlags: ["asked_drop_explain"] } },
        { label: "How did you get it back?", next: "sam_intro", requires: { notFlags: ["asked_sam_intro"] } },
        { label: "When did you notice the missing $20?", next: "checked_when", requires: { notFlags: ["asked_checked_when"] } },
        { label: "Let's talk about the missing money.", next: "money_missing", requires: { notFlags: ["asked_money_missing"] } },

        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_02" },
      ],
    },

    suspects_menu_silent: {
      segments: [],
      choices: [
        { label: "Sam", next: "sam_info" },
        { label: "John", next: "john_info" },
        { label: "Tim", next: "tim_info" },
        { label: "Back to the timeline.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    from_beginning: {
      segments: [
        {
          speaker: "jim",
          text: "From the beginning, huh…",
          voice: "from_beginning_01",
        },

        {
          speaker: "jim",
          text: "Well it was late three days ago. I was coming home and—",
          voice: "from_beginning_02",
        },
        {
          speaker: "donna", text: "Take your time, Jim.",
          voice: "from_beginning_03"
        },
        {
          speaker: "jim",
          text: "Yeah... I was walking home, must have been past dark. Then suddenly I don't have my wallet.",
          voice: "from_beginning_04",
        },
      ],
      set: { flagsAdd: ["asked_from_beginning"] },
      choices: [
        { label: "You think you dropped it?", next: "drop_explain", requires: { notFlags: ["asked_drop_explain"] } },
        { label: "How did you get it back?", next: "sam_intro", requires: { notFlags: ["asked_sam_intro"] } },
        { label: "Geez— can you hurry this up?", next: "poke_01" },
        { label: "Let's talk about the missing money.", next: "money_missing", requires: { notFlags: ["asked_money_missing"] } },

        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    drop_explain: {
      segments: [
        {
          speaker: "jim",
          text: "Yeah I suppose I dropped it. I don't remember getting bumped into or anything like that.",
          voice: "dropped"
        },
      ],
      set: { flagsAdd: ["asked_drop_explain"] },
      choices: [
        { label: "Where do you think you dropped it?", next: "location1" },
        { label: "Who found it?", next: "sam_intro" },
        { label: "Okay. Keep going.", next: "timeline_menu" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    location1: {
      segments: [
        {
          speaker: "donna",
          text: "Our neighbor Sam said it was on the sidewalk a little left from her house. Jim probably let it slip out of his pocket.",
          voice: "location_01",
        },
      ],
      set: { flagsAdd: ["asked_location1"] },
      choices: [
        { label: "So Sam returned it the next morning?", next: "sam_intro" },
        { label: "Jim— do you remember the return?", next: "jim_memory" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    jim_memory: {
      segments: [
        {
          speaker: "jim",
          text: "Sam? Yeah I remember Sam.  I still don't remember dropping it though, sorry detective.",
          voice: "memory"
        },
      ],
      set: { flagsAdd: ["asked_jim_memory"] },
      choices: [
        { label: "When did you notice the missing $20?", next: "checked_when" },
        { label: "Let's talk about the money that went missing.", next: "money_missing" },
        { label: "Back up— how did you get it back?", next: "sam_intro" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    sam_intro: {
      segments: [
        {
          speaker: "donna",
          text: "Sam brought it by the next morning. Knocked on the door before breakfast.",
          voice: "sam_recovered_01",
        },
      ],
      set: { flagsAdd: ["asked_sam_intro"] },
      choices: [
        { label: "Did she say whether she opened it?", next: "sam_opened", requires: { notFlags: ["asked_sam_opened"] } },
        { label: "Did either of you check the money then?", next: "checked_when" },
        { label: "Alright. Let's move on.", next: "timeline_menu" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    sam_opened: {
      segments: [
        {
          speaker: "jim",
          text: "No, I didn't ask. I was just grateful to get it back.",
          voice: "opened"
        },
      ],
      set: { flagsAdd: ["asked_sam_opened"] },
      choices: [
        { label: "Okay. When did you notice the missing $20?", next: "checked_when" },
        { label: "Let's move to the missing twenty.", next: "money_missing" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    checked_when: {
      segments: [
        { speaker: "donna", text: "He didn't check it. That's the problem.", voice: "checked_01" },
        {
          speaker: "donna",
          text: "We only found out three days later when I was checking our bills and noticed the cash was short.",
          voice: "checked_02",
        },
        {
          speaker: "jim",
          text: "Yeah I didn't think to check the money, I figured I dodged a bullet",
          voice: "checked_03"
        },
        {
          speaker: "donna",
          text: "I know how that looks. But at first, we thought he just dropped the wallet got lucky.",
          voice: "checked_04",
        },
      ],
      set: { flagsAdd: ["asked_checked_when"] },
      choices: [
        { label: "Why did you check the money later?", next: "why_check", requires: { notFlags: ["asked_why_check"] } },
        { label: "How much was missing, and how much was left?", next: "money_missing" },
        { label: "What a joke. Have you checked between the couch cushions?", next: "poke_02" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    why_check: {
      segments: [
        {
          speaker: "donna",
          text: "He's always forgetting things, and I always do checks around the house.",
          voice: "why_check_01",
        },
      ],
      set: { flagsAdd: ["asked_why_check"] },
      choices: [
        { label: "How much money was missing?", next: "money_missing" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "Let's talk about John's robbery.", next: "john" },
        { label: "Back.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    money_missing: {
      segments: [
        {
          speaker: "donna",
          text: "We had six twenties for a total of one hundred and twenty dollars.",
          voice: "money_missing_01",
        },
        {
          speaker: "donna",
          text: "I remember because I told him not to carry that much.",
          voice: "money_missing_02",
        },
      ],
      set: { flagsAdd: ["asked_money_missing"], cluesAdd: ["clue_jim_had_120", "clue_missing_20"] },
      choices: [
        { label: "They only took one $20 bill?", next: "comment_on_odd", requires: { notFlags: ["asked_comment_on_odd"] } },
        { label: "Let's talk about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "Back.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    john: {
      segments: [
        {
          speaker: "donna",
          text: "From what Sam told me, it looks like John got robbed for $30.",
          voice: "john_01",
        },
        {
          speaker: "jim",
          text: "Wait— no. Wasn't it $20?",
          voice: "john_02"
        },
        {
          speaker: "donna",
          text: "No, Jim. It was $30. You'll be better off asking Sam for details about that.",
          voice: "john_03",
        },
        {
          speaker: "donna",
          text: "Two robberies on the same street within days, detective. That's not a coincidence.",
          voice: "john_04",
        },
      ],
      set: { flagsAdd: ["asked_john"], cluesAdd: ["clue_john_robbed"] },
      choices: [
        { label: "Back to the timeline.", next: "timeline_menu" },
        { label: "Let's talk about your neighbors", next: "suspects_menu_silent" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    comment_on_odd: {
      segments: [
        {
          speaker: "jim",
          text: "That's what I said! Who steals just one? If you're going to rob an old man, at least commit to it.",
          voice: "odd"
        },
      ],
      set: { flagsAdd: ["asked_comment_on_odd"] },
      choices: [
        { label: "Seems more likely you misplaced it, Jim.", next: "accuse_jim_followup" },
        { label: "Maybe Sam stole it.", next: "accuse_sam_followup" },
        { label: "Maybe it was taken after the wallet was returned.", next: "accuse_after_return_followup" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    accuse_sam_followup: {
      segments: [
        {
          speaker: "donna",
          text: "Sam's been our neighbor for years. I don't believe she'd take anything.",
          voice: "sam_accuse_01",
        },
        {
          speaker: "jim",
          text: "Yeah… though I guess anyone could've grabbed it if it was lying out there all night.",
          voice: "sam_accuse_02"
        },
      ],
      set: { flagsAdd: ["asked_accuse_sam_followup"] },
      choices: [
        { label: "Tell me more about Sam.", next: "sam_info" },
        { label: "Alright. What about other neighbors", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    accuse_jim_followup: {
      segments: [
        {
          speaker: "jim",
          text: "What!? I swear I'm not that careless.",
          voice: "accused"

        },
        { speaker: "donna", text: "…" },
      ],
      set: { flagsAdd: ["asked_accuse_jim_followup"] },
      choices: [
        { label: "Let's talk about your neighbors", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    accuse_after_return_followup: {
      segments: [
        {
          speaker: "donna",
          text: "That's crossed my mind. It was on the table a lot those days. We weren't guarding it.",
          voice: "table_01",
        },
        {
          speaker: "jim",
          text: "Anyone could've walked by it… not that we had many visitors.",
          voice: "table_02"
        },
      ],
      set: { flagsAdd: ["asked_accuse_after_return_followup"] },
      choices: [
        { label: "*sigh* you can't be serious.", next: "poke_03" },
        { label: "Back to your neighbors.", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    neighbors: {
      segments: [{ speaker: "donna", text: "Sure. Who do you want to know about?", voice: "menu" }],
      choices: [
        { label: "Sam", next: "sam_info" },
        { label: "John", next: "john_info" },
        { label: "Tim", next: "tim_info" },
        { label: "Back.", next: "suspects_menu_silent" },
      ],
    },


    sam_info: {
      segments: [{ speaker: "donna", text: "" }],
      choices: [
        { label: "Back.", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    john_info: {
      segments: [
        {
          speaker: "jim", text: "John is a quiet fellow. Keeps to himself mostly.",
          voice: "john_info_02"
        },
      ],
      choices: [
        { label: "Back.", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    tim_info: {
      segments: [{ speaker: "donna", text: "Tim is a rude fellow." },
      {
        speaker: "jim",
        text: "He once told me my mailbox was 'an eyesore to the community.'",
        voice: "tim_04"
      },
      ],
      choices: [
        { label: "Go on.", next: "tim_followup" },
        { label: "Would he take $20?", next: "tim_motive"},
        { label: "Back.", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    tim_motive: {
      segments: [
        { speaker: "donna", text: "Would he take it? Hard to say. He's rude, not desperate." },
        {
          speaker: "jim", text: "But he'd pocket twenty bucks if he thought he deserved it more than us.",
          voice: "tim_mot_02"
        },
      ],
      set: { flagsAdd: ["asked_tim_motive"] },
      choices: [
        { label: "Back to your neighbors.", next: "suspects_menu_silent" },
        { label: "Back to the timeline.", next: "timeline_menu" },
        { label: "[Leave]", next: "end_01" },
      ],
    },


    poke_01: {
      segments: [
        { speaker: "donna", text: "Detective…", voice: "" },
        {
          speaker: "jim", text: "Yeah. Sorry. I'm trying here.",
          voice: "poke_02"
        },
      ],
      choices: [
        { label: "Fine. Continue.", next: "timeline_menu" },
        { label: "Let's talk about the money.", next: "money_missing" },
        { label: "Ask about John's robbery.", next: "john" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
      ],
    },

    poke_02: {
      segments: [
        {
          speaker: "jim", text: "The couch? Yeah we actually did, we didn't find it.",
          voice: "poke_03"
        },
        { speaker: "donna", text: "Very funny, detective." },
      ],
      choices: [
        { label: "Alright. Back to business.", next: "timeline_menu" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "Ask about John's robbery.", next: "john" },
      ],
    },

    poke_03: {
      segments: [{ speaker: "donna", text: "Detective… please.", voice: "" }],
      choices: [
        { label: "Yeah. Sorry.", next: "suspects_menu_silent" },
        { label: "Back.", next: "accuse_after_return_followup" },
        { label: "Back to the timeline.", next: "timeline_menu" },
      ],
    },

    end_01: {
      segments: [
        {
          speaker: "jim", text: "Bye.",
          voice: ""
        },
      ],
      choices: [
        { label: "Alright. Back to business.", next: "timeline_menu" },
        { label: "Let's talk about your neighbors.", next: "suspects_menu_silent" },
        { label: "Ask about John's robbery.", next: "john" },
      ],
    },

    end_02: {
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default jimDonnaDialogue;
