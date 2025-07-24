#!/bin/bash

#
rm *.log

# Start bot code
nohup node index.js > index.log 2>&1 &

# Start Cloudflare Tunnel
nohup cloudflared tunnel --config tunnel.yml run > cloudflared.log 2>&1 &

# Only have to use one tunnel now, yay, I love cloudflare
