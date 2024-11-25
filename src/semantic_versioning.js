const semver = require('semver');  // Import semver package to handle versioning

async function getCurrentVersion(octokit, repo) {
    // Fetch tags from the repository
    const { data: tags } = await octokit.rest.repos.listTags({
        owner: repo.owner,
        repo: repo.repo,
    });

    // Get the most recent tag or fallback to v0.0.0 if no tags are present
    const latestTag = tags[0] ? tags[0].name : "v0.0.0";
    return latestTag;
}

async function calculateNewVersion(octokit, repo, commits) {
    // Get the current version from the latest tag
    let currentVersion = await getCurrentVersion(octokit, repo);

    // Iterate over commits and adjust the version based on the commit message
    commits.forEach(commit => {
        const message = commit.commit.message;

        // If it's a 'feat!:' commit, bump the major version
        if (message.startsWith('feat!:')) {
            currentVersion = semver.inc(currentVersion, 'major');
        }
        // If it's a 'feat:' commit, bump the minor version
        else if (message.startsWith('feat:')) {
            currentVersion = semver.inc(currentVersion, 'minor');
        }
        // If it's a 'fix:' commit, bump the patch version
        else if (message.startsWith('fix:')) {
            currentVersion = semver.inc(currentVersion, 'patch');
        }
    });

    return currentVersion;
}

module.exports = { calculateNewVersion };


// Bumping major with "feat!:" commit
// Bumping minor with "feat:" commit
// Bumping patch with "fix:" commit
// Bumping patch with "fix:" commit
