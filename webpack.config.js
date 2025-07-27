const path = require('path');
const { merge } = require('webpack-merge');
const defaultConfig = require('react-scripts/config/webpack.config');

module.exports = (env, argv) => {
  const config = defaultConfig(env, argv);
  
  config.module.rules.forEach(rule => {
    if (rule.oneOf) {
      rule.oneOf.forEach(oneOfRule => {
        if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
          oneOfRule.use.forEach(loader => {
            if (loader.loader && loader.loader.includes('postcss-loader')) {
              if (loader.options && loader.options.postcssOptions) {
                loader.options.postcssOptions = {
                  plugins: [
                    require('autoprefixer')
                  ]
                };
              }
            }
          });
        }
      });
    }
  });
  
  return config;
};
