const bobbyBartenderDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {text: "(You see Bobby drinking when he's supposed to be working.)" , requires: {notFlags: ["bar_talk"]}},
      ],
      choices: [
        { label: "(order a drink too.)", next: "intro_02", set: { flagsAdd: ["ordered_drink"] },requires: {notFlags: ["bar_talk"]} },
        { label: "Drinking on the job??", next: "intro_02",requires: {notFlags: ["bar_talk"]} },
        { label: "[Leave]", next: "end" },
      ],
    },
    intro_02: {
      segments: [
        { speaker: "bartender", text: "coming right up sir.", voice: "drink_01", requires: { flagsAll: ["ordered_drink"] } },
        { speaker: "bobby", text: "*chuckle* looks like your stressed too", voice: "bar_drink_intro", requires: { flagsAll: ["ordered_drink"] } },
        { speaker: "bobby", text: "Sorry sir its just this assignment has me stressed", voice: "intro_bar_02", },
        { speaker: "bobby", text: "I been running around all day and I don't have a single lead", voice: "intro_bar_03" },
        { speaker: "bobby", text: "Even after talking with the patrons of this bar I couldn't find anything.", voice: "intro_bar_04" },
      ],
      set: { flagsAdd: ["met_bobby_in_bar"] },
      choices: [
        { label: "This is all Marcus fault", next: "marcus_fault" },
        { label: "Don't quit. You're doing fine just focus.", next: "encourage_good" },
        { label: "[Leave]", next: "end_01" },
      ],
    },

    marcus_fault: {
      segments: [{ speaker: "bobby", text: "All marcus fault? How so", voice: "fault" },],
      choices: [
        { label: "He's holding you back. You should stop listening to him.", next: "anti_marcus_01" },
        { label: "No, I was joking. Marcus is your mentor.", next: "encourage_good" },
      ],
    },

    anti_marcus_01: {
      segments: [
        { speaker: "bobby", text: "You do have a point there", voice: "anti_01", },
        { speaker: "bobby", text: "Maybe I should start being more like you instead of Marcus", voice: "anti_02", },
        { speaker: "bartender", text: "Here's your drink sir, and another round for you.", voice: "drink_02", requires: { flagsAll: ["ordered_drink"] } },
        { speaker: "bartender", text: "Here, another round sir.", voice: "drink_03",requires: { notFlags: ["ordered_drink"] } },
        { speaker: "bobby", text: "Thank you.", voice: "thanks_drink", },
        { speaker: "bartender", text: "If you don't mind me asking what were you two talking about?", voice: "anti_01"},
        { speaker: "bartender", text: "Did I hear somthing about not following orders?", voice: "anti_02"},
        { speaker: "bobby", text: "Yeah no more following Marcus rules", voice: "anti_03", },
        { speaker: "bobby", text: "The only reason I took up this job is to put food on the table for my kids.", voice: "reason_01" },
      ],
      choices: [
        { label: "For the money", next: "money_resp" },
        { label: "To end all crime by any means", next: "anymeans_resp" },
        { label: "To make the world a better place", next: "good_resp" },
        { label: "Actually stay clean. Don't throw your career away.", next: "encourage_good_late" },
        { label: "Let's ask the bartender about the gambling den", next: "ask_bartender_about_den" },
      ],
    },

    encourage_good: {
      segments: [
        { speaker: "bobby", text: "Thank you for the words of encouragement, detective, but I think I'm done.", voice: "good_01" },
        { speaker: "bobby", text: "Im going to call it quits Im cleary not up for the job, its the only first week", voice: "quit_02" },
        { speaker: "bartender", text: "Here's your drink sir, and another round for you.",voice: "drink_02", requires: { flagsAll: ["ordered_drink"] } },
        { speaker: "bartender", text: "Here, another round sir.", voice: "drink_03", requires: { notFlags: ["ordered_drink"] } },
        { speaker: "bobby", text: "Thank you.", voice: "thanks_drink" },
        { speaker: "bobby", text: "…" },
        { speaker: "bobby", text: "No. You're right. I can't give up.", voice: "good_02" },
        { speaker: "bobby", text: "The only reason I even took up this job is to put food on the table for my kids.", voice: "reason_01" },
      ],
      choices: [
        { label: "Let's ask the bartender about a gambling den.", next: "ask_bartender_about_den" },
        { label: "I'll be going now", next: "end_01" },
      ],
    },
    encourage_good_late: {
      segments: [
        { speaker: "bartender", text: "woah your changing just like that.", voice: "late" },
        { speaker: "bobby", text: "…" },
        { speaker: "bobby", text: "No. You're right. I can't give up.", voice: "good_02" },
      ],
      choices: [
        { label: "Let's ask the bartender about a gambling den.", next: "ask_bartender_about_den" },
       { label: "I'll be going now", next: "end_01" },
      ],
    },
    ask_bartender_about_den: {
      segments: [
        { speaker: "bobby", text: "Oh that's a good idea.", voice: "den_ask_01" },
        { speaker: "bobby", text: "Have you heard any mention about a gambling den?", voice: "den_ask_02" },
        { speaker: "bartender", text: "You see I have a bit of a confinically cause at my bar so, anything a customer tells me, stays with me", voice: "clause_01" },
      ],
      choices: [
       { label: "I'll be going now", next: "end_01" },
      ],
    },
    end_01: {
      set: { flagsAdd: ["bar_talk"] },
      segments: [
        { speaker: "bobby", text: "Okay, I'll continue my investigation too.", voice: "end_01" },
        { speaker: "bobby", text: "after I finish my drink of course.", voice: "end_02" },
      ],
      choices: [
        { label: "[Leave]", next: "end" },
      ],
    },
    end: { segments: [], end: true, choices: [] },
  },
};

export default bobbyBartenderDialogue;
