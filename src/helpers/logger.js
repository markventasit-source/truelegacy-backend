const clc = require('cli-color');

const logger = {
  info: (message) => console.log(clc.blue(`[INFO] ${message}`)),
  error: (message) => console.log(clc.red(`[ERROR] ${message}`)),
  success: (message) => console.log(clc.green(`[SUCCESS] ${message}`)),
  warn: (message) => console.log(clc.yellow(`[WARN] ${message}`))
};

module.exports = logger;