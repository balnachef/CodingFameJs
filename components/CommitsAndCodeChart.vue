<template>
  <div>
    <h4>{{ repoName }}</h4>
    <GChart
      v-if="repo.length > 0"
      type="ColumnChart"
      :data="lineChartData"
      :options="lineChartOptions"
    />
  </div>
</template>
<script>
/* eslint-disable */

import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart,
  },
  props: {
    reponame: {
      type: String,
    },
    repo: {
      type: Array,
      default: () => {},
    },
    dates: {
      type: Array,
      default: () => [],
    },
  },
  data: function () {
    return {
      lineChartOptions: {
        title: this.reponame,
        legend: { position: "top" },
        series: {
          0: { targetAxisIndex: 0 },
          1: { targetAxisIndex: 1 },
        },
        vAxes: {
          // Adds titles to each axis.
          0: { title: "Commits" },
          1: { title: "Changes" },
        },
      },
      lineChartData: [["Day", "Commits", "Changes"]],
    };
  },
  mounted() {
    const commits = {};
    const lines = {};
    this.repo.forEach((commit) => {
      var date = new Date(commit.date);
      var dateKey = date.toISOString().substr(0, 10);
      commits[dateKey] = (commits[dateKey] ?? 0) + 1;
      console.log(dateKey, commits[dateKey]);
      lines[dateKey] =
        (lines[dateKey] ?? 0) +
        commit.stat.reduce((p, c) => p + c.added + c.deleted, 0);
    });
    console.log(this.dates[0], this.dates[1]);
    this.getDatesBetween(
      new Date(this.dates[0]),
      new Date(this.dates[1])
    ).forEach((date) => {
      const dateKey = date.toISOString().substr(0, 10);
      this.lineChartData.push([date, commits[dateKey], lines[dateKey]]);
    });
  },
  methods: {
    getDatesBetween: function (startDate, endDate, includeEndDate = true) {
      const dates = [];
      const currentDate = startDate;
      while (currentDate < endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (includeEndDate) dates.push(endDate);
      return dates;
    },
  },
};
</script>
