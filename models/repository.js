export class Repository {
  path;
  structure = [];
  ignoredFiles = [];
  authors = [];
  commits = 0;
  lines = {};

  constructor (path, structure, ignoredFiles, authors, commits, lines) {
    this.path = path
    this.authors = authors
    this.ignoredFiles = ignoredFiles ?? []
    this.structure = structure
    this.commits = commits
    this.lines = lines
  }
}
