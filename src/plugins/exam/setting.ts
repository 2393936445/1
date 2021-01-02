const SETTINGS: SectionSetting[] = [
    {
        title: "单元/班级测试",
        display: true,
        settings: [
            {
                id: "autoSolveTest",
                name: "自动答题",
                type: "switch",
                default: false,
                description: "是否自动解答测试，不建议使用",
            },
            {
                id: "solveIntervalMinTest",
                name: "间隔下限",
                default: 3000,
                valueType: "number",
                description: "单位毫秒，测试的答题间隔下限",
            },
            {
                id: "solveIntervalMaxTest",
                name: "间隔上限",
                default: 8000,
                valueType: "number",
                description: "单位毫秒，测试的答题间隔上限",
            },
        ],
    },
];

export default SETTINGS;
