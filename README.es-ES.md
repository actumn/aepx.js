

*Obsoleto. Por favor, utiliza https://github.com/boltframe/aftereffects-aep-parser*
 
# aepx.js
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/actumn/aepx.js/blob/master/LICENSE)

Este proyecto intenta convertir archivos aepx a JSON legible.  
Inspirado en 
- https://github.com/inlife/aftereffects-project-research
- https://github.com/Jam3/ae-to-json

## Instalación
```bash
npm i aepx
```

## Uso
### .parse()
API basada en callbacks
```javascript
const aepx = require('aepx');

let data = '<AfterEffectsProject></AfterEffectsProject>';

aepx.parse(data, (err, project) => {
  console.log(project);
});
```
API basada en promesas
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
API basada en callbacks
```javascript
const aepx = require('aepx');

aepx.parseFile('./input/empty.aepx', (err, project) => {
  console.log(project);
});
```
API basada en promesas
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

## Licencia
- MIT
