var proxy = require('http-proxy-middleware');

var apiProxy = proxy('/api', {
    target: 'http://localhost:3001',
    changeOrigin: true   // for vhosted sites
});

module.exports = {
    server: {
        baseDir: ["./app", "./build/contracts"],
        // Start from key `10` in order to NOT overwrite the default 2 middleware provided
        // by `lite-server` or any future ones that might be added.
        // Reference: https://github.com/johnpapa/lite-server/blob/master/lib/config-defaults.js#L16
        middleware: {
            10: apiProxy
        }
    },
     port: 8000
   };
