import { recur, handleAlert } from "./main";
import { store } from "@src/store";

if (location.href.includes("https://ucontent.unipus.cn/_pc_default/pc.html?")) {
    if (store.USER_SETTINGS.autoRefresh) {
        recur();
        handleAlert();
    }
}
