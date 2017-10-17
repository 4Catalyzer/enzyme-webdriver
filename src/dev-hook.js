/* eslint no-underscore-dangle: off */

function getStub() {
  const renderers = {};
  const roots = {};
  const hook = {
    _renderers: renderers,

    supportsFiber: true,

    inject(renderer) {
      const id = Math.random().toString(16).slice(2);
      renderers[id] = renderer;
    },
    getFiberRoots(rendererId) {
      if (!roots[rendererId]) roots[rendererId] = new Set();
      return roots[rendererId];
    },
    onCommitFiberRoot(rendererID, root) {
      const mountedRoots = hook.getFiberRoots(rendererID);
      const current = root.current;
      const isKnownRoot = mountedRoots.has(root);
      const isUnmounting = current.memoizedState == null ||
        current.memoizedState.element == null;

      // Keep track of mounted roots so we can hydrate when DevTools connect.
      if (!isKnownRoot && !isUnmounting) mountedRoots.add(root);
      else if (isKnownRoot && isUnmounting) mountedRoots.delete(root);
    },
  };
  return hook;
}

const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || getStub();

if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;
}

export default hook;
