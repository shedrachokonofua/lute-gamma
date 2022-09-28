value=`cat .env.production`
doctl compute ssh root@lute-platform --ssh-key-path ~/.ssh/id_rsa --ssh-command "cd /root/dev/lute-v3 && echo '$value' > .env && git pull && pnpm prod:build -d"