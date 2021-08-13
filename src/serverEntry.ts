import { diskinfo } from '@dropb/diskinfo';
import {
  readdirSync,
  mkdirSync,
  statSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join, isAbsolute, dirname, basename } from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

const middlewares: {
  [type: string]: (data: any) => Promise<any>;
} = {
  // 文件选取器窗口的工具函数
  async getProcessDir(_data) {
    return {
      path: process.cwd(),
      dirContent: readdirSync(process.cwd()).reduce(
        (obj, name) => ({
          ...obj,
          [name]: (() => {
            try {
              return statSync(join(process.cwd(), name)).isDirectory()
                ? 'dir'
                : 'file';
            } catch (_e) {
              return 'file';
            }
          })(),
        }),
        {}
      ),
    };
  },
  async getPreviousDir({ path }) {
    return {
      path: join(path, '../'),
      dirContent: readdirSync(join(path, '../')).reduce(
        (obj, name) => ({
          ...obj,
          [name]: (() => {
            try {
              return statSync(join(path, '../', name)).isDirectory()
                ? 'dir'
                : 'file';
            } catch (_e) {
              return 'file';
            }
          })(),
        }),
        {}
      ),
    };
  },
  async getDir({ path }) {
    return {
      path: join(path),
      dirContent: readdirSync(join(path)).reduce(
        (obj, name) => ({
          ...obj,
          [name]: (() => {
            try {
              return statSync(join(path, name)).isDirectory() ? 'dir' : 'file';
            } catch (_e) {
              return 'file';
            }
          })(),
        }),
        {}
      ),
    };
  },
  async getDiskList() {
    return {
      disks: (await diskinfo()).map((n) => join(n.target + '/')),
    };
  },
  async createFile({ path, name, initContent }) {
    if (existsSync(join(path, name))) {
      return {
        hasSuccess: false,
        reason: '文件已存在',
      };
    } else {
      try {
        writeFileSync(join(path, name), initContent);
      } catch (e) {
        return {
          hasSuccess: false,
          reason: `${e}`,
        };
      }
      return {
        hasSuccess: true,
        dirContent: readdirSync(join(path)).reduce(
          (obj, name) => ({
            ...obj,
            [name]: (() => {
              try {
                return statSync(join(path, name)).isDirectory()
                  ? 'dir'
                  : 'file';
              } catch (_e) {
                return 'file';
              }
            })(),
          }),
          {}
        ),
      };
    }
  },
  async createFolder({ path, name }) {
    if (existsSync(join(path, name))) {
      return {
        hasSuccess: false,
        reason: '文件夹已存在',
      };
    } else {
      try {
        mkdirSync(join(path, name));
      } catch (e) {
        return {
          hasSuccess: false,
          reason: `${e}`,
        };
      }
      return {
        hasSuccess: true,
        dirContent: readdirSync(join(path)).reduce(
          (obj, name) => ({
            ...obj,
            [name]: (() => {
              try {
                return statSync(join(path, name)).isDirectory()
                  ? 'dir'
                  : 'file';
              } catch (_e) {
                return 'file';
              }
            })(),
          }),
          {}
        ),
      };
    }
  },
  // JSON 配置文件读写
  async readJsonFile({ path }) {
    if (existsSync(path)) {
      try {
        const { musicFiles, tracks, fsmConfig, unitWeight } = JSON.parse(
          readFileSync(path, 'utf-8')
        );
        return {
          hasSuccess: true,
          musicFiles: Object.keys(musicFiles).reduce(
            (obj, name) => ({
              ...obj,
              [name]: isAbsolute(musicFiles[name])
                ? musicFiles[name]
                : join(dirname(path), musicFiles[name]),
            }),
            {}
          ),
          tracks,
          fsmConfig,
          unitWeight,
        };
      } catch (e) {
        console.error(e);
        return {
          hasSuccess: false,
          reason: `${e}`,
        };
      }
    } else {
      return {
        hasSuccess: false,
        reason: '文件不存在',
      };
    }
  },
  async writeJsonFile({ path, obj }) {
    console.log('Wrote file to', path);
    try {
      writeFileSync(path, JSON.stringify(obj));
      return {
        hasSuccess: true,
      };
    } catch (e) {
      return {
        hasSuccess: false,
        reason: `${e}`,
      };
    }
  },
  // 音乐资源文件加载
  async loadMusicFile({ path }) {
    console.log('Generate music file route to', path);
    try {
      if (existsSync(path)) {
        return {
          hasSuccess: true,
          fileName: /^(.+)\.mp3$/.exec(basename(path))[1],
          httpRoutePath: path,
        };
      } else {
        return {
          hasSuccess: false,
          reason: '文件不存在',
        };
      }
    } catch (e) {
      return {
        hasSuccess: false,
        reason: `${e}`,
      };
    }
  },
};

let win: BrowserWindow;
app.whenReady().then(() => {
  ipcMain.on('asynchronous-message', (event, raw) => {
    console.log('IPC Message', raw);
    const { type, id, data } = JSON.parse(raw);
    middlewares[type](data).then((data) =>
      event.reply('asynchronous-reply', {
        type,
        id,
        data,
      })
    );
  });

  win = new BrowserWindow({
    width: 1200,
    height: 900,
    backgroundColor: '#22272e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(join(__dirname, '../res/index.html'));
});
