const Koa = require('koa');
const app = new Koa();

const  session = require('koa-session');
const redis = require('redis');
const redisStore = require('koa-redis');
const redisClient = redis.createClient(6379, 'localhost');

const wrapper = require('co-redis');

const client = wrapper(redisClient);

app.keys = ['secret'];

const SESS_CONFIG = {
    key:'sessionKey',
    maxAge:8640000,
    httpOnly:true,
    signed:true,
    store:redisStore({client})
}

app.use(session(SESS_CONFIG,app));
app.use(ctx => {
    // 查看redis
    redisClient.keys('*',(err,keys) => {
        console.log('keys:',keys)
        keys.forEach(key => {
            redisClient.get(key, (err,val) => {
                console.log(val)
            })
        })
    })

    if (ctx.path === '/favicon.ico') return
    let n = ctx.session.count || 0
    ctx.session.count = ++n
    ctx.body = '第' + n + '次访问'
})
app.listen(3000)

