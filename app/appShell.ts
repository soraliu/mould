import { createAction, handleAction } from 'redux-actions'
import {
    EditorState,
    Path,
    View,
    Vector,
    Size,
    Component,
    ID,
    Kit,
    StateName,
    InputConfig,
} from './types'
import { initialData, pathToString, viewPathToString } from './utils'
import nanoid from 'nanoid'
import { filter, remove, find } from 'lodash'

type SelectComponentAction = { pathes: Path[] }
const SELECT_COMPONENT = 'SELECT_COMPONENT'
export const selectComponent = createAction<SelectComponentAction>(
    SELECT_COMPONENT
)
export const handleSelectComponent = handleAction<
    EditorState,
    SelectComponentAction
>(
    SELECT_COMPONENT,
    (state, { payload: { pathes } }) => {
        // if (action.payload.selection === state.selection) {
        //     return state
        // }
        // state.selection = action.payload.selection
        if (pathes.length === 0) {
            state.selection = undefined
        } else if (!state.selection) {
            state.selection = pathes[0]
        } else if (
            viewPathToString(pathes[0]) !== viewPathToString(state.selection)
        ) {
            state.selection = pathes[0]
        } else {
            const index = pathes.findIndex(
                (p) => pathToString(p) === pathToString(state.selection!)
            )
            if (index === -1) {
                const selectionStr = pathToString(state.selection)

                for (let path of pathes.reverse()) {
                    const pathStr = pathToString(path)
                    if (
                        selectionStr.includes(pathStr) ||
                        pathStr.slice(0, pathStr.length - 1) ===
                            selectionStr.slice(0, selectionStr.length - 1)
                    ) {
                        state.selection = path
                        break
                    }
                }
            } else {
                const nextSelection = pathes[index + 1]
                if (nextSelection) {
                    state.selection = nextSelection
                }
            }
        }

        return state
    },
    initialData
)

type SelectComponentFromTreeAction = { path: Path }
const SELECT_COMPONENT_FROM_TREE = 'SELECT_COMPONENT_FROM_TREE'
export const selectComponentFromTree = createAction<
    SelectComponentFromTreeAction
>(SELECT_COMPONENT_FROM_TREE)
export const handleSelectComponentFromTree = handleAction<
    EditorState,
    SelectComponentFromTreeAction
>(
    SELECT_COMPONENT_FROM_TREE,
    (state, { payload: { path } }) => {
        state.selection = path

        return state
    },
    initialData
)

type AddInputAction = { mouldId: string; inputKey: string; config: InputConfig }
const ADD_INPUT = 'ADD_INPUT'
export const addInput = createAction<AddInputAction>(ADD_INPUT)
export const handleAddInput = handleAction<EditorState, AddInputAction>(
    ADD_INPUT,
    (state, action) => {
        if (!state.moulds[action.payload.mouldId].input) {
            state.moulds[action.payload.mouldId].input = {}
        }
        state.moulds[action.payload.mouldId].input[action.payload.inputKey] =
            action.payload.config

        return state
    },
    initialData
)

type RemoveInputAction = { mouldId: string; inputKey: string }
const REMOVE_INPUT = 'REMOTE_INPUT'
export const removeInput = createAction<RemoveInputAction>(REMOVE_INPUT)
export const handleRemoveInput = handleAction<EditorState, RemoveInputAction>(
    REMOVE_INPUT,
    (state = initialData, action) => {
        state.moulds[action.payload.mouldId].input[
            action.payload.inputKey
        ] = undefined
        delete state.moulds[action.payload.mouldId].input[
            action.payload.inputKey
        ]

        return state
    },
    initialData
)

type ModifyScopeAction = {
    mouldId: string
    scope: string[]
}
const MODIFY_SCOPE = 'MODIFY_SCOPE'
export const modifyScope = createAction<ModifyScopeAction>(MODIFY_SCOPE)
export const handleModifyScope = handleAction<EditorState, ModifyScopeAction>(
    MODIFY_SCOPE,
    (state, action) => {
        state.moulds[action.payload.mouldId].scope = action.payload.scope

        return state
    },
    initialData
)

