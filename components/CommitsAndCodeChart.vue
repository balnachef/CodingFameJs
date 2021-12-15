<template>
  <GChart type="ColumnChart" :data="lineChartData" :options="lineChartOptions" v-if="repo.length > 0" />
</template>
<script>
/* eslint-disable */

import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart,
  },
  props: {
    repo: {
      type: Array,
      default: () => {},
    },
    dates: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    lineChartOptions: {
      title: "Perfomance",
      legend: { position: "top" },
      isStacked: 'relative'
    },
    lineChartData: [["Day", "Commits", "Changes"]],
  }),
  mounted() {
    const commits = {};
    const lines = {};
    this.repo.forEach((commit) => {
      var date = new Date(commit.date);
      var dateKey = date.toISOString().substr(0, 10);
      commits[dateKey] = (commits[dateKey] ?? 0) + 1;
      console.log(dateKey, commits[dateKey])
      lines[dateKey] =
        (lines[dateKey] ??
        0) + commit.stat.reduce((p, c) => p + c.added + c.deleted, 0);
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
