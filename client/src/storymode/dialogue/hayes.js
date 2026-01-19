const hayesDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "hayes",
          text: "Detective. I'm glad you're here.",
          voice: "intro_01",
        }
      ],
      choices: [
        {
          label: "I'm ready to name a suspect.",
          next: "suspect_selection",
          requires: { flagsAll: ['talkedToJim', 'talkedToDonna', 'talkedToJohn', 'talkedToSam'] },
        },
        { label: "Give me the short version.", next: "summary_short" },
        { label: "Give me the full version.", next: "summary_long" },
        { label: "I don't need a briefing. I'll handle this.", next: "objectives_unlock" },
        { label: "You already lost control of this, Hayes. Explain yourself.", next: "reprimand_start" }
      ]
    },
    return_visit: {
      segments: [
        {
          speaker: "hayes",
          text: "Oh, you're back.",
          voice: "intro_02",
        }
      ],
      choices: [
        {
          label: "I'm ready to name a suspect.",
          next: "suspect_selection",
          requires: { flagsAll: ['talkedToJim', 'talkedToDonna', 'talkedToJohn', 'talkedToSam'] },
        },
        { label: "Let's review the case.", next: "post_summary_menu" },
        { label: "Just checking in.", next: "objectives_unlock" }
      ]
    },
    summary_short: {
      segments: [
        {
          speaker: "hayes",
          text: "Short version? We had a robbery. Jim dropped his wallet four days ago. Sam found it the next morning. Jim only noticed the money missing yesterday and his wife called it in.",
          voice: "short_summary_01",
        },
        {
          speaker: "hayes",
          text: "I spoke with the couple for a short while and apparently their neighbor John was also robbed.",
          voice: "short_summary_02",
        },
        {
          speaker: "hayes",
          text: "I haven't had the chance to speak with John yet.",
          voice: "short_summary_03",
        }
      ],
      choices: [
        { label: "Alright. Let's get into details.", next: "post_summary_menu" },
        { label: "That's all I needed.", next: "objectives_unlock" }
      ]
    },
    summary_long: {
      segments: [
        {
          speaker: "hayes",
          text: "Okay here's the full breakdown.",
          voice: "long_summary_01",
        },
        {
          speaker: "hayes",
          text: "four days ago, Jim dropped his wallet while walking home. Their neighbor Sam found the wallet early the next morning where it fell.",
          voice: "long_summary_02",
        },
        {
          speaker: "hayes",
          text: "Sam said it didn't look touched but Jim checked the wallet to be sure. He didn't notice anything at first until his wife Donna. Was sorting the bills yesterday and realized a $20 bill missing yesterday.",
          voice: "long_summary_03",
        },
        {
          speaker: "hayes",
          text: "But, Donna revealed something interesting when I spoke to her.",
          voice: "long_summary_04",
        },
        {
          speaker: "hayes",
          text: "Three days ago another neighbor named John was robbed.  I haven't had the chance to speak with him yet but apparently he was robbed for $30.",
          voice: "long_summary_05",
        },
        {
          speaker: "hayes",
          text: "And here's the strange part. Unlike Jim and Donna, John never reported it.",
          voice: "long_summary_06",
        }
      ],

      choices: [
        { label: "Good. Can you tell me about the neighbors", next: "post_summary_menu" },
        { label: "That's enough. I'll start talking to people.", next: "objectives_unlock" }
      ]
    },

    reprimand_start: {
      segments: [
        {
          speaker: "hayes",
          text: "Sorry sir, I did what I could.",
          voice: "reprimaned",
        },
      ],
      choices: [
        { label: "Fine. Give me the short version.", next: "summary_short" },
        { label: "Then explain everything from the top.", next: "summary_long" },
        { label: "Forget it. I'll handle this.", next: "objectives_unlock" }
      ]
    },

    post_summary_menu: {
      segments: [
        {
          speaker: "hayes",
          text: "Alright. What do you want to go over?",
          voice: "summary_menu"
        }
      ],
      choices: [
        { label: "Tell me about Jim and Donna.", next: "jim_donna_notes" },
        { label: "Tell me about Sam.", next: "sam_notes" },
        { label: "Tell me about John.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },


    jim_donna_notes: {
      segments: [
        {
          speaker: "hayes",
          text: "From what I gathered Jim seems pretty scatterbrained. Donna on the other hand seems sharp.",
          voice: "JimandDonna"
        },
      ],
      choices: [
        { label: "Tell me about Jim and Donna again.", next: "jim_donna_notes" },
        { label: "Tell me about Sam", next: "sam_notes" },
        { label: "Tell me about John.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },

    sam_notes: {
      segments: [
        {
          speaker: "hayes",
          text: "Sam's been nothing but cooperative. she seems to keep to herself mostly.",
          voice: "Sam",
        }
      ],
      choices: [
        { label: "Tell me about Jim and Donna.", next: "jim_donna_notes" },
        { label: "Tell me about Sam again", next: "sam_notes" },
        { label: "Tell me about John.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },

    john_read_initial: {
      segments: [
        {
          speaker: "hayes",
          text: "I heard from Donna that John was also robbed but I haven't spoken with him yet.",
          voice: "John"
        },
        {
          speaker: "hayes",
          text: "It also seems he has a person named Jane living wtih him"
        },
      ],
      choices: [
        { label: "Tell me about Jim and Donna.", next: "jim_donna_notes" },
        { label: "Tell me about Sam", next: "sam_notes" },
        { label: "Tell me about John again.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },

    tim_noise: {
      segments: [
        {
          speaker: "hayes",
          text: "Yes, I bumped Tim earlier he's loud and arrogant. Matter of fact you should just avoid him outright.",
          voice: "Tim"
        },
      ],
      choices: [
        { label: "Tell me about Jim and Donna.", next: "jim_donna_notes" },
        { label: "Tell me about Sam", next: "sam_notes" },
        { label: "Tell me about John.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },
    suspect_selection: {
      segments: [
        {
          speaker: "hayes",
          text: "Alright detective, who do you think took the money?",
          voice: "who_is_robber",
        }
      ],
      choices: [
        {
          label: "I believe Sam is the thief.",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_sam"] }
        },
        {
          label: "John is guilty.",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_john"] }
        },
        {
          label: "Jim just lost that money",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_jim"] }
        },
        {
          label: "It was Tim.",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_tim", "you_screwed_lucas"] }
        },
        {
          label: "It was Donna she's been stealing behind Jim's back",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_donna"] }
        },
        {
          label: "It was the Flowerboy",
          next: "confirm_accusation",
          requires: { flagsAll: ["Met_florist"] },
          set: { flagsAdd: ["accused_florist"] }
        },
        {
          label: "It was Jane.",
          next: "confirm_accusation",
          requires: { flagsAll: ["talkedToJane"] },
          set: { flagsAdd: ["accused_jane"] }
        },
        {
          label: "Money's long gone Jim just lost it",
          next: "confirm_accusation",
          set: { flagsAdd: ["accused_jim"] }
        },
      ]
    },

    confirm_accusation: {
      segments: [
        {
          speaker: "hayes",
          text: "Tim huh? Figures.",
          voice: "picked_tim",
          requires: { flagsAll: ["accused_tim"] }
        },
        {
          speaker: "hayes",
          text: "Hmm I suppose you're right, we should probably just call it a day.",
          voice: "quit_ending",
          requires: { flagsAll: ["accused_jim"] }
        },
        {
          speaker: "hayes",
          text: "Are you sure about this?",
          voice: "confirmation",
        }
      ],
      choices: [
        {
          label: "Yes, I'm sure.",
          next: "route_accusation"
        },
        {
          label: "Wait, let me reconsider.",
          next: "suspect_selection",
          set: {
            flagsRemove: ["accused_sam", "accused_john", "accused_jim", "accused_tim", "accused_jane", "accused_donna", "accused_florist"]
          }
        }
      ]
    },

    route_accusation: {
      segments: [],
      choices: [
        {
          label: "",
          next: "lucas_interruption",
          requires: { flagsAny: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_sam",
          requires: { flagsAll: ["accused_sam"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_tim",
          requires: { flagsAll: ["accused_tim"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_john",
          requires: { flagsAll: ["accused_john"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_jane",
          requires: { flagsAll: ["accused_jane"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_donna",
          requires: { flagsAll: ["accused_donna"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_florist",
          requires: { flagsAll: ["accused_florist"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        },
        {
          label: "",
          next: "accuse_jim",
          requires: { flagsAll: ["accused_jim"], notFlags: ["you_screwed_lucas", "hayes_screwed_lucas"] }
        }
      ]
    },
    lucas_interruption: {
      segments: [
        {
          text: "(You hear someone coming.)",
        },
        {
          speaker: "lucas",
          text: "You, Hayes!",
          voice: "hayes",
          requires: { flagsAll: ["hayes_screwed_lucas"] }
        },
        {
          speaker: "hayes",
          text: "Lucas? What are you doing here?",
          voice: "hayes_confused",
          requires: { flagsAll: ["hayes_screwed_lucas"] }
        },
        {
          speaker: "lucas",
          text: "I knew it from the very beginning. You wanted Maya all along!",
          voice: "evil_end_02"
        },
        {
          speaker: "lucas",
          text: "I can't believe you would betray me like this.",
          voice: "evil_end_03"
        },
        {
          speaker: "hayes",
          text: "I don't know what your talking about.",
          voice: "lucas_accuse_01",
          requires: { flagsAll: ["hayes_screwed_lucas"] }
        },
        {
          speaker: "lucas",
          text: "You liar!",
          voice: "lair",
          requires: { flagsAll: ["hayes_screwed_lucas"] }
        },
        {
          speaker: "hayes",
          text: "We don't have time for this.",
          voice: "hayes_security"
        },
        {
          speaker: "lucas",
          text: "What!? Let go of me!",
          voice: "arrested"
        },
      ],
      choices: [
        { label: "[Continue]", next: "route_accusation_after_lucas" }
      ]
    },

    route_accusation_after_lucas: {
      segments: [{
        speaker: "hayes",
        text: "*sigh* Sorry about that. Where were we?",
        voice: "hayes_resume"
      },],
      choices: [
        {
          label: "Sam is our suspect",
          next: "accuse_sam",
          requires: { flagsAll: ["accused_sam"] }
        },
        {
          label: "TIm is our suspect",
          next: "accuse_tim",
          requires: { flagsAll: ["accused_tim"] }
        },
        {
          label: "John is our suspect",
          next: "accuse_john",
          requires: { flagsAll: ["accused_john"] }
        },
        {
          label: "Jane is our suspect",
          next: "accuse_jane",
          requires: { flagsAll: ["accused_jane"] }
        },
        {
          label: "is our suspect",
          next: "accuse_donna",
          requires: { flagsAll: ["accused_donna"] }
        },
        {
          label: "Flower boy is our suspect",
          next: "accuse_florist",
          requires: { flagsAll: ["accused_florist"] }
        },
        {
          label: "Jim is our suspect",
          next: "accuse_jim",
          requires: { flagsAll: ["accused_jim"] }
        }
      ]
    },
    accuse_tim: {
      segments: [
        {
          speaker: "hayes",
          text: "Alright tell me everything, then I'll get them",
          voice: "bringing_subject_01",
        },
        {
          text: "(You tell Hayes everything.)",
        },
        {
          text: "(Excluding your illegal ventures, of course.)",
          requires: { flagsAll: ["BobbyDirty"] }
        },
        {
          speaker: "hayes",
          text: "Okay, stay here. I'll bring them over.",
          voice: "bringing_subject_02",
        }
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_tim");
      },
      choices: [
        {
          label: "[Continue]",
          next: "tim_arrives"
        }
      ]
    },
    tim_arrives: {
      segments: [
        {
          speaker: "Hayes",
          text: "Here they are",
          voice: "suspect_arrived",
        },
        {
          speaker: "Tim",
          text: "Uncuff me. Now.",
          voice: "Tim_ending_intro",
        },
        {
          speaker: "Hayes",
          text: "Stop moving. Your only making this worse",
          voice: "moving_suspect",
        }
      ],
      choices: [
        {
          label: "You stole it during John and Janes agurment",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_heard_argument"] }
        },
        {
          label: "You claimed to see nothing while running but I know that's a lie",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_saw_nothing_running"] }
        },
        {
          label: "You argued with John to try to slow down the investigation",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          label: "How did you steal the money?",
          next: "tim_press",
          requires: { notFlags: ["pressed"] }
        },
        {
          label: "Taunt",
          next: "tim_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Tim)",
          next: "arrest"
        },
      ]
    },
    tim_accusation: {
      set: { flagsAdd: ["tim_accusation"] },
      segments: [
        {
          speaker: "tim",
          text: "This is what you're using to justify arresting me? That doesn't even connect to me. Not remotely.",
          voice: "false_evidence",
        },
        {
          speaker: "Hayes",
          text: "Yes it does Tim, trust me we heard about all of your misdoings around the neighborhood",
          voice: "tim_arrest_01",
        },
        {
          speaker: "tim",
          text: "You want to know who's really suspicious. It's Sam.",
          voice: "sam",
          requires: { notClues: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "tim",
          text: "You want to know who's really suspicious. It's you Hayes",
          voice: "hayes_01",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "tim",
          text: "I saw you, sneaking around Jim's house earlier.",
          voice: "hayes_02",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "Hayes",
          text: "I'm a detective, what did you expect? I was investigating.",
          voice: "tim_arrest_02",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "tim",
          text: "Come now. you know that's not the truth, you were planning money.",
          voice: "hayes_03",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "tim",
          text: "Finally I have pieced all together. You're the one who robbed Jim and John.",
          voice: "hayes_04",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          speaker: "Hayes",
          text: "I had enough of this, we're bringing him in",
          voice: "tim_arrest_03",
        },
      ],
      choices: [
        {
          label: "He makes a great point. Your under arrest Hayes.",
          next: "arrest",
          requires: { flagsAll: ["tim_accusation"] },
          set: {
            flagsAdd: ["accused_hayes"],
            flagsRemove: ["accused_tim"]
          }
        },
        {
          label: "You stole it during John and Janes agurment",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_heard_argument"], notFlags: ["tim_accusation"] }
        },
        {
          label: "You claimed to see nothing while running but I know that's a lie",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_saw_nothing_running"], notFlags: ["tim_accusation"] }
        },
        {
          label: "You argued with John to try to slow down the investigation",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_and_john_argument"], notFlags: ["tim_accusation"] }
        },
        {
          label: "How did you steal the money?",
          next: "tim_press",
          requires: { notFlags: ["pressed"] }
        },
        {
          label: "Taunt",
          next: "tim_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Tim)",
          next: "arrest"
        },
      ]
    },
    tim_press: {
      set: { flagsAdd: ["pressed"] },
      segments: [
        {
          speaker: "tim",
          text: "To hell with that I didn't even do anything, you two are dirty cops.",
          voice: "pressed_01",
        },
        {
          speaker: "Hayes",
          text: "Answer the question!",
          voice: "pressing_suspect",
        },
        {
          speaker: "tim",
          text: "I'm not confessing to anything just because you're loud.",
          voice: "pressed_02",
        },
      ],
      choices: [
        {
          label: "He makes a great point. Your under arrest Hayes.",
          next: "arrest",
          requires: { flagsAll: ["tim_accusation"] }
        },
        {
          label: "You stole it during John and Janes agurment",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_heard_argument"], notFlags: ["tim_accusation"] }
        },
        {
          label: "You claimed to see nothing while running but I know that's a lie",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_saw_nothing_running"], notFlags: ["tim_accusation"] }
        },
        {
          label: "You argued with John to try to slow down the investigation",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_and_john_argument"], notFlags: ["tim_accusation"] }
        },
        {
          label: "How did you steal the money?",
          next: "tim_press",
          requires: { notFlags: ["pressed"] }
        },
        {
          label: "Taunt",
          next: "tim_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Tim)",
          next: "arrest"
        },
      ]
    },
    tim_taunt: {
      set: { flagsAdd: ["taunted"] },
      segments: [
        {
          speaker: "Hayes",
          text: "Ha! great one detective",
          voice: "taunted_suspect",
        },
        {
          speaker: "tim",
          text: "you're enjoying this huh? That says a lot about you, Detective.",
          voice: "taunted",
        }
      ],
      choices: [
        {
          label: "He makes a great point. Your under arrest Hayes.",
          next: "arrest",
          requires: { flagsAll: ["tim_accusation"] },
          set: { flagsAdd: ["tim_aligned"] }
        },
        {
          label: "You stole it during John and Janes agurment",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_heard_argument"] }
        },
        {
          label: "You claimed to see nothing while running but I know that's a lie",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_saw_nothing_running"] }
        },
        {
          label: "You argued with John to try to slow down the investigation",
          next: "tim_accusation",
          requires: { cluesAll: ["clue_tim_and_john_argument"] }
        },
        {
          label: "How did you steal the money?",
          next: "tim_press",
          requires: { notFlags: ["pressed"] }
        },
        {
          label: "Taunt",
          next: "tim_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Tim)",
          next: "arrest",
          set: { flagsAdd: ["tim_arrest"] },

        },
      ]
    },
    accuse_sam: {
      segments: [
        {
          speaker: "hayes",
          text: "Alright tell me everything, then I'll get them",
          voice: "bringing_subject_01",
        },
        {
          text: "(You tell Hayes everything.)",
        },
        {
          text: "(Excluding your illegal ventures, of course.)",
          requires: { flagsAll: ["BobbyDirty"] }
        },
        {
          speaker: "hayes",
          text: "Okay, stay here. I'll bring them over.",
          voice: "bringing_subject_02",
        }
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_sam");
      },
      choices: [
        {
          label: "[Continue]",
          next: "sam_arrives"
        }
      ]
    },

    sam_arrives: {
      segments: [
        {
          speaker: "Hayes",
          text: "Here they are",
          voice: "suspect_arrived",
        },
        {
          speaker: "Sam",
          text: "What are you doing!?",
          voice: "arrested",
        },
        {
          speaker: "Hayes",
          text: "It's okay just tell us what we need to know",
          voice: "calming_suspect",
        }
      ],
      choices: [
        {
          label: "No one had seen the wallet other than you.",
          next: "sam_accusation_good",
          requires: { notFlags: ["sam_accusation_good"] }
        },
        {
          label: "You and Jane ran off with John's money",
          next: "sam_accusation_bad",
          requires: { notFlags: ["sam_accusation_bad"] }
        },
        {
          label: "Taunt",
          next: "sam_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Sam)",
          next: "arrest"
        },
      ]
    },
    sam_accusation_good: {
      set: { flagsAdd: ["sam_accusation_good"] },
      segments: [
        {
          speaker: "Hayes",
          text: "timeline matches up, it only could have been you Sam",
          voice: "sam_arrest_01",
        },
        {
          speaker: "Hayes",
          text: "Your the only one who had contact with the wallet before it reached back to Jim.",
          voice: "sam_arrest_02",
        },
        {
          speaker: "Hayes",
          text: "Now just make this easier and admit it.",
          voice: "sam_arrest_03",
        },
        {
          speaker: "Sam",
          text: "Detective I know how it looks but I swear it isn't me!",
          voice: "evidence",
        },
      ],
      choices: [
        {
          label: "No one had seen the wallet other than you.",
          next: "sam_accusation_good",
          requires: { notFlags: ["sam_accusation_good"] }
        },
        {
          label: "You and Jane ran off with John's money",
          next: "sam_accusation_bad",
          requires: { notFlags: ["sam_accusation_bad"], }
        },
        {
          label: "Taunt",
          next: "sam_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Sam)",
          next: "arrest"
        },
      ]
    },
    sam_accusation_bad: {
      set: { flagsAdd: ["sam_accusation_bad"] },
      segments: [
        {
          speaker: "Sam",
          text: "Huh? That doesn't make sense",
          voice: "bad_evidence",
        },
      ],
      choices: [
        {
          label: "No one had seen the wallet other than you.",
          next: "sam_accusation_good",
          requires: { notFlags: ["sam_accusation_good"] }
        },
        {
          label: "You and Jane ran off with John's money",
          next: "sam_accusation_bad",
          requires: { notFlags: ["sam_accusation_bad"] }
        },
        {
          label: "Taunt",
          next: "sam_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Sam)",
          next: "arrest"
        },
      ]
    },
    sam_taunt: {
      set: { flagsAdd: ["taunted"] },
      segments: [
        { speaker: "hayes", text: "Ha! Good one detective", voice: "taunted_suspect" },
        { speaker: "sam", text: "What the hell is wrong with you!", voice: "taunted" },
      ],
      choices: [
        {
          label: "No one had seen the wallet other than you.",
          next: "sam_accusation_good",
          requires: { notFlags: ["sam_accusation_good"] }
        },
        {
          label: "You and Jane ran off with John's money",
          next: "sam_accusation_bad",
          requires: { notFlags: ["sam_accusation_bad"], }
        },
        {
          label: "Taunt",
          next: "sam_taunt",
          requires: { notFlags: ["taunted"] }
        },
        {
          label: "(arrest Sam)",
          next: "arrest"
        },
      ]
    },

    accuse_jane: {
      segments: [
        { speaker: "hayes", text: "Alright tell me everything, then I'll get them", voice: "bringing_subject_01" },
        { text: "(You tell Hayes everything.)" },
        { text: "(Excluding your illegal ventures, of course.)", requires: { flagsAll: ["BobbyDirty"] } },
        { speaker: "hayes", text: "Okay, stay here. I'll bring them over.", voice: "bringing_subject_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_jane");
      },
      choices: [{ label: "[Continue]", next: "jane_arrives" }],
    },

    jane_arrives: {
      segments: [
        { speaker: "hayes", text: "Here they are", voice: "suspect_arrived" },
        { speaker: "jane", text: "Detective, you can't be serious", voice: "arrested_01" },
        { speaker: "hayes", text: "It's okay. Just tell us what we need to know.", voice: "calming_suspect" },
      ],
      choices: [
        {
          label: "GOOD_ACCUSATION_LABEL",
          next: "jane_accusation",
          requires: { notFlags: ["jane_accusation"] },
        },
        {
          label: "Taunt",
          next: "jane_taunt",
          requires: { notFlags: ["jane_taunted"] },
        },

        { label: "(arrest Jane)", next: "arrest" },
      ],
    },

    jane_accusation: {
      set: { flagsAdd: ["jane_accusation"] },
      segments: [
        { speaker: "hayes", text: "I assume you didn't think we would catch you. Only stealing in small amounts, but we did.", voice: "jane_arrest" },
        { speaker: "jane", text: "..." },
        { speaker: "jane", text: "Just take me away im tired of this", voice: "arrested_02" },
      ],
      choices: [{ label: "[Back]", next: "jane_arrives" }],
    },

    jane_taunt: {
      set: { flagsAdd: ["jane_taunted"] },
      segments: [
        { speaker: "jane", text: "Was that supposed to be a joke?", voice: "taunted" },
        { speaker: "hayes", text: "Ha! great one detective", voice: "taunted_suspect" },
      ],
      choices: [{ label: "[Back]", next: "jane_arrives" }],
    },
    accuse_donna: {
      segments: [
        { speaker: "hayes", text: "Alright tell me everything, then I'll get them", voice: "bringing_subject_01" },
        { text: "(You tell Hayes everything.)" },
        { text: "(Excluding your illegal ventures, of course.)", requires: { flagsAll: ["BobbyDirty"] } },
        { speaker: "hayes", text: "Okay, stay here. I'll bring them over.", voice: "bringing_subject_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_donna");
      },
      choices: [{ label: "[Continue]", next: "donna_arrives" }],
    },

    donna_arrives: {
      segments: [
        { speaker: "hayes", text: "Here they are", voice: "suspect_arrived" },
        { speaker: "donna", text: "What's going on here!??", voice: "arrested_01" },
        { speaker: "hayes", text: "I think you already know Donna.", voice: "donna_suspect" },
        { speaker: "donna", text: "What-", voice: "arrested_02" },
        { speaker: "donna", text: "You think I'm behind the robbery!? Detective, this is ridiculous!", voice: "arrested_03" },
      ],
      choices: [
        {
          label: "After sam returned the wallet you stole Jim's money",
          next: "donna_accusation_good",
          requires: { notFlags: ["donna_accusation_good"] },
        },

        {
          label: "You tricked Jim to rob John.",
          next: "donna_accusation_bad",
          requires: { notFlags: ["donna_accusation_bad"] },
        },
        {
          label: "Taunt",
          next: "donna_taunt",
          requires: { notFlags: ["donna_taunted"] },
        },

        { label: "(arrest Donna)", next: "arrest" },
      ],
    },

    donna_accusation_good: {
      set: { flagsAdd: ["donna_accusation_good"] },
      segments: [
        { speaker: "hayes", text: "It's the only thing that makes sense. Money doesn't just disappear", voice: "donna_arrest_01" },
        { speaker: "hayes", text: "Also I highly doubt an attentive person such as yourself wouldn't have noticed the missing cash sooner.", voice: "donna_arrest_02" },
        { speaker: "donna", text: "I'm telling you guys are making the wrong decision here.", voice: "accused_good" },
      ],
      choices: [{ label: "[Back]", next: "donna_arrives" }],
    },

    donna_accusation_bad: {
      set: { flagsAdd: ["donna_accusation_bad"] },
      segments: [
        { speaker: "donna", text: "What!? This doesn't make any sense!", voice: "accused_bad" },
      ],
      choices: [{ label: "[Back]", next: "donna_arrives" }],
    },

    donna_taunt: {
      set: { flagsAdd: ["donna_taunted"] },
      segments: [
        { speaker: "donna", text: "What is wrong with you!", voice: "taunted" },
        { speaker: "hayes", text: "Ha! great one detective", voice: "taunted_suspect" },
      ],
      choices: [{ label: "[Back]", next: "donna_arrives" }],
    },

    accuse_florist: {
      segments: [
        { speaker: "hayes", text: "Alright tell me everything, then I'll get them", voice: "bringing_subject_01" },
        { text: "(You tell Hayes everything.)" },
        { text: "(Excluding your illegal ventures, of course.)", requires: { flagsAll: ["BobbyDirty"] } },
        { speaker: "hayes", text: "Okay, stay here. I'll bring them over.", voice: "bringing_subject_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_florist");
      },
      choices: [{ label: "[Continue]", next: "florist_arrives" }],
    },

    florist_arrives: {
      segments: [
        { speaker: "hayes", text: "He's here, now tell us why did you do it.", voice: "florist_arrived" },
        { speaker: "florist", text: "Why did I do it? Do what?", voice: "arrested_01" },
      ],
      choices: [
        {
          label: "Your the one who robbed John at the bar.",
          next: "florist_accusation",
          requires: { notFlags: ["florist_accusation"] },
        },
        {
          label: "Taunt",
          next: "florist_taunt",
          requires: { notFlags: ["florist_taunted"] },
        },

        { label: "(arrest the flower boy)", next: "arrest" },
      ],
    },

    florist_accusation: {
      set: { flagsAdd: ["florist_accusation"] },
      segments: [
        { speaker: "hayes", text: "You're a sneaky one I'll give you that", voice: "florist_arrest" },
        { speaker: "florist", text: "Sweetie, I didn't steal anything! I sneeze when I get nervous look (cutely sneezes)", voice: "accused" },
      ],
      choices: [{ label: "[Back]", next: "florist_arrives" }],
    },

    florist_taunt: {
      set: { flagsAdd: ["florist_taunted"] },
      segments: [
        { speaker: "hayes", text: "Ha! great one detective", voice: "taunted_suspect" },
        { speaker: "florist", text: "W-Why… why are you being mean.", voice: "taunted_01" },
        { speaker: "florist", text: "You already decided I was guilty, didn't you?", voice: "taunted_02" },
      ],
      choices: [{ label: "[Back]", next: "florist_arrives" }],
    },
    accuse_jim: {
      segments: [
        { speaker: "hayes", text: "Alright tell me everything, then I'll get them", voice: "bringing_subject_01" },
        { text: "(You tell Hayes everything.)" },
        { text: "(Excluding your illegal ventures, of course.)", requires: { flagsAll: ["BobbyDirty"] } },
        { speaker: "hayes", text: "Okay, stay here. I'll bring them over.", voice: "bringing_subject_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_jim");
      },
      choices: [{ label: "[Continue]", next: "jim_arrives" }],
    },

    jim_arrives: {
      segments: [
        { speaker: "jim", text: "So, I really did lose it huh?", voice: "lost_01" },
        { speaker: "donna", text: "Damn it, Jim!", voice: "jim" },
        { speaker: "hayes", text: "Yup, you two have a great day now.", voice: "arrested_01" },
        { speaker: "hayes", text: "And please keep a closer look on your wallet.", voice: "arrested_01" },
        { speaker: "jim", text: "Right, thank you for everything Hayes and {{playerName}}", voice: "lost_02" },
      ],
      choices: [
        { label: "[End the game]", next: "arrest" },
      ],
    },
    accuse_john: {
      segments: [
        { speaker: "hayes", text: "Alright tell me everything, then I'll get them", voice: "bringing_subject_01" },
        { text: "(You tell Hayes everything.)" },
        { text: "(Excluding your illegal ventures, of course.)", requires: { flagsAll: ["BobbyDirty"] } },
        { speaker: "hayes", text: "Okay, stay here. I'll bring them over.", voice: "bringing_subject_02" },
      ],
      onEnter: (state) => {
        state.flags.add("cutscene_accuse_john");
      },
      choices: [{ label: "[Continue]", next: "john_arrives" }],
    },

    john_arrives: {
      onEnter: (state) => {
        // Initialize interrogation score
        state.metadata.set("john_score", 0);
        state.metadata.set("john_questions_used", 0);
      },
      segments: [
        { speaker: "hayes", text: "Here they are", voice: "suspect_arrived" },
        { speaker: "john", text: "I didn't do anything.", voice: "arrested_01" },
        { speaker: "hayes", text: "It's okay. Just tell us what we need to know.", voice: "calming_suspect" },
      ],
      choices: [
        {
          label: "We know you're the one behind both robberies.",
          next: "john_accusation",
        },
        {
          label: "Press",
          next: "john_press",
          requires: { notFlags: ["john_pressed"] }
        },
        {
          label: "Taunt",
          next: "john_taunt",
          requires: { notFlags: ["john_taunted"] },
        },
        { label: "(arrest John)", next: "arrest" },
      ],
    },

    john_accusation: {
      segments: [
        { speaker: "john", text: "Oh really? And what makes you say that huh?", voice: "john_accuse_01" },
      ],
      choices: [
        {
          label: "Multiple witnesses say you weren't at the bar when you were 'robbed'",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_alibi"],
            cluesAll: ["clue_jane_checked_bar", "clue_GamblerTestimony"]
          },
          set: {
            flagsAdd: ["used_alibi"],
            metadataAdd: { key: "john_evidence_type", value: "alibi" }
          }
        },
        {
          label: "I met one of your gambling buddies. He said you gamble weekly.",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_gambler"],
            cluesAll: ["clue_GamblerTestimony"]
          },
          set: {
            flagsAdd: ["used_gambler"],
            metadataAdd: { key: "john_evidence_type", value: "gambler" }
          }
        },
        {
          label: "If you really weren't robbed then how did you get the money to buy the gift?",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_robbery"],
            flagsAny: ["used_gambler", "used_alibi"]
          },
          set: {
            flagsAdd: ["used_robbery"],
            metadataAdd: { key: "john_evidence_type", value: "robbery" }
          }
        },
        {
          label: "You said you were home celebrating Jane's birthday, but earlier you said you were at the bar that same night. Those can't both be true.",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_timeline"],
            flagsAny: ["used_gambler", "used_alibi"]
          },
          set: {
            flagsAdd: ["used_timeline"],
            metadataAdd: { key: "john_evidence_type", value: "timeline" }
          }
        },
        {
          label: "Jane left after an argument and hasn't been back. Know anything about that?",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_jane"],
            cluesAll: ["clue_jane_location_city"]
          },
          set: {
            flagsAdd: ["used_jane"],
            metadataAdd: { key: "john_evidence_type", value: "jane" }
          }
        },
        {
          label: "The gambling den is being shut down. Who knows what we'll find.",
          next: "john_apply_evidence",
          requires: {
            notFlags: ["used_shutdown"],
            flagsAll: ["BobbyGood"]
          },
          set: {
            flagsAdd: ["used_shutdown"],
            metadataAdd: { key: "john_evidence_type", value: "shutdown" }
          }
        },
        {
          label: "Jane stole your money, and you're covering for her.",
          next: "john_apply_evidence",
          requires: { notFlags: ["used_bad_jane"] },
          set: {
            flagsAdd: ["used_bad_jane"],
            metadataAdd: { key: "john_evidence_type", value: "bad_jane" }
          }
        },
        {
          label: "You stole Jim's money after Jane's party.",
          next: "john_apply_evidence",
          requires: { notFlags: ["used_bad_party"] },
          set: {
            flagsAdd: ["used_bad_party"],
            metadataAdd: { key: "john_evidence_type", value: "bad_party" }
          }
        },
        {
          label: "You lied about your robbery for attention.",
          next: "john_apply_evidence",
          requires: { notFlags: ["used_bad_attention"] },
          set: {
            flagsAdd: ["used_bad_attention"],
            metadataAdd: { key: "john_evidence_type", value: "bad_attention" }
          }
        },
        {
          label: "(Arrest him)",
          next: "arrest"
        }
      ],
    },
    john_apply_evidence: {
      onEnter: (state) => {
        const evidenceType = state.metadata.get("john_evidence_type");
        let currentScore = state.metadata.get("john_score") || 0;
        let questionsUsed = (state.metadata.get("john_questions_used") || 0) + 1;

        const points = {
          alibi: 2,
          gambler: 2,
          robbery: 2,
          timeline: 2,
          jane: 1,
          shutdown: 999,

          bad_attention: -2,
          bad_party: -2,
          bad_jane: -2,
        };
        const scoreChange = points[evidenceType] || 0;
        currentScore += scoreChange;

        state.metadata.set("john_score", currentScore);
        state.metadata.set("john_questions_used", questionsUsed);

        if (evidenceType === "shutdown" || currentScore >= 4) {
          state.flags.add("john_breaking");
        } else if (currentScore <= -4 || questionsUsed >= 9) {
          state.flags.add("john_shutdown");
        }
      },
      segments: [
        {
          speaker: "john",
          text: "...",
          voice: "john_react_good",
          requires: { flagsAny: ["used_alibi", "used_gambler", "used_robbery", "used_timeline"] }
        },
        {
          speaker: "john",
          text: "Wait really?",
          voice: "john_react_shutdown",
          requires: { flagsAll: ["used_shutdown"] }
        },
        {
          speaker: "john",
          text: "You don't know what you're saying.",
          voice: "john_false_02",
          requires: { flagsAny: ["used_bad_party", "used_bad_attention"] }
        },
        {
          speaker: "john",
          text: "Don't drag her into this.",
          voice: "john_false_03",
          requires: { flagsAny: ["used_bad_jane", "used_jane"] }
        },
      ],
      choices: [
        {
          label: "[Continue]",
          next: "john_confess",
          requires: { flagsAll: ["john_breaking"] }
        },
        {
          label: "[Continue]",
          next: "john_lawyer_up",
          requires: { flagsAll: ["john_shutdown"] }
        },
        {
          label: "[Continue]",
          next: "john_accusation",
          requires: { notFlags: ["john_breaking", "john_shutdown"] }
        },
      ],
    },

    john_confess: {
      set: { flagsAdd: ["accused_john", "you_screwed_lucas", "BobbyDirty"] },
      segments: [
        { speaker: "john", text: "Okay, I'll tell you everything.", voice: "confession_start" },
        { speaker: "john", text: "That night I didn't get robbed, I lost my 30 gambling.  The robbery story was just a cover up. Truth is, this wasn't the first time. I- I've been hiding my gambling losses for months now. Lying to Jane, coming up with a new excuse every time the money disappeared", voice: "confession_01" },
        { speaker: "john", text: "This in turn made us broke but even then she still stuck with me, I promised Jane awhile back that I would quit. But I couldn't bear the embarrassment of admitting the truth.", voice: "confession_02" },
        { speaker: "john", text: "As I was walking back home that night I remembered. It was Jane's birthday.  It was then when the internal dread took over me, that I wouldn't be able to buy Janes birthday present all because of my addiction. ", voice: "confession_03" },
        { speaker: "john", text: "It was then when I spotted a wallet on the ground, I opened it up and saw it was Jim's.  I thought to myself “there's no way this old fool will ever spot a missing 20”.  So I took it and purchased Jane's gift with it..", voice: "confession_04" },
        { speaker: "john", text: "And I suppose you know the rest, Jane finally found out.", voice: "confession_05" },
        { speaker: "john", text: "Well. that's everything now what", voice: "confession_06" },
      ],
      choices: [
        { label: "[End interrogation]", next: "arrest" }
      ]
    },

    john_lawyer_up: {
      segments: [
        { speaker: "john", text: "We're done here. Get me my lawyer.", voice: "john_fail_01" },
      ],
      set: {
        flagsAdd: ["john_lawyered_up", "interrogation_failed"]
      },
      choices: [
        { label: "[End interrogation]", next: "arrest" }
      ]
    },

    john_press: {
      set: { flagsAdd: ["john_pressed"] },
      segments: [
        { speaker: "hayes", text: "Answer the question, John!", voice: "pressing" },
        { speaker: "john", text: "I'm not saying anything without understanding what you're accusing me of.", voice: "john_defensive" },
      ],
      choices: [
        { label: "[Back]", next: "john_arrives" }
      ]
    },

    john_taunt: {
      set: {
        flagsAdd: ["john_taunted"],
        metadataAdd: { key: "john_score_penalty", value: -1 }
      },
      onEnter: (state) => {
        const currentScore = state.metadata.get("john_score") || 0;
        state.metadata.set("john_score", currentScore - 1);
      },
      segments: [
        { speaker: "hayes", text: "Ha! Good one detective", voice: "taunted_suspect" },
        { speaker: "john", text: "Are you kidding me? What is this!", voice: "john_offended" },
      ],
      choices: [
        { label: "[Back]", next: "john_arrives" }
      ]
    },
    arrest: {
      onEnter: (state) => {
        state.flags.add("cutscene_ending_master");
      },
      segments: [
        {
          speaker: "hayes",
          text: "What!? Detective, there's no way you're falling for this!?",
          voice: "tim_got_hayes",
          requires: { flagsAll: ["tim_aligned"] },
        },
        {
          speaker: "tim",
          text: "Ha! serves him right, justice is served.",
          voice: "hayes_05",
          requires: { flagsAll: ["tim_aligned"] },
        },
        {
          speaker: "hayes",
          text: "Uh- actually detective.",
          voice: "",
          requires: { flagsAll: ["marcus_caught"]},
        },
        {
          speaker: "hayes",
          text: "I can't go in.",
          voice: "",
          requires: { flagsAll: ["marcus_caught","tim_aligned"] },
        },
        {
          speaker: "hayes",
          text: "Marcus has ordered me to arrest you too",
          voice: "",
          requires: { flagsAll: ["marcus_caught"]},
        },

        {
          speaker: "hayes",
          text: "So come on, I'm taking you in.",
          voice: "",
         requires: { flagsAll: ["marcus_caught"]},
        },
          {
          speaker: "hayes",
          text: "So come on, I'm taking you in. Along with tim",
          voice: "",
         requires: { flagsAll: ["marcus_caught","tim_aligned"] },
        },
        
      ],
      choices: [
        { label: "[End conversation]", next: "end" },
      ]
    },
    objectives_unlock: {
      segments: [
        {
          speaker: "hayes",
          text: "Understood. I'll let you take it from here.",
          voice: "end"
        },
        {
          speaker: "hayes",
          text: "Quick reminder our biggest leads are  Sam, John and Jim make sure you speak with them.",
          voice: "end_01"
        }
      ],
      set: { flagsAdd: ["debriefed"] },
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

export default hayesDialogue;
