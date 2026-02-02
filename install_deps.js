const { execSync } = require('child_process');
try {
  console.log('Installing dependencies...');
  // Try using npm.cmd directly if possible or just npm
  // On Windows, npm is a batch file or ps1.
  // execSync('npm install') might fail if it tries to spawn a shell.
  // Let's try to find where npm is.
  execSync('npm install', { stdio: 'inherit', shell: true });
  console.log('Dependencies installed.');
} catch (e) {
  console.error('Failed to install dependencies:', e.message);
}
