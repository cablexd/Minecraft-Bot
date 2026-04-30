import { addShortTermMemory, addLongTermMemory, removeShortTermMemory, removeLongTermMemory } from './memories-manager.js'
import { STATE } from './state-manager.js'
import { chat, moveTo } from './minecraft-client.js'

export function handleResponse(response) {
    console.info(`Handling response:`, response)
    handleChat(response)
    handleMove(response)
    handleMemories(response)
}

function handleChat(response) {
    if (response.chat != null) {
        chat(response.chat)
    }
}

function handleMove(response) {
    if (response.move != null) {
        const pos = response.move.split(',').map(Number)
        moveTo(pos[0], pos[1], pos[2])
    }
}

function handleMemories(response) {

    /* Add Memories */

    if (response.addShort) {
        for (let memory of response.addShort) {
            addShortTermMemory(memory)
        }
    }
    if (response.addLong) {
        for (let memory of response.addLong) {
            addLongTermMemory(memory)
        }
    }

    /* Remove Memories */

    if (response.forgetShort) {
        for (let id of response.forgetShort) {
            removeShortTermMemory(id)
        }
    }
    if (response.forgetLong) {
        for (let id of response.forgetLong) {
            removeLongTermMemory(id)
        }
    }
}