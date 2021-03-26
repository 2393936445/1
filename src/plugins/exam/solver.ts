import { QUERY_INTERVAL } from "@src/store";
import { sleep, chunk, getPosition } from "@src/utils/common";

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

export async function solveUnitTest(questions: UnitTestAnswer[]) {
    for (const question of questions) {
        const { questionId, questionType, answers } = question;

        const isInput = getPosition(questionType, 4) === 1;
        const hasSubQuestion = getPosition(questionType, 3) === 1;

        const subElements = document.querySelectorAll(`.main [qid="${questionId}"]`) as NodeListOf<
            HTMLInputElement
        >;

        if (isInput) {
            //填空题
            for (const [index, subElement] of subElements.entries()) {
                await sleep(QUERY_INTERVAL); // 保持和addMessage的同步
                await sleep(generateRandomInterval());

                solveBlank(subElement, answers[index]);
            }
        } else {
            //选择题
            const optionLength = subElements.length / answers.length;

            const groupedOptions = chunk(subElements, optionLength);

            for (const [subQuestionIndex, subElements] of groupedOptions.entries()) {
                await sleep(QUERY_INTERVAL);
                await sleep(generateRandomInterval());

                const answer = answers[subQuestionIndex];

                for (const subElement of subElements) {
                    const optionText = subElement.parentElement!.textContent as string;

                    // 当选项为斜体时，<li>
                    // answer中包含<li>标签，而textContent中并不包含
                    if (optionText.includes(answer.replace(/<.*?>/g, ""))) {
                        subElement.click();
                        break;
                    }
                }
            }
        }
    }
}
