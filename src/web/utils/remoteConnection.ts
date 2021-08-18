import { v4 as generate } from 'uuid';
import { ipcRenderer } from 'electron';

let receivers: { [id: string]: (obj: any) => void } = {};

export async function send(type: string, data: { [key: string]: any }) {
  const id = `web-${generate()}`;
  console.log('Send:', id, type, data);
  return new Promise((receiveFunc) => {
    receivers[id] = receiveFunc;
    ipcRenderer.send(
      'asynchronous-message',
      JSON.stringify({
        type,
        id,
        data,
      })
    );
  });
}

ipcRenderer.on('asynchronous-reply', (_event, { type, id, data }) => {
  console.log('Receive:', id, type, data);
  if (receivers[id]) {
    receivers[id](data);
    delete receivers[id];
  }
});
