// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useColorMode } from "@chakra-ui/react"
import ChartComponent from "src/components/charts/Chart"
import React, { memo, useEffect, useMemo, useState } from "react"
import { Panel } from "types/dashboard"

import { QueryPluginData } from "types/plugin"
import { dateTimeFormat } from "utils/datetime/formatter"
import { getTimeFormatForChart } from "utils/format"
import customColors from "theme/colors"


interface Props {
    data: QueryPluginData
    panel: Panel
    width: number
    onSelectLabel?: any
}

const DatavLogChart = memo((props: Props) => {
    const { panel, width, onSelectLabel } = props
    const [chart, setChart] = useState<echarts.ECharts>(null)
    const { colorMode } = useColorMode()

    useEffect(() => {
        if (chart) {
            chart.on('click', function (event) {
                if (event.seriesName != "total") {
                    onSelectLabel(event.seriesName)
                }
            })
        }
        return () => {
            chart?.off('click')
        }
    }, [chart])
   

    const [timeline, names, data] = useMemo(() =>{
        const names = props.data.columns.slice(1)
       
        
        const data = []
        props.data.columns.forEach((name, i) => {
            data.push(props.data.data.map(d => d[i]))
        })

        const timeBucks = data[0]
        const start = Number(timeBucks[0])
        const step = Number(timeBucks[1]) - start
        const end = Number(timeBucks[timeBucks.length - 1])
        const timeFormat = getTimeFormatForChart(start * 1000, end * 1000, step - start )
        const timeline = timeBucks.map(t => dateTimeFormat(t * 1000, { format: timeFormat }))

        return [timeline, names, data.slice(1)]
    },[props.data])



    const chartOptions = {
        animation: false,
        animationDuration: 500,
        tooltip: {
            show: true,
            trigger: 'axis',
            appendToBody: true,
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'none', // 'shadow' as default; can also be 'line' or 'shadow',
            },
        },
        grid: {
            left: "1%",
            right: "3%",
            top: "6%",
            bottom: '0%',
            padding: 0,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: timeline,
            show: true,
            axisTick: {
                alignWithLabel: false,
            },
            axisLabel: {
                show: true,
                textStyle: {
                    // align: 'center',
                    // baseline: 'end',
                },
                fontSize:  10,
                interval: 5
            },
         
        },
        yAxis: {
            type: 'value',
            splitLine: {
                show: false,
            },
            show: 'true',
            splitNumber: 2,
            axisLabel: {
                fontSize: 11
            }
        },
        series: names.map((name, i) => {
            return ({
            name: name,
            data: data[i],
            type: 'bar',
            stack: "total",
            label: {
                show: false,
                formatter: (v) => {
                    v.data + " lines"
                },
                fontSize: 11,
            },
            color: name == "others" ? 'rgb(80,250,123)' : customColors.error.light
            // barWidth: '90%'
        })})
    };

    return (<>
        <ChartComponent key={colorMode} options={chartOptions} clearWhenSetOption theme={colorMode} onChartCreated={c => setChart(c)} width={width} />
    </>)
})

export default DatavLogChart

