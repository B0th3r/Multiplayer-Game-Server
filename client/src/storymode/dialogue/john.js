const johnDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "john", text: "Your the detective right.  I'm John", voice: "intro_01" }
      ],
      set: { flagsAdd: ["talkedToJohn"] },
      choices: [
        { label: "I want to ask about how both you and Jim lost money.", next: "baseline" },
        { label: "This house is dirty, you ever heard of cleaning buddy?", next: "john_press_01" },
        { label: "I'll come back later", next: "good_end" },
        { label: "Heard there was a big argument yesterday.", next: "fight_start", requires: { cluesAll: ["clue_john_argument"] } }
      ]
    },

    return_visit: {
      segments: [
        { speaker: "john", text: "Back again huh?", voice: "intro_02" }
      ],
      choices: [
        { label: "I want to ask about how both you and Jim lost money.", next: "baseline" },
        { label: "This house is dirty, you ever heard of cleaning buddy?", next: "john_press_01" },
        { label: "I'll come back later", next: "good_end" },
        { label: "Heard there was a big argument yesterday.", next: "fight_start", requires: { cluesAll: ["clue_john_argument"] } }
      ]
    },

    robbery_menu_silent: {
      segments: [],
      choices: [
        { label: "Whats your take on Jim's robbery", next: "jim_topic_menu_silent" },
        { label: "Let's talk about your own missing money.", next: "john_topic_menu_silent" },

        { label: "Heard there was a big argument yesterday.", next: "fight_start", requires: { cluesAll: ["clue_john_argument"] } },

        { label: "That's enough for now", next: "good_end" }
      ]
    },

    jim_topic_menu_silent: {
      segments: [
        { speaker: "john", text: "That missing $20 could be anywhere by now. its more likely Jim misplaced it somewhere", voice: "Jim_robbery", requires: { notFlags: ["asked_Jim_robbery"] } }
      ],
      choices: [

        { label: "Who is Jane?", next: "Jane", requires: { notFlags: ["asked_Jane"], flagsAll: ["asked_where_were_you"] } },
        { label: "Where is Jane?", next: "where_jane", requires: { notFlags: ["asked_where_jane"], flagsAll: ["asked_where_were_you"] } },
        { label: "Where were you that night?", next: "where_were_you", requires: { notFlags: ["asked_where_were_you"] } },
        { label: "What a good for nothing answer", next: "insult" },

        { label: "Let's move on to your robbery", next: "john_topic_menu_silent" },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    john_topic_menu_silent: {
      segments: [{ speaker: "john", text: "One day before Jim lost his $20 I was robbed for $30 in the city", voice: "John_robbery_01", requires: { notFlags: ["asked_John_robbery"] } },
      { speaker: "john", text: "I was sitting at a bar at which I assume someone swiped my money without me noticing", voice: "John_robbery_02", requires: { notFlags: ["asked_John_robbery"] } }

      ],
      choices: [
        { label: "Why didn't you report", next: "no_report", requires: { notFlags: ["asked_no_report"] } },
        { label: "When did you notice the money missing", next: "noticed_missing_money", requires: { notFlags: ["asked_noticed_missing_money"] } },
        { label: "Was there anyone suspicious", next: "suspicious", requires: { notFlags: ["asked_suspicious"] } },

        { label: "Let's talk about Jim now.", next: "jim_topic_menu_silent" },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },



    john_press_01: {
      segments: [
        { speaker: "john", text: "Boy I know you ain't just say that. What a dumb thing to say", voice: "pressed_03-3" },
        { speaker: "john", text: "I don't see how this pretans to your investagtion", voice: "john_press_01" }
      ],
      set: { flagsAdd: ["asked_john_press_01"] },
      choices: [
        { label: "I'm just saying people usally clean when guests are coming", next: "evil_path" },
        { label: "I want to ask about how both you and Jim lost money.", next: "baseline" },
        { label: "Heard there was a big argument yesterday.", next: "fight_start", requires: { cluesAll: ["clue_john_argument"] } },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    baseline: {
      segments: [
        { speaker: "john", text: "Sorry you had to come here on something so trivial, detective.", voice: "baseline" },
        { speaker: "john", text: "What did you want to know?", voice: "baseline_02" }
      ],
      set: { flagsAdd: ["asked_baseline"] },
      choices: [
        { label: "Whats your take on Jim's robbery", next: "jim_topic_menu_silent" },
        { label: "Let's talk about your own missing money.", next: "john_topic_menu_silent" },
        { label: "Heard there was a big argument yesterday.", next: "fight_start", requires: { cluesAll: ["clue_john_argument"] } },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    robbery_menu: {
      segments: [
        { speaker: "john", text: "Alright, what did you want to know?", voice: "baseline_02" }
      ],
      choices: [
        { label: "Whats your take on Jim's robbery", next: "jim_topic_menu_silent" },
        { label: "Let's talk about your own missing money.", next: "john_topic_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    Jim_robbery: {
      segments: [
        { speaker: "john", text: "That missing $20 could be anywhere by now. its more likely Jim misplaced it somewhere", voice: "Jim_robbery" }
      ],
      set: { flagsAdd: ["asked_Jim_robbery"] },
      choices: [
        { label: "Where were you that night?", next: "where_were_you", requires: { notFlags: ["asked_where_were_you"] } },
        { label: "What a good for nothing answer", next: "insult" },
        { label: "Let's move on to your robbery", next: "john_topic_menu_silent" },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    insult: {
      segments: [
        { speaker: "john", text: "I'm only telling you what I know detective", voice: "pressed_04" }
      ],
      set: { flagsAdd: ["asked_insult"] },
      choices: [
        { label: "Where were you that night?", next: "where_were_you", requires: { notFlags: ["asked_where_were_you"] } },
        { label: "Alright lets talk about somthing else", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    where_were_you: {
      segments: [
        { speaker: "john", text: "I was home celberting Jane's birthday", voice: "where_were_you" }
      ],
      set: { flagsAdd: ["asked_where_were_you", "asked_Jim_robbery"] },
      choices: [
        { label: "Who is Jane?", next: "Jane", requires: { notFlags: ["asked_Jane"] } },
        { label: "Where is Jane?", next: "where_jane", requires: { notFlags: ["asked_where_jane"] } },
        { label: "Let's go back.", next: "jim_topic_menu_silent" }
      ]
    },

    Jane: {
      segments: [
        { speaker: "john", text: "She's… not here anymore she left.", voice: "Jane" }
      ],
      set: { flagsAdd: ["asked_Jane"] },
      choices: [
        { label: "What happened where did she go", next: "where_jane" },
        { label: "ha what a loser its probaly your fault isnt it", next: "evil_path" },
        { label: "Let's move on.", next: "john_topic_menu_silent" },
      ]
    },

    where_jane: {
      segments: [
        { speaker: "john", text: "This is none of your business, detective.", voice: "press_01" },
        { speaker: "john", text: "Well she didn't tell me anyway", voice: "where_is_Jane" }
      ],
      set: { flagsAdd: ["asked_where_jane"] },
      choices: [
        { label: "Let's move on.", next: "john_topic_menu_silent" },
        { label: "Come on, just tell me what happened", next: "jane_push", requires: { notFlags: ["asked_jane_push"] } },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    jane_push: {
      segments: [
        { speaker: "john", text: "I already told you no detective, stop pushing me", voice: "pressed_03" }
      ],
      set: { flagsAdd: ["asked_jane_push"] },
      choices: [
        { label: "Fine let's move on.", next: "john_topic_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },


    evil_path: {
      segments: [
        { speaker: "john", text: "Are you kidding me!? what type of detecive are you!?", voice: "pressed_05" },
        { speaker: "john", text: "Just get out of my house, now!", voice: "kicked_out" }
      ],
      set: { flagsAdd: ["asked_evil_path"] },
      choices: [
        { label: "Just a joke calm down", next: "time_pressure" },
        { label: "With plesure", next: "good_end" }
      ]
    },

    time_pressure: {
      segments: [
        { speaker: "john", text: "Don't waste my time again, detective.", voice: "pressed_too_hard_03" }
      ],
      set: { flagsAdd: ["asked_time_pressure"] },
      choices: [
        { label: "Fine. Back to the robbery.", next: "robbery_menu_silent" },
        { label: "I'm leaving.", next: "good_end" }
      ]
    },

    John_robbery: {
      segments: [
        { speaker: "john", text: "One day before Jim lost his $20 I was robbed for $30 in the city", voice: "John_robbery_01" },
        { speaker: "john", text: "I was sitting at a bar at which I assume someone swiped my money without me noticing", voice: "John_robbery_02" }
      ],
      set: { flagsAdd: ["asked_John_robbery"] },
      choices: [
        { label: "Why didn't you report", next: "no_report", requires: { notFlags: ["asked_no_report"] } },
        { label: "When did you notice the money missing", next: "noticed_missing_money", requires: { notFlags: ["asked_noticed_missing_money"] } },
        { label: "Was there anyone suspicious", next: "suspicious", requires: { notFlags: ["asked_suspicious"] } },

        { label: "Let's talk about Jim now.", next: "jim_topic_menu_silent" },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    suspicious: {
      segments: [
        { speaker: "john", text: "No, I didn't see anything.", voice: "suspicious" }
      ],
      set: { flagsAdd: ["asked_suspicious", "asked_John_robbery"] },
      choices: [
        { label: "Why didn't you report", next: "no_report", requires: { notFlags: ["asked_no_report"] } },
        { label: "When did you notice the money missing", next: "noticed_missing_money", requires: { notFlags: ["asked_noticed_missing_money"] } },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "Let's talk about Jim now.", next: "jim_topic_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    no_report: {
      segments: [
        { speaker: "john", text: "Because it was only $30 didn't think anyone would care enough to come out here.", voice: "delayed" }
      ],
      set: { flagsAdd: ["asked_no_report", "asked_John_robbery"] },
      choices: [
        { label: "When did you notice the money missing", next: "noticed_missing_money", requires: { notFlags: ["asked_noticed_missing_money"] } },
        { label: "Was there anyone suspicious", next: "suspicious", requires: { notFlags: ["asked_suspicious"] } },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "Let's talk about Jim now.", next: "jim_topic_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    noticed_missing_money: {
      segments: [
        { speaker: "john", text: "When I was already walking back home", voice: "time_of_John_robbery" }
      ],
      set: { flagsAdd: ["asked_noticed_missing_money", "asked_John_robbery"] },
      choices: [
        { label: "Why didn't you report", next: "no_report", requires: { notFlags: ["asked_no_report"] } },
        { label: "Was there anyone suspicious", next: "suspicious", requires: { notFlags: ["asked_suspicious"] } },
        { label: "Let's talk about somthing else", next: "robbery_menu_silent" },
        { label: "Let's talk about Jim now.", next: "jim_topic_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    fight_start: {
      segments: [
        { speaker: "john", text: "People really can't mind their own business huh.  Yeah, Jane and I argued.", voice: "agurment_01" },
        { speaker: "john", text: "It was about money. She thinks I can't be trusted with cash.", voice: "agurment_02" }
      ],
      set: { flagsAdd: ["asked_fight_start"] },
      choices: [
        { label: "Walk me through that argument.", next: "fight_details" },
        { label: "Let's go back to Jim's missing $20.", next: "jim_topic_menu_silent" },
        { label: "Let's move on.", next: "robbery_menu_silent" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    fight_details: {
      segments: [
        { speaker: "john", text: "That’s as far as you go detective stay out of it", voice: "agurment_03" },
      ],
      set: { flagsAdd: ["asked_fight_details"] },
      choices: [
        { label: "Fine. Let's move on.", next: "robbery_menu_silent" },
        { label: "Back to the argument.", next: "fight_start" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    good_end: {
      segments: [
        { speaker: "john", text: "Great." }
      ],
      choices: [{ label: "[End conversation]", next: "end" }]
    },

    end: {
      segments: [],
      end: true,
      choices: []
    }
  }
};

export default johnDialogue;
