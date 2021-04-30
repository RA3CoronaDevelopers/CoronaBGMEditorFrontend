import { createServer } from 'http';
import * as Koa from 'koa';
import * as ws from 'ws';
import * as bodyParserMiddleware from 'koa-bodyparser';

import { clientSideMiddleware } from './webpack';

const app = new Koa();
app.use(bodyParserMiddleware());
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

let wsConnectionReceiver = (_msg: any) => { };
export function setWsConnectionReceiver(receiver: (msg: any) => void) {
  wsConnectionReceiver = receiver;
}
export let wsConnectionSender = (_msg: string) => { };
const wss = new ws.Server({ server });
wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New WS connection(${ip})`);

  wsConnectionSender = (msg: any) => ws.send(JSON.stringify(msg));
  ws.on('message', (msg: string) => {
    try {
      console.log(`WS(${ip}):`, JSON.parse(msg));
      wsConnectionReceiver(JSON.parse(msg));
    } catch (e) {
      console.error(e);
    }

    ws.on('close', () => {
      console.log(`Closed WS connection(${ip})`);
    });
  });
});
