const path = require('path');

module.exports = {
  paths: function (paths, env) {
    // Override paths to use root directory instead of public folder
    paths.appPublic = path.resolve(__dirname);
    paths.appHtml = path.resolve(__dirname, 'index.html');
    return paths;
  },
  webpack: function (config, env) {
    // Update HtmlWebpackPlugin to use root index.html
    const HtmlWebpackPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
    );
    
    if (HtmlWebpackPlugin) {
      HtmlWebpackPlugin.options.template = path.resolve(__dirname, 'index.html');
    }
    
    // Update CopyWebpackPlugin to copy from root instead of public
    const CopyWebpackPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'CopyWebpackPlugin'
    );
    
    if (CopyWebpackPlugin && CopyWebpackPlugin.patterns) {
      // Replace patterns - copy favAbugida from root
      CopyWebpackPlugin.patterns = [
        {
          from: path.resolve(__dirname, 'favAbugida'),
          to: 'favAbugida',
          noErrorOnMissing: true
        }
      ];
    }
    
    return config;
  }
};

