import { Requests } from "@utils/requests";
import { store, actions, QUERY_INTERVAL } from "@src/store";
import { authenticate, sleep } from "@utils/common";

import { solveUnitTest } from "./solver";

const { addMessage, clearMessage } = actions;

export function generateRandomInterval() {
    const { solveIntervalMaxTest, solveIntervalMinTest } = store.USER_SETTINGS;

    let interval = Math.random() * solveIntervalMaxTest;
    interval = interval < solveIntervalMinTest ? solveIntervalMinTest : interval;

    return interval;
}

function getQuestionIds() {
    const buffer = new Set<string>();
    for (const question of document.querySelectorAll("#datika [qid]")) {
        buffer.add(question.getAttribute("qid") as string);
    }
    return buffer;
}

export async function handleUnitTest() {
    if (location.href.includes("uexercise.unipus.cn/uexercise/api/v2/enter_unit_test")) {
        if (process.env.LITE) {
            clearMessage();
            addMessage("请前往Github或者Chrome网上应用店安装完整版本", "error");
            return;
        }

        if (!(await authenticate())) return;

        let index = 1;
        const token = await Requests.getToken();
        for (const questionId of getQuestionIds()) {
            const answers = await Requests.getUnitTestAnswers(questionId, token);

            if (store.USER_SETTINGS.autoSolveTest) {
                solveUnitTest(answers);
            }

            for (const question of answers) {
                for (const answer of question.answers) {
                    await sleep(QUERY_INTERVAL);

                    addMessage(`${String(index).padStart(2, "0")}、${answer}`);

                    index++;
                }
            }
        }
    }
}

export async function handleExerciseExam() {
    const url = window.location.href;
    if (
        url.includes("uexercise.unipus.cn/uexercise/api/v1/enter_exercise_exam") ||
        url.includes("uexercise.unipus.cn/uexercise/api/v1/enter_check_student_exam_detail?")
    ) {
        if (process.env.LITE) {
            clearMessage();
            addMessage("请前往Github或者Chrome网上应用店安装完整版本", "error");
            return;
        }

        if (!(await authenticate())) return;

        let index = 1;
        const token = await Requests.getToken();
        for (const questionId of getQuestionIds()) {
            const answers = await Requests.getClassTestAnswers(questionId, token);

            if (store.USER_SETTINGS.autoSolveTest) {
                solveUnitTest(answers);
            }

            for (const question of answers) {
                for (const answer of question.answers) {
                    await sleep(QUERY_INTERVAL);

                    addMessage(`${String(index).padStart(2, "0")}、${answer}`);

                    index++;
                }
            }
        }
    }
}
