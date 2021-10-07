const exec = require('child_process').execSync;

var gitEveryPath = "-C";
var appSettings = {};
var _job = {};

//git ls-tree --full-tree -r --name-only HEAD

function shortlog(repositoryPath) {
    var command = "shortlog  --all -sn --no-merges <after> <before>";
    var times = getTimes();
    var regex = "[0-9]+\\s+";
    command = command.replace("<before>", times.before).replace("<after>", times.after);
    var comm = appSettings.GeneralSettings.GitCommand + " " + gitEveryPath + " " + repositoryPath + " " + command;
    return execute(comm);
}


function log(repositoryPath, authorName){
    var command = "log --author=\"<author>\" --date=iso --pretty=format:\"--Date:%ad--Author:%an\" --numstat --all --no-merges <after> <before>";
    var times = getTimes();

    command = command.replace("<author>", authorName).replace("<before>", times.before).replace("<after>", times.after);
    var comm = appSettings.GeneralSettings.GitCommand + " " + gitEveryPath + " " + repositoryPath + " " + command;
    console.log("Git command: " + comm);
    return execute(comm);

    //git log --all -M -C --numstat --date=short --pretty=format:'--Date:%ad----Author:%an' --no-rename
    //git -C D:/SIM_Backups/__BACKUPS/Repos/EasyRadiology/Ezdicom log --author="Reinhard Gruber" --date=iso --pretty=format:'--Date:%ad--Author:%an' --numstat --all --after="2020-02-12T00:00:00"  --before="2021-02-18T23:59:59"
  }

  function getTimes(){
      var after = "--after=";
      var before = "--before=";
      if(!_job.Parameters.hasOwnProperty('GitLogTimeBefore')){
        before = "";
      }
      else{
        before += "\"" + _job.Parameters.GitLogTimeBefore + "\"";
      }
      if(!_job.Parameters.hasOwnProperty('GitLogTimeAfter')){
        after = "";
      }
      else{
        after += "\"" + _job.Parameters.GitLogTimeAfter + "\"";
      }
      return {before: before, after: after};
  }

  function blame(repositoryPath, authorName){
    var command = "blame --date=iso --pretty=format:\"--Date:%ad--Author:%an\" --all <after> <before>";
    var after = "--after=";
    var before = "--before=";
    if(!_job.Parameters.hasOwnProperty('GitLogTimeBefore')){
      before = "";
    }
    else{
      before += "\"" + _job.Parameters.GitLogTimeBefore + "\"";
    }
    if(!_job.Parameters.hasOwnProperty('GitLogTimeAfter')){
      after = "";
    }
    else{
      after += "\"" + _job.Parameters.GitLogTimeAfter + "\"";
    }

    command = command.replace("<author>", authorName).replace("<before>", before).replace("<after>", after);
    var comm = appSettings.GeneralSettings.GitCommand + " " + gitEveryPath + " " + repositoryPath + " " + command;
    console.log("Git command: " + comm);
    return execute(comm);

    //git log --all -M -C --numstat --date=short --pretty=format:'--Date:%ad----Author:%an' --no-rename
    //git -C D:/SIM_Backups/__BACKUPS/Repos/EasyRadiology/Ezdicom log --author="Reinhard Gruber" --date=iso --pretty=format:'--Date:%ad--Author:%an' --numstat --all --after="2020-02-12T00:00:00"  --before="2021-02-18T23:59:59"
  }

function setAppSettings(settings){
    appSettings = settings;
}

function setJobSettings(settings){
    _job = settings;
}

function execute(command){
    return exec(command).toString();
  
}

exports.setAppSettings = setAppSettings;
exports.setJobSettings = setJobSettings;
exports.shortlog = shortlog;
exports.log = log;