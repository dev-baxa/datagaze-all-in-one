const  prompt = `\x1b[A\x1b[K\x1b[01;32m$USER@$HOSTNAME\x1b[00m:\x1b[01;34m$(echo $PWD | sed "s|^$(eval echo ~$USER)|~|")\x1b[00m\x1b[37m$\x1b[00m`;
console.log(prompt);
