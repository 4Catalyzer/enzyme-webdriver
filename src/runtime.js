/*
  eslint no-underscore-dangle: off, no-param-reassign: off, import/first: off
 */

import devHook from './dev-hook'; // needs to be before react imports

import ReactDOM from 'react-dom';
import { reduceTreeBySelector } from 'enzyme/build/selectors';

import hostNodeToNode from './tree-traversal';

export function getDOMNode(node) {
  while (node && !Array.isArray(node) && node.instance === null) {
    node = node.rendered;
  }
  if (Array.isArray(node)) {
    throw new Error('Trying to get host node of an array');
  }
  if (!node) return null;
  return ReactDOM.findDOMNode(node.instance); // eslint-disable-line react/no-find-dom-node
}


export default {
  getRootNodes() {
    return devHook.getFiberRoots().map(c => hostNodeToNode(c));
  },

  qsa(selector) {
    return reduceTreeBySelector(selector, this.getRootNodes());
  },
};

