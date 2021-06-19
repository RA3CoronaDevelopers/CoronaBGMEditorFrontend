import React, { createElement } from 'react';
import { render } from 'react-dom';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { Store } from './utils/storeContext';
import './utils/websocketClient';
import { Main } from './components/main';

render(
  createElement(function () {
    return (
      <>
        <style>{`
        html, body { margin: 0px; padding: 0px; }
        body { background: #22272e; }
      `}</style>
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
