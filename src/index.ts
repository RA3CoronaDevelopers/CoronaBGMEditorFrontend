import { createServer } from 'http';
import * as Koa from 'koa';
import * as ws from 'ws';
import * as bodyParserMiddleware from 'koa-bodyparser';
import * as staticMiddleware from 'koa-static';
import { join } from 'path';

import { clientSideMiddleware } from './webpack';

const app = new Koa();
app.use(bodyParserMiddleware());
app.use(staticMiddleware(join(__dirname, '../res')));
// WARN - 下面是用来为临时测试音频播放控件提供音频素材的，具体文件不会上传到 github，且在文件拣取写好后会移除
app.use(staticMiddleware(join(__dirname, '../../TouhouMusicNew')));
app.use(async (
  ctx: Koa.Context,
  next: () => Promise<void>
) => {
  console.log(`Http(${ctx.ip}):`, ctx.path);
  await clientSideMiddleware(ctx, next);
});

const server = createServer(app.callback()).listen(
  process.env.PORT && +process.env.PORT || 80,
  process.env.HOST || undefined
);

let wsReceiver = (_msg: any) => { return; };
export function setWsConnectionReceiver(receiver: (msg: any) => void) {
  wsReceiver = receiver;
}
let wsSender;
export let wsConnectionSender = (msg: string) => {
  wsSender(msg);
};
const wss = new ws.Server({ server });
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New WS connection(${ip})`);

  wsSender = (msg: any) => {
    console.log(`WS(${ip}) Send:`, msg.type);
    ws.send(JSON.stringify(msg));
  };
  ws.on('message', (msg: string) => {
    try {
      const obj = JSON.parse(msg);
      console.log(`WS(${ip}) Receive:`, obj.type);
      wsReceiver(obj);
    } catch (e) {
      console.error(e);
    }

    ws.on('close', () => {
      console.log(`Closed WS connection(${ip})`);
    });
  });
});
