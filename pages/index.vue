<template>
  <div id="wrapper">
    <div id="range-select">
      <v-row justify="space-around">
        <v-col cols="3">
          <div class="date-from-range">
            <v-menu
              :return-value.sync="dateFrom"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="dateFrom"
                  label="From"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="dateFrom" no-title scrollable />
            </v-menu>
          </div>
          <div class="predefined-date-range">
            <v-select :items="predifineDateRanges" label="Other ranges" />
          </div>

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
                  @click="addRepository"
                >
                  <v-icon> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="3">
          <v-menu
            :return-value.sync="dateTo"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="dateTo"
                label="To"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-date-picker v-model="dateTo" no-title scrollable />
          </v-menu>
        </v-col>
        <v-col class="d-flex" cols="3">
          <v-textarea
            outlined
            name="input-7-4"
            label="Ignore paths"
            value="package-lock.json, package.json"
          />
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="1">
          <h1>Results</h1>
        </v-col>
      </v-row>

      <v-row justify="space-around">
        <v-col cols="2">
          <div class="statistics">
            <div class="repositories-list">
              <div
                v-for="repository in analizedRepositories"
                :key="repository.path"
                class="repository"
              >
                <div class="path">repo: {{ repository.path }}</div>
                <div class="commits-count">
                  commits: {{ repository.commits }}
                </div>
                <div class="lines-of-code">
                  Lines of code: +{{ repository.lines.added }} -{{
                    repository.lines.deleted
                  }}
                </div>
              </div>
            </div>
          </div>
        </v-col>
        <v-col cols="2" />
      </v-row>
    </div>
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
    dateFrom: new Date(Date.now() - new Date().getMonth() - 1)
      .toISOString()
      .substr(0, 10),
    dateTo: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .substr(0, 10),
    predifineDateRanges: [
      "Last 7 days",
      "Last Month",
      "Last 3 Months",
      "Last 6 Months",
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
    repositories: [
      { path: "/Source/market-access-suite", lines: {}, commits: 0 },
      { path: "", lines: {}, commits: 0 },
    ],
  }),
  computed: {
    analizedRepositories: function () {
      return this.repositories.filter((x) => x.path)
    }
  },
  async fetch() {
    for (let index = 0; index < this.repositories.length; index++) {
      const repo = this.repositories[index].path;
      if (repo === "") {
        continue;
      }
      console.log("repo", repo);
      const gitlog = await this.$axios.$get(`/gitlog?repo=${repo}`);
      console.log("gitlog", gitlog);

      this.repositories[index].commits = gitlog.commits;
      this.repositories[index]["lines"] = {
        added: gitlog.lines.added,
        deleted: gitlog.lines.deleted,
      };

      for (const [key, value] of Object.entries(gitlog["authors"])) {
        this.pieCommitsData.push([key, value.commits]);
      }
    }

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
      this.repositories.push({ paht: "", lines: {}, commits: 0 });
    },
    removeRepository: function (index) {
      this.repositories.splice(index, 1);
    },
  },
};
</script>