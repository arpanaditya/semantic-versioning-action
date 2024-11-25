const core = require("@actions/core");
const github = require("@actions/github");
const { exec } = require("child_process");
const { calculateNewVersion } = require("./semantic_versioning");

async function run() {
    try {
        const token = core.getInput("github_token", { required: true });
        const octokit = github.getOctokit(token);

        const { context } = github;
        const repo = context.repo;

        // Fetch commits to calculate the new version
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
        });

        // Calculate new version based on the commits
        const newVersion = await calculateNewVersion(octokit, repo, commits);
        console.log(`Calculated new version: ${newVersion}`);

        // Check if the tag already exists by listing the tags
        const { data: tags } = await octokit.rest.repos.listTags({
            owner: repo.owner,
            repo: repo.repo,
        });

        // Log existing tags for debugging purposes
        console.log(`Existing tags: ${tags.map((tag) => tag.name).join(", ")}`);

        // If the tag already exists, delete it and recreate
        if (tags.some((tag) => tag.name === newVersion)) {
            console.log(`Tag ${newVersion} already exists. Deleting and recreating the tag.`);

            // Check if the tag exists locally before trying to delete it
            try {
                await execPromise(`git rev-parse ${newVersion}`); // Check if the tag exists locally
                await execPromise(`git tag -d ${newVersion}`);
                await execPromise(`git push --delete origin ${newVersion}`);
                console.log(`Deleted tag ${newVersion} locally and from the remote.`);
            } catch (err) {
                console.log(`Tag ${newVersion} does not exist locally, skipping deletion.`);
            }
        }

        // Create a new tag using Octokit API
        const tagResponse = await octokit.rest.git.createTag({
            owner: repo.owner,
            repo: repo.repo,
            tag: newVersion,
            message: `Release ${newVersion}`,
            object: context.sha,
            type: "commit",
        });

        // Log the tag creation response
        console.log(`Created tag response:`, tagResponse);

        // Create a new release
        const releaseResponse = await octokit.rest.repos.createRelease({
            owner: repo.owner,
            repo: repo.repo,
            tag_name: newVersion,
            name: `Release ${newVersion}`,
            body: `Version ${newVersion} is now available`,
        });

        // Log the release creation response
        console.log(`Created release response:`, releaseResponse);

        core.setOutput("tag_name", newVersion);
        console.log(`Created tag and release: ${newVersion}`);
    } catch (error) {
        console.log("Error details:", error);  // Detailed error logging
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

// Utility function to run Git commands asynchronously
function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`exec error: ${error}, stderr: ${stderr}`);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

run();
