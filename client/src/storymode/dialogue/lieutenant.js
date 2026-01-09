const lieutenantDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "lieutenant", text: "Close the door, Detective.", voice: "intro_02" },
        { speaker: "lieutenant", text: "Last case went cold. Not because we were out of options.", voice: "intro_03" },
        { speaker: "lieutenant", text: "Because you burned the one lead that mattered. ", voice: "intro_04" },
      ],
      choices: [
        { label: "I didn't burn anything.", next: "deny" },
        { label: "What lead are we talking about?", next: "explain_lead" },
        { label: "Yeah. I screwed up.", next: "admit" },
      ]
    },

    explain_lead: {
      segments: [
        { speaker: "lieutenant", text: "The witness was ready to talk then you pushed too hard", voice: "explain_01" },
        { speaker: "lieutenant", text: "Now they've lawyered up and won't touch us", voice: "explain_02" },
        { speaker: "lieutenant", text: "You talked yourself out of a confession", voice: "explain_03" },
      ],
      choices: [
        { label: "So what's my punishment?", next: "punishment" },
        { label: "I was trying to get results.", next: "results_excuse" },
      ]
    },

    deny: {
      segments: [
        { speaker: "lieutenant", text: "Spare me. I read the report.", voice: "excuse_01" },
        { speaker: "lieutenant", text: "careful detective if you don't take ownership with this, this can get a whole lot worse.", voice: "excuse_02" },
      ],
      choices: [
        { label: "So what now?", next: "punishment" },
        { label: "I can fix it.", next: "cant_fix" },
      ]
    },

    admit: {
      segments: [
        { speaker: "lieutenant", text: "Good. At least you admit it", voice: "admit" },
      ],
      choices: [
        { label: "How?", next: "punishment" },
      ]
    },

    cant_fix: {
      segments: [
        { speaker: "lieutenant", text: "No. You can't.", voice: "no_fix" },
        { speaker: "lieutenant", text: "Look, our new guy Hayes has ran into some trouble with his case.  Easy neighborhood case, your job is to help out and teach.", voice: "punishment_03" },
        { speaker: "lieutenant", text: "along with that I want you to prove to me that you can be trusted around people again.", voice: "punishment_02" },
      ],
      choices: [
        { label: "Understood.", next: "punishment" },
      ]
    },

    punishment: {
      segments: [
        { speaker: "lieutenant", text: "Our new guy Hayes has ran into some trouble with his case.  Easy neighborhood case, your job is to help out and teach.", voice: "punishment_01" },
        { speaker: "lieutenant", text: "along with that I want you to prove to me that you can be trusted around people again.", voice: "punishment_02" },
      ],
      onEnter: (s) => {
        s.flags.objectivesUnlocked = true;
      },
      choices: [
        { label: "Fine.", next: "end_02" },
        { label: "You're punishing him too.", next: "end_01" },
      ]
    },

    end_01: {
      segments: [
        { speaker: "lieutenant", text: "No. I'm protecting him and I'm testing you.", voice: "rookie_pushback" },
        { speaker: "lieutenant", text: "Find detective Ace when your ready to go", voice: "outro_01" },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02" },
      ],
      choices: []
    },

    end_02: {
      segments: [
        { speaker: "lieutenant", text: "Find detective Ace when your ready to go", voice: "outro_01" },
        { speaker: "lieutenant", text: "Dismissed.", voice: "outro_02" },
      ],
      choices: []
    }
  }
};
export default lieutenantDialogue;
