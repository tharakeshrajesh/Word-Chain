require("dotenv").config();
const { startgame } = require('./index');
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const gameActive = new Map();

const PORT = process.env.SLASH_PORT || 3030;

function gameOver(channelId) {
	gameActive.delete(channelId);
}

app.command('/startgame', async ({ command, ack, say }) => {
  await ack();
  if (gameActive.get(command.channel_id)) {
    return app.client.chat.postEphemeral({
        token: process.env.SLACK_BOT_TOKEN,
        channel: command.channel_id,
        user: command.user_id,
        text: "There is already an ongoing game!"
    });
  }
  await say(`Game started by <@${command.user_id}>.`);
  startgame(command.channel_id);
  gameActive.set(command.channel_id, true);
});

app.command('/help', async ({ command, ack }) => {
  await ack();
  app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: command.channel_id,
      user: command.user_id,
      text: "/help: Lists all the commands.\n/rules: Explains the rules of the game.\n/startgame: starts a game if there is not an ongoing one currently."
  });
});

app.command('/rules', async ({ command, ack }) => {
  await ack();
  app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: command.channel_id,
      user: command.user_id,
      text: "Word Chain Game Rules",
      blocks: [
		{
			"type": "rich_text",
			"elements": [
				{
					"type": "rich_text_section",
					"elements": [
						{
							"type": "text",
							"text": "In this game you just type a word following these rules:\n\n"
						}
					]
				},
				{
					"type": "rich_text_list",
					"style": "bullet",
					"indent": 0,
					"elements": [
						{
							"type": "rich_text_section",
							"elements": [
								{
									"type": "text",
									"text": "First letter of your word must be the last letter of the previous one."
								}
							]
						},
						{
							"type": "rich_text_section",
							"elements": [
								{
									"type": "text",
									"text": "You may not type another word consecutively, you must wait on another player first."
								}
							]
						},
						{
							"type": "rich_text_section",
							"elements": [
								{
									"type": "text",
									"text": "Must be a word in the English dictionary."
								}
							]
						},
						{
							"type": "rich_text_section",
							"elements": [
								{
									"type": "text",
									"text": "Longer than 2 characters."
								}
							]
						},
						{
							"type": "rich_text_section",
							"elements": [
								{
									"type": "text",
									"text": "And lastly, you can not repeat any words already used."
								}
							]
						}
					]
				},
				{
					"type": "rich_text_section",
					"elements": [
						{
							"type": "text",
							"text": "\nThat's pretty much it.\nHave fun, don't ruin streaks."
						}
					]
				}
			]
		}
	]
  });
});

app.event('member_joined_channel', async ({ command }) => {
  app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: command.channel_id,
      user: command.user_id,
      text: `Welcome to <#${C0955VAEG4W}>, <@${command.user_id}>!\nTo learn the rules use the /rules command.\nTo learn other commands use the /help command.\nHave fun and don't ruin streaks!`
    });
});

async function slash_commands() {
  await app.start(PORT);
  console.log(`⚡️ Bolt app (slash commands) is running on port ${PORT}`);
}

module.exports = { slash_commands, gameOver }