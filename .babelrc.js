module.exports = {
  presets: [
    [
      '@4c/4catalyzer-react',
      {
        target: 'web',
        modules: process.env.BABEL_ENV === 'esm' ? false : 'commonjs',
      },
    ],
  ],
};
