import { promptLlm } from './llm-client.js'

promptLlm('how many messages have I sent you?').then(r => {
    console.log(r)
})