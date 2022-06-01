

const shell = require('shelljs')

export default function (req, res, _) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.searchParams.get('repo') == null) {
    res.end()
    return
  }
  shell.echo(`cd ${url.searchParams.get('repo')} && git --patch --pretty=email`)
  const gitlogpatch = shell.exec(`cd ${url.searchParams.get('repo')} && git log --patch --pretty=email`, { silent: true }).stdout

//   const hashRegex = /^From \S*/
// const authorRegex = /^From:\s?([^<].*[^>])?\s+(<(.*)>)?/
// const fileNameRegex = /^diff --git "?a\/(.*)"?\s*"?b\/(.*)"?/
// const fileLinesRegex = /^@@ -([0-9]*),?\S* \+([0-9]*),?/
// const similarityIndexRegex = /^similarity index /
// const addedFileModeRegex = /^new file mode /
// const deletedFileModeRegex = /^deleted file mode /
// const lines = gitlogpatch.split('\n')

//  const hashLine = lines.shift()
//  const [, hash] = hashLine.match(hashRegex)

//  const authorLine = lines.shift()
//  const [, Name,, Email] = authorLine.match(authorRegex)

//  const dateLine = lines.shift()
//  const [, Date] = dateLine.split('Date: ')

//  const messageLine = lines.shift()
//  const [, Commit] = messageLine.split('Subject: ')


//  const  [,files] = lines.slice(1)


//  const parsedPatch = {
//     Name,
//     Email,
//     Date,
//     Commit,
//     files,
//   }






 //   const parseGitPatch = require('parse-git-patch')
 //   const parsedPatch = parseGitPatch(gitlogpatch)
 //   let hasRegex=/^From \S*/
 //   let authorRegex = /^From: \s?([^<].*[^>])?/
 //   const patchCommit = `${lines}`.match(hasRegex)
 //   const patchAuthor = `${lines}`.match(authorRegex)



  res.write(JSON.stringify(gitlogpatch))
  res.end()
}