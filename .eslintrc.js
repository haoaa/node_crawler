// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'semi': ['error', 'never'],
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    //custom config
    'indent': ['error', 2],
    'no-unused-vars': 0,
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': ['error', 'only-multiline'],
    'key-spacing': ['error', { 'align': 'colon' }],
    'eol-last': 0,
    'object-curly-spacing': 0,
    'no-unused-expressions':['off'],
  }
}
