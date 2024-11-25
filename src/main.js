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

        // Log existing tags for debugging purposes
        console.log(`Existing tags: ${tags.map((tag) => tag.name).join(", ")}`);

        // If you want to overwrite existing tags, you can skip the check here and create a new tag
        // Otherwise, use the condition below to skip tag creation if the tag already exists
        if (tags.some((tag) => tag.name === newVersion)) {
            console.log(`Tag ${newVersion} already exists. Deleting and recreating the tag.`);

            // Deleting the existing tag via Git CLI
            await execPromise(`git tag -d ${newVersion}`);
            await execPromise(`git push --delete origin ${newVersion}`);

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
