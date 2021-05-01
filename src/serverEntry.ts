declare global {
  function receive(receiver: (msg: any) => void): void;
  function send(msg: any): void;
}

export { };

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const middlewares: {
  [type: string]: (data: any) => Promise<void>
} = {
  async getProcessDir(_data) {
    send({
      type: 'setFileSelectorDir',
      path: process.cwd(),
      dirContent: (readdirSync(process.cwd())).reduce((obj, name) => ({
        ...obj,
        [name]: (() => {
          try {
            return statSync(join(process.cwd())).isDirectory() ? 'dir' : 'file';
          } catch (_e) {
            return 'file';
          }
        })()
      }), {})
    });
  },
  async getAbsoluteDir({ path }) {
    send({
      type: 'setFileSelectorDir',
      path: join(path),
      dirContent: (readdirSync(join(path))).reduce((obj, name) => ({
        ...obj,
        [name]: (() => {
          try {
            return statSync(join(path, name)).isDirectory() ? 'dir' : 'file';
          } catch (_e) {
            return 'file';
          }
        })()
      }), {})
    });
  },
  async getNextLevelDir({ path, dirName }) {
    send({
      type: 'setFileSelectorDir',
      path: join(path, dirName),
      dirContent: (readdirSync(join(path, dirName))).reduce((obj, name) => ({
        ...obj,
        [name]: (() => {
          try {
            return statSync(join(path, dirName)).isDirectory() ? 'dir' : 'file';
          } catch (_e) {
            return 'file';
          }
        })()
      }), {})
    });
  },
  async getPreviousLevelDir({ path }) {
    send({
      type: 'setFileSelectorDir',
      path: join(path, '../'),
      dirContent: (readdirSync(join(path, '../'))).reduce((obj, name) => ({
        ...obj,
        [name]: (() => {
          try {
            return statSync(join(path, '../', name)).isDirectory() ? 'dir' : 'file';
          } catch (_e) {
            return 'file';
          }
        })()
      }), {})
    });
  }
};
receive((msg: any) => {
  if (!msg.type || !middlewares[msg.type]) {
    console.error('WS Unknown type', msg);
  } else {
    console.log('WS Trigger', msg.type);
    middlewares[msg.type](msg);
  }
});
