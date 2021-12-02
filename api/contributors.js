const shell = require('shelljs')

export default function (req, res, _) {
  const gitlog = shell.exec('cd /www/market-access-suite && git log --format="%an %aE" | sort /unique', { silent: true }).stdout

  const users = gitlog.split('\r')

  const output = []
  users.forEach((user) => {
    const userData = user.split(' ')
    if (userData.length == 3) {
      output.push({ name: `${userData[0]} ${userData[1]}`.trim(), email: userData[2].trim() })
    } else if (userData.length == 2) {
      output.push({ name: userData[0].trim(), email: userData[1].trim() })
    }
  })
  res.write(JSON.stringify(output))
  res.end()
}
