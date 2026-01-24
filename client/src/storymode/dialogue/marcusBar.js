const marcusDialogue = {

  nodes: {
    bar_clean_praise: {
      segments: [
        { speaker: "bobby", text: "Oh detective marcus {{playerName}} and I solved the case, let me tell you about it", voice: "good_end_01" },
        { speaker: "marcus", text: "I'm listening", voice: "listening" },
        { text: "(bobby tells marcus everything.)" },
        { text: "..." },
        { speaker: "marcus", text: "*chuckle* I have to admit this is some great work.", voice: "good_end_01" },
        { speaker: "bobby", text: "Really you mean it?", voice: "good_end_02" },
        { speaker: "marcus", text: "You done a great job here Bobby I'm proud of you", voice: "good_end_02" },
        { text: "(Marcus turns to you)" },
        { speaker: "marcus", text: "Look detective, perhaps I was wrong about you.", voice: "good_end_03" },
        { speaker: "marcus", text: "Whenever you come back to the office talk to me.", voice: "good_end_04" },
        { speaker: "bobby", text: "Thank you everything detective I'll see you back at the station.", voice: "good_end_03" },
      ],
      choices: [
        { label: "[End]", next: "bar_confirm_end" },
      ],
    },

    bar_dirty_pass: {
      segments: [
        { speaker: "marcus", text: "I can't believe this bobby, it's your first assignment.", voice: "bobby_01" },
        { speaker: "bobby", text: "I am being set up, {{playerName}} set me up!", voice: "evil_end_01" },
        { speaker: "marcus", text: "Just stop, I won't tolerate anymore lies.", voice: "bobby_02" },
        { speaker: "bobby", text: "I am being serious!", voice: "evil_end_02" },
        { speaker: "marcus", text: "Enough! You're coming with me.", voice: "bobby_03" },
        { speaker: "bobby", text: "*sigh* damn", voice: "reject" },
        { speaker: "marcus", text: "Look detective, perhaps I was wrong about you.", voice: "good_end_03" },
        { speaker: "marcus", text: "Whenever you come back to the office talk to me.", voice: "good_end_04" },

      ],
      choices: [
        { label: "[End]", next: "bar_confirm_end" },
      ],
    },
    bar_dirty_failed: {
      segments: [
        { speaker: "marcus", text: "I can't believe this bobby, it's your first assignment.", voice: "bobby_01" },
        { speaker: "bobby", text: "I am being set up, {{playerName}} set me up!", voice: "evil_end_01" },
        { text: "(Bobby and Marcus both turn to you.)" },
      ],
      choices: [
        { label: "Don't sntich!", next: "bar_dirty_failed_02" },
        { label: "[Leave]", next: "bar_confirm_end" },
      ]
    },
    bar_dirty_failed_02: {
      segments: [
        { speaker: "bobby", text: "What are you doing!", voice: "worse_end_01" },
        { speaker: "marcus", text: "*Laugh* That's a perfect detective.", voice: "bar_dirty_failed_02" },

      ],
      choices: [
        { label: "[Leave]", next: "bar_confirm_end" },
      ]
    },

    bar_confirm_end: {
      segments: [],
      end: true,
    },
  }

}
export default marcusDialogue;
