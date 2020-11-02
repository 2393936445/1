# 开发指南

## 架构
  - 考试、联系、时长、秒过都作为插件单独编写，最终通过plugins文件下下的index.ts统一暴露，如果需要扩展功能，可以自行扩展插件
  - 每一个插件都有自己的设置，在index.ts中统一注册，最终呈现于设置面板

## 安装所有依赖
```
npm install
```

## 运行开发服务器，可以用来调整UI布局
```
npm run server
```

## 打包带source map的dev bundle
```
npm run dev
```

## 打包生产bundle
```
npm run build
```

## 最终发布的成品
1. 油猴不允许minified的脚本，所以格式化一下
2. 手动将headers.js中的脚本元信息添加至最上方
3. 如果最终打包体积过大，可以考虑不打包Vue等依赖，通过油猴require