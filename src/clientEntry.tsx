import React, { createElement } from 'react';
import { render } from 'react-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { Store } from './utils/storeContext';
import './utils/websocketClient';
import { Main } from './components/main';

try {
  render(
    createElement(function () {
      return (
        <>
          <ThemeProvider
            theme={createMuiTheme({
              palette: {
                type: 'dark',
                primary: blue,
                secondary: blue,
              },
            })}
          >
            <SnackbarProvider maxSnack={3}>
              <Store>
                <Main />
              </Store>
            </SnackbarProvider>
          </ThemeProvider>
        </>
      );
    }),
    document.querySelector('#root')
  );
} catch (e) {
  let node = document.createElement('div');
  node.appendChild(
    (() => {
      let node = document.createElement('div');
      node.innerText = `${e}`;
      return node;
    })()
  );
  node.style.position = 'fixed';
  node.style.left = '0px';
  node.style.top = '0px';
  node.style.width = '100%';
  node.style.height = '100%';
  node.style.background = 'rgba(0, 0, 0, 0.8)';
  node.style.display = 'flex';
  node.style.alignItems = 'center';
  node.style.justifyContent = 'center';
  document.body.appendChild(node);
}
