import $ from "jquery";

import { store } from "@src/store";
import { sleep } from "@utils/common";
import { addMessage } from "@src/store/actions";

function generateRandomInterval() {
    const { solveIntervalMax, solveIntervalMin } = store.USER_SETTINGS;

    let interval = Math.random() * solveIntervalMax;
    interval = interval < solveIntervalMin ? solveIntervalMin : interval;

    return interval;
}

function handleChoice(element: HTMLInputElement) {
    if (!element.checked) element.click();
}

function handleInput(element: Element, answerText: string) {
    $(element)
        .trigger("click")
        .trigger("focus")
        .trigger("keydown")
        .trigger("input");

    if (/input/i.test(element.tagName)) {
        var setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!
            .set;
        (setValue as Function).call(element, answerText);

        // myQuery(element).eventTrigger("input", { bubbles: true });
        var e = new Event("input", { bubbles: true });
        element.dispatchEvent(e);
    } else {
        (element as HTMLTextAreaElement).value = answerText;
    }

    $(element)
        .trigger("keyup")
        .trigger("change")
        .trigger("blur");
}

function getCurrentOptionOrder() {
    const optionList = [] as any[];
    const options = document.querySelectorAll(".sequence-pc-card--item-3CfJy div div div");
    for (const option of options) {
        optionList.push(option.textContent!.replace(".", ""));
    }
    return optionList;
}

function getProperty(ele: Element, prop: any) {
    return parseInt(getComputedStyle(ele)[prop]);
}

function eventTrigger(element: Element, event: string, init?: any) {
    const e = new Event(event, init);
    element.dispatchEvent(e);
}

function triggerMouseEvent(
    element: Element,
    mouseType: "mousemove" | "mousedown" | "mouseup",
    targetX: number,
    targetY: number,
) {
    const mouseEvent = document.createEvent("MouseEvents");
    mouseEvent.initMouseEvent(
        mouseType,
        true,
        true,
        window,
        0,
        targetX,
        targetY,
        targetX,
        targetY,
        false,
        false,
        false,
        false,
        0,
        null,
    );
    element.dispatchEvent(mouseEvent);
}

async function moveCardToTarget(from: Element, to: Element) {
    //点击from
    eventTrigger(from, "mousedown");
    //拖动from到to
    const targetX = getProperty(to, "left");
    const targetY = getProperty(to, "top");
    const targetWidth = getProperty(to, "width");
    const targetHeight = getProperty(to, "height");

    const sourceY = getProperty(from, "top");

    (from as HTMLElement).style.left = targetX + targetWidth + "px";
    (from as HTMLElement).style.top = targetY + targetHeight + "px";

    // eventTrigger(from, "mousemove");
    for (let i = 0; i < 100; i += (targetY - sourceY) / 100) {
        triggerMouseEvent(
            from,
            "mousemove",
            targetX + targetWidth,
            targetY + (targetY - sourceY) / 100,
        );
    }

    //等待1秒
    await sleep(1000);
    //松开鼠标
    eventTrigger(from, "mouseup");
}

function autoNext(selector: string, classFlag: string, switchLevel: number) {
    let flag = false;
    for (let [index, unit] of document.querySelectorAll(selector).entries()) {
        if (flag) {
            (unit as HTMLElement).click();
            flag = false;
            break;
        }
        if (unit.classList.contains(classFlag)) {
            flag = true;
        }
    }
}

