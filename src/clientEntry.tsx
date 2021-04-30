import React, { createElement } from 'react';
import { render } from 'react-dom';
import { Main } from './components/main';

render(
  createElement(function () {
    return <>
      <style>{`
        html, body { margin: 0px; padding: 0px; }
        body { background: no-repeat center/105% url("./bg.jpg"); }
      `}</style>
      <Main />
    </>;
  }), document.querySelector('#root')
);
