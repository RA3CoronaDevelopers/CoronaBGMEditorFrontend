import * as Koa from 'koa';
import { join } from 'path';
import * as webpack from 'webpack';
import { Volume, IFs } from 'memfs';
import { Union } from 'unionfs'
import * as realFs from 'fs';
import { Script, createContext } from 'vm';
import { watch as watchFiles } from 'chokidar';
import { setWsConnectionReceiver, wsConnectionSender } from './index';

const globalConfig = {
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript'
          ],
          plugins: [
            '@babel/plugin-transform-runtime'
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
    modules: [
      join(__dirname, '../node_modules'),
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      join(__dirname, '../node_modules'),
      'node_modules'
    ]
  }
};

const fs: IFs = ((new Union()) as any).use(realFs).use(Volume.fromJSON({
  [join(__dirname, './__client.ts')]: `require('${join(
    __dirname, './clientEntry.tsx'
  ).split('\\').join('\\\\')}');`,
  [join(__dirname, './__server.ts')]: `require('${join(
    __dirname, './serverEntry.ts'
  ).split('\\').join('\\\\')}');`
}));
fs['join'] = join;

export async function clientSideMiddleware(
  ctx: Koa.Context,
  next: () => Promise<unknown>
) {
  switch (ctx.path) {
    case '/':
      ctx.body = `<html>
        <head>
          <title>Pneumatic</title>
          <meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no'>
        </head>
        <body>
          <div id='root'></div>
          ${ctx.query.debug === '1' && `
          <script src='//cdn.jsdelivr.net/npm/eruda'></script><script>eruda.init();</script>
          ` || ``}
          <script src='/entry'></script>
        </body>
      </html>`;
      ctx.type = 'text/html';
      break;
    case '/entry':
      ctx.body = fs.readFileSync(join(__dirname, '__client.bundle.js'), 'utf8');
      ctx.type = 'text/javascript';
      break;
    default:
      await next();
  }
}

let watcherWaitingState = {
  firstChange: false,
  continueChange: false
};

function watcherTrigger() {
  if (!watcherWaitingState.continueChange) {
    console.log('Compiling the codes.');
    watcherWaitingState.firstChange = false;
    watcherWaitingState.continueChange = false;

    const compiler = webpack([
      {
        ...globalConfig,
        entry: join(__dirname, './__client.ts'),
        mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
        target: 'web',
        output: {
          filename: '__client.bundle.js',
          path: __dirname
        },
        cache: {
          type: 'memory'
        },
        devtool: process.env.NODE_ENV === 'production' ? 'none' : 'inline-source-map'
      },
      {
        ...globalConfig,
        entry: join(__dirname, './__server.ts'),
        mode: 'development',
        target: 'node',
        output: {
          filename: '__server.bundle.js',
          path: __dirname
        },
        cache: {
          type: 'memory'
        },
        devtool: 'inline-source-map'
      }
    ]);
    compiler.inputFileSystem = fs;
    compiler.outputFileSystem = fs;

    setTimeout(() => compiler.run((err: Error, stats) => {
      if (err) {
        console.error(err);
      } else if (stats.hasErrors()) {
        const info = stats.toJson();
        let errStr = '';
        if (stats.hasErrors()) {
          for (const e of info.errors) {
            errStr += `${e.message}\n`;
          }
        }
        if (stats.hasWarnings()) {
          for (const e of info.warnings) {
            errStr += `${e.message}\n`;
          }
        }
        console.error(Error(errStr));
      } else {
        console.log('Compiled the codes.');

        // Server reboot.
        const script = new Script(
          fs.readFileSync(join(__dirname, './__server.bundle.js'), 'utf8') as string, {
          filename: 'serverEntry.js'
        });
        const context = createContext({
          receive: setWsConnectionReceiver,
          send: wsConnectionSender,
          console, process, require,
          setInterval, setTimeout, clearInterval, clearTimeout
        });
        try {
          script.runInContext(context);
        } catch (e) {
          console.error(e);
        }
      }
    }), 0);
  } else {
    watcherWaitingState.continueChange = false;
    setTimeout(watcherTrigger, 3000);
  }
}

watchFiles(__dirname, {
  ignored: /^(node_modules)|(\.git)$/
}).on('all', () => {
  if (!watcherWaitingState.firstChange) {
    watcherWaitingState.firstChange = true;
    setTimeout(watcherTrigger, 3000);
  } else {
    watcherWaitingState.continueChange = true;
  }
});
