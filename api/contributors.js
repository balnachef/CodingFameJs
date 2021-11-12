const shell = require('shelljs')

export default function (req, res, _) {
    var gitlog = shell.exec("cd /www/market-access-suite && git log --format=\"%an %aE\" | sort /unique", {silent:true}).stdout;
    res.write(gitlog)
    res.end()
}