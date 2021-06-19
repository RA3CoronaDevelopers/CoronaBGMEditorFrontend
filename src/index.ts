import { createServer } from 'http';
import * as Koa from 'koa';
import * as ws from 'ws';
import * as bodyParserMiddleware from 'koa-bodyparser';
import * as staticMiddleware from 'koa-static';
import { generate } from 'shortid';
import { createReadStream } from 'fs';
import { join } from 'path';
import { clientSideMiddleware } from './webpack';

let wsReceiver = (_msg: any) => {
  return;
};
export function setWsConnectionReceiver(receiver: (msg: any) => void) {
  wsReceiver = receiver;
}
let wsSender: (msg: any) => void;
export let wsConnectionSender = (msg: string) => {
  wsSender(msg);
};

const app = new Koa();
app.use(bodyParserMiddleware());
app.use(async (ctx, next) => {
  console.log(`Http(${ctx.ip}):`, ctx.path);
  await next();
});
app.use(staticMiddleware(join(__dirname, '../res/')));
app.use(async (ctx, next) => await clientSideMiddleware(ctx, next));

let staticFileRouteCache: { [path: string]: string } = {};
export function useStaticMiddleware(path: string): string {
  if (typeof staticFileRouteCache[path] === 'undefined') {
    staticFileRouteCache[path] = generate();
    app.use(async (ctx, next) => {
      if (ctx.path === `/${staticFileRouteCache[path]}`) {
        ctx.body = createReadStream(path);
      } else {
        await next();
      }
    });
  }
  return staticFileRouteCache[path];
}

const server = createServer(app.callback()).listen(
  (process.env.PORT && +process.env.PORT) || 80,
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
