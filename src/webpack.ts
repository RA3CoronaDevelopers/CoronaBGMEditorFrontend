import { join } from 'path';
import * as webpack from 'webpack';
import * as TerserPlugin from 'terser-webpack-plugin';
import { watch as watchFiles } from 'chokidar';

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
            '@babel/preset-typescript',
          ],
          plugins: ['@babel/plugin-transform-runtime'],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
    modules: [join(__dirname, '../node_modules'), 'node_modules'],
  },
  resolveLoader: {
    modules: [join(__dirname, '../node_modules'), 'node_modules'],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

let watcherWaitingState = {
  firstChange: false,
  continueChange: false,
};

function watcherTrigger() {
  if (!watcherWaitingState.continueChange) {
    console.log('Compiling the codes.');
    watcherWaitingState.firstChange = false;
    watcherWaitingState.continueChange = false;

    const compiler = webpack([
      {
        ...globalConfig,
        entry: join(__dirname, './clientEntry.tsx'),
        mode:
          process.env.NODE_ENV === 'development' ? 'development' : 'production',
        target: 'electron-renderer',
        output: {
          filename: 'client.bundle.js',
          path: join(__dirname, '../res/'),
        },
        cache: {
          type: 'memory',
        },
        devtool:
          process.env.NODE_ENV === 'production' ? 'none' : 'inline-source-map',
      },
      {
        ...globalConfig,
        entry: join(__dirname, './serverEntry.ts'),
        mode: 'development',
        target: 'electron-main',
        output: {
          filename: 'server.bundle.js',
          path: join(__dirname, '../res/'),
        },
        cache: {
          type: 'memory',
        },
        devtool: 'inline-source-map',
      },
    ]);

    setTimeout(
      () =>
        compiler.run((err: Error, stats) => {
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
          }
        }),
      0
    );
  } else {
    watcherWaitingState.continueChange = false;
    setTimeout(watcherTrigger, 3000);
  }
}

if (process.argv.indexOf('--watch') >= 0) {
  watchFiles(__dirname, {
    ignored: /^(node_modules)|(\.git)$/,
  }).on('all', () => {
    if (!watcherWaitingState.firstChange) {
      watcherWaitingState.firstChange = true;
      setTimeout(watcherTrigger, 3000);
    } else {
      watcherWaitingState.continueChange = true;
    }
  });
} else {
  watcherTrigger();
}
