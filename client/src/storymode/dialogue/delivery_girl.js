const deliveryDialogue = {
    start: "intro",

    nodes: {
        intro: {
            segments: [
                { speaker: "delivery_girl", text: "thank you for helping me before detective.", voice: "intro" },
            ],
            choices: [
                {
                    label: "We solved the case!",
                    next: "good",
                    requires: { flagsAll: ["BobbyGood"] }
                },
                {
                    label: "We didn't solve the case yet",
                    next: "bad",
                    requires: { flagsAll: ["BobbyDirty"] }
                },
                { label: "[Leave]", next: "end" },
            ],
        },
        bad: {
            segments: [
                { speaker: "delivery_girl", text: "Well that sucks, I'll keep a lookout from now on for any new information.", voice: "bad" },
            ],
            choices: [
              { label: "[Leave]", next: "end" },
            ],
        },
        good: {
            segments: [
                { speaker: "delivery_girl", text: "That's great, I'm glad to hear it.", voice: "good" },
            ],
            choices: [
               { label: "[Leave]", next: "end" },
            ],
        },
        end: {
            segments: [],
            end: true,
            choices: [],
        },
    },
};

export default deliveryDialogue;
