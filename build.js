const { execSync } = require('child_process');

try {
  // Install dependencies using npm
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Run build
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 