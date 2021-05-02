import React, { createElement } from 'react';
import { render } from 'react-dom';
import { SnackbarProvider } from 'notistack';
import { Store } from './utils/storeContext';
import './utils/websocketClient';
import { Main } from './components/main';

render(
  createElement(function () {
    return <>
      <style>{`
        html, body { margin: 0px; padding: 0px; }
        body { background: no-repeat center/105% url("./bg.jpg"); }
      `}</style>
      <SnackbarProvider maxSnack={3}>
        <Store>
          <Main />
        </Store>
      </SnackbarProvider>
    </>;
  }), document.querySelector('#root')
);
