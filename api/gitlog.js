const shell = require('shelljs')

export default function (req, res, _) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  let gitFilterParams = ''
  if (url.searchParams.get('after') != null) {
    gitFilterParams += `--after=${url.searchParams.get('after')} `
  } else {
    const now = new Date()
    const lastMonth = new Date(now.setDate(now.getDate() - 30)).toISOString().substring(0, 10)
    gitFilterParams += `--after=${lastMonth} `
  }
  if (url.searchParams.get('before') != null) {
    gitFilterParams += `--before=${url.searchParams.get('before')} `
  }

  if (url.searchParams.get('author') != null) {
    gitFilterParams += `--author=${url.searchParams.get('author')} `
  }

  const gitlog = shell.exec(`cd /www/market-access-suite && git log --numstat ${gitFilterParams}`, { silent: true }).stdout
  const parse = require('parse-git-numstat')
  const commits = parse(gitlog)

  const output = {
    authors: {
    },
    lines: {
      added: 0,
      deleted: 0
    },
    commits: 0
  }

  commits.forEach((commit) => {
    if (output.authors[commit.author.email] && output.authors[commit.author.email] != null) {
      if (commit.stat.length > 0) {
        output.authors[commit.author.email].lines.added += commit.stat.reduce((p, n) => {
          if (fileExcluded(n.filepath)) {
            return p
          } else {
            return p + n.added
          }
        }, 0)
        output.authors[commit.author.email].lines.deleted += commit.stat.reduce((p, n) => {
          if (fileExcluded(n.filepath)) {
            return p
          } else {
            return p + n.deleted
          }
        }, 0)
      }
      output.authors[commit.author.email].commits += 1
    } else {
      output.authors[commit.author.email] = {
        lines: {
          added: commit.stat.reduce((p, n) => {
            if (fileExcluded(n.filepath)) {
              return p
            } else {
              return p + n.added
            }
          }, 0),
          deleted: commit.stat.reduce((p, n) => {
            if (fileExcluded(n.filepath)) {
              return p
            } else {
              return p + n.deleted
            }
          }, 0)
        },
        commits: 1
      }
    }

    output.lines.added += commit.stat.reduce((p, n) => {
      if (fileExcluded(n.filepath)) {
        return p
      } else {
        return p + n.added
      }
    }, 0)

    output.lines.deleted += commit.stat.reduce((p, n) => {
      if (fileExcluded(n.filepath)) {
        return p
      } else {
        return p + n.deleted
      }
    }, 0)
    output.commits += 1
  })
  res.write(JSON.stringify(output))
  res.end()

  function fileExcluded (filepath) {
    const excluded = ['package-lock.json', 'package.json']
    for (let i = 0; i < excluded.length; i++) {
      const element = excluded[i]
      if (filepath.includes(element)) {
        return true
      }
    }
    return false
  }
}