type DeleteScopeAction = {
    mouldId: string
    scopeName: string
}
const DELETE_SCOPE = 'DELETE_SCOPE'
export const deleteScope = createAction<DeleteScopeAction>(DELETE_SCOPE)
export const handleDeleteScope = handleAction<EditorState, DeleteScopeAction>(
    DELETE_SCOPE,
    (state, { payload: { mouldId, scopeName } }) => {
        state.moulds[mouldId].scope = state.moulds[mouldId].scope.filter(
            (name) => name !== scopeName
        )

        const kits = state.moulds[mouldId].kits.filter((k) =>
            k.dataMappingVector.flat().includes(scopeName)
        )
        kits.forEach((kit) => {
            Object.assign(kit, {
                dataMappingVector: kit.dataMappingVector.filter(
                    ([, target]) => target !== scopeName
                ),
            })
        })

        return state
    },
    initialData
)

type AddScopeAction = {
    mouldId: string
    scope: string
}
const ADD_SCOPE = 'ADD_SCOPE'
export const addScope = createAction<AddScopeAction>(ADD_SCOPE)
export const handleAddScope = handleAction<EditorState, AddScopeAction>(
    ADD_SCOPE,
    (state, action) => {
        state.moulds[action.payload.mouldId].scope.push(action.payload.scope)

        return state
    },
    initialData
)

type RemoveScopeAction = {
    mouldId: string
    scope: string
}
const REMOVE_SCOPE = 'REMOVE_SCOPE'
export const removeScope = createAction<RemoveScopeAction>(REMOVE_SCOPE)
export const handleRemoveScope = handleAction<EditorState, RemoveScopeAction>(
    REMOVE_SCOPE,
    (state, action) => {
        const index = state.moulds[action.payload.mouldId].scope.findIndex(
            (value) => value === action.payload.scope
        )
        if (index !== -1) {
            state.moulds[action.payload.mouldId].scope.splice(index, 1)
        }

        return state
    },
    initialData
)

type AddStateAction = {
    mouldId: string
    state: string
}
const ADD_STATE = 'ADD_STATE'
export const addState = createAction<AddStateAction>(ADD_STATE)
export const handleAddState = handleAction<EditorState, AddStateAction>(
    ADD_STATE,
    (state, action) => {
        state.moulds[action.payload.mouldId].states[action.payload.state] = null
        const view: View = {
            id: nanoid(6),
            mouldId: action.payload.mouldId,
            state: action.payload.state,
            width: 300,
            height: 500,
            x: 100,
            y: 100,
        }
        state.views[view.id] = view

        return state
    },
    initialData
)

type RemoveStateAction = {
    mouldId: string
    state: string
}
const REMOVE_STATE = 'REMOVE_STATE'
export const removeState = createAction<RemoveStateAction>(REMOVE_STATE)
export const handleRemoveState = handleAction<EditorState, RemoveStateAction>(
    REMOVE_STATE,
    (state, action) => {
        const viewId = (<any>Object)
            .values(state.views)
            .find((g) => g.mouldId === action.payload.mouldId).id

        // state.moulds[action.payload.mouldId].states[
        //     action.payload.state
        // ] = undefined
        delete state.moulds[action.payload.mouldId].states[action.payload.state]

        // state.views[viewId] = undefined
        delete state.views[viewId]

        return state
    },
    initialData
)

type ResizeViewAction = {
    viewId: string
} & Size
const RESIZE_VIEW = 'RESIZE_VIEW'
export const resizeView = createAction<ResizeViewAction>(RESIZE_VIEW)
export const handleResizeView = handleAction<EditorState, ResizeViewAction>(
    RESIZE_VIEW,
    (state, action) => {
        const view = state.views[action.payload.viewId]
        view.width = action.payload.width
        view.height = action.payload.height

        return state
    },
    initialData
)

