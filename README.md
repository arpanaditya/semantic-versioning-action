# Semantic Versioning Action
## Overview
This project leverages **Semantic Versioning** and **semantic-release** to automate the versioning and release process. The GitHub Action is configured to analyze the commit messages, determine the release type (major, minor, or patch), and update associated files like `CHANGELOG.md`. It also publishes the release on GitHub.

---

## Features
 - **Automated Versioning**: Based on commit message types.
 - **Changelog Management**: Update `CHANGELOG.md` automatically.
 - **GitHub Release**: Publishes releases to the repository.
 
 ---
 
 ## Prerequisites
 1. **GitHub Repository Setup**:
  - Ensure the repository uses **conventional commits** for commit messages.
 2. **Node.js Installation**:
  - Node.js version 20.x or higher is required for local testing.
  
---

## Commit Message Guidelines
The table below explains the required commie message structure and the type of release triggered:

| Commit Message Type | Example Commit Message | Release Type |
| ------------------------- | ----------------------------- | --------------- |
|`feat!`|`feat!: add user authentication` <br> `BREAKING CHANGE: add user authentication`|Major|
|`feat`|`feat: add user authentication`|Minor|
|`fix`|`fix: resolve login issue`|Patch|
|`chore`|`chore: update dependencies`|No Release|

---

## Project Structure
```
project-root/ 
├── .github/ 
│ └── workflows/ 
│ └── release.yml 
├── CHANGELOG.md 
├── README.md
```

---

## How It Works
1. **Trigger**: The workflow triggers when code is pushed to the `main` branch.
2. **Setup**: The repository is checked out, and Node.js is set up.
3. **Cache & Install**: Node.js dependencies are cached and installed using `npm ci`.
4. **Semantic Release**: The `npx semantic-release` command analyzes commit messages, determines the release type, and performs the following:
 - Generates and updates the `CHANGELOG.md`.
 - Publishes a release to GitHub.

---

## FAQs
### What happens if the commit messages are not formatted correctly?
If the commit message doesn't follow the **conventional commit** format, no release will be generated. Ensure messages are properly formatted.

### Can I modify the branches used for release?
Yes, update the `branches` array in the `package.json` under the `release` field.

### How can I add custom assets to releases?
Modify the `@semantic-release/github` plugin configuration in `package.json` to include additional assets.

---

Made with ❤️ by [@arpanaditya](https://github.com/arpanaditya)

