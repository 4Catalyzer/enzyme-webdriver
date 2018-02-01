import React from 'react';

describe('runtime', () => {
  let ReactDOM;
  let runtime;

  beforeEach(() => {
    runtime = require('../src/runtime').default;

    ReactDOM = require('react-dom');
  });

  it('should find stuff', () => {
    const container = document.createElement('div');
    ReactDOM.render(
      <div>
        <p>hello</p>
        <span className="foo" />
      </div>,
      container,
    );

    expect(runtime.qsa('p')[0].tagName).toEqual('P');

    expect(runtime.qsa('.foo')[0].tagName).toEqual('SPAN');

    expect(runtime.qsa('p + .foo')[0].tagName).toEqual('SPAN');
  });
});
