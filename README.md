# Word Chain
A Slack bot run in Node.js that manages a very fun game. (Well not right now currently, very boring and passive in this version)

# Play!
If you are in the Hack Club workspace then just join the [#word-chain](https://app.slack.com/client/T0266FRGM/C0955VAEG4W) channel

Channel ID: C0955VAEG4W

# Distributions
Add this bot to your workspace!

Click this button:

<a href="https://slack.com/oauth/v2/authorize?client_id=2210535565.9201372246081&scope=app_mentions:read,channels:history,chat:write,reactions:write,commands&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

Or go to this link -> [https://slack.com/oauth/v2/authorize?client_id=2210535565.9201372246081&scope=app_mentions:read,channels:history,chat:write,reactions:write,commands](https://slack.com/oauth/v2/authorize?client_id=2210535565.9201372246081&scope=app_mentions:read,channels:history,chat:write,reactions:write,commands)

# Self-hosting
If you want to host this bot yourself to add to it or anything, then feel free but just please give me credit!

### Steps to self host
* Clone the repo to your host machine
* Install these node requirements
  * @slack/bolt
  * dotenv
  * express
* Create a .env file
  * Now inside the file copy and paste this and fill out the required fields:
    ```
    SLACK_BOT_TOKEN=<SLACK_BOT_TOKEN_HERE>
    SLACK_SIGNING_SECRET=<SLACK_APP_SIGNING_SECRET_HERE>
    PORT=<Port that index.js will be using>
    SLASH_PORT=<Port that slash_commands.js will be using>
    DEVID=<Your Slack ID>
    BOTID=<Your Bot ID>
    DEBUGCHANNELID=<Your Channel to be notified with any bot info, errors, etc.>
    PRIVATEDEBUG=<Set to true if you want only yourself to see the debug messages or false if you want everyone in the debug channel to see it>
    ```
* Next install ngrok and cloudflare
  * First create a cloudflare account if you don't already have one and start a tunnel (watch yt videos)
  * Then create an ngrok account and authenticate that too (watch yt videos)
* Next create a Slack app/bot and add it to your workspace with these OAuth Scopes:
    ```
    app_mentions:read
    channels:history
    channels:read
    chat:write
    commands
    reactions:write
    ```
* Then go to slash commands section of your bot and add these commands:
    ```
    /help
    /startgame
    /rules
    /tunnel
    ```
    * Then set the Request URL to the cloudflare tunnel link + /slack/events at the end.
    * e.g. https://word-chain.example.com/slack/events
* Then everytime you need to start the bot just run start_services.sh if you are on linux
* If you are on Windows or MacOS then just run 'node index.js' and find out a way to run it in the background or something idk
* And then go to a slack channel where the bot is in and run /tunnel and copy and paste that ngrok link into the event subscriptions section and that's it!
* But be aware that if your ngrok tunnel restarts or stops then you need to redo the previous step.

# Feedback / Contact
If you have any questions or found a bug then [DM me on Slack](https://hackclub.slack.com/team/U08UTM44MS6) if you are in the Hack Club workspace.

Or use my e-mail -> trajesh@3272010.xyz
