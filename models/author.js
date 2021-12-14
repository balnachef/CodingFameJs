export class Author {
    email;
    name;
    commits = 0;
    lines = {};

    constructor (email, name, commits, lines) {
      this.email = email
      this.name = name
      this.commits = commits
      this.lines = lines
    }
}
