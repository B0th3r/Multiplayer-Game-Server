const janeDialogue = {
  start: "intro",
  nodes: {
    intro: {
      gate: { notFlags: ["janes_location_known"] },
      nextFail: "intro_pass",
      segments: [{ speaker: "jane", text: "Huh? who are you?", voice: "rare_intro" }],
      choices: [
        { label: "I'm a detecive", next: "intro_detective" },
        { label: "Who are you?", next: "intro_polite_leave" },
        { label: "[Leave]", next: "end" },
      ],
    },

    intro_polite_leave: {
      segments: [
        { speaker: "jane", text: "What- oh guess your not here for me", voice: "rare_intro_02" },
        { speaker: "jane", text: "Sorry to bother you", voice: "rare_intro_03" }
      ],
      choices: [
        { label: "How do you know Donna?", next: "intro_not_for_you" },
        { label: "[Leave]", next: "end" }
      ],
    },

    intro_not_for_you: {
      segments: [
        { speaker: "jane", text: "If your not here for me then leave me alone", voice: "rare_intro_04" },
      ],
      choices: [
        { label: "[Leave]", next: "end" },
      ],
    },
    intro_detective: {
      set: { flagsAdd: ["talkedToJane"] },
      segments: [
        {
          speaker: "jane",
          text: "Detective? Donna said you might come find me. Didn't think you'd actually track me all the way out here.",
          voice: "intro_01",
        },
      ],
      choices: [
        { label: "I need to ask about John's robbery.", next: "robbery_claim" },
        { label: "What happened between you and John?", next: "birthday_context" },
        { label: "Tell me what you know about Jim.", next: "jim_topic" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },
    intro_pass: {
      segments: [
        {
          speaker: "jane",
          text: "Detective? Donna said you might come find me. Didn't think you'd actually track me all the way out here.",
          voice: "intro_01",
        },
      ],
      set: { flagsAdd: ["talkedToJane"] },
      choices: [
        { label: "I need to ask about John's robbery.", next: "robbery_claim" },
        { label: "What happened between you and John?", next: "birthday_context" },
        { label: "Tell me what you know about Jim.", next: "jim_topic" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    return_visit: {
      segments: [{ speaker: "jane", text: "Huh? Your still here", voice: "intro_02" }],
      choices: [
        { label: "Tell me about John's robbery.", next: "robbery_claim" },
        { label: "Tell me what you know about Jim.", next: "jim_topic" },
        { label: "Where's that guy you talked to at the bar?", next: "where_is_gambling_buddy", requires: { cluesAll: ["clue_jane_talked_to_gambler"] } },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    hub: {
      segments: [{ speaker: "jane", text: "Ask what you came to ask, detective." }],
      choices: [
        { label: "Let's go back to John's robbery.", next: "robbery_claim" },
        { label: "What happened after you confronted him?", next: "confrontation_start" },
        { label: "Tell me what you know about Jim.", next: "jim_topic" },
        {
          label: "Where's that gambling buddy now?",
          next: "where_is_gambling_buddy",
          requires: { cluesAll: ["clue_jane_talked_to_gambler"] },
        },
        { label: "You want revenge? Tell me somthing that'll bring him down.", next: "evil_pushback" },

        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    robbery_claim: {
      segments: [
        { speaker: "jane", text: "Yeah, he said he was robbed for $30.", voice: "john_rob_01" },
        { speaker: "jane", text: "But it's a lie I'm certain.", voice: "john_rob_02" },
      ],
      set: { cluesAdd: ["clue_jane_says_john_lied", "clue_john_robbed_30_claim"] },
      choices: [
        { label: "Why are you so sure?", next: "birthday_context" },
        { label: "What exactly did he tell you happened?", next: "john_claim_details" },
        { label: "Let's talk about something else", next: "hub" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    birthday_context: {
      segments: [
        { speaker: "jane", text: "about 4 days ago John and I were home celebrating my birthday", voice: "bday_01" },
        {
          speaker: "jane",
          text: "All was well up to this point, until the next day when we went over our expenses",
          voice: "bday_02",
        },
        {
          speaker: "jane",
          text: "To be honest John and I ran into some financial trouble a little while back so once a week we both track our expenses.",
          voice: "bday_03",
        },
        { speaker: "jane", text: "It was then where John told me about his robbery.", voice: "bday_04" },
        {
          speaker: "jane",
          text: "After he told me about the robbery I already knew something was off but I let it go then.",
          voice: "bday_05",
        },
        {
          speaker: "jane",
          text: "But it keep thawing it me, so I went the supposive  bar John got robbed at.",
          voice: "bday_06",
        },
        {
          speaker: "jane",
          text: "Come to find out he wasn't even there that night. THe bartender told me",
          voice: "bday_07",
        },
        { speaker: "jane", text: "He was out gambling I know it.", voice: "bday_08" },
      ],
      set: { cluesAdd: ["clue_jane_checked_bar"] },
      choices: [
        { label: "This doesn't prove anything.", next: "bar_followup" },
        { label: "Back to the robbery claim.", next: "robbery_claim" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    bar_followup: {
      segments: [
        { speaker: "jane", text: "Yes it does. I even started asking around the bar", voice: "bar_01" },
        { speaker: "jane", text: "Some guy overheard me asking about John and walked up to me", voice: "bar_02" },
        {
          speaker: "jane",
          text: "He confirmed all of my suspensions. He's one of the guys who's been gambling with John.",
          voice: "bar_03",
        },
        { speaker: "jane", text: "looking back at it this definitely wasn't the first time", voice: "gamble_01" },
        {
          speaker: "jane",
          text: "You see John is addicted to gambling and months ago he promised me that would stop.",
          voice: "gamble_02",
        },
      ],
      set: { cluesAdd: ["clue_john_gambling_confirmed", "clue_jane_talked_to_gambler"] },
      choices: [
        { label: "Where is that guy now?", next: "where_is_gambling_buddy" },
        { label: "Has this happened before?", next: "gambling_pattern" },
        { label: "Let's talk about something else", next: "hub" },
      ],
    },

    where_is_gambling_buddy: {
      segments: [{ speaker: "jane", text: "Yeah he's right over there", voice: "gambler" }],
      set: {
        flagsAdd: ["gambler_location_known"],
      },
      choices: [
        { label: "Let's talk about something else", next: "hub" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    john_claim_details: {
      segments: [
        { speaker: "jane", text: "He said he was robbed at the bar for $30", voice: "rob_01" },
        { speaker: "jane", text: "and that he only noticed it when going back home.", voice: "rob_02" },
      ],
      set: { cluesAdd: ["clue_john_claim_pickpocket_bar", "clue_john_claim_notice_on_way_home"] },
      choices: [
        { label: "Why were you so sure that he wasn't robbed", next: "birthday_context" },
        { label: "Let's talk about something else", next: "robbery_claim" },
      ],
    },

    confrontation_start: {
      segments: [
        { speaker: "jane", text: "Yes when I confronted him, he only dug deeper", voice: "rob_03" },
        { speaker: "jane", text: "So I left.", voice: "rob_04" },
      ],
      set: { cluesAdd: ["clue_jane_left_after_confrontation"] },
      choices: [
        { label: "Let's talk about something else", next: "hub" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    jim_topic: {
      segments: [
        { speaker: "jane", text: "Jim? He's a sweet guy but forgetful.", voice: "jim_01" },
        {
          speaker: "jane",
          text: "I didn't hear too much about his robbery, Donna sure seem worried though",
          voice: "jim_02",
        },
      ],
      set: { cluesAdd: ["clue_jane_jim_forgetful", "clue_donna_worried_about_jim"] },
      choices: [
        { label: "Let's talk about something else", next: "hub" },
        { label: "[Leave]", next: "end_goodbye" },
      ],
    },

    evil_pushback: {
      segments: [{ speaker: "jane", text: "I'm not here to be your entertainment. Ask real questions.", voice: "revenge" }],
      choices: [
        { label: "Alright. My bad. Back to business.", next: "hub" },
        { label: "Whatever. I'm leaving.", next: "end" },
      ],
    },

    end_goodbye: {
      segments: [{ speaker: "jane", text: "See you later Detective", voice: "end" }],
      choices: [{ label: "[Leave]", next: "end" }],
    },

    end: { segments: [], end: true, choices: [] },
  },
};

export default janeDialogue;
