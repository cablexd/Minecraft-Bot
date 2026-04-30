import 'dotenv/config'
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

connectMinecraftClient()
start()