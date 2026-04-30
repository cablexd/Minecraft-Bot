# Minecraft Bot

This project is a work in progress - the foundations are not yet complete.

## Purpose

This project serves as a way for me to learn about the nature of the responses of LLMs when they are given an objective/scenario. In this case, our LLM is the *brain* of an autonomous Minecraft bot.

I find the way that LLMs act and respond very fascinating. More specifically, how well they process different kinds of data and when they choose to carry out certain tasks in an **agentic loop**. I am also trying to find out how changing the formatting of a prompt and the data given to the LLM will affect how effectively it can interpret and respond to the input.

## Comments About Current Version

The current prompt is causing the LLM to hallucinate a lot of random things in the response.
I think it needs to be shortened.

## Project Stack

- **LLM:** Qwen3.5 via Ollama running locally
- **Minecraft client:** Mineflayer

## Environment Variables

Must have a `.env` file in the root directory with the following fields:

- MINECRAFT_PORT
- MINECRAFT_VERSION