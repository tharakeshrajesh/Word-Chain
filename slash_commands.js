require("dotenv").config();
const { startgame } = require('./index');
const { App } = require('@slack/bolt');
const { exec } = require('child_process');

const botId = process.env.BOTID;
const devId = process.env.DEVID;
const PORT = process.env.SLASH_PORT || 3030;

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events',
  port: PORT
});

async function postEphemeral(channelId, userId, text, blocks = null) {
	if (!(await app.client.conversations.members({ channel: channelId })).members.includes(botId)) return;
	if (blocks)
		app.client.chat.postEphemeral({
			token: process.env.SLACK_BOT_TOKEN,
			channel: channelId,
			user: userId,
			text: text,
			blocks: blocks
		});
	else
		app.client.chat.postEphemeral({
			token: process.env.SLACK_BOT_TOKEN,
			channel: channelId,
			user: userId,
			text: text
		});
}

app.command('/startgame', async ({ command, ack }) => {
	await ack();
	startgame(command.channel_id, command.user_id);
});

app.command('/help', async ({ command, ack }) => {
	await ack();
	postEphemeral(command.channel_id, command.user_id, "/help: Lists all the commands.\n/rules: Explains the rules of the game.\n/startgame: starts a game if there is not an ongoing one currently.");
});

app.command('/rules', async ({ command, ack }) => {
	await ack();
	postEphemeral(command.channel_id, command.user_id, 'Word Chain Game Rules', [
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
	]);
});

app.command('/tunnel', async ({ command, ack }) => {
	await ack();
	if (!command.userId === devId) return postEphemeral(command.channel_id, command.user_id, 'Only developers/managers/admins of the bot can use this command!');
	exec(process.platform === 'win32' ? '(Invoke-RestMethod -Uri http://127.0.0.1:4040/api/tunnels).tunnels | ForEach-Object { $_.public_url } | Where-Object { $_ -like "https://*" }' : process.platform === 'linux' ? "curl -s http://127.0.0.1:4040/api/tunnels | grep -o 'https://[^\"]*'" : process.platform === 'darwin' ? 'curl -s http://127.0.0.1:4040/api/tunnels | grep -o \'"public_url":"https://[^"]*"\' | sed \'s/"public_url":"//\'' : 'echo "OS not supported for this command."', (err, stdout, stderr) => {
		if (err) return postEphemeral(command.channel_id, command.user_id, `An error occured!\n\n${String(err)}`);
		postEphemeral(command.channel_id, command.user_id, `Tunnel URL(s):\n${stdout.trim()}`);
	});
});

app.event('member_joined_channel', async ({ command }) => {
	postEphemeral(command.channel_id, command.user_id, `Welcome to <#${command.channel_id}>, <@${command.user_id}>!\nTo learn the rules use the /rules command.\nTo learn other commands use the /help command.\nHave fun and don't ruin streaks!`);
});

async function slash_commands() {
  await app.start(PORT);
  console.log(`⚡️ Bolt app (slash commands) is running on port ${PORT}`);
  if (process.env.PRIVATEDEBUG === 'true')
  	postEphemeral(process.env.DEBUGCHANNELID, devId, `Bot started\n<@${devId}>`);
  else
	try {
		await app.client.chat.postMessage({
		token: process.env.SLACK_BOT_TOKEN,
		channel: process.env.DEBUGCHANNELID,
		text: `Bot started\n<@${devId}>`,
		});
	} catch (error) {
		console.error('Error sending message:', error);
	}
}

module.exports = { slash_commands }
