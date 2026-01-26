const johnTimDialogue = {
    start: "scene_start",

    nodes: {
        scene_start: {
            set: {
                cluesAdd: ["clue_tim_and_john_argument"],
            },
            segments: [
                { speaker: "john", text: "Will you just leave me alone already?", voice: "tim_agure_01" },
                { speaker: "tim", text: "Come on just tell me what happened man.", voice: "john_agure_01" },
                { speaker: "tim", text: "Did she leave you because your broke", voice: "john_agure_02" },
                { speaker: "john", text: "For the last time, Tim back off!", voice: "tim_agure_02" },
                { speaker: "tim", text: "I'm not leaving until I get some answers!", voice: "john_agure_03" },
                {
                    speaker: "john",
                    text: "oh, look the detectives here, please get Tim out of here.",
                    voice: "tim_agure_03"
                },
                {
                    speaker: "tim",
                    text: "What? He's just mad that his girlfriend left him. I'm asking a pretty valid question.",
                    voice: "john_agure_04"
                },
            ],
            choices: [
                {
                    label: "tim. What are you even doing here?",
                    next: "tim_investigation_01",
                },
                {
                    label: "I talked to Jane.",
                    next: "jane_reveal_with_tim",
                },
            ],
        },

        jane_reveal_with_tim: {
            set: { flagsAdd: ["reveal_with_tim"] },
            segments: [
                { speaker: "john", text: "What!? You talked to Jane!?", voice: "talked_to_Jane" },
                {
                    speaker: "tim",
                    text: "I think he's trying to steal your girl.",
                    voice: "reveal_01"
                },
                {
                    speaker: "tim",
                    text: "So what happens next officer",
                    voice: "reveal_02"
                },
                { speaker: "john", text: "I'm not trying to answer not of your questions! Will you get this guy out of here!?", voice: "reveal_03" },
                {
                    speaker: "tim",
                    text: "I don't have to go anywhere I'm not breaking any laws",
                    voice: "no_leave"
                },
                {
                    speaker: "tim",
                    text: "{{playerName}} since you've been taking so long with your investigation I decided to do it for you",
                    voice: "investigation_01"
                },
                { speaker: "tim", text: "Would you like to see my findings", voice: "investigation_02" },
            ],
            choices: [
                {
                    label: "Yes",
                    next: "tim_investigation_02",
                }, {
                    label: "No",
                    next: "tim_investigation_02",
                },
            ],
        },

        tim_investigation_01: {
            segments: [
                {
                    speaker: "tim",
                    text: "since you've been taking so long with your investigation I decided to do it for you",
                    voice: "investigation_01"
                },
                { speaker: "tim", text: "Would you like to see my findings", voice: "investigation_02" },
            ],
            choices: [
                {
                    label: "Yes",
                    next: "tim_investigation_02",
                }, {
                    label: "No",
                    next: "tim_investigation_02",
                },
            ],
        },

        tim_investigation_02: {
            segments: [
                {
                    speaker: "tim",
                    text: "Doesn't matter I'm telling you anyway whether you like it or not.",
                    voice: "investigation_07"
                },
                {
                    speaker: "john",
                    text: "Great",
                    voice: "great"
                },
                {
                    speaker: "tim",
                    text: "You should keep your eyes on your partner Hayes. He’s been acting real suspicious as of late.",
                    voice: "investigation_03"
                },
                {
                    speaker: "tim",
                    text: "Let's just say I saw him poking around Jim and Donna’s house earlier.",
                    voice: "investigation_04"
                },
                {
                    speaker: "tim",
                    text: "could be nothing but it seems of a cover up to me",
                    voice: "investigation_05"
                },
                {
                    speaker: "john",
                    text: "What was he doing",
                    voice: "tim_investigation_01"
                },
                {
                    speaker: "tim",
                    text: "Hm, who knows he also seemed pretty nervous to me.",
                    voice: "investigation_06"
                },
                { speaker: "tim", text: "just keep an eye on him.", voice: "investigation_08" },


            ],

            choices: [
                {
                    label: "Time to go Tim",
                    next: "tim_exit",
                },
            ],

        },

        tim_exit: {
            onEnter: (state) => {
                state.flags.add("cutscene_tim_leaves");
            },
            segments: [
                { speaker: "john", text: "Yes, get him out of here detective", voice: "tim_exit" },
                { speaker: "tim", text: "Fine, fine I'm going", voice: "leaves" },
            ],
            choices: [
                {
                    label: "[continue]",
                    next: "invest_start",
                    requires: { notFlags: ["reveal_with_tim"] },
                },
                {
                    label: "[continue]",
                    next: "john_invest_02",
                    requires: { flagsAll: ["reveal_with_tim"] },
                },
            ],
        },
        invest_start: {
            segments: [
                { text: "(Tim leaves)" },
                { speaker: "john", text: "So what did you want to tell me." },
            ],
            choices: [
                {
                    label: "I talked to Jane",
                    next: "john_invest_01",
                },
                {
                    label: "Nevermind",
                    next: "end",
                },
            ],
        },

        john_invest_01: {
            segments: [
                { speaker: "john", text: "What!? You talked to Jane!?", voice: "talked_to_Jane" },
                { speaker: "john", text: "Now why would you go on to do something like that. I don't like how you keep poking your noise into my business", voice: "talked_jane_01" },
                { speaker: "john", text: "This clearly has nothing to do with your investigation I would even argue that this isn’t even legal.", voice: "talked_jane_02" },
                { speaker: "john", text: "Will you at least tell me where she is", voice: "talked_jane_03" },
            ],
            choices: [
                {
                    label: "She's at the bar",
                    next: "question_menu",
                },
                {
                    label: "No I won't",
                    next: "no_tell_01",
                },
            ],
        },
        john_invest_02: {
            segments: [
                { text: "(Tim leaves)" },
                { speaker: "john", text: "So you talked to Jane huh.", voice: "talked_jane_04"  },
                { speaker: "john", text: "Now why would you go on to do something like that. I don't like how you keep poking your noise into my business", voice: "talked_jane_01" },
                { speaker: "john", text: "This clearly has nothing to do with your investigation I would even argue that this isn’t even legal.", voice: "talked_jane_02" },
                { speaker: "john", text: "Will you at least tell me where she is", voice: "talked_jane_03" },
            ],
            choices: [
                {
                    label: "She's at the bar",
                    next: "question_menu",
                },
                {
                    label: "No I won't",
                    next: "no_tell_01",
                },
            ],
        },
        question_menu: {
            segments: [
                { speaker: "john", text: "..." },
                { speaker: "john", text: "Whatever, you get one question.", voice: "question_menu" },
            ],
            choices: [
                {
                    label: "I know about your gambling John.",
                    next: "gamble",
                },
                {
                    label: "bartender said you weren't there that night",
                    next: "bar",
                },
            ],
        },
        no_tell_01: {
            segments: [
                { speaker: "john", text: "Well, then we have nothing to talk about.", voice: "wont_tell" },
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },
        return_visit: {
            segments: [
                { speaker: "john", text: "You ready to tell me where Jane is?", voice: "return_no_tell" },
            ],
            choices: [{
                label: "She's at the bar",
                next: "question_menu",
            },
            {
                label: "No I won't",
                next: "no_tell_01",
            },]
        },
        bar: {
            segments: [
                { speaker: "john", text: "That hardly proves anything, he sees plenty of people daily he probably just forgot I was there that night.", voice: "bar_01" },
                { speaker: "john", text: "Thats enough for me detective this interview is over", voice: "invest_end" },
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },
        gamble: {
            segments: [
                { speaker: "john", text: "Gambling huh? (laughs) is that what she told you, officer she is a liar", voice: "gamble_01" },
                { speaker: "john", text: "All I did is have a few drinks and got robbed, Jane is just over reacting like usual", voice: "gamble_02" },
                { speaker: "john", text: "You said she was at the bar right? Officer are you really going to trust a drunk over my word.", voice: "gamble_03" },
                { speaker: "john", text: "Thats enough for me detective this interview is over", voice: "invest_end" },
            ],
            choices: [{ label: "[End conversation]", next: "end" },]
        },
        end: {
            segments: [],
            end: true,
            choices: [],
        },
    },
};

export default johnTimDialogue;
