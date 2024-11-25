const core = require("@actions/core");
const github = require("@actions/github");
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

        // Check if the tag already exists by listing the tags
        const { data: tags } = await octokit.rest.repos.listTags({
            owner: repo.owner,
            repo: repo.repo,
        });

        // If the tag already exists, skip creation and exit
        if (tags.some(tag => tag.name === newVersion)) {
            core.info(`Tag ${newVersion} already exists. Skipping tag and release creation.`);
            return;  // Exit the function without proceeding further
        }

        // Create a new tag
        const tagResponse = await octokit.rest.git.createTag({
            owner: repo.owner,
            repo: repo.repo,
            tag: newVersion,
            message: `Release ${newVersion}`,
            object: context.sha,
            type: "commit",
        });

        // Create a new release
        await octokit.rest.repos.createRelease({
            owner: repo.owner,
            repo: repo.repo,
            tag_name: newVersion,
            name: `Release ${newVersion}`,
            body: `Version ${newVersion} is now available`,
        });

        core.setOutput("tag_name", newVersion);
        console.log(`Created tag and release: ${newVersion}`);
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

run();
