#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=1800"
cd /home/z/my-project
exec npx next dev -p 3000 --webpack 2>&1 | tee dev.log
