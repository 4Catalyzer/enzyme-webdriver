export default function wrap(source, method, fn) {
  const base = source[method];
  // eslint-disable-next-line no-param-reassign
  source[method] = function wrapped(...args) {
    return fn(base.bind(this), args);
  };
}
