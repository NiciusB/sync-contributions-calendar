# sync-contributions-calendar

Merge your Gitlab's public contributions calendar to your Github contributions calendar.

## How to setup

1. Fork this github repo
2. Create a new private github repo, with a name similar to `sync-contributions-calendar-fake-commits`. You have to initialize it with something, so select the option to create a readme file.
3. Create a new pair of private and public keys. You can do it on the terminal, or just use a website like https://8gwifi.org/sshfunctions.jsp. A website is NOT recommended for any important stuff, but this is not important.
4. On `sync-contributions-calendar-fake-commits`, go to Settings -> Deploy key tab. and add a new Deploy key **with write access** with the public key you have generated
5. On `sync-contributions-calendar` (your fork) configure the secrets. Go to Settings -> Secrets.
    1. GITLAB_USERNAME: Your GitLab username
    2. GIT_USERNAME: Your GitHub username
    3. GIT_EMAIL: Your GitHub email
    4. FAKE_COMMITS_REPO_URL: The git url for your `sync-contributions-calendar-fake-commits` repo. For example: `git@github.com:NiciusB/sync-contributions-calendar-fake-commits.git`
    5. FAKE_COMMITS_REPO_DEPLOY_KEY_PUBLIC: The public key you generated on step 3
    6. FAKE_COMMITS_REPO_DEPLOY_KEY_PRIVATE: The private key you generated on step 3
6. You should be good to go! The github action should execute every hour, and generate activity as needed to replicate your GitLab activity calendar.

## How to remove

If you no longer want to use this, just remove both repositories from your account. Please note that it will remove the data from your calendar as well.
