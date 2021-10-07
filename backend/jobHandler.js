const authorMod = require('./Models/author');
const report = require('./reportHandler');


var _job;
var _gitHandle;
var _appsettings;
var _result;

function runJob(job, gitHandle, appsettings){
    _job = job;
    _gitHandle = gitHandle;
    _appsettings = appsettings;

    for (var i = 0; i < _job.Repositories.length; i++){
        var res = shortLog(_job.Repositories[i].Path);
        var authors = getAuthors(res);
    
        if(authors.length == 0){
            console.log("No authors were found with git shortlog in repository: " + _job.Repositories[i].Name);
            _job.Repositories[i].Authors = [];    
            continue;
        }
        _job.Repositories[i].Authors = authors;
        for (var j = 0; j < _job.Repositories[i].Authors.length; j++){
            var auObj = _job.Repositories[i].Authors[j];
            var res = Log(_job.Repositories[i].Path, auObj.Name);
            auObj.loc = new Object();
            auObj.loc = getLinesOfCode(res);
        }
        
    }
    report.report(_job, _appsettings);

}

function shortLog(path){
    return _gitHandle.shortlog(path);    
}

function getAuthors(stdout){
    var authors = [];
    var lines = stdout.split("\n");
    for(var i = 0; i < lines.length; i++){
        if(!isEmptyOrSpaces( lines[i])){
            if((/([0-9]+)\s+(.*)/).test(lines[i])){
                var elements = lines[i].match(/([0-9]+)\s+(.*)/);
                var au = new authorMod.author();
                au.Name = elements[2];
                au.Commits = elements[1];
                authors.push(au);
            }
        }
    }
    return authors;
}

function getLinesOfCode(stdout){
    var files = new Object();
    var lines = stdout.split("\n");
    for(var i = 0; i < lines.length; i++){
        if(!isEmptyOrSpaces( lines[i])){
            if((/([0-9]+)\s+([0-9]+)\s+(.*)/).test(lines[i])){
                
                var elements = lines[i].match(/([0-9]+)\s+([0-9]+)\s+(.*)/);

                if(isFileToBeIncludedInAnalysis(elements[3])){
                    if(files.hasOwnProperty(elements[3])){
                        files[elements[3]].AddedLines += parseInt(elements[1]);
                        files[elements[3]].DeletedLines += parseInt(elements[2]);
                        files[elements[3]].TotalLines += parseInt(elements[1]) - parseInt(elements[2]);

                    }
                    else{
                        files[elements[3]] = new Object();
                        files[elements[3]].AddedLines = parseInt(elements[1]);
                        files[elements[3]].DeletedLines = parseInt(elements[2]);
                        files[elements[3]].TotalLines = parseInt(elements[1]) - parseInt(elements[2]);
                    }
                }
                

            }
        }
    }
    return files;
}

function isFileToBeIncludedInAnalysis(filename){
    var val = true;
    if(_job.Parameters.hasOwnProperty("IncludeFilesWithExtensions")
        && Array.isArray(_job.Parameters.IncludeFilesWithExtensions) 
    && _job.Parameters.IncludeFilesWithExtensions.length > 0
    && !_job.Parameters.IncludeFilesWithExtensions.includes("." + filename.split('.').pop())){
        val = false;
    }
    if(_job.Parameters.hasOwnProperty("ExcludeFilesWithExtensions")
    && Array.isArray(_job.Parameters.ExcludeFilesWithExtensions) 
    && _job.Parameters.ExcludeFilesWithExtensions.length > 0
    && _job.Parameters.ExcludeFilesWithExtensions.includes("." + filename.split('.').pop())){
        val = false;
    }
    return val;
}


function Log(repositoryPath, authorName){
    return _gitHandle.log(repositoryPath, authorName);
}

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

exports.runJob = runJob;