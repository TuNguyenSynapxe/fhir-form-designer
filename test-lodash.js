// Quick test to verify lodash.get behavior
import get from 'lodash.get';

const sampleData = {
  "resourceType": "Patient",
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["John", "Michael"],
      "prefix": ["Mr."]
    }
  ]
};

console.log('Testing lodash.get:');
console.log('name[0].given[0]:', get(sampleData, 'name[0].given[0]'));
console.log('name[0].family:', get(sampleData, 'name[0].family'));
console.log('name[0].given:', get(sampleData, 'name[0].given'));

export default null;