# aepx.js
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/actumn/aepx.js/blob/master/LICENSE)

This project tries to convert aepx to readable json.  
Inspired by 
- https://github.com/inlife/aftereffects-project-research
- https://github.com/Jam3/ae-to-json

## Install
```bash
npm i aepx
```

## Usage
### .parse()
callback api
```javascript
const aepx = require('aepx');

let data = '<AfterEffectsProject></AfterEffectsProject>';

aepx.parse(data, (err, project) => {
  console.log(project);
});
```
promise api
```javascript
const aepx = require('aepx');

let data = '<AfterEffectsProject></AfterEffectsProject>';

aepx.parse(data)
  .then(project => console.log(project));
```

### .parseSync()
```javascript
const aepx = require('aepx');

let data = '<AfterEffectsProject></AfterEffectsProject>';

console.log(aepx.parseSync(data));
```

### .parseFile()
callback api
```javascript
const aepx = require('aepx');

aepx.parseFile('./input/empty.aepx', (err, project) => {
  console.log(project);
});
```
promise api
```javascript
const aepx = require('aepx');

aepx.parseFile('./input/empty.aepx')
  .then(project => console.log(project));
```

### .parseFileSync()
```javascript
const aepx = require('aepx');

console.log(aepx.parseFileSync('./input/empty.aepx'));
```

## License
- MIT