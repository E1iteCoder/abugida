const path = require('path');
const fs = require('fs');

module.exports = {
  paths: function (paths, env) {
    // Use a minimal public directory to avoid circular copy issues
    // We'll handle copying assets manually in webpack config
    const minimalPublic = path.resolve(__dirname, '.public-temp');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(minimalPublic)) {
      fs.mkdirSync(minimalPublic, { recursive: true });
    }
    
    paths.appPublic = minimalPublic;
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
    
    // Find and update CopyWebpackPlugin
    const CopyWebpackPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'CopyWebpackPlugin'
    );
    
    if (CopyWebpackPlugin) {
      // Completely replace patterns - only copy what we need from root
      // Exclude build, node_modules, src, etc.
      CopyWebpackPlugin.patterns = [
        {
          from: path.resolve(__dirname, 'favAbugida'),
          to: 'favAbugida',
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'CNAME'),
          to: 'CNAME',
          noErrorOnMissing: true
        }
      ];
    }
    
    return config;
  }
};
