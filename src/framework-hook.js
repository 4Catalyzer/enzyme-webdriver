/* eslint no-underscore-dangle: off */
import wrap from './wrap';

function deferred() {
  let resolve;
  const promise = new Promise(y => {
    resolve = y;
  });
  promise.resolve = resolve;
  return promise;
}

let relayInternals;
let reqPromise = deferred();
const pendingRequests = new Set();

const renderers = {};
const roots = {};

const hook = {
  supportsFiber: true,

  inject(renderer) {
    const id = Math.random()
      .toString(16)
      .slice(2);
    renderers[id] = renderer;
    return id;
  },

  getFiberRoots(rendererId) {
    if (!roots[rendererId]) roots[rendererId] = new Set();
    return roots[rendererId];
  },

  onCommitFiberRoot(rendererId, root) {
    const mountedRoots = hook.getFiberRoots(rendererId);
    const current = root.current;
    const isKnownRoot = mountedRoots.has(root);
    const isUnmounting =
      current.memoizedState == null || current.memoizedState.element == null;

    // Keep track of mounted roots so we can hydrate when DevTools connect.
    if (!isKnownRoot && !isUnmounting) mountedRoots.add(root);
    else if (isKnownRoot && isUnmounting) mountedRoots.delete(root);
  },

  onCommitFiberUnmount(rendererId, root) {
    const currentRoots = hook.getFiberRoots(rendererId);
    if (currentRoots.has(root)) currentRoots.delete(root);
  },

  set _relayInternals(internals) {
    relayInternals = internals;

    const { NetworkLayer } = internals;

    function recordRequest(type, request) {
      const done = () => {
        pendingRequests.delete(request);
        if (!pendingRequests.size) {
          reqPromise.resolve();
          reqPromise = deferred();
        }
      };

      pendingRequests.add(request);
      request.finally(done);
    }

    wrap(NetworkLayer.constructor.prototype, 'sendQueries', (base, args) => {
      const [queries] = args;
      const retval = base(...args);
      queries.forEach(query => recordRequest(query));
      return retval;
    });

    wrap(NetworkLayer.constructor.prototype, 'sendMutation', (base, args) => {
      const retval = base(...args);
      recordRequest(args[0]);
      return retval;
    });
  },

  get _relayInternals() {
    return relayInternals;
  },
};

window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook;

export function waitForRelayRequests(fn) {
  if (!pendingRequests.size) {
    fn();
    return;
  }
  reqPromise.then(fn);
}

export function getAllRoots() {
  return Object.keys(renderers)
    .map(hook.getFiberRoots)
    .reduce((result, next) => result.concat(Array.from(next)), []);
}