// type AddMouldAction = Size & Vector
// const ADD_MOULD = 'ADD_MOULD'
// export const addMould = createAction<AddMouldAction>(ADD_MOULD)
// export const handleAddMould = handleAction<EditorState, AddMouldAction>(
//     ADD_MOULD,
//     (state, action) => {
//         const { width, height, x, y } = action.payload
//         const mouldId = nanoid(6)
//         const view: View = {
//             id: nanoid(6),
//             width,
//             height,
//             x,
//             y,
//             mouldId,
//             state: 'default',
//         }
//         const mould: Mould = {
//             id: mouldId,
//             name: `Mould ${Object.values(state.moulds).length + 1}`,
//             scope: [],
//             kits: [],
//             input: [],
//             states: {
//                 default: [],
//             },
//             rootProps: {},
//         }

//         state.testWorkspace.views.push(view.id)
//         state.views[view.id] = view
//         state.moulds[mould.id] = mould

//         return state
//     },
//     initialData
// )

type ModifyMouldTreeAction = { id: string; tree: Component; state: string }
const MODIFY_MOULD_TREE = 'MODIFY_MOULD_TREE'
export const modifyMouldTree = createAction<ModifyMouldTreeAction>(
    MODIFY_MOULD_TREE
)
export const handleModifyMouldTree = handleAction<
    EditorState,
    ModifyMouldTreeAction
>(
    MODIFY_MOULD_TREE,
    (state, action) => {
        const mould = state.moulds[action.payload.id]
        mould.states[action.payload.state] = action.payload.tree

        return state
    },
    initialData
)

type WaitingForCreatingAction = { mouldId: string; stateName: string }
const WAITING_FOR_CREATING = 'WAITING_FOR_CREATING'
export const waitingForCreating = createAction<WaitingForCreatingAction>(
    WAITING_FOR_CREATING
)
export const handleWaitingForCreating = handleAction<
    EditorState,
    WaitingForCreatingAction
