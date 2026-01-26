const aceDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                { speaker: "ace", text: "Detective {{playerName}}, are you ready to go?" },
                { speaker: "", text: "If you say YES, you'll start the investigation and won’t be able to return to the police department." },
            ],
            choices: [
                { label: "Yes", next: "start_investigation" },
                { label: "Not yet.", next: "end_01" },
            ]
        },
        start_investigation: {
             set: { flagsAdd: ["started_investigation"] },
            segments: [
                { speaker: "ace", text: "Okay good luck." },
            ],
            onEnter: (state) => {
                state.flags.add("cutscene_leave_pd");
            },
            choices: [
                { label: "continue", next: "" },
            ]
        },

        end_01: {
            segments: [
            ],
            end: true,

            choices: []
        },
    }
};

export default aceDialogue;
