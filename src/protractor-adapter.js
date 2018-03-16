function wrapBlock(code) {
  return `
    var runtime = window.EnzymeWebdriver
    try {
      var args = [].slice.call(arguments)
      var result = (function () {${code}; })()
    } catch (err) {
      if (runtime) runtime._log(err)
      throw err
    }
    return result;
  `;
}

/* eslint-disable no-param-reassign */
export default (protractor, browser) => {
  const { By } = protractor;

  By.addLocator('component', wrapBlock('return runtime.qsa(args[0])'));

  browser.ignoreSynchronization = true;

  browser.waitForRelay = () =>
    browser.wait(
      browser.executeAsyncScript(
        wrapBlock(`
        setTimeout(function() {
          runtime.waitForRelayRequests(args[args.length - 1])
        })
      `),
      ),
    );
};
/* eslint-enable no-param-reassign */
