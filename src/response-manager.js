import { addShortTermMemory, addLongTermMemory, removeShortTermMemory, removeLongTermMemory } from './memory-manager.js'
import { state } from './state.js'

export function handleResponse(response) {
    console.log(`Handling response:`, response)
    handlePosition(response.moveTo)
    handleMemories(response)
}

function handleMemories(response) {

    /* Add Memories */

    if (response.addShortTermMemories) {
        for (let memory of response.addShortTermMemories) {
            addShortTermMemory(memory)
        }
    }
    if (response.addLongTermMemories) {
        for (let memory of response.addLongTermMemories) {
            addLongTermMemory(memory)
        }
    }

    /* Remove Memories */

    if (response.forgetShortTermMemories) {
        for (let id of response.forgetShortTermMemories) {
            removeShortTermMemory(id)
        }
    }
    if (response.forgetLongTermMemories) {
        for (let id of response.forgetLongTermMemories) {
            removeLongTermMemory(id)
        }
    }
}

function handlePosition(position) {
    if (position == null) return

    const parts = position.split(',')
    state.position.x = parseInt(parts[0])
    state.position.y = parseInt(parts[1])
    state.position.z = parseInt(parts[2])
}