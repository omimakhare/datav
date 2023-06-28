// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { Panel, PanelQuery } from "types/dashboard"
import { Datasource } from "types/datasource"
import { TimeRange } from "types/time"
import { isJaegerDatasourceValid } from "./DatasourceEditor"

export const run_jaeger_query = async (panel: Panel, q: PanelQuery,range: TimeRange,ds: Datasource) => {
    //@todo: 
    // 1. rather than query directyly to prometheus, we should query to our own backend servie
    // 2. using `axios` instead of `fetch`
    
    const res0 = await fetch(`http://localhost:9090/api/v1/query_range?query=${q.metrics}&start=${range.start.getTime() / 1000}&end=${range.end.getTime() / 1000}&step=15`)
     
    const res = await res0.json()
    
    if (res.status !== "success") {
        console.log("Failed to fetch data from prometheus", res)
        return {
            error: `${res.errorType}: ${res.error}`,
            data: []
        }
    }


    if (res.data.result.length ==0 || res.data.result[0].values.length == 0) {
        return {
            error: null,
            data:[]
        }
    }


    const data =  []
    return {
        error: null,
        data: data
    }
}


export const checkAndTestJaeger = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isJaegerDatasourceValid(ds)
    if (res != null) {
        return res
    }

    // test connection status
    try {
        // http://localhost:9090/api/v1/labels?match[]=up
        const res0 = await fetch(`${ds.url}/api/v1/labels?match[]=up`)
        const res = await res0.json()
        if (res.status) {
            return true
        }

        return "test failed"
    } catch (error) {
        return error.message
    }
}
