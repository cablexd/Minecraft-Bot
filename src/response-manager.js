import { addShortTermMemory, addLongTermMemory, removeShortTermMemory, removeLongTermMemory } from './memories-manager.js'
import { STATE } from './state-manager.js'
import { chat, moveTo } from './minecraft-client.js'

export function handleResponse(response) {
    console.info(`Handling response:`, response)
    handleChat(response)
    handleMoveTo(response)
    handleMemories(response)
}

function handleChat(response) {
    if (response.chat != null) {
        chat(response.chat)
    }
}

function handleMoveTo(response) {
    if (response.moveTo != null) {
        const pos = response.moveTo.split(',').map(Number)
        moveTo(pos[0], pos[1], pos[2])
    }
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