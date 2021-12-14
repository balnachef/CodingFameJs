const shell = require('shelljs')

function createNode (path, tree, fullpath, repo, currentPath = null) {
  const name = path.shift()
  const idx = tree.findIndex(function (e) {
    return e.name == name
  })
  if (currentPath === null) {
    currentPath = `${repo}/${name}`
  } else {
    currentPath += `/${name}`
  }
  if (idx < 0) {
    if (name) {
      tree.push({
        name,
        children: [],
        path: currentPath,
        repo
      })
    }
    if (path.length !== 0) {
      if (name) {
        createNode(path, tree[tree.length - 1].children, fullpath, repo, currentPath)
      }
    }
  } else if (name) {
    createNode(path, tree[idx].children, fullpath, repo, currentPath)
  }
}
function parse (data, repo) {
  const tree = []
  for (let i = 0; i < data.length; i++) {
    const path = data[i]
    const split = path.split('/')
    createNode(split, tree, path, repo)
  }
  return tree
}

export default function (req, res, _) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.searchParams.get('repo') == null) {
    res.end()
    return
  }
  let gitFilterParams = ''
  let ignores = []
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

  if (url.searchParams.get('ignore') != null) {
    ignores = url.searchParams.get('ignore').replace(/ /g, '').split(',')
  }

  const gitlog = shell.exec(`cd ${url.searchParams.get('repo')} && git log --numstat ${gitFilterParams}`, { silent: true }).stdout
  const parsegit = require('parse-git-numstat')
  const commits = parsegit(gitlog)

  const output = {
    authors: {
    },
    lines: {
      added: 0,
      deleted: 0
    },
    commits: 0,
    files: []
  }
  let files = []
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
    files = files.concat(commit.stat.map(x => x.filepath))
  })

  output.files = parse(files, url.searchParams.get('repo'))

  res.write(JSON.stringify(output))
  res.end()

  function fileExcluded (filepath) {
    for (let i = 0; i < ignores.length; i++) {
      const element = ignores[i]
      if (filepath.includes(element)) {
        return true
      }
    }
    return false
  }
}
