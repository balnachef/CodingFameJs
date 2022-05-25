const shell = require('shelljs')

export default function (req, res, _) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.searchParams.get('repo') == null) {
    res.end()
    return
  }
  shell.echo(`cd ${url.searchParams.get('repo')} && git log --format="%an %aE" | sort /unique`)
  const gitlog = shell.exec(`cd ${url.searchParams.get('repo')} && git log --format="%an %aE" | sort /unique`, { silent: true }).stdout
  // let gitFilterParams = ''
  // const now = new Date()
  // const lastWeek = new Date(now.setDate(now.getDate() - 30)).toISOString().substring(0, 10)
  // gitFilterParams += `--since=${lastWeek} `
  // shell.echo(`cd ${url.searchParams.get('repo')} && git log --patch`)
  // const gitlogpatch = shell.exec(`cd ${url.searchParams.get('repo')} && git log --patch ${gitFilterParams}`, { silent: true }).stdout
  // const patchs = gitlogpatch.split("\n")
  // var changes =[]
  // var commits = []
  // var authors =[]
  // var date =[]
  //   patchs.forEach((patch) => {
  //     if(`${patch}`.startsWith("commit")){
  //      changes.push(patchs.splice(0,1))
  //     }
  //  })

  // another way to do it but it is longer, otherweise it is working like i wanted(without loop)

  //  if(`${patch}`.startsWith("commit")){
  //     changes.push(patch.splice(0,1))
  //   }
  //    if(`${patch}`.startsWith("Author")){
  //     changes.push(patch.splice(0,1))
  //   }
  //   if(`${patch}`.startsWith("Date")){
  //     changes.push(patch.splice(0,1))
  //   }



  const users = gitlog.split('\r')
  const output = []
  users.forEach((user) => {
    const userData = user.split(' ')
    if (userData.length === 3) {
      output.push({ name: `${userData[0]} ${userData[1]}`.trim(), email: userData[2].trim() })
    } else if (userData.length == 2) {
      output.push({ name: userData[0].trim(), email: userData[1].trim() })
    }
  })
  res.write(JSON.stringify(output))
  // res.write(JSON.stringify(changes))
  res.end()
}
