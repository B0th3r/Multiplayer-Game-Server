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

    john_press_01: {
      segments: [
        { speaker: "john", text: "What a dumb thing to say", voice: "pressed_03-3" },
        { speaker: "john", text: "I don't see how this pretans to your investagtion", voice: "john_press_01" }
      ],
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
      choices: [
        { label: "Whats your take on Jim's robbery", next: "Jim_robbery" },
        { label: "Let's talk about your own missing money.", next: "John_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    robbery_menu: {
      segments: [
        { speaker: "john", text: "Alright, what did you want to know?", voice: "baseline_02" }
      ],
      choices: [
        { label: "Whats your take on Jim's robbery", next: "Jim_robbery" },
        { label: "Let's talk about your own missing money.", next: "John_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    Jim_robbery: {
      segments: [
        { speaker: "john", text: "That missing $20 could be anywhere by now. its more likely Jim misplaced it somewhere", voice: "Jim_robbery" }
      ],
      choices: [
        { label: "Where were you that night?", next: "where_were_you" },
        { label: "What a good for nothing answer", next: "insult" },
        { label: "Let's move on to your robbery", next: "John_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    insult: {
      segments: [
        { speaker: "john", text: "I'm only telling you what I know detective", voice: "pressed_04" }
      ],
      choices: [
        { label: "Where were you that night?", next: "where_were_you" },
        { label: "Alright lets talk about somthing else", next: "robbery_menu" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    where_were_you: {
      segments: [
        { speaker: "john", text: "I was home celberting Jane's birthday", voice: "where_were_you" }
      ],
      choices: [
        { label: "Who is Jane?", next: "Jane" },
        { label: "Where is Jane?", next: "where_jane" },
        { label: "Let's go back.", next: "Jim_robbery" }
      ]
    },

    Jane: {
      segments: [
        { speaker: "john", text: "She's… not here anymore she left.", voice: "Jane" }
      ],
      choices: [
        { label: "What happened where did she go", next: "where_jane" },
        { label: "ha what a loser its probaly your fault isnt it", next: "evil_path" },
        { label: "Alright. Continue.", next: "baseline" }
      ]
    },

    where_jane: {
      segments: [
        { speaker: "john", text: "This is none of your business, detective.", voice: "press_01" },
        { speaker: "john", text: "Well she didn't tell me anyway", voice: "where_is_Jane" }
      ],
      choices: [
        { label: "Let's move on.", next: "baseline" },
        { label: "Come on, just tell me what happened", next: "jane_push" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    jane_push: {
      segments: [
        { speaker: "john", text: "I already told you no detective, stop pushing me", voice: "pressed_03" }
      ],
      choices: [
        { label: "Fine let's move on.", next: "baseline" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },
/*
    lie_detect_1: {
      segments: [
        { speaker: "john", text: "You're not hearing me. Drop it.", voice: "pressed_too_hard_02" }
      ],
      choices: [
        { label: "Alright, alright. We'll drop it.", next: "baseline" },
        { label: "I'm not dropping it. Tell me.", next: "reval_truth_fail" },
        { label: "Back off and regroup.", next: "robbery_menu" }
      ]
    },
*/
    evil_path: {
      segments: [
        { speaker: "john", text: "Are you kidding me!? what type of detecive are you!?", voice: "pressed_05" },
        { speaker: "john", text: "Just get out of my house, now!", voice: "kicked_out" }
      ],
      choices: [
        { label: "Just a joke calm down", next: "time_pressure" },
        { label: "With plesure", next: "good_end" }
      ]
    },

    time_pressure: {
      segments: [
        { speaker: "john", text: "Hmph. Don't waste my time again, detective.", voice: "pressed_too_hard_03" }
      ],
      choices: [
        { label: "Fine. Back to the robbery.", next: "baseline" },
        { label: "I'm leaving.", next: "good_end" }
      ]
    },

    John_robbery: {
      segments: [
        { speaker: "john", text: "One day before Jim lost his $20 I was robbed for $30 in the city", voice: "John_robbery_01" },
        { speaker: "john", text: "I was sitting at a bar at which I assume someone swiped my money without me noticing", voice: "John_robbery_02" }
      ],
      choices: [
        { label: "Why didn't you report", next: "no_report" },
        { label: "When did you notice the money missing", next: "noticed_missing_money" },
        { label: "Was there anyone suspicious", next: "suspicious" },
        { label: "Let's talk about Jim now.", next: "Jim_robbery" },
        { label: "Let's talk about somthing else", next: "robbery_menu" }
      ]
    },

    suspicious: {
      segments: [
        { speaker: "john", text: "No, I didn't see anything.", voice: "suspicious" }
      ],
      choices: [
        { label: "Why didn't you report", next: "no_report" },
        { label: "When did you notice the money missing", next: "noticed_missing_money" },
        { label: "Let's talk about somthing else", next: "robbery_menu" },
        { label: "Let's talk about Jim now.", next: "Jim_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    no_report: {
      segments: [
        { speaker: "john", text: "Because it was only $30 didn't think anyone would care enough to come out here.", voice: "delayed" }
      ],
      choices: [
        { label: "When did you notice the money missing", next: "noticed_missing_money" },
        { label: "Was there anyone suspicious", next: "suspicious" },
        { label: "Let's talk about somthing else", next: "robbery_menu" },
        { label: "Let's talk about Jim now.", next: "Jim_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    noticed_missing_money: {
      segments: [
        { speaker: "john", text: "When I was already walking back home", voice: "time_of_John_robbery" }
      ],
      choices: [
        { label: "Why didn't you report", next: "no_report" },
        { label: "Was there anyone suspicious", next: "suspicious" },
        { label: "Let's talk about somthing else", next: "robbery_menu" },
        { label: "Let's talk about Jim now.", next: "Jim_robbery" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    // Argument branch (unlocked by clue_john_argument)
    fight_start: {
      segments: [
        { speaker: "john", text: "People really can't mind their own business huh.  Yeah, Jane and I argued.", voice: "agurment_01" },
        { speaker: "john", text: "It was about money. She thinks I can't be trusted with cash.", voice: "agurment_02" }
      ],
      choices: [
        { label: "Because of your gambling?", next: "gambling_crack" },
        { label: "Walk me through that argument.", next: "fight_details" },
        { label: "Let's go back to Jim's missing $20.", next: "baseline" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    gambling_crack: {
      segments: [
        { speaker: "john", text: "…What about it?", voice: "talked_to_jane" }
      ],
      choices: [
        { label: "I'm not judging. I just need the truth.", next: "reval_truth_pass" },
        { label: "So you ARE gambling again.", next: "reval_truth_fail" },
        { label: "Let's move on.", next: "baseline" }
      ]
    },

    fight_details: {
      segments: [
        { speaker: "john", text: "It started small. Then it got loud. She packed a suitcase and left.", voice: "talked_to_jane" },
        { speaker: "john", text: "She thinks I'm reckless with money. I told her I'm trying to fix it.", voice: "agurment_02" }
      ],
      choices: [
        { label: "Back to the robberies.", next: "robbery_menu" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    reval_truth_fail: {
      segments: [
        { speaker: "john", text: "I don't have to tell you a damn thing!", voice: "pressed_too_hard_02" },
        { speaker: "john", text: "If your so intersed in my life story come back with a warrent!", voice: "pressed_too_hard_03" }
      ],
      choices: [
        { label: "Fine. Back to the robbery.", next: "robbery_menu" },
        { label: "I'm leaving.", next: "good_end" }
      ]
    },

    reval_truth_pass: {
      segments: [
        { speaker: "john", text: "Fine." },
        { speaker: "john", text: "Yes it was because of the gambling. I feel bad about it" }
      ],
      choices: [
        { label: "I just want the full story", next: "fight_details" },
        { label: "Back to the robberies", next: "robbery_menu" },
        { label: "That's enough for now", next: "good_end" }
      ]
    },

    Evil_ending: {
      segments: [
        { speaker: "john", text: "You really are deplurable human being" },
        { speaker: "john", text: "*signes* fine I'll do it, take everything and go" }
      ],
      choices: [
        { label: "Leave.", next: "good_end" }
      ]
    },

    good_end: {
      segments: [
        { speaker: "john", text: "Great." }
      ],
      choices: [{ label: "[End conversation]", next: "end" },]
    },
    end: {
            segments: [
            ],
            end: true,
            choices: []
        }
  }
};

export default johnDialogue;
