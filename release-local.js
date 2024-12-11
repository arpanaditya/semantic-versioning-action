// Load environment variables from the .env file
require('dotenv').config();

// Now you can access the environment variables
const { execSync } = require('child_process');

// Make sure the GITHUB_TOKEN is loaded
if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN is not set in the .env file');
    process.exit(1);
}

// Run semantic-release with dry-run
execSync('npx semantic-release --dry-run', { stdio: 'inherit' });
