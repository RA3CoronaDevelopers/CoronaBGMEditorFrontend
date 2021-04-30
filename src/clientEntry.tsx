import React, { createElement } from 'react';
import { render } from 'react-dom';

render(
  createElement(function () {
    return <>
      <style>{`
        html, body { margin: 0px; padding: 0px; }
        body { background: no-repeat center/105% url("./bg.jpg"); }
      `}</style>
    </>;
  }), document.querySelector('#root')
);
