#!/bin/sh
mode=$1
if [ -z "$mode" ] 
echo Error! Select build mode: build or staging
then exit 1
fi

git reset --hard
git pull
npm run build:$mode
rm -rf /usr/share/nginx/admin_frontend
cp -r dist/ /usr/share/nginx/admin_frontend
echo Successful