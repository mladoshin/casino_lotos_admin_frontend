#!/bin/sh
mode=$1
if [ -z "$mode" ]; then 
echo Error! Select build mode: build or staging
exit 1
fi

git reset --hard
git pull
npm run build:$mode
rm -rf /usr/share/nginx/admin_frontend
cp -r dist/ /usr/share/nginx/admin_frontend
echo Success!