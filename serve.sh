#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS='--max-old-space-size=800 --max-semi-space-size=48' node .next/standalone/server.js -p 3000 2>/dev/null
  echo "Server crashed, restarting in 1s..."
  sleep 1
done
