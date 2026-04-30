import 'dotenv/config'
import { initialize as initializeMemories, saveMemoriesToFile } from './memories-manager.js'
import { saveState } from './state-manager.js'
import { connect as connectMinecraftClient } from './minecraft-client.js'
import { start } from './orchestrator.js'

function onExit() {
    saveMemoriesToFile()
    saveState()
}

process.on('SIGINT', () => {
    onExit()
    process.exit(0)
})
process.on('exit', onExit)

initializeMemories()
connectMinecraftClient()
start()