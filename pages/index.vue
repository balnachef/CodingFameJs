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
                <v-btn text color="primary" @click="$refs.datePicker.save(date)">
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
          </div>
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
        <v-col class="d-flex" cols="3">
          <v-textarea
            outlined
            name="input-7-4"
            label="Ignore paths"
            v-model="ignore"
          />
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="3">
          <div class="repositories-input">
            <v-row v-for="(item, index) in repositories" :key="index">
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
                v-for="repository in analizedRepositories"
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
      <v-col>
        {{ fileSelected }}
        <v-treeview
          :items="files"
          activatable
          item-key="path"
          open-on-click
          transition
          :active.sync="fileSelected"
          :open.sync="fileOpened"
        >
          <template #prepend="{ item, open }">
            <v-icon v-if="item.children && item.children.length > 0">
              {{ open ? "mdi-folder-open" : "mdi-folder" }}
            </v-icon>
            <v-icon v-else>
              mdi-file-document
            </v-icon>
          </template>
        </v-treeview>
      </v-col>
      <v-col />
    </v-row>

    <GChart type="PieChart" :data="pieCommitsData" :options="chartOptions" />

    <!-- <GChart type="ColumnChart" :data="Last3MonthsCommits" :options="chartOptions" /> -->
  </div>
</template>
<script>
/* eslint-disable */
import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart,
  },
  data: () => ({
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
    ignore: "",
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
        if (this.ignore.length > 0) {
          ignore = `&ignore=${this.ignore}`.replace(/ /g, '')
        }
        const gitlog = await this.$axios.$get(`/gitlog?repo=${repo}${dates}${ignore}`);

        this.repositories[index].commits = gitlog.commits;
        this.repositories[index]["lines"] = {
          added: gitlog.lines.added,
          deleted: gitlog.lines.deleted,
        };

        for (const [key, value] of Object.entries(gitlog["authors"])) {
          this.pieCommitsData.push([key, value.commits]);
          if (this.authors.find((x) => x.email === key)) {
            let author = this.authors.find((x) => x.email === key);
            author.commits += value.commits;
            author.lines.added += value.lines.added;
            author.lines.deleted += value.lines.deleted;
          } else {
            this.authors.push({
              email: key,
              commits: value.commits,
              lines: value.lines,
            });
          }
        }
        console.log(gitlog.files);
        this.files = this.files.concat(gitlog.files);
      }

      if (this.repositories.filter((x) => x.path).length > 0) {
        localStorage.repositories = JSON.stringify(
          this.repositories.filter((x) => x.path)
        );
      }
    },
  },
  watch: {
    ignore: function (value) {
      localStorage.ignore = value
    }
  }
};
</script>
