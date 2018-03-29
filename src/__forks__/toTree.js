/* eslint no-use-before-define: off */
// https://github.com/airbnb/enzyme/blob/master/packages/enzyme-adapter-react-16/src/ReactSixteenAdapter.js

import * as Reflection from 'react-reconciler/reflection';

const HostRoot = 3;
const ClassComponent = 2;
const Fragment = 10;
const FunctionalComponent = 1;
const HostPortal = 4;
const HostComponent = 5;
const HostText = 6;
const Mode = 11;
const ContextConsumer = 12;
const ContextProvider = 13;
const ForwardRef = 14;

function ensureKeyOrUndefined(key) {
  return key || (key === '' ? '' : undefined);
}

function nodeAndSiblingsArray(nodeWithSibling) {
  const array = [];
  let node = nodeWithSibling;
  while (node != null) {
    array.push(node);
    node = node.sibling;
  }
  return array;
}

function flatten(arr) {
  const result = [];
  const stack = [{ i: 0, array: arr }];
  while (stack.length) {
    const n = stack.pop();
    while (n.i < n.array.length) {
      const el = n.array[n.i];
      n.i += 1;
      if (Array.isArray(el)) {
        stack.push(n);
        stack.push({ i: 0, array: el });
        break;
      }
      result.push(el);
    }
  }
  return result;
}

export default function toTree(vnode) {
  if (vnode == null) {
    return null;
  }
  // TODO(lmr): I'm not really sure I understand whether or not this is what
  // i should be doing, or if this is a hack for something i'm doing wrong
  // somewhere else. Should talk to sebastian about this perhaps
  const node = Reflection.findCurrentFiberUsingSlowPath(vnode);
  switch (node.tag) {
    case HostRoot: // 3
      return toTree(node.child);
    case HostPortal: // 4
      return toTree(node.child);
    case ClassComponent:
      return {
        nodeType: 'class',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: childrenToTree(node.child),
      };
    case FunctionalComponent: // 1
      return {
        nodeType: 'function',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: null,
        rendered: childrenToTree(node.child),
      };
    case HostComponent: {
      // 5
      let renderedNodes = flatten(
        nodeAndSiblingsArray(node.child).map(toTree),
      );
      if (renderedNodes.length === 0) {
        renderedNodes = [node.memoizedProps.children];
      }
      return {
        nodeType: 'host',
        type: node.type,
        props: { ...node.memoizedProps },
        key: ensureKeyOrUndefined(node.key),
        ref: node.ref,
        instance: node.stateNode,
        rendered: renderedNodes,
      };
    }
    case HostText: // 6
      return node.memoizedProps;
    case Fragment:
    case ContextProvider:
    case ContextConsumer:
    case Mode:
    case ForwardRef:
      return childrenToTree(node.child);
    default:
      throw new Error(
        `Enzyme Internal Error: unknown node with tag ${node.tag}`,
      );
  }
}

function childrenToTree(node) {
  if (!node) {
    return null;
  }
  const children = nodeAndSiblingsArray(node);
  if (children.length === 0) {
    return null;
  } else if (children.length === 1) {
    return toTree(children[0]);
  }
  return flatten(children.map(toTree));
}
