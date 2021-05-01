const wsConnection = new WebSocket(`ws://${window.location.host}/corona-bgm-editor`);

let sendCache = [];
export function send(obj: { type: string, [key: string]: any }) {
  console.log('WS Send:', obj);
  if (wsConnection.readyState < 1) {
    sendCache.push(obj);
  } else {
    wsConnection.send(JSON.stringify(obj));
  }
}

let receivers: { [type: string]: (obj: any) => void } = {};
export function receive(type: string, callback: (obj: any) => void) {
  receivers[type] = callback;
}

wsConnection.addEventListener('open', _e => {
  for (const obj of sendCache) {
    wsConnection.send(JSON.stringify(obj));
  }
  wsConnection.addEventListener('message', e => {
    const obj = JSON.parse(e.data);
    console.log('WS Receive:', obj);
    if (receivers[obj.type]) {
      receivers[obj.type](obj);
    }
  });
});
