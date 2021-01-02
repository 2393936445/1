import request from "@utils/proxy";
import { requestErrorHandler, addMessage, setValue, getValue } from "@utils/common";

interface GetTokenReturn {
    openId: string;
    token: string;
}

interface IsExistUserReturn {
    status: boolean;
    message: string;
}

interface CheckVersionReturn {
    status: boolean;
    message: string;
}

interface UnitAnswerSuccess {
    status: true;
    data: UnitTestAnswer[];
}

interface UnitAnswerFail {
    status: false;
    error: string;
}

type UnitAnswerReturn = UnitAnswerSuccess | UnitAnswerFail;

export class Requests {
    @requestErrorHandler("openId获取异常")
    static async getOpenId() {
        const response = await request("https://u.unipus.cn/user/data/getToken");
        const returnJson = (await response.json()) as GetTokenReturn;
        return returnJson.openId;
    }

    @requestErrorHandler("token获取异常")
    static async getToken() {
        const response = await request("https://u.unipus.cn/user/data/getToken");
        const returnJson = (await response.json()) as GetTokenReturn;
        return returnJson.token;
    }

    @requestErrorHandler("身份验证异常")
    static async isExistUser() {
        const openId = await this.getOpenId();
        const openIdResponse = await request(`http://mz.3ds2.top/IsExistUser.php?openid=${openId}`);
        const IsExistUserReturnJson = (await openIdResponse.json()) as IsExistUserReturn;

        return IsExistUserReturnJson;
    }

    @requestErrorHandler("单元测试答案获取异常")
    static async getUnitTestAnswers(questionId: string, token: string) {
        const response = await request.post("/exam/", {
            body: {
                queryType: 0,
                token,
                exerciseId: /exerciseId=(.*?)&/.exec(location.href)![1] as string,
                questionIds: [questionId],
            },
        });
        const returnJson = (await response.json()) as UnitAnswerReturn;
        if (returnJson.status === false) {
            addMessage(returnJson.error, "error");
            return [];
        } else {
            return returnJson.data;
        }
    }

    @requestErrorHandler("班级测试答案获取异常")
    static async getClassTestAnswers(questionIds: Set<string>) {
        throw new Error();
    }

    @requestErrorHandler("脚本版本查询异常")
    static async checkVersion(version: string) {
        const CURRENT_DATE = new Date().toISOString().slice(0, 10);
        const LAST_CHECK_DATE = await getValue("LAST_CHECK_DATE", "2020-01-01");

        if (CURRENT_DATE > LAST_CHECK_DATE) {
            const response = await request("/version/", {
                method: "POST",
                body: {
                    version: version,
                },
            });
            const checkVersionReturnJson = (await response.json()) as CheckVersionReturn;

            if (checkVersionReturnJson.status) {
                addMessage(checkVersionReturnJson.message, "info");
                setValue("LAST_CHECK_DATE", CURRENT_DATE);
            }
        }
    }
}
