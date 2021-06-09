/*
CODING FAME
(C) BY MARTIN WEIHRAUCH 2021
UNDER MIT LICENSE

*/
const git = require('./gitCommand');
const fs = require('fs');
const jH = require('./jobHandler');

var args = process.argv.slice(2);
var jsonFile = '';
var beforeParam = '';
var afterParam = '';

for (var i = 0; i < args.length; i++){
    if(args[i].includes('.json')){
        jsonFile = args[i];
    }
    else if(args[i].includes('--before=')){
        beforeParam =  args[i].replace('--before=', '');
    }
    else if(args[i].includes('--after')){
        afterParam = args[i].replace('--after=', '');
    }
}
if(jsonFile == ''){
    console.log("Please provide a job (.json) file!");
    return;
}


var rawdata = fs.readFileSync(jsonFile);
let job = JSON.parse(rawdata);
git.setJobSettings(job);
if(beforeParam.trim() != ""){
    job.Parameters.GitLogTimeBefore = beforeParam;
}
if(afterParam.trim() != ""){
    job.Parameters.GitLogTimeAfter = afterParam;
}

rawdata = fs.readFileSync('appSettings.json');
let settings = JSON.parse(rawdata);
git.setAppSettings(settings);

jH.runJob(job, git, settings);

/*
* 
git log --after="2014-02-12T16:36:00-07:00"
git log --before="2014-02-12T16:36:00-07:00"
git log --since="1 month ago"
git log --since="2 weeks 3 days 2 hours 30 minutes 59 seconds ago"
*
*/


//https://www.lostindetails.com/articles/get-contributor-stats-from-git