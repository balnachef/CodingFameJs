const cheerio = require('cheerio');
const fs = require("fs"); // Or `import fs from "fs";` with ESM
const chrono = require('chrono-node');
var dateFormat = require("dateformat");
const { html } = require('cheerio');
var _report;

//=> <html><head></head><body><h2 class="title welcome">Hello there!</h2></body></html>


function report(job, appsettings){
    if (appsettings.GeneralSettings.ReportOutputFolder.trim() != "") {
        if(!fs.existsSync(appsettings.GeneralSettings.ReportOutputFolder)){
            fs.mkdirSync(appsettings.GeneralSettings.ReportOutputFolder);
        }
    }
    else {
        console.log("Error: You have to set the ReportOutputFolder in the appsettings.json to run a report!");
        return;
    }

    getGeneralInformation(job);
    if (!fs.existsSync(appsettings.GeneralSettings.TemplateFile)) {
        console.log('Error: File' + appsettings.GeneralSettings.TemplateFile + ' does not exist!');
        return;
    }
    var rawdata = fs.readFileSync(appsettings.GeneralSettings.TemplateFile, 'utf8');

    _report = {
        GeneralInformations: "",
        Authors: [],
        Repositories:[]
    };

    _report.GeneralInformations = getGeneralInformation(job);
    _report.Authors = getAuthorData(job);
    _report.Repositories = job.Repositories;
    var htmlString = embedGeneralInfoIntoHtml(rawdata);
    htmlString = embedAuthorDataIntoHtml(htmlString);
    htmlString = embedRepositoryDataIntoHtml(htmlString);
    
    var now = new Date();
    var dt = dateFormat(now, "yyyy-mm-dd-H-MM-ss");
    fs.writeFile(appsettings.GeneralSettings.ReportOutputFolder + "/" + job.Parameters.JobName + "_" + dt + ".html", htmlString, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
    
}

function embedGeneralInfoIntoHtml(html){
    const $ = cheerio.load(html);
    $('#GeneralInformation').text(_report.GeneralInformations);
    var test = $.html();
    return $.html();

}

function embedAuthorDataIntoHtml(html){
    var results = {
        CommitStat: [], //{Author, TotalCommits, Repos []}
        LocStat: [] // {Author, TotalLinesAdded, TotalLinesDeleted, TotalTotalLines}
    };
    
    const $ = cheerio.load(html);
    if(_report.Authors !== undefined){
        for (var i = 0; i < _report.Authors.length; i++){
        
        }
    }
    return $.html();
}

function embedRepositoryDataIntoHtml(html){
    const $ = cheerio.load(html);

}


function getGeneralInformation(job){
    var after = chrono.parseDate(job.Parameters.GitLogTimeAfter);
    var before = chrono.parseDate(job.Parameters.GitLogTimeBefore);
    var dtAfter = Date.parse(after);
    var dtBefore = Date.parse(before);
    var strAfter = dateFormat(dtAfter, "ddd, yyyy-mm-dd, HH:MM");
    var strBefore = dateFormat(dtBefore, "ddd, yyyy-mm-dd, HH:MM");

    return "Git analysis from: " + strAfter + " until: " + strBefore;
}

function getAuthorData(job){

    /*
    job.Repositories[index].Authors[index2].loc[]....
        ...Website/wwwroot/js/EasyRadiologyViewer/js/AnnotationRenderer.js:{AddedLines: 80, DeletedLines: 32, TotalLines: 48}
        ...Website/wwwroot/js/EasyRadiologyViewer/js/DisplayEngine.js:{AddedLines: 3, DeletedLines: 3, TotalLines: 0}
        AddedLines:3
        DeletedLines:3
        TotalLines:0
    
    */

    var authors = [];
    for(var i = 0; i < job.Repositories.length; i++){
        for(var j = 0; j < job.Repositories[i].Authors.length; j++){
            var au = job.Repositories[i].Authors[j];
            var loc = {AddedLines : 0, DeletedLines : 0, TotalLines: 0};
            var authorIndex = findInArray(authors, "Name", au.Name);
            if(authorIndex == -1){
                authors.push({Name: au.Name, TotalCommits: au.Commits});
                authorIndex = authors.length - 1;
            }
            else{
                authors[authorIndex].TotalCommits += au.Commits;
            }
            

            var test = Object.keys(au.loc).length;
            
            for (var key in au.loc){

                if (au.loc.hasOwnProperty(key)) {
                    loc.AddedLines += au.loc[key].AddedLines;
                    loc.DeletedLines += au.loc[key].DeletedLines;
                    loc.TotalLines += au.loc[key].TotalLines;
                }

                
            }
            if(!authors[authorIndex].hasOwnProperty("loc")){
                authors[authorIndex].loc = new Object();
                authors[authorIndex].loc = loc;
            }
            else{
                authors[authorIndex].loc.AddedLines += loc.AddedLines;
                authors[authorIndex].loc.DeletedLines += loc.DeletedLines;
                authors[authorIndex].loc.TotalLines += loc.TotalLines;
            }
        }
    }
    return authors;
}

function findInArray(arr, prop, searchtext){
    var found = false;
    for(var i = 0; i < arr.length; i++) {
        if (arr[i][prop] == searchtext) {
        return i;
        }
    }
    return -1;
}


exports.report = report;