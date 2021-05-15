import { createServer } from 'http';
import * as Koa from 'koa';
import * as ws from 'ws';
import * as bodyParserMiddleware from 'koa-bodyparser';
import * as staticMiddleware from 'koa-static';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { clientSideMiddleware } from './webpack';

let wsReceiver = (_msg: any) => { return; };
export function setWsConnectionReceiver(receiver: (msg: any) => void) {
  wsReceiver = receiver;
}
let wsSender: (msg: any) => void;
export let wsConnectionSender = (msg: string) => {
  wsSender(msg);
};
let httpStaticFileRoute: {
  [routePath: string]: string
} = {};

const app = new Koa();
app.use(bodyParserMiddleware());
app.use(staticMiddleware(join(__dirname, '../res/')));
app.use(async (
  ctx: Koa.Context,
  next: () => Promise<void>
) => {
  console.log(`Http(${ctx.ip}):`, ctx.path);
  if (Object.keys(httpStaticFileRoute).indexOf(ctx.path) >= 0) {
    if (existsSync(httpStaticFileRoute[`/${ctx.path}`])) {
      ctx.body = createReadStream(httpStaticFileRoute[`/${ctx.path}`]);
      await next();
    } else {
      ctx.status = 404;
      await next();
    }
  } else {
    await clientSideMiddleware(ctx, next);
  }
});

export function useStaticMiddleware(path: string): string {
  // TODO - 改成针对单个文件的引导；如果路径正确，直接对接二进制流
  app.use(staticMiddleware(join(path)));
  // TODO - 返回一个根据此 path 生成的唯一 hash 值，作为 HTTP 请求入口
  return '';
}

const server = createServer(app.callback()).listen(
  process.env.PORT && +process.env.PORT || 80,
  process.env.HOST || undefined
);

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
