import { Global } from "@src/global";
import { addMessage, authenticate } from "@utils/common";

import { parseAnswers } from "./parser";
import { solveQuestions } from "./solver";

async function outputAnswers(answers: string[]) {
    let index = 1;
    for (const answer of answers) {
        //因为答案的显示与答题被分离，所以要同步答案的输出和答题，还得另写一套，算了
        // if (Global.USER_SETTINGS.autoSolveNormal) {
        //     await sleep(Global.USER_SETTINGS.solveInterval);
        // }

        addMessage(`${String(index).padStart(2, "0")}、${answer}`);

        index++;
    }
}

export async function handleQuestions(encryptedJson: EncryptedJson) {
    let continueFlag = false;
    if (process.env.LITE) {
        continueFlag = true;
    } else {
        continueFlag = await authenticate();
    }

    if (continueFlag) {
        const { questionType, answers } = parseAnswers(encryptedJson);

        Global.messages = [];
        console.log(answers);
        outputAnswers(answers);

        if (Global.USER_SETTINGS.autoSolveNormal && questionType !== "debug") {
            solveQuestions(questionType, answers);
        }
    }
}
