const core = require("@actions/core");
const github = require("@actions/github");
const semver = require("semver");

async function run() {
  try {
    const context = github.context;
    const token = core.getInput("github_token");
    const octokit = github.getOctokit(token);

    // Get the commit messages from the last push event
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: context.repo.owner,
      repo: context.repo.repo,
      sha: context.sha,
    });

    const messages = commits.map((commit) => commit.commit.message);

    // Determine the next version based on commit messages
    let version = "0.0.0";
    messages.forEach((message) => {
      if (message.startsWith("feat!:")) {
        version = semver.inc(version, "major");
      } else if (message.startsWith("feat:")) {
        version = semver.inc(version, "minor");
      } else if (message.startsWith("fix:")) {
        version = semver.inc(version, "patch");
      }
    });

    // Create a new release with the generated version
    const releaseResponse = await octokit.rest.repos.createRelease({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag_name: `v${version}`,
      name: `Release v${version}`,
      body: messages.join("\n"),
    });

    console.log(`Release created: ${releaseResponse.data.html_url}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
