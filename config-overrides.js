const path = require('path');
const fs = require('fs');

module.exports = {
  paths: function (paths, env) {
    // Create a temporary minimal public directory to avoid circular copy issues
    // This prevents react-scripts from trying to copy the entire root
    const minimalPublic = path.resolve(__dirname, '.public-temp');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(minimalPublic)) {
      fs.mkdirSync(minimalPublic, { recursive: true });
    }
    
    // Create a minimal index.html in the temp directory (react-scripts needs this)
    const tempIndexHtml = path.join(minimalPublic, 'index.html');
    if (!fs.existsSync(tempIndexHtml)) {
      // Copy the root index.html to temp directory
      const rootIndexHtml = path.resolve(__dirname, 'index.html');
      if (fs.existsSync(rootIndexHtml)) {
        fs.copyFileSync(rootIndexHtml, tempIndexHtml);
      }
    }
    
    paths.appPublic = minimalPublic;
    paths.appHtml = path.resolve(__dirname, 'index.html');
    return paths;
  },
  webpack: function (config, env) {
    // Update HtmlWebpackPlugin to use root index.html (not the temp one)
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
      // This prevents copying the entire root directory
      CopyWebpackPlugin.patterns = [
        {
          from: path.resolve(__dirname, 'favAbugida'),
          to: 'favAbugida',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/node_modules/**', '**/.git/**']
          }
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
