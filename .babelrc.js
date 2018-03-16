module.exports = {
  presets: [
    [
      '@4c/4catalyzer',
      {
        target: 'web',
        modules: process.env.BABEL_ENV === 'esm' ? false : 'commonjs',
      },
    ],
  ],
};
