# checking
自动签到工具
## 安装Node.js
http://nodejs.org/download/
## 安装依赖包
npm install / yarn install
## 设定自动签到任务
‘
task({h: [22], m: [43]}, function () {
    accounts.forEach(function (v) {
        autoCheckIn(v);
    });
});
’
## 运行程序
npm run start

