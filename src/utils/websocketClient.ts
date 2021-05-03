import { generate } from 'shortid';
const wsConnection = new WebSocket(`ws://${window.location.host}/corona-bgm-editor`);

let sendCache = [];
let receivers: { [id: string]: (obj: any) => void } = {};

export async function send(type: string, data: { [key: string]: any }) {
  const id = generate();
  console.log('WS Send:', type, id);
  return new Promise(receiveFunc => {
    receivers[id] = receiveFunc;
    if (wsConnection.readyState < 1) {
      sendCache.push({
        type, id, data
      });
    } else {
      wsConnection.send(JSON.stringify({
        type, id, data
      }));
    }
  });
}

wsConnection.onopen = () => {
  console.log('WS Connected');
  for (const obj of sendCache) {
    wsConnection.send(JSON.stringify(obj));
  }
};

wsConnection.onmessage = e => {
  const obj = JSON.parse(e.data);
  console.log('WS Receive:', obj.type, obj.id);
  if (receivers[obj.id]) {
    receivers[obj.id](obj.data);
    delete receivers[obj.id];
  }
};
