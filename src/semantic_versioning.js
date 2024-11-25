function calculateNewVersion(commits) {
    let major = 1,
        minor = 0,
        patch = 0;

    commits.forEach((commit) => {
        const message = commit.commit.message;

        if (message.includes("feat!:")) {
            major++;
            minor = 0;
            patch = 0;
        } else if (message.startsWith("feat:")) {
            minor++;
            patch = 0;
        } else if (message.startsWith("fix:")) {
            patch++;
        }
    });
    
    return `v${major}.${minor}.${patch}`;
}

module.exports = { calculateNewVersion };
