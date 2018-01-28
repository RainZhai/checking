var request = require('superagent');
var sendEmail = require('./sendEmail');

var headers = {
    Accept:"application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding":"gzip, deflate, br",
    "Accept-Language":"zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6,la;q=0.5",
    Host:"passport.suning.com",
    Origin:"https://passport.suning.com",
    Referer:"https://passport.suning.com/ids/login?method=GET&loginTheme=b2c",
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "X-Requested-With":"XMLHttpRequest"
};
var headersSign = {
    Accept:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
    "Accept-Encoding":"gzip, deflate, br",
    "Accept-Language":"zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6,la;q=0.5",
    Host:"sign.suning.com",
    Referer:"https://sign.suning.com/sign/welcome.do",
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
    "X-Requested-With":"XMLHttpRequest"
};
var origin = 'https://passport.suning.com',
    urls = {
        login: origin + '/ids/login',
        checkIn: 'https://sign.suning.com/sign/doSign.do?dt=test&callback=lotteryDrawCallback'
    };

/**
 * 自动签到
 * @param account {object}
 * @constructor
 */
function AutoCheckIn(account) {
    this.account = account;

    this.cookie = {
        value: null,
        expires: null
    };

    this.init();
}

AutoCheckIn.prototype = {
    constructor: AutoCheckIn,

    init: function () {
        var that = this;

        that.checkIn(function (data) {
            console.log('======', '数据，' + data, '======');
            sendEmail(that.account.user + '，签到完毕。 ' + new Date());
            console.log('======', '签到完毕，' + that.account.user, '======');
        });
    },

    // 验证登录，如果凭证没过期，无需重新验证
    _verify: function (cb) {
        Date.now() > this.cookie.expires
            ? this._login(cb)
            : cb(this.cookie);
    },

    // 登录
    _login: function (cb) {
        var that = this;

        request
            .post(urls.login)
            .set(headers)
            .type('form')
            .send({
                jsonViewType:true,
                username:that.account.user,
                password:'',
                password2:that.account.password,
                loginTheme:'b2c',
                service:'',
                rememberMe:true,
                client:'app',
                sceneId:'logonImg',
            })
            .redirects(0) // 防止页面重定向
            .end(function (result) {
                var cookie = result.headers['set-cookie'];
                that.cookie = {
                    value: cookie,
                    expires: cookie
                        .join()
                        .match(/Expires=(.*);/)[1]
                };

                cb(that.cookie);
            });
    },

    // 签到
    checkIn: function (cb) {
        var that = this;

        that._verify(function (cookie) {
            request
                .get(urls.checkIn)
                .set(headersSign)
                .set('Cookie', cookie.value)
                .end(cb);
        });
    }
};

module.exports = function (account) {
    return new AutoCheckIn(account);
};