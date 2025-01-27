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
export interface Variable {
    id?: number
    name: string 
    type: string
    datasource?: number
    value?: string // query statement
    default?: string
    description?: string
    created?: string
    values?: string[]
    selected?: string
    regex?: string 
    refresh?: VariableRefresh
    enableMulti?: boolean
    enableAll?: boolean
    sortWeight?: number
    teamId?: number
}

export enum VariableQueryType {
    Custom = "custom",
    Query = "query",
    Datasource = "datasource",
    TextInput = "textinput"
}

export enum VariableRefresh {
    OnDashboardLoad = "OnDashboardLoad",
    OnTimeRangeChange = "OnTimeRangeChange",
    Manually = "Manually"
}
