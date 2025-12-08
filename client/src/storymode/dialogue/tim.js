const timDialogue = {
  start: "intro",


  nodes: {
    intro: {
      segments: [
        {
          speaker: "tim",
          text: "Detective. Make it quick. I have actual things to do."
        }
      ],
      choices: [
        { label: "I have some questions about the thefts on this street.", next: "baseline" },
        { label: "You jog mornings, right? Need your perspective.", next: "jogging_start" },
        { label: "Lose the attitude, Tim.", next: "player_pushes_first"}
      ]
    },


    baseline: {
      segments: [
        {
          speaker: "tim",
          text: "Oh, the missing pocket change? Riveting case. I'm sure the city will give you a medal."
        }
      ],
      choices: [
        { label: "Do you know any detials about the robbery.", next: "two_thefts_comment" },
        { label: "Cut the crap and answer.", next: "tim_bait_round1" }
      ]
    },


    robbery_detials: {
      segments: [
        {
          speaker: "tim",
          text: "All I know is, John got robbed and Jim got robbed."
        },
        {
          speaker: "tim",
          text: "Can I go now detective."
        }
      ],
      choices: [
        { label: "", next: "john_robbery_info" },
        { label: "Come on you can tell me more than that", next: "john_gf_fight" },
        { label: "You seem to be in a hurry.", next: "tim_bait_round1" }
      ]
    },




    john_gf_fight: {
      segments: [
        {
          speaker: "tim",
          text: "Nothing much to note but He and his girlfriend were screaming at each other the day. She stormed out with a suitcase. "
        },
        {
          speaker: "tim",
          text: "If money went missing, I'd check her before checking me. But what do I know?"
        }
      ],
      set: { cluesAdd: ["tim_heard_argument"] },
      choices: [
        { label: "What exactly did you hear?", next: "argument_detail" },
        { label: "Back to the thefts.", next: "baseline" },
        { label: "You didn't think to tell me this ealirer?", next: "tim_bait_round1" }
      ]
    },
    jane_info: {
      segments: [
        {
          speaker: "tim",
          text: "Jane is John's girlfriend, I think they've been living together for about four years"
        },
      ],
      choices: [
        { label: "What exactly did you hear?", next: "argument_detail" },
        { label: "Back to the thefts.", next: "baseline" }
      ]
    },

    argument_detail: {
      segments: [
        {
          speaker: "tim",
          text: "Something about bills or whatever I didn't listen in for very long"
        }
      ],
      choices: [
        { label: "Did you see anyone near John's place that day?", next: "tim_saw_anyone" },
        { label: "Return to your morning route.", next: "jogging_start" }
      ]
    },



    jogging_start: {
      segments: [
        {
          speaker: "tim",
          text: "I didn't see anything, now can you go already."
        }
      ],
      choices: [
        { label: "Your route passes Sam's walkway, right? Could you have seen Jim's wallet before Sam did?", next: "jogging_route_detail" },
        { label: "Could you have seen Jim's wallet before Sam did?", next: "maybe_saw_wallet" },
        { label: "Bait resp", next: "tim_bait_round1" }
      ]
    },




    maybe_saw_wallet: {
      segments: [
        {
          speaker: "tim",
          text: "Didn't see a thing. Maybe if you did a lap around the block you'd spot something yourself."
          //speaker: "tim",
          // text: "Go on, run little doggy."
        }
      ],
      set: { cluesAdd: ["tim_alibi"] },
      choices: [
        { label: "What can you tell me about John", next: "John" },
        { label: "What can you tell me about Jim", next: "Jim" },
        { label: "Any details on the robberies?", next: "" },
        { label: "bait resp", next: "tim_bait_round1" }
      ]
    },




    tim_bait_round1: {
      segments: [
        {
          speaker: "tim",
          text: "Careful, Detective. If you're trying to provoke me, it's working."
        }
      ],
      choices: [
        { label: "Just answer the question.", next: "tim_bait_round2" },
        { label: "What are you hiding, Tim?", next: "tim_nuke", onSelect: (s) => { s.flags.pissedOffTim = true; } }
      ]
    },


    tim_bait_round2: {
      segments: [
        {
          speaker: "tim",
          text: "You're pushing it. I don't tolerate disrespect—not from neighbors, and definitely not from cops."
        }
      ],
      choices: [
        { label: "Sorry. Let's restart.", next: "tim_reset" },
        { label: "You look guilty as hell.", next: "tim_nuke", onSelect: (s) => { s.flags.pissedOffTim = true; } }
      ]
    },


    tim_reset: {
      segments: [
        {
          speaker: "tim",
          text: "Hmph. Fine. One more chance. Don't waste it."
        }
      ],
      choices: [
        { label: "Back to the thefts.", next: "baseline" },
        { label: "Let's continue your route.", next: "jogging_start" }
      ]
    },


    tim_nuke: {
      segments: [
        {
          speaker: "tim",
          text: "We're done. Get off my porch."
        }
      ],
      end: true,
      onEnter: (s) => { s.flags.timHardShutdown = true; },
      choices: []
    },


    end: {
      segments: [
        {
          speaker: "tim",
          text: "If we're finished, close the gate on your way out."
        }
      ],
      end: true,
      choices: []
    }
  }
};


export default timDialogue;