>(
    WAITING_FOR_CREATING,
    (state, { payload: { mouldId, stateName } }) => {
        state.creating = {
            status: 'waiting',
            view: {
                id: nanoid(6),
                mouldId,
                state: stateName,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
            beginAt: { x: 0, y: 0 },
        }

        return state
    },
    initialData
)

type StartCreatingAction = Vector
const START_CREATING = 'START_CREATING'
export const startCreating = createAction<StartCreatingAction>(START_CREATING)
export const handleStartCreating = handleAction<
    EditorState,
    StartCreatingAction
>(
    START_CREATING,
    (state, { payload: { x, y } }) => {
        if (state.creating && state.creating.status === 'waiting') {
            state.creating.status = 'start'
            state.creating.beginAt = { x, y }
        }

        return state
    },
    initialData
)

type UpdateCreatingAction = Vector
const UPDATE_CREATING = 'UPDATE_CREATING'
export const updateCreating = createAction<UpdateCreatingAction>(
    UPDATE_CREATING
)
export const handleUpdateCreating = handleAction<
    EditorState,
    UpdateCreatingAction
>(
    UPDATE_CREATING,
    (state, { payload: { x, y } }) => {
        if (
            state.creating &&
            (state.creating.status === 'start' ||
                state.creating.status === 'updating')
        ) {
            state.creating.status = 'updating'
            state.creating.view.width = Math.abs(x - state.creating.beginAt.x)
            state.creating.view.height = Math.abs(y - state.creating.beginAt.y)
            state.creating.view.x = Math.min(x, state.creating.beginAt.x)
            state.creating.view.y = Math.min(y, state.creating.beginAt.y)
        }

        return state
    },
    initialData
)

type FinishCreatingAction = void
const FINISH_CREATING = 'FINISH_CREATING'
export const finishCreating = createAction<FinishCreatingAction>(
    FINISH_CREATING
)
export const handleFinishCreating = handleAction<
    EditorState,
    FinishCreatingAction
>(
    FINISH_CREATING,
    (state) => {
        const { status, view } = state.creating || {}
        if (
            status === 'updating' &&
            typeof view === 'object' &&
            view.width !== 0 &&
            view.height !== 0
        ) {
            state.views[view.id] = view
            state.testWorkspace.views = [...state.testWorkspace.views, view.id]
            if (!state.moulds[view.mouldId]) {
                state.moulds[view.mouldId] = {
                    id: view.mouldId,
                    name: `mould ${Object.keys(state.moulds).length}`,
                    scope: [],
                    kits: [],
                    input: {},
                    states: {},
                }
            }
            state.moulds[view.mouldId].states[view.state] = null
        }

        state.creating = undefined
        delete state.creating

        return state
    },
    initialData
)

type CancelCreatingAction = void
const CANCEL_CREATING = 'CANCEL_CREATING'
export const cancelCreating = createAction<CancelCreatingAction>(
    CANCEL_CREATING
)
export const handleCancelCreating = handleAction<
    EditorState,
    CancelCreatingAction
>(
    CANCEL_CREATING,
    (state) => {
        state.creating = undefined
        delete state.creating

        return state
    },
    initialData
)

type DragViewAction = { id: string; x: number; y: number }
const DRAG_VIEW = 'DRAG_VIEW'
export const dragView = createAction<DragViewAction>(DRAG_VIEW)
export const handleDragView = handleAction<EditorState, DragViewAction>(
    DRAG_VIEW,
    (state, { payload: { id, x, y } }) => {
        state.views[id].x = x
        state.views[id].y = y

        return state
    },
    initialData
)

type SortTreeAction = { info: any }
const SORT_TREE = 'SORT_TREE'
export const sortTree = createAction<SortTreeAction>(SORT_TREE)
export const handleSortTree = handleAction<EditorState, SortTreeAction>(
    SORT_TREE,
    (state, { payload: { info } }) => {
        const selection = state.selection
        const moulds = state.moulds
        const selectedTree =
            selection && moulds[selection[0][0]].states[selection[0][1]]

        if (selectedTree && selection) {
            let dropKey = info.node.props.eventKey
            const dragKey = info.dragNode.props.eventKey
            const dropPos = info.node.props.pos.split('-')
            const dropPosition =
                info.dropPosition - Number(dropPos[dropPos.length - 1])

            const loop = (data, key, addPath, callback) => {
                const target = Array.isArray(data) ? data : data.children
                target.forEach((item, index, arr) => {
                    const path = addPath ? `${addPath}-${index}` : `${index}`
                    if (path === key) {
                        callback(item, index, arr)
                        return
                    }
                    if (item.children) {
                        loop(item.children, key, path, callback)
                    }
                })
            }
            const data = selectedTree

            // Find dragObject
            let dragObj
            loop(data, dragKey, '', (item, index, arr) => {
                arr.splice(index, 1)
                dragObj = item
            })

            const l = dragKey.length - 1
            if (parseInt(dragKey[l]) < parseInt(dropKey[l])) {
                const prevStr = dragKey.substring(0, l)
                if (prevStr === dropKey.substring(0, l)) {
                    dropKey =
                        prevStr +
                        (parseInt(dropKey[l]) - 1) +
                        dropKey.substring(l + 1)
                }
            }

            if (!info.dropToGap) {
                // Drop on the content
                loop(data, dropKey, '', (item) => {
                    item.children = item.children || []
                    // where to insert 示例添加到尾部，可以是随意位置
                    const index = item.children.push(dragObj)
                })
            } else if (
                (info.node.props.children || []).length > 0 && // Has children
                info.node.props.expanded && // Is expanded
                dropPosition === 1 // On the bottom gap
            ) {
                loop(data, dropKey, '', (item) => {
                    item.children = item.children || []
                    // where to insert 示例添加到尾部，可以是随意位置
                    item.children.unshift(dragObj)
                })
            } else {
                // Drop on the gap
                let ar
                let i
                loop(data, dropKey, '', (item, index, arr) => {
                    ar = arr
                    i = index
                })
                if (dropPosition === -1) {
                    ar.splice(i, 0, dragObj)
                } else {
                    ar.splice(i + 1, 0, dragObj)
                }
            }

            moulds[selection[0][0]].states[selection[0][1]] = data
            selection[1] = []
        }

        return state
    },
    initialData
)

type HasChildren = {
    children?: HasChildren[]
}

const deleteChildren = (comp: HasChildren, path: number[]) => {
    if (path.length === 1) {
        comp.children!.splice(path[0], 1)
    } else {
        deleteChildren(comp.children![path[0]], path.slice(1))
    }
}

type DeleteNodeAction = void
const DELETE_NODE = 'DELETE_NODE'
export const deleteNode = createAction<DeleteNodeAction>(DELETE_NODE)
export const handleDeleteNode = handleAction<EditorState, DeleteNodeAction>(
    DELETE_NODE,
    (state) => {
        const selection = state.selection
        const views = state.views
        const allViews = Object.keys(views)
        if (state.testWorkspace.views.length !== allViews.length) {
            state.testWorkspace.views = allViews
        }

        if (selection) {
            if (selection[1].length) {
                deleteChildren(
                    {
                        children:
                            state.moulds[selection[0][0]].states[
                                selection[0][1]
                            ]?.children,
                    },
                    selection[1]
                )
                selection[1] = []
            } else {
                if (
                    state.moulds[selection[0][0]].states[selection[0][1]] !==
                    null
                ) {
                    state.moulds[selection[0][0]].states[selection[0][1]] = null
                } else {
                    delete state.moulds[selection[0][0]].states[selection[0][1]]
                    if (
                        Object.keys(state.moulds[selection[0][0]].states)
                            .length === 0
                    ) {
                        delete state.moulds[selection[0][0]]
                    }
                    const view = Object.values(state.views).find(
                        (view) =>
                            view.mouldId === selection[0][0] &&
                            view.state === selection[0][1]
                    )
                    delete state.views[view!.id]
                    const index = state.testWorkspace.views.findIndex(
                        (viewId) => view!.id === viewId
                    )
                    state.testWorkspace.views.splice(index, 1)
                    state.selection = undefined
                }
            }
        }

        return state
    },
    initialData
)

type AddKitAction = { type: string; mouldId: ID; name?: string; param?: object }
const ADD_KIT = 'ADD_KIT'
export const addKit = createAction<AddKitAction>(ADD_KIT)
export const handleAddKit = handleAction<EditorState, AddKitAction>(
    ADD_KIT,
    (state, { payload: { type, mouldId, name, param } }) => {
        const { kits } = state.moulds[mouldId]

        let kitName = name || `kit ${kits.length}`
        const names = kits.map((k) => k.name)
        if (names.includes(kitName)) {
            kitName = 'New-' + kitName
        }
        const mould = state.moulds[mouldId]
        const kit: Kit = {
            type,
            name: kitName,
            dataMappingVector: [],
            param,
        }

        kits.push(kit)

        return state
    },
    initialData
)

type ConnectScopeToKit = {
    scope: string
    prop: string
    mouldId: ID
    kitIndex: number
}
const CONNECT_SCOPE_TO_KIT = 'CONNECT_SCOPE_TO_KIT'
export const connectScopeToKit = createAction<ConnectScopeToKit>(
    CONNECT_SCOPE_TO_KIT
)
export const handleConnectScopeToKit = handleAction<
    EditorState,
    ConnectScopeToKit
>(
    CONNECT_SCOPE_TO_KIT,
    (state, { payload: { scope, prop, mouldId, kitIndex } }) => {
        const mould = state.moulds[mouldId]
        const kit = mould.kits[kitIndex]
        kit.dataMappingVector.push([prop, scope])

        return state
    },
    initialData
)

type DisConnectScopeToKit = {
    scope: string
    prop: string
    mouldId: ID
    kitName: string
}
const DISCONNECT_SCOPE_TO_KIT = 'DISCONNECT_SCOPE_TO_KIT'
export const disconnectScopeToKit = createAction<DisConnectScopeToKit>(
    DISCONNECT_SCOPE_TO_KIT
)
export const handleDisConnectScopeToKit = handleAction<
    EditorState,
    DisConnectScopeToKit
>(
    DISCONNECT_SCOPE_TO_KIT,
    (state, { payload: { scope, prop, mouldId, kitName } }) => {
        const mould = state.moulds[mouldId]
        const kit = find(mould.kits, (k) => k.name === kitName)

        remove(kit.dataMappingVector, (v) => v[0] === prop && v[1] === scope)
        return state
    },
    initialData
)

type ModifyInputAction = {
    mouldId: string
    inputKey: string
    config: InputConfig
}
const MODIFY_INPUT = 'MODIFY_INPUT'
export const modifyInput = createAction<ModifyInputAction>(MODIFY_INPUT)
export const handleModifyInput = handleAction<EditorState, ModifyInputAction>(
    MODIFY_INPUT,
    (state, action) => {
        state.moulds[action.payload.mouldId].input[action.payload.inputKey] =
            action.payload.config

        return state
    },
    initialData
)

type ModifyMetaAction = {
    mouldId: ID
    name?: string
    hookFunctionName?: string
}
const MODIFY_META = 'MOULD_META'
export const modifyMeta = createAction<ModifyMetaAction>(MODIFY_META)
export const handleModifyMeta = handleAction<EditorState, ModifyMetaAction>(
    MODIFY_META,
    (state, { payload: { mouldId, name, hookFunctionName } }) => {
        name && (state.moulds[mouldId].name = name)
        hookFunctionName &&
            (state.moulds[mouldId].hookFunctionName = hookFunctionName)

        return state
    },
    initialData
)

type ModifyKitAction = {
    mouldId: ID
    kitName: string
    [key: string]: any
}
const MODIFY_KIT = 'MODIFY_KIT'
export const modifyKit = createAction<ModifyKitAction>(MODIFY_KIT)
export const handleModifyKit = handleAction<EditorState, ModifyKitAction>(
    MODIFY_KIT,
    (state, { payload: { mouldId, kitName, ...rest } }) => {
        const kit = state.moulds[mouldId].kits.find((k) => k.name === kitName)
        Object.assign(kit, rest)

        return state
    },
    initialData
)

type DragToViewAction = {
    tree: Component
    viewId: ID
}
const DRAG_TO_VIEW = 'DRAG_TO_VIEW'
export const dragToView = createAction<DragToViewAction>(DRAG_TO_VIEW)
export const handleDragToView = handleAction<EditorState, DragToViewAction>(
    DRAG_TO_VIEW,
    (state, { payload: { tree, viewId } }) => {
        const view = state.views[viewId]
        const stateName = view.state
        const mould = state.moulds[view.mouldId]
        mould.states[stateName] = tree

        return state
    },
    initialData
)

type ModifyStateName = {
    mouldId: string
    stateName: string
    name: string
}
const MODIFY_STATENAME = 'STATE_NAME'
export const modifyStateName = createAction<ModifyStateName>(MODIFY_STATENAME)
export const handleModifyStateName = handleAction<EditorState, ModifyStateName>(
    MODIFY_STATENAME,
    (state, { payload: { mouldId, stateName, name } }) => {
        const currentMould = state.moulds[mouldId]
        currentMould.states[name] = currentMould.states[stateName]
        delete currentMould.states[stateName]

        const view = Object.values(state.views).find(
            (view) => view.state === stateName
        )
        if (view) view.state = name

        return state
    },
    initialData
)

type ModifyKitNameAction = {
    mouldId: ID
    kitName: string
    newKitName: string
    stateName: string
}
const MODIFY_KITNAME = 'MODIFY_KITNAME'
export const modifyKitName = createAction<ModifyKitNameAction>(MODIFY_KITNAME)
export const handleModifyKitName = handleAction<
    EditorState,
    ModifyKitNameAction
>(
    MODIFY_KITNAME,
    (state, { payload: { mouldId, kitName, newKitName, stateName } }) => {
        const { kits, states } = state.moulds[mouldId]
        const currentKit = kits.find((k) => k.name === kitName)
        const currentState = states[stateName]

        const recursiveUpdate = (children, propSet) => {
            const { key, oldValue, newValue } = propSet
            children.forEach((child) => {
                if (child.children && Array.isArray(child.children)) {
                    recursiveUpdate(child.children, propSet)
                }
                if (child.props[key] === oldValue) {
                    child.props[key] = newValue
                }
            })
        }

        if (currentState?.children) {
            recursiveUpdate(currentState.children, {
                key: '__kitName',
                oldValue: kitName,
                newValue: newKitName,
            })
        }

        Object.assign(currentKit, { name: newKitName })

        return state
    },
    initialData
)

type DeleteKitAction = {
    mouldId: ID
    kitName: string
    stateName: string
}
const DELETE_KIT = 'DELETE_KIT'
export const deleteKit = createAction<DeleteKitAction>(DELETE_KIT)
export const handleDeleteKit = handleAction<EditorState, DeleteKitAction>(
    DELETE_KIT,
    (state, { payload: { mouldId, kitName, stateName } }) => {
        const { kits, states } = state.moulds[mouldId]
        const currentKitIndex = kits.findIndex((k) => k.name === kitName)
        const currentState = states[stateName]
        const recursiveRemove = (children, propSet) => {
            const { key, name } = propSet
            children.forEach((child, index) => {
                if (child.children && Array.isArray(child.children)) {
                    recursiveRemove(child.children, propSet)
                }
                if (child.props[key] === name) {
                    children.splice(index, 1)
                }
            })
        }

        Object.assign(state.moulds[mouldId], {
            kits: [
                ...kits.slice(0, currentKitIndex),
                ...kits.slice(currentKitIndex + 1),
            ],
        })

        if (currentState?.children) {
            recursiveRemove(currentState.children, {
                key: '__kitName',
                name: kitName,
            })
        }
        return state
    },
    initialData
)

type renderRecursiveMouldAction = { key: string }
const RENDER_RECURSIVE_MOULD = 'RENDER_RECURSIVE_MOULD'
export const renderRecursiveMould = createAction<renderRecursiveMouldAction>(
    RENDER_RECURSIVE_MOULD
)
export const handleRenderRecursiveMould = handleAction<
    EditorState,
    renderRecursiveMouldAction
>(
    RENDER_RECURSIVE_MOULD,
    (state, { payload: { key } }) => {
        if (!state.recursiveRendered) {
            state.recursiveRendered = []
        }
        if (!state.recursiveRendered.includes(key)) {
            state.recursiveRendered.push(key)
        }

        return state
    },
    initialData
)

type ToggleViewsAction = {
    excludes: string
}

const TOGGLE_VIEWS = 'TOGGLE_VIEWS'
export const toggleViews = createAction<ToggleViewsAction>(TOGGLE_VIEWS)
export const handleToggleViews = handleAction<EditorState, ToggleViewsAction>(
    TOGGLE_VIEWS,
    (state, { payload: { excludes } }) => {
        const { views } = state
        const target = excludes

        const allViews = Object.keys(views)
        const ownViews = filter(allViews, (v) => views[v].mouldId === target)

        state.testWorkspace.views =
            state.testWorkspace.views.length === allViews.length
                ? ownViews
                : allViews

        return state
    },
    initialData
)
