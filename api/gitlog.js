const shell = require('shelljs')

export default function (req, res, _) {
    var url = new URL(req.url, `http://${req.headers.host}`)
    var gitFilterParams = ""
    if (url.searchParams.get("after") != null) {
        gitFilterParams += `--after=${url.searchParams.get("after")} `
    } else {
        var now = new Date();
        var lastMonth = new Date(now.setDate(now.getDate() - 30)).toISOString().substring(0, 10);
        gitFilterParams += `--after=${lastMonth} `
    }
    if (url.searchParams.get("before") != null) {
        gitFilterParams += `--before=${url.searchParams.get("before")} `
    }

    if (url.searchParams.get("author") != null) {
        gitFilterParams += `--author=${url.searchParams.get("author")} `
    }

    var gitlog = shell.exec(`cd /www/market-access-suite && git log --numstat ${gitFilterParams}`, {silent:true}).stdout;
    const parse = require('parse-git-numstat');
    const commits = parse(gitlog);
    res.write(JSON.stringify(commits))
    res.end()
}