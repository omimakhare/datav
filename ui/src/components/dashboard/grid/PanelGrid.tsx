import { Dashboard, DatasourceType, Panel, PanelType } from "types/dashboard"
import AutoSizer from 'react-virtualized-auto-sizer';
import { Box, Center, HStack, Input, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text, Tooltip, useColorModeValue, useToast } from "@chakra-ui/react";
import { FaCopy, FaEdit, FaRegCopy, FaTrashAlt } from "react-icons/fa";
import { IoMdInformation } from "react-icons/io";
import TextPanel from "../plugins/panel/text/Text";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { run_prometheus_query } from "../plugins/datasource/prometheus/query_runner";
import { DataFrame } from "types/dataFrame";
import GraphPanel from "../plugins/panel/graph/Graph";
import { PANEL_BODY_PADDING, PANEL_HEADER_HEIGHT, StorageCopiedPanelKey } from "src/data/constants";
import { cloneDeep, isEmpty, isEqual } from "lodash";
import { TimeRange } from "types/time";
import { Variable } from "types/variable";
import { replaceWithVariables } from "utils/variable";
import storage from "utils/localStorage";
import TablePanel from "../plugins/panel/table/Table";
import useBus from 'use-bus'
import { getInitTimeRange } from "components/TimePicker";
import { TimeChangedEvent } from "src/data/bus-events";

interface PanelGridProps {
    dashboard: Dashboard
    panel: Panel
    onEditPanel?: any
    onRemovePanel?: any
    variables: Variable[]
    sync: any
    onVariablesChange?: any
}

const PanelGrid = (props: PanelGridProps) => {
    console.log("panel grid rendered")
    return (<AutoSizer>
        {({ width, height }) => {
            if (width === 0) {
                return null;
            }


            return (
                <Box width={width}
                    height={height}>
                    <PanelComponent width={width} height={height} {...props} />
                </Box>
            );
        }}
    </AutoSizer>)
}

export default PanelGrid

interface PanelComponentProps extends PanelGridProps {
    width: number
    height: number
}

export const prevQueries = {}
export const prevQueryData = {}
export const PanelComponent = ({ dashboard, panel, onEditPanel, onRemovePanel, width, height, variables, sync, onVariablesChange }: PanelComponentProps) => {
    const toast = useToast()
   

    const [tr, setTr] = useState<TimeRange>(getInitTimeRange())
    useBus(
        (e) => { return e.type == TimeChangedEvent },
        (e) => setTr(e.data)
    )

    const [panelData, setPanelData] = useState<DataFrame[]>([])
    const [queryError, setQueryError] = useState()



    // run the queries and render the panel
    useEffect(() => {
        console.log("timerange or datasource changed!")
        // if there is no data in panel currently, we should make a immediate query
        // if (isEmpty(panelData)) {
        queryData(dashboard.id + panel.id)
        // }
    }, [panel.datasource, tr])

    const queryData = async (queryId) => {
        for (var i = 0; i < panel.datasource.length; i++) {
            const ds = panel.datasource[i]
            if (ds.selected) {
                let data = []
                for (const q0 of ds.queries) {
                    const metrics = replaceWithVariables(q0.metrics, variables)
                    const q = { ...q0, metrics }

                    const id = queryId + q.id
                    const prevQuery = prevQueries[id]
                    const currentQuery = [q, tr]

                    if (isEqual(prevQuery, currentQuery)) {
                        const d = prevQueryData[id]
                        if (d) {
                            data.push(...d)
                        }
                        continue
                    }

                    // console.log("re-query data! metrics id:", q.id, " query id:", queryId)

                    prevQueries[id] = currentQuery
                    let res
                    switch (ds.type) {
                        case DatasourceType.Prometheus:


                            res = await run_prometheus_query(q, tr)
                            break;
                        default:
                            break;
                    }

                    if (res.error) {
                        setQueryError(res.error)
                        return
                    } else {
                        setQueryError(null)
                    }


                    if (!isEmpty(res.data)) {
                        data.push(...res.data)
                        prevQueryData[id] = res.data
                    }
                }

                console.log("query and set panel data")
                setPanelData(data)
            }
        }
    }

    const onCopyPanel = (panel) => {
        toast({
            title: "Copied",
            description: "Panel copied, you can use it through **Add Panel** button",
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        storage.set(StorageCopiedPanelKey, panel)
    }

    const panelBodyHeight = height - PANEL_HEADER_HEIGHT
    const panelInnerHeight = panelBodyHeight - PANEL_BODY_PADDING * 2 // 10px padding top and bottom of panel body
    const panelInnerWidth = width + 8 // 10px padding left and right of panel body

    const title = replaceWithVariables(panel.title, variables)

    console.log("panel component rendered, data: ",panelData)
    return <Box height="100%" >
        <HStack className="grid-drag-handle" height={`${PANEL_HEADER_HEIGHT - (isEmpty(title) ? 20 : 0)}px`} cursor="move" spacing="0" position={isEmpty(title) ? "absolute" : "relative"} width="100%" zIndex={1000}>
            {(queryError || panel.desc) && <Box color={useColorModeValue(queryError ? "red" : "brand.500", queryError ? "red" : "brand.200")} position="absolute">
                <Tooltip label={queryError ?? replaceWithVariables(panel.desc, variables)}>
                    <Box>
                        <IoMdInformation fontSize="20px" cursor="pointer" />
                    </Box>
                </Tooltip>
            </Box>}
            <Center width="100%">
                {onEditPanel ? <Menu placement="bottom">
                    <MenuButton
                        transition='all 0.2s'
                        _focus={{ border: null }}
                        width="100%"
                    >
                        <Center width="100%">{!isEmpty(title) ? <Box cursor="pointer">{title}</Box> : <Box>&nbsp;</Box>}</Center>
                    </MenuButton>
                    <MenuList p="1">
                        <MenuItem icon={<FaEdit />} onClick={() => onEditPanel(panel)}>Edit</MenuItem>
                        <MenuDivider my="1" />
                        <MenuItem icon={<FaRegCopy />} onClick={() => onCopyPanel(panel)}>Copy</MenuItem>
                        <MenuDivider my="1" />
                        <MenuItem icon={<FaTrashAlt />} onClick={() => onRemovePanel(panel)}>Remove</MenuItem>
                    </MenuList>
                </Menu> :
                    <Text cursor="pointer" width="fit-content">{title}</Text>
                }
            </Center>
        </HStack>
        <Box
            // panel={panel}
            maxHeight={`${isEmpty(title) ? height : panelBodyHeight}px`}
            overflowY="scroll"
            marginLeft={panel.type == PanelType.Graph ? "-10px" : "0px"}
            h="100%"
        >
            {
                isEmpty(panelData) ?
                    <Box h="100%">
                        <Center height="100%">No data</Center></Box>
                    : <CustomPanelRender panel={panel} data={panelData} height={panelInnerHeight} width={panelInnerWidth} variables={variables} sync={sync} onVariablesChange={onVariablesChange} />
            }
        </Box>
    </Box>
}


const CustomPanelRender = memo((props:any) => {
    //@needs-update-when-add-new-panel
    switch (props.panel?.type) {
        case PanelType.Text:
            return <TextPanel  {...props} />
        case PanelType.Graph:
            return <GraphPanel {...props} />
        case PanelType.Table:
            return <TablePanel {...props} />
        default:
            return <></>
    }
})