// import { actions } from "@src/store";
import { addMessage, clearMessage } from "@src/store/actions";
import Communication from "./bridge";
import { Requests } from "./requests";

// const { addMessage, clearMessage } = actions;
// webpack编译后有循环引用的问题，必须直接从/actions中导入

export const injectToContent = process.env.CRX
    ? new Communication("client", "inject", "content")
    : ({} as Communication);

export function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getProperty(ele: HTMLElement, prop: any) {
    return parseInt(window.getComputedStyle(ele)[prop], 10);
}

/**实现拖动，带边界检测*/
export function makeDraggable(handle: HTMLElement, container: HTMLElement) {
    let draggable = false,
        pastX: number,
        pastY: number,
        containerLeft: number,
        containerTop: number,
        containerWidth: number,
        containerHeight: number,
        windowWidth: number,
        windowHeight: number;

    handle.addEventListener(
        "mousedown",
        (e) => {
            handle.style.cursor = "grabbing";
            draggable = true;

            pastX = e.clientX;
            pastY = e.clientY;

            containerLeft = getProperty(container, "left");
            containerTop = getProperty(container, "top");
            containerWidth = getProperty(container, "width");
            containerHeight = getProperty(container, "height");

            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
        },
        false,
    );

    document.addEventListener("mousemove", (e) => {
        if (draggable === true) {
            let currentX = e.clientX,
                currentY = e.clientY,
                diffX = currentX - pastX,
                diffY = currentY - pastY;

            let targetX = containerLeft + diffX;
            let targetY = containerTop + diffY;

            if (targetX <= 0) targetX = 0;
            if (targetY <= 0) targetY = 0;
            if (targetX >= windowWidth - containerWidth) targetX = windowWidth - containerWidth;
            if (targetY >= windowHeight - containerHeight) targetY = windowHeight - containerHeight;

            container.style.left = targetX + "px";
            container.style.top = targetY + "px";
        }
    });

    handle.addEventListener(
        "mouseup",
        () => {
            handle.style.cursor = "grab";
            draggable = false;

            containerLeft = getProperty(container, "left");
            containerTop = getProperty(container, "top");
        },
        false,
    );

    //防止意外未退出拖动状态
    document.body.addEventListener(
        "keydown",
        (e) => {
            if (e.key === "Escape") {
                handle.style.cursor = "grab";
                draggable = false;

                containerLeft = getProperty(container, "left");
                containerTop = getProperty(container, "top");
            }
        },
        false,
    );
}

/** 通过装饰器，实现请求失败时，输出定制化的提示信息
 *
 * 如果不对request进行装饰器包裹，异常直接输出至console
 *
 * 如果使用了装饰器，但是未提供message，输出默认值
 */
export function requestErrorHandler(message: string = "请求异常，稍后再试", originError = false) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]) {
            const result = originalMethod.apply(this, args);
            result.catch((error: Error) => {
                addMessage(`${originError ? error : message}`, "error");
            });
            return result;
        };

        return descriptor;
    };
}

/**调用GM_setValue或者chrome.storage
 *
 * 如果调用的是GM_setValue，会对value进行JSON.stringify */
export async function setValue(key: string, value: any) {
    typeof GM_setValue === "function" || function GM_setValue() {};

    if (process.env.CRX) {
        await injectToContent.request({
            type: "setValue",
            key: key,
            value: value,
        });
    } else {
        GM_setValue(key, JSON.stringify(value));
    }
}

/**调用GM_getValue或者chrome.storage
 *
 * 如果调用的是GM_getValue，返回JSON.parse后的结果 */
export async function getValue(key: string, defaultValue?: any) {
    typeof GM_getValue === "function" || function GM_getValue() {};

    let returnValue: any;
    if (process.env.CRX) {
        returnValue = await injectToContent.request({
            type: "getValue",
            key: key,
            defaultValue: defaultValue,
        });

        console.error(returnValue);
    } else {
        const temp = GM_getValue(key, defaultValue);
        try {
            returnValue = JSON.parse(temp);
        } catch (error) {
            returnValue = temp;
        }
    }
    return returnValue;
}

/**针对带数字索引的答案 */
export async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text.replace(/^.*、/, ""));
}

/**格式化单元测试接口返回的html格式答案 */
export function clearHtmlTagAndSplit(text: string) {
    return text.split(/<(?:br|hr) *\/?>/).map((answer) => {
        let buffer = answer.replace(/<.*?>/g, "").replace(/&nbsp;/g, "");

        const temp = buffer.split(/:/);

        if (temp.length === 2) {
            const [index, answerText] = temp;
            const realIndex = index.padStart(2, "0");
            buffer = `${realIndex}、${answerText}`;
        }

        return buffer;
    });
}

interface OpenIdStatus {
    [openId: string]: boolean;
}

export async function authenticate() {
    const openId = await Requests.getOpenId();
    let openIdStatus: OpenIdStatus = await getValue("openIdStatus", {});

    if (openIdStatus[openId]) {
        //如果已经认证通过
        return true;
    } else {
        const isExistUseReturnJson = await Requests.isExistUser();
        if (isExistUseReturnJson.status) {
            //认证成功
            openIdStatus[openId] = true;
            await setValue("openIdStatus", openIdStatus);
            return true;
        } else {
            //认证失败
            clearMessage();
            addMessage(`${isExistUseReturnJson.message}`, "info");
            return false;
        }
    }
}

export function chunk<T>(iterable: Iterable<T>, size: number) {
    return Array.from(iterable).reduce((prev: T[][], current) => {
        const lastChunk = prev.slice(-1)[0];

        // 第一次执行时,lastChunk为undefined
        const currentLength = lastChunk?.length;

        // 之后当满size时，新建
        if (prev.length === 0 || currentLength % size === 0) {
            prev.push([current]);
        } else {
            // 0 % size也 < size
            if (currentLength % size < size) {
                lastChunk.push(current);
            }
        }

        return prev;
    }, []);
}

/** 取整数的千位数字和百味数字的方法
 *
 * `position`从1开始，从右往左取
 *
 * 如千位即4，百位即3
 */
export function getPosition(number: number | string, position: number) {
    const stringified = number.toString();

    if (position < 1) {
        return undefined;
    }

    // 越界
    if (position > stringified.length) {
        return undefined;
    }

    const reversed = stringified
        .split("")
        .reverse()
        .join("");

    return parseInt(reversed.charAt(position - 1), 10);
}
