#!/bin/bash
cd /home/z/my-project
rm -f dev.log
NODE_OPTIONS="--max-old-space-size=2048" npx next dev -p 3000 --webpack >> dev.log 2>&1 &
echo $! > /tmp/nextjs.pid
