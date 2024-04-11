# 与 gpt 通信,带记忆功能

### how to install

```
pnpm i gpt-api
```

### how to use

```
import {createGptChat,config,createAudioTranscriptions} from 'gpt-api'
// config is global config，can set apiKey and proxy

// this api follow terminal agent
const gpt = createGptChat({
  apiKey: 'your key',
  baseUrl: 'official or your proxy url',
  model: "gpt-3.5-turbo",
})
/** @returns {string} */
const response =  await gpt.sendMessage('say you question')

gpt.reset() // restart memory

// create audio transcription
createAudioTranscriptions({
  filePath: './xxx.mp3',
  output: './audio.txt'
})
// default return text
```
