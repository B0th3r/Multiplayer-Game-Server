const floristDialogue = {
  start: "intro",

  nodes: {
    intro: {
      segments: [
        {
          speaker: "florist",
          text: "Welcome to the Bloom Room! Whoa, serious face. You're not here for a bouquet, are you?"
        }
      ],
      choices: [
        { label: "I'm investigating something that happened the other night.", next: "case_intro" },
        { label: "what do you have in stock?", next: "browse" },
        { label: "I hate flowers", next: "rude_open" },
       
      ]
    },

rude_open: {
      segments: [
        {
          speaker: "florist",
          text: "hmph! a flower hater get out of my store!"
        }
      ],
      choices: [
        { label: "Wait! I was joking", next: "rude_recovery" },
        { label: "Whatever", next: "end" }
      ]
    },
    rude_recovery: {
      segments: [
        {
          speaker: "florist",
          text: "Oh you were just joking, thank golly."
        }
      ],
      choices: [
        { label: "Have you seen anyone suspicious lately", next: "suspicious" },
        { label: "what do you have in stock?", next: "browse" },
        { label: "Jk still hate flowers", next: "rude_end" }
      ]
    },
    rude_end: {
      segments: [
        {
          speaker: "florist",
          text: "How rude! that's it I am ingoring you."
        }
      ],
      choices: [
      ]
    },
    
    case_intro: {
      segments: [
        {
          speaker: "florist",
          text: "Ooooh okay, mystery face on! Okay, hit me. Flower boy is ready."
        }
      ],
      choices: [

        { label: "what do you have in stock?", next: "browse" },
        { label: "Have you seen anyone suspicious lately", next: "suspicious" },


      ]
    },
    browse: {
      segments: [
        {
          speaker: "florist",
          text: "Tell me, what type of flowers are you looking for sweetie"
        }
      ],
      choices: [{ label: "What's the cheapest thing in here?", next: "florist_cheapest_item" },
      { label: "I need something for my mom", next: "florist_mother_item" },
      { label: "What do guilty boyfriends normally buy?", next: "florist_john_gift_hint" },
      { label: "Lets talk about somthing else", next: "florist_john_gift_hint" },
      { label: "That's enough, sorry to bother you.", next: "florist_end" }
      ]
    },


    john_ask: {
      segments: [
        {
          speaker: "florist",
          text: "Sorry swettie I havn't seen her"
        }
      ],
      choices: [
        { label: "what do you have in stock?", next: "browse" },
        { label: "I hate flowers", next: "rude_open" },
      ]
    },
    suspicious: {
      segments: [
        {
          speaker: "florist",
          text: "Anyone one suspicious? Nope, can't say I have swettie."
        }
      ],
      choices: [
        { label: "That sounds like him.", next: "john_detail_intro" },
        { label: "Did he come in the night Jim lost money?", next: "timeline_check" }
      ]
    },
    florist_cheapest_item: {
      segments: [
        {
          speaker: "florist",
          text: "That would be this bouquet of Sunflowers, for 15$ they'll brighten up anyone's day."
        }
      ],
      choices: [
        { label: "That sounds like him.", next: "john_detail_intro" },
        { label: "Did he come in the night Jim lost money?", next: "timeline_check" }
      ]
    },
florist_mother_item: {
      segments: [
        {
          speaker: "florist",
          text: "For your mother I would choose this bouquet of Tulips"
        }
      ],
      choices: [
        { label: "That sounds like him.", next: "john_detail_intro" },
        { label: "Did he come in the night Jim lost money?", next: "timeline_check" }
      ]
    },




    end_soft: {
      segments: [
        {
          speaker: "florist",
          text: "Alright sweetie, go do your detective thing. Come back if you need fresh air and fresh petals."
        }
      ],
      end: true,
      choices: []
    }
  }
};


export default floristDialogue;



