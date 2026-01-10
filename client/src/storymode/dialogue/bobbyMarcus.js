const bobbyMarcusDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "Bobby",
                    text: "...",
                }
            ],
            choices: [
                { label: "Hello?", next: "cant_speak" },
                { label: "[Leave]", next: "Hello?" },
            ]
        },

        cant_speak: {
            segments: [
                {
                    speaker: "Bobby",
                    text: "Um- sorry they said I couldn't speak to you",
                    voice: "intro_01",
                }
            ],
            choices: [
                { label: "Who did?", next: "who" },
                { label: "Okay I understand", next: "end" },
            ]
        },
        who: {
            segments: [
                {
                    speaker: "bobby",
                    text: "Detective Marcus did",
                    voice: "who",
                },
                {
                    speaker: "bobby",
                    text: "He gave me a briefing and everything.",
                    voice: "lying_02",
                },
            ],
            choices: [
                { label: "Who did?", next: "lying" },
                { label: "Okay I'll go", next: "late_leave" },
            ]
        },
        lying: {
            segments: [
                {
                    speaker: "bobby",
                    text: "No, I'm not lying I swear ask him yourself.",
                    voice: "lying_01",
                },
                {
                    speaker: "marcus",
                    text: "Detective Bobby!",
                    voice: "marcus_entrance_01",
                },
                {
                    speaker: "bobby",
                    text: "Great. Just great.",
                    voice: "marcus_appers",
                },
                {
                    speaker: "marcus",
                    text: "I thought I told you not to speak with him.",
                    voice: "marcus_entrance_02",
                },
                {
                    speaker: "bobby",
                    text: "I know but-",
                    voice: "rep",
                },
                {
                    speaker: "marcus",
                    text: "No buts! Just go!",
                    voice: "marcus_entrance_03",
                },
                {
                    speaker: "bobby",
                    text: "Okay.",
                    voice: "leaves",
                },
            ],
            choices: [
                { label: "Overreation huh?", next: "overreacted" },
                { label: "What did you tell him", next: "explanation" },
                { label: "[Leave]", next: "end" },
            ]
        },
        late_leave: {
            segments: [
                {
                    speaker: "bobby",
                    text: "PLease just leave me be, I don't want to lose my job.",
                    voice: "lying_01",
                },
                {
                    speaker: "marcus",
                    text: "Detective Bobby!",
                    voice: "marcus_entrance_01",
                },
                {
                    speaker: "bobby",
                    text: "Great. Just great.",
                    voice: "marcus_appers",
                },
                {
                    speaker: "marcus",
                    text: "I thought I told you not to speak with him.",
                    voice: "marcus_entrance_02",
                },
                {
                    speaker: "bobby",
                    text: "I know but-",
                    voice: "rep",
                },
                {
                    speaker: "marcus",
                    text: "No buts! Just go!",
                    voice: "marcus_entrance_03",
                },
                {
                    speaker: "bobby",
                    text: "Okay.",
                    voice: "leaves",
                },
            ],
            choices: [
                { label: "Overreation huh?", next: "overreacted" },
                { label: "What did you tell him", next: "explanation" },
                { label: "taunted", next: "taunted" },
                { label: "[Leave]", next: "end" },
            ]
        },
        overreacted: {
            segments: [
                {
                    speaker: "marcus",
                    text: "No, I'm not over reacting.",
                    voice: "overreact_01",
                },
                {
                    speaker: "marcus",
                    text: "I've seen what happens to rookies who learn your way.",
                    voice: "overreact_02",
                },
                {
                    speaker: "marcus",
                    text: "And I won't be having it with Bobby so just stay away from him.",
                    voice: "overreact_03",
                },

            ],
            choices: [
                { label: "What did you tell him", next: "explanation" },
                { label: "taunted", next: "taunted" },
                { label: "[Leave]", next: "end" },
            ]
        },
        taunted: {
            segments: [
                {
                    speaker: "marcus",
                    text: "See! This is exactly what I'm talking about, no respect at all.",
                    voice: "taunted_01",
                },
                {
                    speaker: "marcus",
                    text: "If I was the lieutenant I would have fired you months ago. People like you give cops a bad name.",
                    voice: "taunted_02",
                },
            ],
            choices: [
                { label: "Overreation huh?", next: "overreacted" },
                { label: "What did you tell him", next: "explanation" },
                { label: "taunted to mad end", next: "mad_end" },
                { label: "[Leave]", next: "end" },
            ]
        },
        explanation: {
            segments: [
                {
                    speaker: "marcus",
                    text: "I told him nothing good will come from hanging out with the likes of you.",
                    voice: "taunted_01",
                },
                {
                    speaker: "marcus",
                    text: " I wouldn't want him picking up any bad habits.",
                    voice: "taunted_02",
                },
            ],
            choices: [
                { label: "Overreation huh?", next: "overreacted" },
                { label: "taunted", next: "taunted" },
                { label: "[Leave]", next: "end" },
            ]
        },
        mad_end: {
            segments: [
                {
                    speaker: "marcus",
                    text: "You get things- No. im done with this. Thread very carefully detective.",
                    voice: "mad_end",
                },
            ],
            choices: [
            ]
        },
        end: {
            segments: [
                {
                    speaker: "marcus",
                    text: "Good riddance. And stay away from Bobby!",
                    voice: "end",
                },

            ],
            choices: []
        }
    }
};

export default bobbyMarcusDialogue;
