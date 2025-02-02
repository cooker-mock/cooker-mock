const defaultConfig = require('./default');

const env = process.env.NODE_ENV || 'production'; // use 'production' as default

let envConfig = {};
try {
  envConfig = require(`./${env}`);
} catch (error) {
  console.warn(`No config found for environment "${env}", using default only.`);
}

const finalConfig = { ...defaultConfig, ...envConfig };

console.log(`Loaded "${env}" configuration`);

module.exports = finalConfig;
