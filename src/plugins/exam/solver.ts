import { sleep } from "@src/utils/common";

import { generateRandomInterval } from "./main";

function solveBlank(element: HTMLInputElement, answer: string) {
    $(element)
        .trigger("click")
        .trigger("focus")
        .trigger("keydown")
        .trigger("input");

    element.value = answer.split("|")[0];
    const e = new Event("input", { bubbles: true });
    element.dispatchEvent(e);

    $(element)
        .trigger("keyup")
        .trigger("change")
        .trigger("blur");
}

export async function solveUnitTest(answers: UnitTestAnswer[]) {
    for (const question of answers) {
        //todo 更方便的，取千位数字和百味数字的方法
        const isInput = String(question.questionType)[0] === "1" ? true : false;
        const hasSubQuestion = String(question.questionType)[1] === "1" ? true : false;

        const subElements = document.querySelectorAll(
            `.main [qid="${question.questionId}"]`,
        ) as NodeListOf<HTMLInputElement>;
        if (isInput) {
            //填空题
            for (const [index, subElement] of subElements.entries()) {
                await sleep(generateRandomInterval());

                solveBlank(subElement, question.answers[index]);
            }
        } else {
            //选择题
            if (hasSubQuestion) {
                const optionLength = subElements.length / question.answers.length;
                let subQuestionIndex = 0;

                for (const [index, subElement] of subElements.entries()) {
                    const optionText = subElement.parentElement!.textContent as string;
                    const answer = question.answers[subQuestionIndex];

                    if (index === (subQuestionIndex + 1) * optionLength - 1) {
                        subQuestionIndex++;
                    }

                    if (optionText.includes(answer)) {
                        subElement.click();
                        break;
                    }
                }
            } else {
                for (const [index, subElement] of subElements.entries()) {
                    const optionText = subElement.parentElement!.textContent as string;
                    const answer = question.answers[0];

                    if (optionText.includes(answer)) {
                        subElement.click();
                    }
                }
            }
        }
    }
}
