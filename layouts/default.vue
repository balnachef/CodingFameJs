<template>
  <v-app dark>
    <v-main>
      <v-container>
        <GChart type="PieChart" :data="pieCommitsData" :options="chartOptions" />

        <GChart type="ColumnChart" :data="Last3MonthsCommits" :options="chartOptions" />
      </v-container>

      <div>{{ authors }}</div>
    </v-main>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
/* eslint-disable */
import { GChart } from "vue-google-charts";

export default {
  components: {
    GChart,
  },
  data: () => ({
    pieCommitsData: [
      ["Author", "Commits"],
    ],
    Last3MonthsCommits: [
        ['Month', 'a1', 'a2', 'a3'],
        ['2014', 1000, 400, 200],
        ['2015', 1170, 460, 250],
        ['2016', 660, 1120, 300],
        ['2017', 1030, 540, 350]
    ],
    chartOptions: {
      chart: {
        title: "Company Performance",
        subtitle: "",
      },
    },
    authors: [],
  }),

  async fetch() {
    const gitlog = await this.$axios.$get("/gitlog");
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 10)

    const gitlogLastMonth = await this.$axios.$get(`/gitlog?after=${lastMonth}`); 

    for (const [key, value] of Object.entries(gitlog["authors"])) {

      this.pieCommitsData.push([key, value.commits])
    }

    this.Last3MonthsCommits = [
        ["Month"]
    ]
    this.Last3MonthsCommits[0]
    for (const [key, value] of Object.entries(gitlog3Months["authors"])) {

      
    }
    
  },
};
</script>
