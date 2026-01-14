const samDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "sam", text: "Oh! You're the detective, right?", voice: "intro_01" },
        { speaker: "sam", text: "I spoke to your partner earlier. He said you'd come by. I'm Sam.", voice: "intro_02" },
      ],
      set: { flagsAdd: ["talkedToSam"] },
      choices: [
        { label: "I want to talk about the wallet you found.", next: "found_wallet" },
        { label: "Have you heard anything about John's robbery?", next: "john_robbery" },
        { label: "[Leave]", next: "end" },
      ],
    },

    return_visit: {
      segments: [{ speaker: "sam", text: "Back again, detective?", voice: "intro_04" }],
      choices: [
        { label: "Let's revisit the wallet.", next: "wallet_menu" },
        { label: "Remind me what you heard about John's robbery.", next: "john_robbery" },
        { label: "[Leave]", next: "end" },
      ],
    },

    found_wallet: {
      segments: [
        {
          speaker: "sam",
          text: "I left my house to check the mail. While walking, I spotted a wallet on the ground.",
          voice: "wallet_01",
        },
        { speaker: "sam", text: "I opened it, and it was Jim's.", voice: "wallet_02" },
        { speaker: "sam", text: "So I gave it back to him right away.", voice: "wallet_03" },
      ],
      choices: [
        { label: "You opened it? Could it have fallen out there?", next: "return_reason" },
        { label: "Let's talk about something else.", next: "intro" },
      ],
    },

    return_reason: {
      segments: [{ speaker: "sam", text: "Um… I don't think so. At least, I didn't see it fall out.", voice: "falled" }],
      set: { cluesAdd: ["sam_found_wallet"] },
      choices: [
        { label: "What time was this?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Wow. What an idiot.", next: "sam_poke_01" },
        { label: "Tell me how you found it again.", next: "timeline_start" },
        { label: "That's all for now.", next: "good_end" },
      ],
    },

    wallet_menu: {
      segments: [{ speaker: "sam", text: "What else do you want to know about the wallet?", voice: "wallet_02" }],
      choices: [
        { label: "What time was this?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Tell me how you found it again.", next: "timeline_start" },
        { label: "Let's talk about John's robbery.", next: "john_robbery" },
        { label: "[Leave]", next: "end" },
      ],
    },

    timeline_start: {
      segments: [
        {
          speaker: "sam",
          text: "I was walking to the mailbox and saw a wallet on the ground. That's really all there was to it.",
          voice: "wallet_01",
        },
      ],
      choices: [
        { label: "What time was this?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Got it.", next: "wallet_menu" },
      ],
    },

    timeline_time: {
      segments: [
        {
          speaker: "sam",
          text: "It was around the morning not too early. I don't have the exact minute, sorry.",
          voice: "wallet_01",
        },
      ],
      set: { cluesAdd: ["sam_wallet_time_window"] },
      choices: [
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Tell me how you found it again.", next: "timeline_start" },
        { label: "Okay. Let's move on.", next: "wallet_menu" },
      ],
    },

    suspicious: {
      segments: [{ speaker: "sam", text: "No… I didn't see anyone suspicious.", voice: "suspicious" }],
      set: { cluesAdd: ["sam_saw_no_one"] },
      choices: [
        { label: "What time exactly did you find it?", next: "timeline_time" },
        { label: "Tell me how you found it.", next: "timeline_start" },
        { label: "Alright.", next: "wallet_menu" },
      ],
    },

    sam_poke_01: {
      segments: [{ speaker: "sam", text: "Come on. There's no reason to be like that.", voice: "press" }],
      choices: [
        { label: "Yeah, fair. What time was this?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "You probably dropped it and someone else picked it up.", next: "sam_poke_02" },
        { label: "That's all for now.", next: "good_end" },
      ],
    },

    sam_poke_02: {
      segments: [
        {
          speaker: "sam",
          text: "No. I didn't drop anything. I found it, and I returned it. That's it.",
          voice: "press_02",
        },
      ],
      choices: [
        { label: "Alright. Back up— what time was this?", next: "timeline_time" },
        { label: "Fine. Did you take the $20?", next: "direct_accuse_sam" },
        { label: "Let's move on.", next: "wallet_menu" },
      ],
    },

    john_robbery: {
      segments: [
        { speaker: "sam", text: "I heard from Jane that John got robbed for $30.", voice: "john_01" },
        { speaker: "sam", text: "From what she told me, it sounded like a pickpocket.", voice: "john_02" },
      ],
      choices: [
        { label: "Where is Jane now?", next: "jane_where" },
        { label: "Let's go back to the wallet.", next: "wallet_menu" },
        { label: "[Leave]", next: "end" },
      ],
    },

    jane_where: {
      segments: [
        {
          speaker: "sam",
          text: "She's… um. Sorry, detective. It's a pretty complicated story.",
          voice: "jane",
        },
      ],
      choices: [
        { label: "Tell me. Now.", next: "pressure_sam" },
        { label: "Take your time. I just need the truth.", next: "pressure_sam" },
        { label: "Fine. Keep it private.", next: "pressure_sam_fail" },
        { label: "Let's talk about something else.", next: "intro" },
      ],
    },

    pressure_sam: {
      segments: [
        { speaker: "sam", text: "I— okay. Okay. I'll tell you.", voice: "tell" },
        { speaker: "sam", text: "Jane had a big argument with John last night.", voice: "where_jane_01" },
        {
          speaker: "sam",
          text: "I don't know the full details. All I know is she hasn't been back since.",
          voice: "where_jane_02",
        },
        { speaker: "sam", text: "I saw her heading toward the city.", voice: "where_jane_03" },
      ],
      set: {
        cluesAdd: ["clue_sam_heard_argument", "clue_john_argument"],
        flagsAdd: ["janes_location_known"],
      },
      choices: [
        { label: "Did you see anyone else on the street?", next: "street_people" },
        { label: "Do you know anything else?", next: "john_robbery_menu" },
        { label: "Let's go back to the wallet.", next: "wallet_menu" },
        { label: "[Leave]", next: "end" },
      ],
    },

    john_robbery_menu: {
      segments: [{ speaker: "sam", text: "What else do you want to ask about John and Jane?", voice: "john_01" }],
      choices: [
        { label: "Remind me what you heard about John's robbery.", next: "john_robbery" },
        { label: "Let's switch topics.", next: "intro" },
        { label: "[Leave]", next: "end" },
      ],
    },


    pressure_sam_fail: {
      segments: [
        {
          speaker: "sam",
          text: "Sorry, detective… but there are some things that should remain private.",
          voice: "no_tell",
        },
      ],
      choices: [
        { label: "Fine. Did you take the $20?", next: "direct_accuse_sam" },
        { label: "Okay. Then give me the wallet timeline.", next: "timeline_time" },
        { label: "Alright. We'll leave it there.", next: "good_end" },
      ],
    },

    direct_accuse_sam: {
      segments: [
        {
          speaker: "sam",
          text: "Detective… if you're accusing me, just say it. I'm trying to help here.",
          voice: "press_02",
        },
      ],
      choices: [
        { label: "I'm accusing you. Did you take it?", next: "accuse_sam_02" },
        { label: "No— I'm just covering every angle.", next: "accuse_sam_deescalate" },
        { label: "Forget it. Let's move on.", next: "wallet_menu" },
      ],
    },

    accuse_sam_deescalate: {
      segments: [
        {
          speaker: "sam",
          text: "Then ask your questions like a professional. I'm not your punching bag.",
          voice: "press",
        },
      ],
      choices: [
        { label: "Understood. What time was it?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Alright. Back to the robbery stuff.", next: "john_robbery" },
        { label: "That's enough for now.", next: "good_end" },
      ],
    },

    accuse_sam_02: {
      segments: [
        {
          speaker: "sam",
          text: "Wow. Okay. No. I didn't take anything. And if you're going to talk to me like that, we might be done here.",
          voice: "press_02",
        },
      ],
      choices: [
        { label: "Apologize. I pushed too hard.", next: "accuse_sam_apology" },
        { label: "Good. Then we're done here.", next: "end" },
      ],
    },

    accuse_sam_apology: {
      segments: [
        {
          speaker: "sam",
          text: "…Fine. Just— ask your questions and move on.",
          voice: "tell",
        },
      ],
      choices: [
        { label: "What time did you find the wallet?", next: "timeline_time" },
        { label: "Did you see anyone suspicious?", next: "suspicious" },
        { label: "Okay. Let's move on.", next: "wallet_menu" },
      ],
    },

    good_end: {
      segments: [
        {
          speaker: "sam",
          text: "If you need anything else, detective, just ask. I hope this whole thing gets sorted out soon.",
          voice: "end",
        },
      ],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    end: {
      segments: [],
      end: true,
      choices: [],
    },
  },
};

export default samDialogue;
