const hayesDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "hayes",
          text: "Detective. I'm glad you're here."
        }
      ],
      choices: [
        { label: "Give me the short version.", next: "summary_short" },
        { label: "Give me the full version.", next: "summary_long" },
        { label: "I don't need a briefing. I'll handle this.", next: "objectives_unlock" },
        { label: "You already lost control of this, Hayes. Explain yourself.", next: "reprimand_start" }
      ]
    },

    summary_short: {
      segments: [
        {
          speaker: "hayes",
          text: "Short version? Jim dropped his wallet four days ago. Sam found it the next morning. Jim only noticed the money missing yesterday and his wife called it in."
        },
        {
          speaker: "hayes",
          text: "I spoke with the couple for a short while and apparently their neighbor John was also robbed."
        },
        {
          speaker: "hayes",
          text: "I haven't had the chance to speak with John yet."
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
          text: "Okay here's the full breakdown."
        },
        {
          speaker: "hayes",
          text: "four days ago, Jim dropped his wallet while walking home. Their neighbor Sam found the wallet early the next day right where it fell."
        },
        {
          speaker: "hayes",
          text: "Sam said it didn't look touched but Jim checked the wallet to be sure. He noticed nothing until his wife Donna was sorting bills and noticed a $20 bill missing yesterday."
        },
        {
          speaker: "hayes",
          text: "But, Donna revealed something interesting when I spoke with her."
        },
        {
          speaker: "hayes",
          text: "Three days ago another neighbor named John was robbed.  I haven't had the chance to speak with him yet but apparently he was robbed for $30."
        },
        {
          speaker: "hayes",
          text: "And here's the strange part: unlike Jim and Donna, John never reported it."
        }
      ],

      choices: [
        { label: "Good. Let's break it down.", next: "post_summary_menu" },
        { label: "That's enough. I'll start talking to people.", next: "objectives_unlock" }
      ]
    },

    reprimand_start: {
      segments: [
        {
          speaker: "hayes",
          text: "Sorry sir, I did what I could."
        },
      ],
      onEnter: (s) => { s.flags.playerReprimandedHayes = true; },
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
          text: "Alright. What do you want to go over?"
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
          text: "From what I gathered Jim seems pretty scatterbrained."
        },
        {
          speaker: "hayes",
          text: "Donna on the other hand seems sharp."
        }
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
          text: "Sam's been nothing but cooperative. she seems to keep to herself mostly."
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
          text: "I heard from Donna that John was also robbed but I haven't spoken with him yet."
        },
        {
          speaker: "hayes",
          text: "It also seems he has a person named Jane living wtih him"
        }
      ],
      choices: [
        { label: "You think he took the twenty?", next: "john_theft_speculation" },
        { label: "What's his personality like?", next: "john_personality" },
        { label: "Alright.", next: "post_summary_menu" },
        { label: "I'll talk to him myself.", next: "objectives_unlock" }
      ]
    },

    tim_noise: {
      segments: [
        {
          speaker: "hayes",
          text: "Yes, I bumped Tim earlier he's loud and arrogant. Matter of fact you should just avoid him outright."
        },
        {
          speaker: "hayes",
          text: "He's stirring the pot but he knows nothing."
        }
      ],
      choices: [
        { label: "Tell me about Jim and Donna.", next: "jim_donna_notes" },
        { label: "Tell me about Sam", next: "sam_notes" },
        { label: "Tell me about John.", next: "john_read_initial" },
        { label: "Anyone causing drama?", next: "tim_noise" },
        { label: "I've got what I need.", next: "objectives_unlock" }
      ]
    },

    objectives_unlock: {
      segments: [
        {
          speaker: "hayes",
          text: "Alright"
        }
      ],
      onEnter: (s) => {
        s.flags.objectivesUnlocked = true;
      },
      end: true,
      choices: []
    }
  }
};

export default hayesDialogue;
