import { Requests } from "@utils/requests";
import { Global, QUERY_INTERVAL } from "@src/global";
import { addMessage, authenticate, sleep } from "@utils/common";

import { solveUnitTest } from "./solver";

export function generateRandomInterval() {
    let interval = Math.random() * Global.USER_SETTINGS.solveIntervalMaxTest;
    interval =
        interval < Global.USER_SETTINGS.solveIntervalMinTest
            ? Global.USER_SETTINGS.solveIntervalMinTest
            : interval;
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
            Global.messages = [];
            addMessage("请前往Github或者Chrome网上应用店安装完整版本", "error");
            return;
        }
        if (!(await authenticate())) return;

        let index = 1;
        const token = await Requests.getToken();
        for (const questionId of getQuestionIds()) {
            const answers = await Requests.getUnitTestAnswers(questionId, token);

            for (const question of answers) {
                for (const answer of question.answers) {
                    await sleep(QUERY_INTERVAL);

                    addMessage(`${String(index).padStart(2, "0")}、${answer}`);

                    if (Global.USER_SETTINGS.autoSolveTest) {
                        solveUnitTest([question]);
                    }

                    index++;
                }
            }
        }
    }
}

export function handleExerciseExam() {
    const url = window.location.href;
    if (
        url.includes("uexercise.unipus.cn/uexercise/api/v1/enter_exercise_exam") ||
        url.includes("uexercise.unipus.cn/uexercise/api/v1/enter_check_student_exam_detail?")
    ) {
        Requests.getClassTestAnswers(new Set());
    }
}

// export function smoothAlert() {
//     let button = document.querySelector("#pageLayout div.main button") as HTMLElement;
//     if (button !== null && button.textContent === "开始做题") {
//         swal("温馨提示", "请耐心等待【开始做题】 变为：【载入完成 点击进入】", "warning");
//         let now_course = (document.querySelector("#header ul") as HTMLElement).innerText.split(
//             "\n",
//         );
//         console.log("课程名：", now_course);
//         button.innerText = "载入完成\n 点击进入";
//     }
// }
