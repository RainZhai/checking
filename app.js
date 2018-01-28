var accounts = require('./config').accounts;
var task = require('./controller/task');
var autoCheckIn = require('./controller/autoCheckIn');

// 定时执行
task({h: [18], m: [0]}, function () {
    accounts.forEach(function (v) {
        autoCheckIn(v);
    });
});

console.log('======', '自动签到服务运行中..', '======');