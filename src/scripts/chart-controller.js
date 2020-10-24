export class ChartController {
    constructor(chartElem) {
        this.chart = new Chart(chartElem, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: {
                    xAxes: [{
                        ticks: {
                            display: false
                        },
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        }
                    }],
                    yAxes: [{
                        ticks: {

                            // beginAtZero: true
                        },
                        gridLines: {
                            color: "rgba(0, 0, 0, 0)",
                        }
                    }]
                }
            }
        });
        this.datasets = this.chart.data.datasets;
        this.updateConfig = {
            duration: 200,
            easing: 'easeOutBounce'
        };
    }

    updateLabels(labels) {
        this.chart.data.labels = labels;
        this.chart.update(this.updateConfig);
    }

    addDataSet(name, data, color) {
        let dataset = {
            label: name,
            data: data,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderColor: color,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 0, 0, 0)',
            pointBorderColor: 'rgba(0, 0, 0, 0)',
            pointHoverBackgroundColor: color,
        }
        this.datasets.push(dataset);
        this.chart.update(this.updateConfig);
    }

    isDatasetExist(name) {
        let set = this.datasets.find(set => set.label === name);
        if (set)
            return true;

        return false;
    }

    removeByName(dataSetName) {
        let index = this.datasets.findIndex(set => set.label === dataSetName);
        if (index) {
            this.datasets.splice(index, 1);
            this.chart.update(this.updateConfig);
            return true;
        } else
            return false;
    }

    updateDataByName(dataSetName, data) {
        let set = this.datasets.find(set => set.label === dataSetName);
        if (set) {
            set.data = data;
            this.chart.update(this.updateConfig);
        } else
            throw new Error("Такого сета не существует");
    }
}