export async function solveQuestions(questionType: string, answers: string[]) {
    const inputOnPaper = document.querySelectorAll('input[class^="fill-blank--bc-input"]');
    const inputOnPaper3 = document.querySelectorAll('input[class^="cloze-text-pc--bc-input"]');
    const textareaOnPaper = document.querySelectorAll('textarea[class^="writing--textarea"]');
    const textareaOnPaper2 = document.querySelectorAll('div[class^="cloze-text-pc--fill-blank"]');
    const sentencesToReadRecordButtons = document.querySelectorAll(
        ".sentencesToRead--record-circle-player-1ADLj",
    );

    for (const [questionIndex, answerText] of answers.entries()) {
        await sleep(generateRandomInterval());

        switch (questionType) {
            case "singleChoice":
                const optionIndex = answerText.toUpperCase().charCodeAt(0) - 65;
                handleChoice(
                    document.querySelectorAll(`[name=single-${questionIndex + 1}]`)[
                        optionIndex
                    ] as HTMLInputElement,
                );
                break;

            case "multiChoice":
                for (const option of answerText) {
                    const optionIndex = option.toUpperCase().charCodeAt(0) - 65;
                    handleChoice(
                        document.querySelectorAll(`[name=multichoice-${questionIndex + 1}]`)[
                            optionIndex
                        ] as HTMLInputElement,
                    );
                }
                break;

            case "input1":
            case "input2":
                handleInput(inputOnPaper[questionIndex], answerText);
                break;

            case "input3":
                handleInput(inputOnPaper3[questionIndex], answerText);
                break;

            case "textarea":
                handleInput(textareaOnPaper[questionIndex], answerText);
                break;

            case "textarea2":
                handleInput(
                    textareaOnPaper2[questionIndex].firstElementChild as Element,
                    answerText,
                );
                break;

            case "sequence":
                const cardSelector = ".sequence-pc-card--item-3CfJy div div div";
                const optionList = getCurrentOptionOrder();

                if (answerText !== optionList[questionIndex]) {
                    let targetOptionIndex = 99;
                    for (const [index, currentOption] of optionList.entries()) {
                        if (currentOption === answerText) {
                            targetOptionIndex = index;
                        }
                    }

                    const fromElement = document.querySelectorAll(cardSelector)[targetOptionIndex];
                    const toElement = document.querySelectorAll(cardSelector)[questionIndex];
                    console.log(fromElement, toElement);

                    moveCardToTarget(fromElement, toElement);
                }

                break;

            case "sentencesToRead":
                // const recordButton = sentencesToReadRecordButtons[questionIndex] as HTMLElement;

                // //todo 需要dispatch click event来触发点击事件，因为svg元素上并没有click方法
                // //todo 直接在svg上dispatch似乎并没有什么效果
                // recordButton.click();
                // await sleep(2000);
                // recordButton.click();

                break;

            default:
                addMessage("此题型尚未实现自动答题，请在Github的Issue中反馈", "error");
                addMessage(`${questionType}`, "error");
                break;
        }
    }

    // let submitButton, nextButton;
    // const buttons = document.querySelectorAll(
    //     ".submit-bar-pc--control-btn-3MI5V button",
    // ) as NodeListOf<HTMLButtonElement>;

    // for (const button of buttons) {
    //     if (button.textContent == "提交") submitButton = button;
    //     if (button.textContent == "下一题") nextButton = button;
    // }

    // if (nextButton) {
    //     nextButton.click();
    //     return;
    // }

    // if (submitButton) {
    //     submitButton.click();
    // }

    // try {
    //     //只记录第一次提交的成绩
    //     await sleep(2000);
    //     const confirmButton = document.querySelector(
    //         "body > div > div > div:nth-child(1) > div > div > div:nth-child(3) > div:nth-child(1) > button",
    //     ) as HTMLButtonElement;
    //     if (confirmButton) confirmButton.click();
    // } catch {}

    // try {
    //     //继续学习
    //     await sleep(2000);
    //     const alertButtons = document.querySelectorAll(
    //         "body > div > div > div > div > div > div > div > button > div > div > span",
    //     ) as NodeListOf<HTMLSpanElement>;
    //     for (const button of alertButtons) {
    //         if (button.textContent === "查看答案") button.click();
    //     }
    // } catch {}

    // try {
    //     autoNext(".layoutHeaderStyle--circleTabsBox-jQdMo a", "selected", 3);
    //     autoNext("#header .TabsBox li", "active", 2);
    //     autoNext("#sidemenu li.group", "active", 1);
    // } catch {}
}
