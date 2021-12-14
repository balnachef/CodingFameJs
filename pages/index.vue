<template>
  <div id="wrapper">
    <div id="range-select">
      <v-row justify="space-around">
        <v-col cols="3">
          <div class="date-from-range">
            <v-menu
              ref="datePicker"
              v-model="datePicker"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="dateRange"
                  label="Date filter"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="date" range no-title scrollable>
                <v-spacer />
                <v-btn text color="primary" @click="datePicker = false">
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.datePicker.save(date)"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
          </div>
        </v-col>
        <v-col cols="3">
          <div class="predefined-date-range">
            <v-select
              v-model="date"
              :items="predifineDateRanges"
              label="Other ranges"
              item-text="title"
              item-value="value"
            />
          </div>
        </v-col>
        <v-col cols="3"> </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="3">
          <div class="repositories-input">
            <v-row v-for="(item, index) in repos" :key="index">
              <v-col cols="9">
                <v-text-field v-model="item.path" label="Repository" />
              </v-col>
              <v-col cols="3">
                <v-btn
                  v-if="index != repositories.length - 1"
                  class="mx-2"
                  fab
                  dark
                  color="indigo"
                  small
                  @click="removeRepository(index)"
                >
                  <v-icon dark> mdi-minus </v-icon>
                </v-btn>

                <v-btn
                  v-if="index == repositories.length - 1"
                  class="mx-2"
                  fab
                  dark
                  color="indigo"
                  small
                  @click="addRepository"
                >
                  <v-icon> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="3">
          <div class="analyze-buttons">
            <v-btn color="secondary" elevation="2" @click="analize">
              Analyze
            </v-btn>
          </div>
        </v-col>
        <v-col cols="3" />
      </v-row>
      <v-row justify="space-around">
        <v-col cols="1">
          <h1>Results</h1>
        </v-col>
      </v-row>

      <v-row justify="space-around">
        <v-col cols="4">
          <div class="statistics">
            <div class="repositories-list">
              <v-card
                v-for="repository in repos"
                :key="repository.path"
                class="mb-2"
                elevation="4"
              >
                <v-card-title>{{ repository.path }}</v-card-title>
                <v-card-text>
                  <div class="commits-count">
                    Commits: {{ repository.commits }}
                  </div>
                  <div class="lines-of-code">
                    Lines of code: +{{ repository.lines.added }} -{{
                      repository.lines.deleted
                    }}
                  </div>
                </v-card-text>
              </v-card>
              <v-card>
                <v-card-title>Total</v-card-title>
                <v-card-text>
                  {{ repositories.reduce((a, b) => a + b.commits, 0) }} Commits
                  <br />
                  {{ repositories.reduce((a, b) => a + b.lines.added, 0) }}
                  Lines added <br />
                  {{ repositories.reduce((a, b) => a + b.lines.deleted, 0) }}
                  Lines deleted <br />
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="statistics">
            <div class="author-list">
              <v-card
                v-for="author in authors"
                :key="author.email"
                class="mb-2"
                elevation="4"
              >
                <v-card-title>{{ author.email }}</v-card-title>
                <v-card-text>
                  <div class="commits-count">Commits: {{ author.commits }}</div>
                  <div class="lines-of-code">
                    Lines of code: +{{ author.lines.added }} -{{
                      author.lines.deleted
                    }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-col>
      </v-row>
    </div>
    <v-divider />

    <v-row>
      <v-col cols="6">
        <div v-for="(repo, index) in repos" :key="index">
          <project-tree
            :items="repo.structure"
            :activeFile.sync="fileSelected"
            :openFile.sync="fileOpened"
            :isIgnoredCallback="isIgnored"
            :stopIgnoreFileCallback="stopIgnoreFile"
            :ignoreFileCallback="ignoreFile"
          />
          <v-divider />
        </div>
      </v-col>
      <v-col cols="6">
        <v-card>
          <v-card-text class="filePreview">
            <pre
              >{{ filePreview }}
            </pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- <GChart type="PieChart" :data="pieCommitsData" :options="chartOptions" /> -->

    <!-- <GChart type="ColumnChart" :data="Last3MonthsCommits" :options="chartOptions" /> -->
  </div>
</template>
<script>
/* eslint-disable */
import { GChart } from "vue-google-charts";

import { Repository } from "~/models/repository";
import { Author } from "~/models/author";
import ProjectTree from '../components/ProjectTree.vue';

export default {
  components: {
    GChart,
    ProjectTree,
  },
  data: () => ({
    filePreview: "",
    tree: [],
    fileSelected: [],
    fileOpened: [],
    date: [],
    datePicker: false,
    predifineDateRanges: [
      {
        title: "Last 7 days",
        value: [
          new Date(new Date().setDate(new Date().getDate() - 7))
            .toISOString()
            .substr(0, 10),
          ,
          new Date().toISOString().substr(0, 10),
        ],
      },
      {
        title: "Last Month",
        value: [
          new Date(new Date().setDate(new Date().getMonth() - 30))
            .toISOString()
            .substr(0, 10),
          new Date(Date.now()).toISOString().substr(0, 10),
        ],
      },
      {
        title: "Last 3 Months",
        value: [
          new Date(new Date().setDate(new Date().getDate() - 90))
            .toISOString()
            .substr(0, 10),
          new Date(Date.now()).toISOString().substr(0, 10),
        ],
      },
      {
        title: "Last 6 Months",
        value: [
          new Date(new Date().setDate(new Date().getDate() - 120))
            .toISOString()
            .substr(0, 10),
          new Date(Date.now()).toISOString().substr(0, 10),
        ],
      },
    ],
    pieCommitsData: [["Author", "Commits"]],
    Last3MonthsCommits: [
      ["Month", "a1", "a2", "a3"],
      ["2014", 1000, 400, 200],
      ["2015", 1170, 460, 250],
      ["2016", 660, 1120, 300],
      ["2017", 1030, 540, 350],
    ],
    chartOptions: {
      chart: {
        title: "Company Performance",
        subtitle: "",
      },
    },
    authors: [],
    files: [],
    repositories: [{ path: "", lines: {}, commits: 0, authors: [] }],
    repos: [],
  }),
  computed: {
    analizedRepositories: function () {
      return this.repositories.filter((x) => x.path);
    },
    selectedFile: async function () {
      const gitlog = await this.$axios.$get(`/file?file=${repo}`);
    },
    dateRange: function () {
      return this.date.join(" - ");
    },
    ignore: function () {
      if (this.repos.length > 0) {
        console.log("this.repos", this.repos);
        var ignoredFiles = this.repos.reduce(
          (p, c) => [...p, ...c.ignoredFiles],
          []
        );
        return ignoredFiles && ignoredFiles.length > 0
          ? ignoredFiles.join(", ")
          : [];
      }
    },
  },
  mounted() {
    if (localStorage.getItem("repositories")) {
      this.repositories = JSON.parse(localStorage.getItem("repositories"));
    }

    if (localStorage.ignore) {
      this.ignore = localStorage.ignore;
    }
  },
  created() {
    if (process.client) {
      if (localStorage.getItem("repositories")) {
        console.log(localStorage.getItem("repositories"));
        this.repositories = JSON.parse(localStorage.getItem("repositories"));
      }
      this.analize();
    }
  },
  async fetch() {
    // const lastMonthBegin = new Date(
    //   new Date().setMonth(new Date().getMonth() - 2)
    // )
    //   .toISOString()
    //   .slice(0, 10);
    // const lastMonthEnd = new Date(
    //   new Date().setMonth(new Date().getMonth() - 2)
    // )
    //   .toISOString()
    //   .slice(0, 10);
    // const gitlogLastMonth = await this.$axios.$get(
    //   `/gitlog?after=${lastMonthBegin}&before=${lastMonthEnd}`
    // );
    // this.Last3MonthsCommits = [["Month"]];
    // this.Last3MonthsCommits[0];
    // for (const [key, value] of Object.entries(gitlogLastMonth["authors"])) {
    // }
  },
  methods: {
    addRepository: function () {
      this.repositories.push({ path: "", lines: {}, commits: 0, authors: [] });
      localStorage.repositories = JSON.stringify(this.repositories);
    },
    removeRepository: function (index) {
      this.repositories.splice(index, 1);
      localStorage.repositories = JSON.stringify(this.repositories);
    },
    analize: async function () {
      this.pieCommitsData = [["Author", "Commits"]];
      this.authors = [];
      this.files = [];
      this.repos = [];
      const authors = [];
      for (let index = 0; index < this.repositories.length; index++) {
        const repo = this.repositories[index].path;
        if (repo === "") {
          continue;
        }
        let dates = "";
        if (this.date.length === 2) {
          dates = `&after=${this.date[0]}&before=${this.date[1]}`;
        }
        let ignore = "";
        if (this.ignore && this.ignore.length > 0) {
          ignore = `&ignore=${this.ignore}`
            .replace(/ /g, "")
            .replace(/,\s*$/, "");
        }
        const gitlog = await this.$axios.$get(
          `/gitlog?repo=${repo}${dates}${ignore}`
        );

        for (const [key, value] of Object.entries(gitlog["authors"])) {
          this.pieCommitsData.push([key, value.commits]);
          if (this.authors.find((x) => x.email === key)) {
            let author = this.authors.find((x) => x.email === key);
            author.commits += value.commits;
            author.lines.added += value.lines.added;
            author.lines.deleted += value.lines.deleted;
          } else {
            let newAuthor = new Author(key, null, value.commits, value.lines);
            authors.push(newAuthor);
            this.authors.push(newAuthor);
          }
        }
        const lines = {
          added: gitlog.lines.added,
          deleted: gitlog.lines.deleted,
        };
        var repository = new Repository(
          repo,
          gitlog.files,
          [],
          authors,
          gitlog.commits,
          lines
        );
        this.repos.push(repository);
      }

      if (this.repositories.filter((x) => x.path).length > 0) {
        localStorage.repositories = JSON.stringify(
          this.repositories.filter((x) => x.path)
        );
      }
    },
    ignoreFile: function (path, repositoryPath) {
      if (this.isIgnored(path, repositoryPath)) {
        return;
      }

      if (this.repos.find((x) => x.path === repositoryPath)) {
        let repo = this.repos.find((x) => x.path === repositoryPath);
        const filePath = path
          .replace(/,\s*$/, "")
          .replace(repo, "")
          .replace(/^\/+/, "");

        repo.ignoredFiles.push(filePath);
      }
    },
    isIgnored: function (path, repositoryPath) {
      let repo = this.repos.find((x) => x.path === repositoryPath);
      if (repo !== undefined) {
        const filePath = path
          .replace(/,\s*$/, "")
          .replace(repo, "")
          .replace(/^\/+/, "");
        return (
          repo.ignoredFiles.find((x) => filePath.startsWith(x)) !== undefined
        );
      }
    },
    stopIgnoreFile: function (path, repositoryPath) {
      if (this.repos.find((x) => x.path === repositoryPath)) {
        let repo = this.repos.find((x) => x.path === repositoryPath);
        const filePath = path
          .replace(/,\s*$/, "")
          .replace(repo, "")
          .replace(/^\/+/, "");
        if (repo.ignoredFiles.includes(filePath)) {
          repo.ignoredFiles = repo.ignoredFiles.filter((x) => x != filePath);
        }
      }
    },
  },
  watch: {
    fileSelected: async function (value) {
      this.filePreview = await this.$axios.$get(`/file?file=${value}`);
    },
  },
};
</script>
<style scoped>
.filePreview {
  overflow: hidden;
}
</style>
