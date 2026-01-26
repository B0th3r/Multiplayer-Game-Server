const flower_promoterDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                {
                    speaker: "flower_promoter",
                    text: "Hey, come in to the flower shop.",
                    voice: "intro"
                }
            ],
            choices: [
                { label: "Where is it", next: "where" },
                { label: "I don't like flowers", next: "rude" }

            ]
        },

        rude: {
            segments: [
                {
                    speaker: "flower_promoter",
                    text: "How rude!",
                    voice: "rude"
                }
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },
        where: {
            segments: [
                {
                    speaker: "flower_promoter",
                    text: "Yeah just right through these doors.",
                    voice: "where",
                }
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },
        end: {
            segments: [
            ],
            end: true,
            choices: []
        }
    }
};


export default flower_promoterDialogue;



