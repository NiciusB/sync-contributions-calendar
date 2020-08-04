require('dotenv').config()
const nodegit = require('nodegit')
const path = require('path')
const fse = require('fs-extra')

const repoDir = path.resolve(__dirname, './tmp_repo')

module.exports.GitHelper = class GitHelper {
  async init ({ repoUrl, keyPublic, keyPrivate }) {
    await this.deleteLocalRepoFolder()
    this.creds = { keyPublic, keyPrivate }
    this.repository = await nodegit.Clone.clone(repoUrl, repoDir, { fetchOpts: { callbacks: await this._getCallbacksWithCredentials() } })

    return this
  }

  getCommitsByDate () {
    return new Promise((resolve, reject) => {
      this.repository.getMasterCommit()
        .then(masterCommit => masterCommit.history(nodegit.Revwalk.SORT.TIME))
        .then(history => {
          const dates = {}

          history.on('commit', (commit) => {
            const dateISO = commit.date().toISOString()
            const dateStr = dateISO.slice(0, 10)

            if (!dates[dateStr]) dates[dateStr] = 0
            dates[dateStr]++
          })
          history.on('end', function (commit) {
            resolve(dates)
          })
          history.on('error', reject)

          history.start()
        })
        .catch(reject)
    })
  }

  async generateCommit ({ username = 'Foo', email = 'foo@bar.com', timestamp = Date.now() / 1000 }) {
    const commitName = 'sync'
    const fileName = path.join('files', `${Math.random()}.txt`)
    const fileContent = ''

    // Create random file
    const filePath = path.join(repoDir, fileName)
    await fse.ensureFile(filePath)
    await fse.writeFile(filePath, fileContent)

    // Add file and commit
    const index = await this.repository.refreshIndex()
    await index.addByPath(fileName)
    await index.write()

    const Oid = await index.writeTree()
    const head = await nodegit.Reference.nameToId(this.repository, 'HEAD')
    const parent = await this.repository.getCommit(head)
    const signature = nodegit.Signature.create(username, email, timestamp, 0)
    await this.repository.createCommit('HEAD', signature, signature, commitName, Oid, [parent])

    return this
  }

  async push () {
    const remote = await this.repository.getRemote('origin')
    await remote.push(['refs/heads/master:refs/heads/master'], { callbacks: await this._getCallbacksWithCredentials() })

    return this
  }

  async _getCallbacksWithCredentials () {
    // This should not be reused for two calls
    const sshKey = await nodegit.Cred.sshKeyMemoryNew('git', this.creds.keyPublic, this.creds.keyPrivate, '')
    const callbacksWithCredentials = {
      credentials: () => sshKey
    }
    return callbacksWithCredentials
  }

  async deleteLocalRepoFolder () {
    await fse.remove(repoDir)
  }
}
