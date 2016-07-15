# HAF

> :fork_and_knife: HTML Application Framework

[![Travis](https://img.shields.io/travis/crossjs/HAF.svg?style=flat-square)](https://travis-ci.org/crossjs/HAF)
[![Coveralls](https://img.shields.io/coveralls/crossjs/HAF.svg?style=flat-square)](https://coveralls.io/github/crossjs/HAF)
[![dependencies](https://david-dm.org/crossjs/HAF.svg?style=flat-square)](https://david-dm.org/crossjs/HAF)
[![devDependency Status](https://david-dm.org/crossjs/HAF/dev-status.svg?style=flat-square)](https://david-dm.org/crossjs/HAF#info=devDependencies)
[![NPM version](https://img.shields.io/npm/v/HAF.svg?style=flat-square)](https://npmjs.org/package/HAF)

## APIs

- Layout
  - get(row, col)
- Plugin
  - add(route, layout, handler)
- Router
  - on(name, path, handler)
  - off(any)
  - start(origin)
  - go(path)
  - reset()
- Events
  - on(name, handler)
  - off(name, handler)
  - trigger(name, ...args)

## Usage

TODO

## License

[MIT](http://opensource.org/licenses/MIT)
