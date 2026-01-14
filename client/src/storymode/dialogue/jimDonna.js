const jimDonnaDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "donna",
          text: "Oh— detective, right? Your partner said you'd be by. Please, come in.",
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
        { label: "[Leave]", next: "end" },
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
          text: "I was walking home, must have been past dark. Then suddenly I don't have my wallet.",
          voice: "from_beginning_04",
        },
      ],
      choices: [
        { label: "You think you dropped it?", next: "drop_explain" },
        { label: "How did you get it back?", next: "sam_intro" },
        { label: "Geez— can you hurry this up?", next: "poke_01" },
        { label: "Let's talk about the missing money.", next: "money_missing" },
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
      choices: [
        { label: "Where do you think you dropped it?", next: "location1" },
        { label: "Who found it?", next: "sam_intro" },
        { label: "Okay. Keep going.", next: "from_beginning" },
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
      choices: [
        { label: "So Sam returned it the next morning?", next: "sam_intro" },
        { label: "Jim— do you remember the return?", next: "jim_memory" },
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
      choices: [
        { label: "When did you notice the missing $20?", next: "checked_when" },
        { label: "Let's talk about the money that went missing.", next: "money_missing" },
        { label: "Back up— how did you get it back?", next: "sam_intro" },
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
      choices: [
        { label: "Did she say whether she opened it?", next: "sam_opened" },
        { label: "Did either of you check the money then?", next: "checked_when" },
        { label: "Alright. Let's move on.", next: "money_missing" },
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
      choices: [
        { label: "Okay. When did you notice the missing $20?", next: "checked_when" },
        { label: "Let's move to the missing twenty.", next: "money_missing" },
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
          text: "I know how that looks. But at first, we thought he just got lucky.",
          voice: "checked_04",
        },
      ],
      choices: [
        { label: "Why did you check the money later?", next: "why_check" },
        { label: "How much was missing, and how much was left?", next: "money_missing" },
        { label: "What a joke. Have you checked between the couch cushions?", next: "poke_02" },
        { label: "Let's talk about possible suspects.", next: "suspects_menu" },
      ],
    },

    why_check: {
      segments: [
        {
          speaker: "donna",
          text: "He's always forgetting things, so I do checks around the house—bills, cash, important stuff.",
          voice: "why_check_01",
        },
      ],
      choices: [
        { label: "How much money was missing?", next: "money_missing" },
        { label: "Back.", next: "checked_when" },
      ],
    },

    jim_view: {
      segments: [
        { speaker: "jim", text: "Honestly? I don't know. I wish I did." },
        { speaker: "jim", text: "If I dropped it and someone found it… that $20 could've walked away at any point." },
      ],
      choices: [
        { label: "Okay. Let's talk numbers.", next: "money_missing" },
        { label: "Let's talk suspects.", next: "suspects_menu" },
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
      set: { cluesAdd: ["clue_jim_had_120", "clue_missing_20"] },
      choices: [
        { label: "They only took one $20 bill?", next: "comment_on_odd" },
        { label: "Let's talk about John's robbery.", next: "john" },
        { label: "[Leave]", next: "end" },
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
      set: { cluesAdd: ["clue_john_robbed"] },
      choices: [
        { label: "Sam said there was an argument. Do you know anything about that?", next: "argument" },
        { label: "Back to your robbery from the beginning.", next: "from_beginning" },
        { label: "Let's list suspects again.", next: "suspects_menu" },
        { label: "[Leave]", next: "end" },
      ],
    },

    argument: {
      segments: [
        { speaker: "jim", text: "Argument? Oh… no. I haven't heard anything." },
        { speaker: "donna", text: "Can't say I have either.", voice: "argument_02" },
      ],
      choices: [
        { label: "Back to the odd missing $20.", next: "comment_on_odd" },
        { label: "Back to John's robbery.", next: "john" },
        { label: "Back to suspects.", next: "suspects_menu" },
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
      choices: [
        { label: "Seems more likely you misplaced it, Jim.", next: "accuse_jim_followup" },
        { label: "Maybe Sam stole it.", next: "accuse_sam_followup" },
        { label: "Maybe it was taken after the wallet was returned.", next: "accuse_after_return_followup" },
        { label: "Back to the timeline.", next: "checked_when" },
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
      choices: [
        { label: "Tell me more about Sam.", next: "sam_info" },
        { label: "Alright. What about other suspects?", next: "suspects_menu" },
        { label: "Back.", next: "comment_on_odd" },
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
      choices: [
        { label: "So misplacing the bill *is* possible.", next: "timeline_uncertain" },
        { label: "Back to suspects.", next: "suspects_menu" },
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
      choices: [
        { label: "Let's list every visitor again.", next: "visitors1" },
        { label: "Were there moments the house was unlocked?", next: "house_unlocked" },
        { label: "*sigh* you can't be serious.", next: "poke_03" },
        { label: "Back to suspects.", next: "suspects_menu" },
      ],
    },

    house_unlocked: {
      segments: [{ speaker: "jim", text: "Sorry, detective. We weren't as careful as we should've been." }],
      set: { cluesAdd: ["clue_house_unlocked_possible"] },
      choices: [
        { label: "Someone bold. Or someone who knew you.", next: "suspects_menu" },
        { label: "Alright. Let's move on.", next: "timeline_uncertain" },
      ],
    },

    visitors1: {
      segments: [
        { speaker: "donna", text: "Visitors? Not many. Just neighbors, really.", voice: "menu" },
        { speaker: "jim", text: "No parties. No family visits. Just normal days." },
      ],
      set: { cluesAdd: ["clue_few_visitors"] },
      choices: [
        { label: "Let's talk neighbors.", next: "neighbors" },
        { label: "Back to suspects.", next: "suspects_menu" },
        { label: "[Leave]", next: "end" },
      ],
    },

    suspects_menu: {
      segments: [{ speaker: "donna", text: "Alright. Who do you want to ask about?", voice: "menu" }],
      choices: [
        { label: "Sam", next: "sam_info" },
        { label: "John", next: "john_info" },
        { label: "Tim", next: "tim_info" },
        { label: "Back to the timeline.", next: "checked_when" },
        { label: "[Leave]", next: "end" },
      ],
    },

    neighbors: {
      segments: [{ speaker: "donna", text: "Sure. Who do you want to know about?", voice: "menu" }],
      choices: [
        { label: "Sam", next: "sam_info" },
        { label: "John", next: "john_info" },
        { label: "Tim", next: "tim_info" },
        { label: "Back.", next: "suspects_menu" },
      ],
    },

    sam_info: {
      segments: [{ speaker: "donna", text: "Sam is a sweet girl. Always waves when we see her." }],
      choices: [
        { label: "Does she have any reason to take it?", next: "sam_position" },
        { label: "Back.", next: "suspects_menu" },
      ],
    },

    sam_position: {
      segments: [
        { speaker: "donna", text: "I don't think she'd steal. But I guess nobody is perfect." },
        { speaker: "jim", text: "If the wallet was just sitting out there… anyone could've seen it." },
      ],
      choices: [
        { label: "Okay.", next: "suspects_menu" },
        { label: "Back to the timeline.", next: "checked_when" },
      ],
    },

    john_info: {
      segments: [
        { speaker: "donna", text: "John keeps to himself. Lately he's been tense." },
        {
          speaker: "jim", text: "John is a quiet fellow. Keeps to himself mostly.",
          voice: "john_info_02"
        },
      ],
      choices: [{ label: "Back.", next: "suspects_menu" }],
    },

    tim_info: {
      segments: [{ speaker: "donna", text: "Tim is a rude fellow." }],
      choices: [
        { label: "Go on.", next: "tim_followup" },
        { label: "Back.", next: "suspects_menu" },
      ],
    },

    tim_followup: {
      segments: [
        {
          speaker: "donna",
          text: "Tim… well, he's the kind who complains about everyone else. Property values, lawns, cars—everything.",
        },
        {
          speaker: "jim",
          text: "He once told me my mailbox was 'an eyesore to the community.'",
          voice: "tim_04"
        },
      ],
      choices: [
        { label: "Would he take $20?", next: "tim_motive" },
        { label: "Back.", next: "suspects_menu" },
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
      set: { cluesAdd: ["clue_tim_is_opportunist"] },
      choices: [
        { label: "Back to suspects.", next: "suspects_menu" },
        { label: "[Leave]", next: "end" },
      ],
    },

    timeline_uncertain: {
      segments: [
        {
          speaker: "donna",
          text: "Everything happened over a few days. Hard to say exactly when that bill went missing.",
        },
      ],
      choices: [
        { label: "Anyone come by those days?", next: "visitors1" },
        { label: "Let's talk suspects.", next: "suspects_menu" },
        { label: "That's all I needed for now. (end)", next: "end" },
      ],
    },

    poke_01: {
      segments: [
        { speaker: "donna", text: "Detective…", voice: "" },
        { speaker: "jim", text: "Yeah. Sorry. I'm trying here.",
          voice: "poke_02"
         },
      ],
      choices: [
        { label: "Fine. Continue.", next: "from_beginning" },
        { label: "Let's talk about the money.", next: "money_missing" },
      ],
    },

    poke_02: {
      segments: [
        { speaker: "jim", text: "Ha. Yeah— we checked. Multiple times.",
          voice:"poke_03"
         },
        { speaker: "donna", text: "Very funny, detective." },
      ],
      choices: [
        { label: "Alright. Back to business.", next: "checked_when" },
        { label: "Let's talk suspects.", next: "suspects_menu" },
      ],
    },

    poke_03: {
      segments: [{ speaker: "donna", text: "Detective… please.", voice: "" }],
      choices: [
        { label: "Yeah. Sorry.", next: "suspects_menu" },
        { label: "Back.", next: "accuse_after_return_followup" },
      ],
    },

    end: {
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default jimDonnaDialogue;
