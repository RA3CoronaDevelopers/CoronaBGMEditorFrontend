declare global {
  function receive(receiver: (msg: any) => void): void;
  function send(msg: any): void;
}

export { };

import { diskinfo } from '@dropb/diskinfo';
import {
  readdirSync, mkdirSync,
  statSync, existsSync, readFileSync, writeFileSync
} from 'fs';
import { join } from 'path';

const middlewares: {
  [type: string]: (data: any) => Promise<any>
} = {
  // 文件选取器窗口的工具函数
  async getProcessDir(_data) {
    return {
      path: process.cwd(),
      dirContent: (readdirSync(process.cwd())).reduce((obj, name) => ({
        ...obj,
        [name]: (() => {
          try {
            return statSync(join(process.cwd(), name)).isDirectory() ? 'dir' : 'file';
          } catch (_e) {
            return 'file';
          }
        })()
      }), {})
    };
  },
  async getPreviousDir({ path }) {
    return {
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
    };
  },
  async getDir({ path }) {
    return {
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
    };
  },
  async getDiskList() {
    return {
      disks: (await diskinfo()).map(n => join(n.target + '/'))
    };
  },
  async createFile({ path, name, initContent }) {
    if (existsSync(join(path, name))) {
      return {
        hasSuccess: false,
        reason: '文件已存在'
      };
    } else {
      try {
        writeFileSync(join(path, name), initContent);
      } catch (e) {
        return {
          hasSuccess: false,
          reason: `${e}`
        };
      }
      return {
        hasSuccess: true,
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
      };
    }
  },
  async createFolder({ path, name }) {
    if (existsSync(join(path, name))) {
      return {
        hasSuccess: false,
        reason: '文件夹已存在'
      };
    } else {
      try {
        mkdirSync(join(path, name));
      } catch (e) {
        return {
          hasSuccess: false,
          reason: `${e}`
        };
      }
      return {
        hasSuccess: true,
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
      };
    }
  }
};

receive((msg: any) => {
  if (!msg.type || !middlewares[msg.type]) {
    console.error('WS Unknown type', msg.type);
  } else if (!msg.id) {
    console.error('WS Non id', msg.type);
  } else {
    console.log('WS Trigger', msg.type, msg.id);
    middlewares[msg.type](msg.data).then(data => send({
      type: msg.type,
      id: msg.id,
      data
    }));
  }
});
