# Semantic Versioning Action
## Overview
This project leverages **Semantic Versioning** and **semantic-release** to automate the versioning and release process. The GitHub Action is configured to analyze the commit messages, determine the release type (major, minor, or patch), and update associated files like `CHANGELOG.md`. It also publishes the release on GitHub. <br>
Checkout this [blog](https://dev.to/arpanaditya/automating-releases-with-semantic-versioning-and-github-actions-2a06) for reference.

---

## Features
 - **Automated Versioning**: Based on commit message types.
 - **Changelog Management**: Update `CHANGELOG.md` automatically.
 - **GitHub Release**: Publishes releases to the repository.
 
 ---
 
 ## How to Build and Configure the Project
 ### Prerequisites
 - **Node.js**: Install the latest version from the [Node.js official website](https://nodejs.org/en).
 - **Git**: Ensure Git is installed and configured on your system.
 - **GitHub Repository**:
   - `GITHUB_TOKEN`: Used for authentication during the release process. <br> (Note: in this case, GitHub automatically assigns a token while running the action.)
 ### Steps to Build and Configure
 1. **Clone the Repository**:
    ```
    git clone https://github.com/<github_username>/<github_repo_name>.git
    cd <repository_directory>
    ```
 2. **Install Dependencies**: Use npm to install all required dependencies.
    ```
    npm install
    ```
    
 4. **Configure Release Settings**: Modify the `package.json` file to match your project's branches and assets.
    ```
    "release": {
    "branches": [
      "main"
    ],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      [
        "@semantic-release/github",
        {
          "assets": [
            {
              "path": "dist.zip",
              "label": "Distribution"
            }
          ]
        }
      ],
      [
        "@semantic-release/git",
        {
          "assets": [
            "package.json",
            "CHANGELOG.md"
          ],
          "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }
      ]
    ]
    }
    ```
    
 6. **Set Up Workflow File**: Add the following workflow file to `.github/workflows/release.yml`.
    ```
    name: Release

    on:
      push:
        branches:
          - main # Triggers when code is pushed to the main branch

    jobs:
      release:
        permissions:
          contents: write
        runs-on: ubuntu-latest # Runs on an Ubuntu runner

        steps:
          # Step 1: Checkout the repository code
          - name: Checkout Repository
            uses: actions/checkout@v3

          # Step 2: Set up Node.js
          - name: Set up Node.js
            uses: actions/setup-node@v3
            with:
              node-version: "20.x" # Use the Node.js version required for your project

          # Step 3: Cache Node.js modules to speed up future builds
          - name: Cache Node.js modules
            uses: actions/cache@v3
            with:
              path: node_modules
              key: ${{ runner.os }}-node-modules-${{ hashFiles('**/package-lock.json') }}
              restore-keys: |
                ${{ runner.os }}-node-modules-

          # Step 4: Install dependencies
          - name: Install Dependencies
            run: npm ci

          # Step 5: Run semantic-release
          - name: Run Semantic Release
            run: npx semantic-release
            env:
              GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Provide the GitHub token for authentication
    ```
 8. **Push Changes**: Commit and push the workflow file and updated configurations to the `main` branch.
    ```
    git add .
    git commit -m "type(scope): commit message"
    git push origin main
    ```
  
---

## Semantic Release Workflow
### Commit Messages
The table below explains the required commie message structure and the type of release triggered:

| Commit Message Type | Example Commit Message | Release Type |
| ------------------------- | ----------------------------- | --------------- |
|`feat!`|`feat!: add user authentication` <br> `BREAKING CHANGE: add user authentication`|Major|
|`feat`|`feat: add user authentication`|Minor|
|`fix`|`fix: resolve login issue`|Patch|
|`chore`|`chore: update dependencies`|No Release|


---

### Workflow Steps
1. **Trigger**: The workflow triggers when code is pushed to the `main` branch.
2. **Setup**: The repository is checked out, and Node.js is set up.
3. **Cache & Install**: Node.js dependencies are cached and installed using `npm ci`.
4. **Semantic Release**: The `npx semantic-release` command analyzes commit messages, determines the release type, and performs the following:
 - Generates and updates the `CHANGELOG.md`.
 - Publishes a release to GitHub.

---

### Project Structure
```
project-root/ 
├── .github/ 
│ └── workflows/ 
│ └── release.yml 
├── CHANGELOG.md 
├── README.md
```

---

## Dependencies
This project relies on the following `npm` packages:
 - `@semantic-release/changelog`
 - `@semantic-release/commit-analyzer`
 - `@semantic-release/release-notes-generator`
 - `@semantic-release/git`
 - `@semantic-release/github`
 - `semantic-release`

Install them with:
```
npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/commit-analyzer @semantic-release/release-notes-generator @semantic-release/git @semantic-release/github
```

## FAQs
### What happens if the commit messages are not formatted correctly?
If the commit message doesn't follow the **conventional commit** format, no release will be generated. Ensure messages are properly formatted.

### Can I modify the branches used for release?
Yes, update the `branches` array in the `package.json` under the `release` field.

### How can I add custom assets to releases?
Modify the `@semantic-release/github` plugin configuration in `package.json` to include additional assets.

### Where is the `CHANGELOG.md` updated?
It is updated in the root directory during the GitHub Action workflow execution.

---

Made with ❤️ by [@arpanaditya](https://github.com/arpanaditya)

