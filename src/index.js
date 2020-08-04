require('dotenv').config()
const { GitHelper } = require('./git-helper')
const { getGitlabCalendar } = require('./gitlab-calendar')

main().then(gitHelper => gitHelper.deleteLocalRepoFolder())

async function main () {
  console.log('💫 Starting...')

  // Clone repository in a clean directory
  console.log('💫 Cloning repo')
  const gitHelper = await new GitHelper().init({
    repoUrl: process.env.FAKE_COMMITS_REPO_URL,
    keyPrivate: process.env.FAKE_COMMITS_REPO_DEPLOY_KEY_PRIVATE,
    keyPublic: process.env.FAKE_COMMITS_REPO_DEPLOY_KEY_PUBLIC
  })

  const githubCalendar = await gitHelper.getCommitsByDate()
  const gitlabCalendar = await getGitlabCalendar(process.env.GITLAB_USERNAME)
  const gitlabCommitDays = Object.keys(gitlabCalendar)

  let whereChangesMade = false
  for (const day of gitlabCommitDays) {
    const gitlabCommitsCount = gitlabCalendar[day]
    const githubCommitsCount = githubCalendar[day] || 0

    let diff = gitlabCommitsCount - githubCommitsCount
    if (diff > 0) {
      whereChangesMade = true
      console.log(`💫 Generating ${diff} commits for day ${day}`)
      const dayTimestamp = Math.floor(new Date(`${day} 12:00`).getTime() / 1000)

      while (diff > 0) {
        await gitHelper.generateCommit({
          username: process.env.GIT_USERNAME,
          email: process.env.GIT_EMAIL,
          timestamp: dayTimestamp
        })
        diff--
      }
    }
  }

  if (whereChangesMade) {
    // Push to remote
    console.log('💫 Pushing to remote')
    await gitHelper.push()
  }

  // All done!
  console.log('💫 All done!')

  return gitHelper
}
