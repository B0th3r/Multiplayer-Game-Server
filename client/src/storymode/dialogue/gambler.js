const gamblerDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        { speaker: "gambler", text: "Yo man what do you want", voice: "intro_01" },
      ],
      choices: [
        { label: "Does John gamble with you often?", next: "intro_02", requires: { flagsAll: ["gambler_location_known"] }, },
        { label: "I'm looking for someone named John.", next: "intro_02", requires: { flagsAll: ["gambler_location_known"] }, },
        { label: "[Leave]", next: "end" },
      ],
    },
    intro_02: {
      segments: [
        { speaker: "gambler", text: "Wait, are you a cop!?", voice: "intro_02" },
        { speaker: "gambler", text: "I'm not telling you anything", voice: "intro_03" },
      ],
      choices: [
        { label: "You're interfering with an investigation, Tell me now!", next: "tells" },
        { label: "Okay I'll leave", next: "bad_end" },
      ],
    },

    tells: {
      set: { cluesAdd: ["clue_GamblerTestimony"] },
      segments: [
        { speaker: "gambler", text: "Fine man just chill.", voice: "tell_01" },
        { speaker: "gambler", text: "Yeah John plays poker with us sometimes", voice: "tell_02" },
        { speaker: "gambler", text: "The only reason we do is to take his money, the guy sucks.", voice: "tell_03" },
      ],
      choices: [
        { label: "How often do you see John there", next: "often" },
        { label: "Where do you gamble at?", next: "where" },
        { label: "(Call over Bobby)", next: "call_01", requires: { flagsAll: ["bobby_investigation_bar"] } },
        { label: "That's all I needed", next: "solo_end" },
      ],
    },

    often: {
      segments: [{ speaker: "gambler", text: "I would say at least once a week.", voice: "often" }],
      choices: [
        { label: "Where do you gamble at?", next: "where" },
        { label: "(Call over Bobby)", next: "call_01", requires: { flagsAll: ["bobby_investigation_bar"] } },
        { label: "[Leave]", next: "end" },
      ],
    },

    where: {
      segments: [{ speaker: "gambler", text: "I- um- forgot.", voice: "forgot" }],
      choices: [
        { label: "How often do you see John there", next: "often" },
        { label: "(Call over Bobby)", next: "call_01", requires: { flagsAll: ["bobby_investigation_bar"] } },
        { label: "[Leave]", next: "end" },
      ],
    },

    bad_end: {
      segments: [{ speaker: "gambler", text: "Yeah that's right!", voice: "deined" }],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    solo_end: {
      set: { flagsAdd: ["talkedToGambler"] },
      segments: [{ speaker: "gambler", text: "Thank good", voice: "let_go" }],
      choices: [{ label: "[End conversation]", next: "end" }],
    },

    call_01: {
      onEnter: (state) => {
        state.flags.add("cutscene_bobby_comes");
      },
      set: { flagsAdd: ["talkedToGambler"] },
      segments: [
        { speaker: "gambler", text: "Hey, what are you doing", voice: "called" },
      ],
      choices: [
        { label: "[Continue]", next: "call_02" },
      ],
    },
    call_02: {
      segments: [
        { speaker: "bobby", text: "Yes detective?", voice: "called_01" },
        { text: "(You explain everything to Bobby.)" },
        { speaker: "bobby", text: "Ohh I see. This is what I've been waiting for.", voice: "called_02" },
        { speaker: "bobby", text: "Now you're going to tell us everything we want to know about this gambling den.", voice: "called_03" },
        { speaker: "gambler", text: "Like hell I am, Look detective telling you about john is one thing but", voice: "called_02" },
      ],
      choices: [
        { label: "Just give us your boss.", next: "press" },
        { label: "Talk or be arrested", next: "press" },
        { label: "We will let you walk away", next: "walk_01" },
      ],
    },

    walk_01: {
      segments: [{ speaker: "bobby", text: "Wait, woah detective are you serious about this?", voice: "checking" }],
      choices: [
        { label: "Just trust me.", next: "walk_02" },
        { label: "No.", next: "walk_02" },
      ],
    },

    walk_02: {
      onEnter: (state) => {
        state.flags.add("cutscene_bobby_moves_to_bartender");
      },
      segments: [
        { speaker: "gambler", text: "What are you guys talking about!!??", voice: "walk_02" },
        { speaker: "gambler", text: "Just take me in I would rather get arrested", voice: "walk_01" },
        { speaker: "bobby", text: "Don't worry your not in trouble we only want your boss", voice: "only_boss" },
        { speaker: "gambler", text: "fine", voice: "fine" },
        { speaker: "gambler", text: "You see that guy there.", voice: "boss_01" },
        { speaker: "bobby", text: "The bartender?", voice: "reveal" },
        { speaker: "gambler", text: "yes he runs the whole operation", voice: "boss_02" },
        { speaker: "bobby", text: " You better not be lying", voice: "lying" },
        { speaker: "gambler", text: "I'm not lying I swear", voice: "boss_03" },
        { speaker: "bobby", text: "alright you can go", voice: "let_go" },
      ],
      choices: [{ label: "Let's go to the bartender", next: "bartender" }],
    },

    press: {
      onEnter: (state) => {
        state.flags.add("cutscene_bobby_moves_to_bartender");
      },
      segments: [
        { speaker: "gambler", text: "Damn it.", voice: "damn" },
        { speaker: "gambler", text: "You see that guy there.", voice: "boss_01" },
        { speaker: "bobby", text: "The bartender?", voice: "reveal" },
        { speaker: "gambler", text: "yes he runs the whole operation", voice: "boss_02" },
        { speaker: "bobby", text: " You better not be lying", voice: "lying" },
        { speaker: "gambler", text: "I'm not lying I swear", voice: "boss_03" },
        { speaker: "bobby", text: "You better not go anywhere.", voice: "stay" },
      ],
      choices: [{ label: "Let's go to the bartender", next: "bartender" }],
    },

    bartender: {
      segments: [
        { speaker: "bartender", text: "Evening, can I get you two a drink?", voice: "confronted_01" },
        { speaker: "bobby", text: "Give it up, we know everything!", voice: "bartender_01" },

        { speaker: "bartender", text: "Everything? ...About what, exactly?", voice: "confronted_02" },

        { speaker: "bobby", text: "We know you're behind the gambling den!", voice: "bartender_02" },
      ],
      choices: [
        { label: "We want a cut of the action.", next: "dirty" },
        { label: "(arrest him)", next: "arrest" },
      ],
    },

    arrest: {
      set: { flagsAdd: ["BobbyGood"] },
      segments: [
        { speaker: "bobby", text: "Come on. You're coming with us.", voice: "booked" },


        { speaker: "bartender", text: "Damn it!", voice: "damn" },

        { speaker: "bobby", text: "Thank you for all of the help, detective.", voice: "bartender_04" },

        { speaker: "bobby", text: "I'll make sure to put in a good word with Detective marcus", voice: "bartender_05" },
      ],
      choices: [{ label: "[End conversation]", next: "end", set: { flagsAdd: ["MarcusComesToBar"] } }],
    },

    dirty: {
      set: { flagsAdd: ["BobbyDirty"] },
      segments: [

        { speaker: "bartender", text: "What do you mean by everything? What are you talking about?", voice: "cut_01" },
        { speaker: "bobby", text: "Yeah that’s right, we’ll be taking a cut of the action here… unless you want to get arrested?", voice: "bartender_03" },
        { speaker: "bartender", text: "Okay fine just keep your voices down.", voice: "cut_02" },

        { speaker: "bobby", text: "I'll take it from here detective", voice: "bartender_04" },
        { speaker: "bobby", text: "Thank you for all of the help, detective.", voice: "thanked" },
      ],
      choices: [{ label: "[End conversation]", next: "end", set: { flagsAdd: ["MarcusComesToBar"] } }],
    },

    end: { segments: [], end: true },
  },
};

export default gamblerDialogue;
