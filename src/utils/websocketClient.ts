import { generate } from 'shortid';
import { ipcRenderer } from 'electron';

let receivers: { [id: string]: (obj: any) => void } = {};

export async function send(type: string, data: { [key: string]: any }) {
  const id = generate();
  console.log('IPC Send:', type, id);
  return new Promise(receiveFunc => {
    receivers[id] = receiveFunc;
    ipcRenderer.send('asynchronous-message', JSON.stringify({
      type,
      id,
      data,
    }));
  });
}

ipcRenderer.on('asynchronous-reply', (_event, { type, id, data }) => {
  console.log('IPC Receive:', type, id);
  if (receivers[id]) {
    receivers[id](data);
    delete receivers[id];
  }
})
