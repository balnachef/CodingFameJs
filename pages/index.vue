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
        <v-col cols="3" />
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
                  v-if="index !== repos.length - 1"
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
                  v-if="index === repos.length - 1"
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
          <div class="analyze-button">
            <v-btn color="secondary" elevation="2" @click="analize">
              Analyze
            </v-btn>
          </div>

          <div class="mt-2">
            <SaveConfiguration :repos="repos" :date="date" />
          </div>

          <div class="mt-2">
            <v-file-input
              accept=".cfj"
              chips
              label="Import configuration"
              @change="configFileSelected"
            ></v-file-input>
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
                  {{ repos.reduce((a, b) => a + b.commits, 0) }} Commits
                  <br />
                  {{ repos.reduce((a, b) => a + b.lines.added, 0) }}
                  Lines added <br />
                  {{ repos.reduce((a, b) => a + b.lines.deleted, 0) }}
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
    <v-divider class="mt-5" />
    <v-row>
      <v-col>
        <div class="mt-3">
          <commits-and-code-chart
            v-for="(repo, index) in rawData"
            :key="index"
            :repo="repo"
            :dates="date"
            :repo-name="repo.path"
          />
        </div>
      </v-col>
    </v-row>
    <v-divider />
    <v-row class="mt-5">
      <v-col cols="6">
        <div v-for="(repo, index) in repos" :key="index">
          <project-tree
            :items="repo.structure"
            :active-file.sync="fileSelected"
            :open-file.sync="fileOpened"
            :is-ignored-callback="isIgnored"
            :stop-ignore-file-callback="stopIgnoreFile"
            :ignore-file-callback="ignoreFile"
          />
          <v-divider v-if="repo.structure.length > 0" />
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
  </div>
</template>
<script>
/* eslint-disable */
import { saveAs } from "file-saver";
import { Repository } from "~/models/repository";
import { Author } from "~/models/author";
import ProjectTree from "../components/ProjectTree.vue";
import CommitsAndCodeChart from "../components/CommitsAndCodeChart.vue";
import SaveConfiguration from '../components/SaveConfiguration.vue';

export default {
  components: {
    ProjectTree,
    CommitsAndCodeChart,
    SaveConfiguration
  },
  data: () => ({
    filePreview: "",
    fileSelected: [],
    fileOpened: [],
    date: [
      new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .substr(0, 10),
      new Date(Date.now()).toISOString().substr(0, 10),
    ],
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
          new Date(new Date().setDate(new Date().getDate() - 30))
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
    authors: [],
    files: [],
    repos: [],
    rawData: [],
  }),
  computed: {
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
    if (process.client) {
      if (localStorage.getItem("hasData")) {
        if (localStorage.getItem("authors")) {
          this.authors = JSON.parse(localStorage.getItem("authors"));
        }
        if (localStorage.getItem("date")) {
          this.date = JSON.parse(localStorage.getItem("date"));
        }
        if (localStorage.getItem("repos")) {
          this.repos = JSON.parse(localStorage.getItem("repos"));
        }
        if (localStorage.getItem("rawData")) {
          this.rawData = JSON.parse(localStorage.getItem("rawData"));
        }
      } else {
        if (localStorage.getItem("repos")) {
          this.repos = JSON.parse(localStorage.getItem("repos"));
          this.analize();
        } else {
          this.repos.push(new Repository("", [], [], [], 0, 0));
        }
      }
    }
  },
  async fetch() {},
  methods: {
    addRepository: function () {
      this.repos.push(new Repository("", [], [], [], 0, 0));
    },
    removeRepository: function (index) {
      this.repos.splice(index, 1);
    },
    saveConfiguration: function () {
      const data = {
        repos: this.repos,
        date: this.date,
      };
      var serializedData = JSON.stringify(data);

      const blob = new Blob([serializedData], {
        type: "text/plain;charset=utf-8",
      });
      const date = new Date().toISOString().substr(0, 10);
      saveAs(blob, `${date}.cfj`);
    },
    configFileSelected: function (ev) {
      if (ev) {
        const file = ev;
        const reader = new FileReader();

        reader.onload = (e) => this.loadConfiguration(e.target.result);
        reader.readAsText(ev);
      }
    },
    loadConfiguration: function (data) {
      const parsedData = JSON.parse(data);
      if (parsedData.repos) {
        this.repos = parsedData.repos;
      }
      if (parsedData.date) {
        this.date = parsedData.date;
      }
    },
    analize: async function () {
      this.authors = [];
      this.rawData = [];
      this.repos.forEach(async (repository) => {
        if (repository.path === "") {
          return;
        }
        let dates = "";
        if (this.date.length === 2) {
          dates = `&after=${this.date[0]}&before=${this.date[1]}`;
        }
        let ignore = "";

        if (repository.ignoredFiles.length > 0) {
          ignore = "&ignore=" + repository.ignoredFiles.join(",");
        }
        const gitlog = await this.$axios.$get(
          `/gitlog?repo=${repository.path}${dates}${ignore}`
        );

        const rawData = await this.$axios.$get(
          `/gitlog?repo=${repository.path}${dates}${ignore}&raw=true`
        );

        this.rawData.push(rawData);
        const authors = [];
        for (const [key, value] of Object.entries(gitlog["authors"])) {
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

        repository.structure = gitlog.files;
        repository.commits = gitlog.commits;
        repository.lines = gitlog.lines;
        repository.authors = authors;
      });

      if (this.repos.length > 0) {
        localStorage.authors = JSON.stringify(this.authors);
        localStorage.repos = JSON.stringify(this.repos);
        localStorage.rawData = JSON.stringify(this.rawData);
        localStorage.date = JSON.stringify(this.date);
        localStorage.hasData = 1;
      }
    },
    ignoreFile: function (path, repositoryPath) {
      if (this.isIgnored(path, repositoryPath)) {
        return;
      }

      if (this.repos.find((x) => x.path === repositoryPath)) {
        let repo = this.repos.find((x) => x.path === repositoryPath);
        const filePath = path.replace(repositoryPath, "").replace(/^\/+/, "");

        repo.ignoredFiles.push(filePath);
      }
    },
    isIgnored: function (path, repositoryPath) {
      let repo = this.repos.find((x) => x.path === repositoryPath);
      if (repo !== undefined) {
        const filePath = path.replace(repositoryPath, "").replace(/^\/+/, "");
        if (repo.ignoredFiles.find((x) => filePath === x) !== undefined) {
          return 1;
        } else if (
          repo.ignoredFiles.find((x) => filePath.startsWith(x)) !== undefined
        ) {
          return 2;
        }
        return false;
      }
    },
    stopIgnoreFile: function (path, repositoryPath) {
      if (this.repos.find((x) => x.path === repositoryPath)) {
        let repo = this.repos.find((x) => x.path === repositoryPath);
        const filePath = path.replace(repositoryPath, "").replace(/^\/+/, "");
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
