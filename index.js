{require("dotenv").config();
const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

receiver.app.use(express.json());
receiver.app.use(express.urlencoded({ extended: true }));

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
});

const PORT = process.env.PORT || 3000;

const botId = process.env.BOTID;

const gameActive = new Map();
const lastWord = new Map();
const usedWords = new Map();
const streak = new Map();
const lastUser = new Map();

const sentences = [
  "Good job\nYou ruined this streak of streakVal!\nThank user for this.\nThis is public shaming and I am proud of it.",
  "Yay!\nuser ruined the streakVal word streak!\nNow we all have to restart!",
  ":tada: :confetti_ball:\nuser has done it!\nWe all get to have the fun of restarting this streakVal word streak again!",
  "That streakVal word streak was getting big!\nThanks user for breaking it!",
  "I think the people who worked hard on this streakVal word streak want to privately talk to you user.\nMake sure you take off all your protective clothing and gear before you go!",
];

async function sendMessage(channelId, text) {
  if (!(await app.client.conversations.members({ channel: channelId })).members.includes(botId)) return;
  try {
    await app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      text,
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function postEphemeral(channelId, userId, text) {
  if (!(await app.client.conversations.members({ channel: channelId })).members.includes(botId)) return;
  app.client.chat.postEphemeral({
    token: process.env.SLACK_BOT_TOKEN,
    channel: channelId,
    user: userId,
    text: text
  });
}

async function addReaction(channel, ts, emoji = '+1') {
  try {
    if (!(await app.client.conversations.members({ channel: channelId })).members.includes(botId)) return;
    await app.client.reactions.add({
      token: process.env.SLACK_BOT_TOKEN,
      name: emoji,
      channel,
      timestamp: ts,
    });

    if (emoji === "-1") {
      await app.client.reactions.add({
        token: process.env.SLACK_BOT_TOKEN,
        name: "poop",
        channel,
        timestamp: ts,
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
  }
}

async function isWord(word, channelId, user) {
  if (!/^[a-zA-Z]+$/.test(word)) return false;
  if (word.length < 2) return false;

  if (lastUser.get(channelId) === user) return false;

  const lower = word.toLowerCase();
  if (usedWords.get(channelId)?.has(lower)) return false;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${lower}`);
    const dict = await response.json();
    return dict.title !== "No Definitions Found";
  } catch {
    return false;
  }
}

async function startgame(channelId, userId) {
  gameActive.set(channelId, true);
  usedWords.set(channelId, new Set());

  if (gameActive.get(channelId)) return postEphemeral(channelId, userId, "There is already an ongoing game!");

  await sendMessage(channelId, `Game started by <@${userId}>.`);

  try {
    const wordRes = await fetch('https://random-word-api.herokuapp.com/word');
    const [randomWord] = await wordRes.json();
    lastWord.set(channelId, randomWord);
    usedWords.get(channelId).add(randomWord.toLowerCase());
    streak.set(channelId, 0);
    await sendMessage(channelId, `The starting word is: ${randomWord}`);
  } catch (error) {
    console.error('Failed to fetch starting word:', error);
    gameActive.delete(channelId);
    usedWords.delete(channelId);
    streak.delete(channelId);
    lastUser.delete(channelId);
    lastWord.delete(channelId);
  }
}

module.exports = { startgame };
const { slash_commands } = require('./slash_commands');

console.clear();

receiver.app.post('/', async (req, res) => {
  const body = req.body;

  if (body.type === 'url_verification') return res.status(200).send(body.challenge);

  if (!body?.event) return res.status(200).send();
  const event = body.event;

  if (event.subtype === 'bot_message' || event.bot_id) return res.status(200).send();
  if (event.type === 'app_mention') await addReaction(event.channel, event.ts, "mad_ping_sock");
  if (!gameActive.has(event.channel)) return res.status(200).send();

  if (event.type === 'message') {
    const channelId = event.channel;
    const messageText = event.text.toLowerCase();

    if (lastWord.has(channelId)) {
      const valid = await isWord(messageText, channelId, event.user);
      if (!valid) {
        await addReaction(channelId, event.ts, "-1");
        await sendMessage(channelId, sentences[Math.floor(Math.random() * sentences.length)].replace("streakVal", String(streak.get(channelId))).replace("user", `<@${event.user}>`));
        gameActive.delete(channelId);
        usedWords.delete(channelId);
        streak.delete(channelId);
        lastUser.delete(channelId);
        lastWord.delete(channelId);
        gameOver(channelId);
        return res.status(200).send();
      }

      const prev = lastWord.get(channelId);
      const lastChar = prev.slice(-1).toLowerCase();
      const firstChar = messageText[0];

      if (lastChar === firstChar) {
        await addReaction(channelId, event.ts);
        lastWord.set(channelId, messageText);
        usedWords.get(channelId).add(messageText);
        streak.set(channelId, streak.get(channelId) + 1);
        lastUser.set(channelId, event.user);
      } else {
        await addReaction(channelId, event.ts, "-1");
        await sendMessage(channelId, sentences[Math.floor(Math.random() * sentences.length)]);
        gameActive.delete(channelId);
        usedWords.delete(channelId);
        streak.delete(channelId);
        lastUser.delete(channelId);
        lastWord.delete(channelId);
        gameOver(channelId);
      }
    }
  }
  res.status(200).send();
});

slash_commands();

(async () => {
  await app.start(PORT);
  console.log(`⚡️ Express Bolt app (main) is running on port ${PORT}`);
})();}