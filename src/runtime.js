/*
  eslint no-underscore-dangle: off, no-param-reassign: off, import/first: off
 */

import * as Hooks from './framework-hook'; // needs to be before react imports

import ReactDOM from 'react-dom';
import { reduceTreeBySelector } from 'enzyme/build/selectors';
import toTree from './__forks__/toTree';

function hostNodeToNode(vnode) {
  return vnode ? toTree(vnode) : null;
}

const flatten = list =>
  list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

function getDOMNode(node) {
  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  }

  if (Array.isArray(node)) {
    throw new Error('Trying to get host node of an array');
  }
  if (!node) return null;
  return ReactDOM.findDOMNode(node.instance); // eslint-disable-line react/no-find-dom-node
}

window.EnzymeWebdriver = {
  waitForRelayRequests: Hooks.waitForRelayRequests,

  getRootNodes() {
    return Hooks.getAllRoots().map(c => c && hostNodeToNode(c.current));
  },

  qsa(selector) {
    try {
      return flatten(
        this.getRootNodes().map(root => reduceTreeBySelector(selector, root)),
      ).map(n => getDOMNode(n));
    } catch (err) {
      const msg =
        err.message || 'EnzymeWebdriver::Could not locate element(s)';
      throw new Error(`${msg}\n\n  Selector:  ${selector}\n`);
    }
  },

  _log(err) {
    console.error(err); // eslint-disable-line
  },
};
