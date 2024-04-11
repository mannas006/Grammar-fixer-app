import dayjs from "dayjs";
import { createReadStream, createWriteStream } from "fs";
import { writeFile } from "fs/promises";
import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
function renderInitMessage() {
  return [
    {
      role: "system",
      content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${dayjs().format(
        "YYYY-MM-DD"
      )}')}`,
    },
  ];
}

const params = {
  model: "",
  messages: renderInitMessage(),
  temperature: 0.7,
  stream: true,
};
export const config = {
  apiKey: "",
  proxy: {},
  baseUrl: "",
};
export function createGptChat(
  options = {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: "gpt-3.5-turbo",
  }
) {
  params.model = options.model || "gpt-3.5-turbo";

  const sendMessage = (message = "") => {
    return new Promise((resolve, reject) => {
      fetch(
        `${options.baseUrl || "https://api.openai.com"}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${options.apiKey}`,
            "Content-Type": "application/json",
            origin: "chrome-extension://iaakpnchhognanibcahlpcplchdfmgma",
          },
          body: JSON.stringify(params),
        }
      )
        .then((res) => res.text())
        .then((m = "") => {
          const jsonData = m
            .split("\n")
            .filter((line) => line !== "" && line !== "data: [DONE]")
            .map((line) => line.replace("data: ", ""))
            .map((line) => JSON.parse(line));

          const AiText = jsonData
            .filter(({ choices: [{ finish_reason }] }) => !finish_reason)
            .map(({ choices: [{ delta }] }) => delta.content)
            .join("");
          params.messages.push({
            role: "assistant",
            content: AiText,
          });
          resolve(AiText);
        })
        .catch(
          (e) => reject(e),
          // @ts-ignore
          (params.messages = renderInitMessage())
        );
    });
  };

  const reset = () => {
    try {
      params.messages = renderInitMessage();
      return true;
    } catch {
      return false;
    }
  };

  return {
    sendMessage,
    reset,
  };
}

export async function createAudioTranscriptions({
  apiKey = config.apiKey,
  filePath = "",
  prompt = undefined,
  format = "text", // json, text, srt, verbose_json, or vtt
  temperature = 0.7,
  output = "./audio.txt",
}) {
  const configuration = new Configuration({
    apiKey,
  });
  const openAi = new OpenAIApi(configuration);
  try {
    // # The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
    const resp = await openAi.createTranscription(
      // @ts-ignore
      createReadStream(filePath),
      "whisper-1",
      prompt,
      format,
      temperature,
      undefined,
      {
        proxy: config.proxy,
      }
    );
    // @ts-ignore
    return writeFile(output, resp.data);
  } catch (error) {
    console.warn(error);
    // @ts-ignore
    errorHandler(error);
  }

  // 错误处理函数
  function errorHandler(err = new Error()) {
    // 将错误信息写入txt文本文件
    const stream = createWriteStream("error.log", { flags: "a" });
    stream.write(`${new Date().toISOString()}: ${err.stack}\n`);
    stream.end();
  }
}
