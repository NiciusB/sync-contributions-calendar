const fetch = require('node-fetch')

module.exports.getGitlabCalendar = async function getGitlabCalendar (gitlabUsername) {
  return fetch(`https://gitlab.com/users/${gitlabUsername}/calendar.json`, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en,es;q=0.9,pt;q=0.8'
    }
  }).then(res => res.json())
}
