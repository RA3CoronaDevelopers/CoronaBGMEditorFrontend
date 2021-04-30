import React, { createElement } from 'react';
import { render } from 'react-dom';

render(
  createElement(function () {
    return <>
      <style>{`html, body { margin: 0px; padding: 0px; }`}</style>
      <p>{'Building in progress'}</p>
    </>;
  }), document.querySelector('#root')
);
