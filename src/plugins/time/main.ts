import { store } from "@src/store";

let startChapter: HTMLElement;

const {
    chapterAmount,
    range,
    rangeStart,
    rangeEnd,
    randomInterval,
    switchInterval,
    switchLevel,
    loop,
} = store.USER_SETTINGS;

const startChapterIndex = (rangeStart - 1) * chapterAmount;
const endChapterIndex = rangeEnd * chapterAmount - 1;

function getStartChapter() {
    for (let [index, unit] of document.querySelectorAll("#sidemenu li.group").entries()) {
        if (index == startChapterIndex) startChapter = unit as HTMLElement;
    }
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

            console.error("12321321", index, unit);

            if (range)
                if (switchLevel === 1) {
                    //限定范围时，从指定开始范围刷
                    if (index < startChapterIndex) {
                        //跳转至开始单元
                        startChapter.click();
                        break;
                    }

                    //限定范围时，是否循环刷
                    if (index >= endChapterIndex) {
                        if (loop) {
                            startChapter.click();
                            break;
                        }
                    }
                }
        }
    }
}

function generateInterval() {
    let rate = 1;
    if (randomInterval) {
        rate = Math.random();
        if (rate < 0.5) rate = 0.5;
    }
    return switchInterval * rate * 60 * 1000;
}

export function recur() {
    console.error(startChapterIndex, endChapterIndex, startChapter);

    setTimeout(() => {
        switch (switchLevel) {
            //这里fall through是可以的，因为点击之后会切换页面，切换页面的话，相当于就break了
            //需要fall through，是因为需要在上一级到达末尾时，能够自动降级，进行下一级的切换
            //不用switch直接调用三次autoNext也是可以的
            case 3: //tab，圆圈包裹的数字
                autoNext(".layoutHeaderStyle--circleTabsBox-jQdMo a", "selected", 3);

            case 2: //section，上方的标签页
                autoNext("#header .TabsBox li", "active", 2);

            case 1: //chapter，侧边栏的标签页
                autoNext("#sidemenu li.group", "active", 1);

            default:
                if (loop) {
                    if (range) {
                        //循环刷，同时指定了范围
                        startChapter.click();
                    } else {
                        //循环刷，但是未指定范围
                        try {
                            (document.querySelector("#sidemenu li.group") as HTMLElement).click();
                        } catch (error) {
                            // console.error(error);
                        }
                    }
                }
        }
        recur();
        //每次切换都计算间隔，而不仅是第一次时计算
    }, generateInterval());
}

export function handleAlert() {
    setTimeout(() => {
        getStartChapter();
        try {
            document
                .querySelector("div.dialog-header-pc--dialog-header-2qsXD")!
                .parentElement!.querySelector("button")!
                .click();
        } catch (e) {
            // console.error(e);
        }
    }, 5000);
}
