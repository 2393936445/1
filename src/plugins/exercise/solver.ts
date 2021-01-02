import * as $ from "jquery";

import { Global } from "@src/global";
import { sleep, addMessage } from "@utils/common";

function generateRandomInterval() {
    let interval = Math.random() * Global.USER_SETTINGS.solveIntervalMax;
    interval =
        interval < Global.USER_SETTINGS.solveIntervalMin
            ? Global.USER_SETTINGS.solveIntervalMin
            : interval;
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

export async function solveQuestions(questionType: string, answers: string[]) {
    const inputOnPaper = document.querySelectorAll('input[class^="fill-blank--bc-input"]');
    const inputOnPaper3 = document.querySelectorAll('input[class^="cloze-text-pc--bc-input"]');
    const textareaOnPaper = document.querySelectorAll('textarea[class^="writing--textarea"]');
    const textareaOnPaper2 = document.querySelectorAll('div[class^="cloze-text-pc--fill-blank"]');

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

            default:
                addMessage("此题型尚未实现自动答题，请在Github的Issue中反馈", "error");
                addMessage(`${questionType}`, "error");
                break;
        }
    }
}
