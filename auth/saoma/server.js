const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const static = require('koa-static');
const qr = require('qr-image');
const jwt = require('jsonwebtoken');
const jwtAuth = require("koa-jwt");

const secret = "it's a secret";
const md5 = require('js-md5');
const app = new Koa();
app.use(static(__dirname + '/'));
app.use(bodyParser());


const codeSession = {};
const Users = [
    {id: 1, name: 'root'},
    {id: 2, name: 'laowang'}
];

router.get("/qrcode", async (ctx) => {
    let qrcode = md5(Date.now().toString());
    codeSession[qrcode] = {
        status: 0
    };
    ctx.body = {
        code: 1,
        data: qrcode
    }
})
router.get("/qrcode/:code", async (ctx) => {
    let qrcode = ctx.params.code;
    var qr_svg = qr.imageSync(`http://192.168.1.101:3000/confirm.html?code=${qrcode}`, {type: 'png'});
    ctx.type = 'image/png';
    ctx.body = qr_svg;
});
router.get("/user/:code", async (ctx) => {
    let qrcode = ctx.params.code;
    const {body} = ctx.request;
    if (codeSession[qrcode] && codeSession[qrcode].status === 1) {
        ctx.body = {
            code: 1,
            data: codeSession[qrcode].user,
            // 生成 token 返回给客户端
            token: jwt.sign(
                {
                    data: codeSession[qrcode].user,
                    // 设置 token 过期时间，一小时后，秒为单位
                    exp: Math.floor(Date.now() / 1000) + 60 * 60
                },
                secret
            )
        };
    } else {
        ctx.body = {
            code: 0
        }
    }
});
router.post('/login', async (ctx) => {
    const {body} = ctx.request;
    if (codeSession[body.code] && Users[body.userId]) {
        codeSession[body.code].status = 1;
        codeSession[body.code].user = Users[body.userId];
        ctx.body = {
            code: 1,
            data: "授权成功"
        }
    } else {
        ctx.body = {
            code: 0,
            data: "授权失败"
        }
    }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
