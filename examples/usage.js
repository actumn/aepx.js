const fs = require('fs');
const aepx = require('../index');

let data = '<AfterEffectsProject></AfterEffectsProject>';

console.log(aepx.parseSync(data));
aepx.parse(data, (err, project) => {
  console.log(project);
});

aepx.parse(data)
  .then(project => console.log(project));


data = fs.readFileSync('./input/empty.aepx');
aepx.parse(data)
  .then(project => console.log(project));

aepx.parseFile('./input/empty.aepx', (err, project) => {
  console.log(project);
});

aepx.parseFile('./input/empty.aepx')
  .then(project => console.log(project));

console.log(aepx.parseFileSync('./input/empty.aepx'));
