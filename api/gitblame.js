

//     var gitBlame = require('git-blame');
//     var path = require('path');

// var repoPath = path.resolve(process.env.REPO || (__dirname + '/.git'));
// var file = process.env.FILE || 'package.json';
// var rev = process.env.REV || 'HEAD';

// gitBlame(repoPath, {
//   file: file,
//   rev: rev
// }).on('data', function(type, data) {
//   // type can be 'line' or 'commit'
//   console.log(type, data);
// }).on('error', function(err) {
//   console.error(err.message);
//   process.exit(1);
// })
