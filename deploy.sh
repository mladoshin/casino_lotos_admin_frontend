git reset --hard
git pull
npm run build
rm -rf /usr/share/nginx/admin_frontend
cp -r dist/ /usr/share/nginx/admin_frontend
echo Successful