import { store, actions } from "@src/store";
import { parseAnswers } from "./parser";
import { solveQuestions } from "./solver";

const { addMessage, clearMessage } = actions;

async function outputAnswers(answers: string[], debug = false) {
    let index = 1;
    for (const answer of answers) {
        //因为答案的显示与答题被分离，所以要同步答案的输出和答题，还得另写一套，算了
        // if (Global.USER_SETTINGS.autoSolveNormal) {
        //     await sleep(Global.USER_SETTINGS.solveInterval);
        // }

        const prefix = `${String(index).padStart(2, "0")}、`;

        addMessage(`${debug ? "" : prefix}${answer}`);

        index++;
    }
}

export async function handleQuestions(encryptedJson: EncryptedJson) {
    const { questionType, answers } = parseAnswers(encryptedJson);

    const isDebug = questionType === "debug";

    console.log(answers);

    clearMessage();
    outputAnswers(answers, isDebug);

    // if (Global.USER_SETTINGS.autoSolveNormal && questionType !== "debug") {
    if (store.USER_SETTINGS.autoSolveNormal) {
        if (!isDebug) {
            await solveQuestions(questionType, answers);
        }
    }
    // }
}
