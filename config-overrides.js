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
    
    // Copy necessary files to the temp public directory
    // This ensures they get copied during the build
    const filesToCopy = [
      { from: 'favAbugida', to: 'favAbugida' },
      { from: 'labels', to: 'labels' },
      { from: 'intro', to: 'intro' },
      { from: 'CNAME', to: 'CNAME' },
      { from: '404.html', to: '404.html' }
    ];
    
    filesToCopy.forEach(({ from, to }) => {
      const sourcePath = path.resolve(__dirname, from);
      const destPath = path.join(minimalPublic, to);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          // Copy directory recursively
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          copyDirectoryRecursive(sourcePath, destPath);
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, destPath);
        }
      }
    });
    
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
    
    return config;
  }
};

// Helper function to copy directories recursively
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip node_modules, .git, and build directories
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build') {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
