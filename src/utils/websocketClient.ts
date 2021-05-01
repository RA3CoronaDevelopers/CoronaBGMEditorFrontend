const wsConnection = new WebSocket(`ws://${window.location.host}/corona-bgm-editor`);

export function send(obj: { type: string, [key: string]: any }) {
  wsConnection.send(JSON.stringify(obj));
}

let receivers: { [type: string]: (obj: any) => void } = {};
export function receive(type: string, callback: (obj: any) => void) {
  receivers[type] = callback;
}

wsConnection.addEventListener('open', _e => {
  wsConnection.addEventListener('message', e => {
    const obj = JSON.parse(e.data);
    if (receivers[obj.type]) {
      receivers[obj.type](obj);
    }
  });
});
