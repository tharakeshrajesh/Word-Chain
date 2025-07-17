#!/bin/bash

# Start bot code
nohup node index.js > index.log 2>&1 &

# Start Cloudflare Tunnel
nohup cloudflared tunnel run --token <your_token> > cloudflared.log 2>&1 &

# Start ngrok
nohup ngrok http 3050 > ngrok.log 2>&1 &