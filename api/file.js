
export default function (req, res, _) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (url.searchParams.get('file') == null) {
    res.end()
    return
  }

  const fs = require('fs')
  let result = ''
  fs.readFile(url.searchParams.get('file'), 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    result = data
  })

  res.write(result)
  res.end()
}
