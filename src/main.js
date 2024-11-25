const core = require("@actions/core");
const github = require("@actions/github");
const { calculateNewVersion } = require("./semantic_versioning");

async function run() {
    try {
        const token = core.getInput("github_token", { required: true });
        const octokit = github.getOctokit(token);

        const { context } = github;
        const repo = context.repo;

        // Fetch commits
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner: repo.owner,
            repo: repo.repo,
        });

        // Calculate new version
        const newVersion = calculateNewVersion(commits);

        // Create a tag and release
        const tagResponse = await octokit.rest.git.createTag({
            owner: repo.owner,
            repo: repo.repo,
            tag: newVersion,
            message: `Release ${newVersion}`,
            object: context.sha,
            type: "commit",
        });

        await octokit.rest.repos.createRelease({
            owner: repo.owner,
            repo: repo.repo,
            tag_name: newVersion,
            name: `Release ${newVersion}`,
            body: `Version ${newVersion} is now available`,
        });

        core.setOutput("tag_name", newVersion);
        console.log(`created tag and release: ${newVersion}`);
    } catch (error) {
        core.setFailed(`Action failed with error: ${error.message}`);
    }
}

run();