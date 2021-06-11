// why all global? You can use everything when you execute javascript in commands or add commands when bot is running
global.fs = require('fs');
global.http = require('http');
const Client = require('discord.js').Client;
global.client = new Client({ partials: ['MESSAGE', 'CHANNEL'] });
global.commands = new Map();

// somebody who setup and control bot, SOMEBODY WHO KNOW JS
const fullControlAdmin = '384298832835379210';

// send log to admin controlling bot
function logOwner(msg, text) {
    msg.guild.members.fetch(fullControlAdmin).then(botControlAdmin => botControlAdmin.send(text))
}

// set bot status
global.setStatus = function( name ) {
    client.user.setActivity(name)
}

// try to load command with optional setting as global this what return module.export in command
global.grequire = function(name, path) {
    try {
        if(name) global[name] = require(path);
            else require(path);
        return 'OK'
    } catch( err ) {
        return err
    }
}

// creating command
global.createCommand = function(name, script) {
    // load command
    require('vm').runInThisContext(script);
    // write to file
    fs.writeFileSync(`commands/${name}.js`, script, 'UTF-8');
    // add to commands list json
    let atr = JSON.parse(fs.readFileSync('auto_require.json', 'UTF-8'));
    atr.push({
        name: name,
        file: `./commands/${name}.js`
    });
    fs.writeFileSync('auto_require.json', JSON.stringify(atr), 'UTF-8')
}

// removing command
global.removeCommand = function(name) {
    // load commands json
    let atr = JSON.parse(fs.readFileSync('auto_require.json', 'UTF-8'));
    // find and delete all comands with equal name
    for(let i = 0; i < atr.length; i++) {
        if(atr[i].name === name){
            atr.splice(i, 1);
            i = atr.length + 1;
            commands.delete(name)
        }
    }
    // save commands to json
    fs.writeFileSync('auto_require.json', JSON.stringify(atr), 'UTF-8')
}

// creating command from chat
global.createNewCommandFromChat = function(name, content) {
    // create command with deleted all ``` from command content
    createCommand(name, `${content}`.replace(/```/g, ''));
}

// command to create command from chat
commands.set('create_command', function(msg, content) {
    // getting name and content, executing create action and sending message about this to bot controlling admin
    let name = content.split(' ')[0],
        script_part = content.substr(name.length + 1, content.length);
    createNewCommandFromChat(name, script_part);
    msg.reply(`Command ${name} created`);
    logOwner(msg, `${msg.author.username}#${msg.author.discriminator} created command "${name}"`);
})

// command to delete command from chat
commands.set('remove_command', function(msg, content) {
    // getting name, doing delete action and sending message about this to bot controlling admin
    let name = content.split(' ')[0];
    removeCommand(name);
    msg.reply(`Command ${name} removed`);
    logOwner(msg, `${msg.author.username}#${msg.author.discriminator} removed command "${name}"`);
})

// sending embed message, usefull if you don't want to write this all time manually
global.embed = function(v, title, description = '', color = '#42b3f5', author_name, author_image) {
    let e = {
        embed: {
            title:title,
            description:description,
            color:color,
            author: {
                name:author_name,
                image:author_image
            }
    }};
    return v.channel ? v.channel.send(e) : v.send(e)
}

// the only person who can execute code on bot
global.hasControl = function( uid ) {
    return uid === fullControlAdmin
}

// execute javascript code, only one guy defined in global.fullControlAdmin can do that
global.executeCommand = function(msg, js){
    try{
        global.gmsg = msg;
        require('vm').runInThisContext( js );
    }catch(err){
        msg.channel.send({
            embed: {
                title: 'Catch him!',
                color: '#ff3600',
                description: err + '\n\n**Have fun :wink:**',
                author: {
                    name:'Wild error appeared!'
                }
            }
        })
    }
}

// execute safe user command created by bot controlling admin and defined in global.commands
global.executeUserCommand = function(msg, command){
    let cmd = command.split(' ')[0];
    // check if command exist
    if (!commands.has(cmd)) return msg.reply('Command not found');
    // try to execute command
    try {
        global.gmsg = msg;
        commands.get(cmd)(msg, command.substr(cmd.length + 1, command.length));
    } catch( err ) {
        msg.channel.send({
            embed: {
                title: 'Catch him!',
                color: '#ff3600',
                description: err + '\n\n**Have fun :wink:**',
                author: {
                    name: 'Wild error appeared!'
                }
            }
        })
    }
}

// message listener
global.messageCallback = function( msg ) {
    // this 2 allows code execution
    if (msg.content.substr(0,2) === 'q ')
        hasControl(msg.author) ? executeCommand(msg, msg.content.substr(2, msg.content.length)) : msg.reply('Access denied');
    else if (msg.content.substr(0,3) === '!q ')
        hasControl(msg.author) ? executeCommand(msg, msg.content.substr(3, msg.content.length)) : msg.reply('Access denied');
    // this allows only predefined commands execution
    else if (msg.content.substr(0,2) === 'c ' || msg.content.substr(0,3) === '!c ') {
        msg.guild.members.fetch(msg.author.id).then(author => {
            // default for people with KICK_MEMBERS permission (moderators, etc)
            if (author.permissions.has('KICK_MEMBERS')) {
                executeUserCommand(msg, msg.content.substr((msg.content.substr(0, 2) === 'c ') ? 2 : 3, msg.content.length));
            } else msg.reply('Access denied');
        })
    }

}

// message listener function, best part is that you can modify messageCallback when bot is running
global.onMessage = function(msg) { messageCallback(msg) }

// load all modules, commands on bot login
global.onLogin = async function(){
    // load all modules
    for(let mod of JSON.parse(fs.readFileSync('auto_require.json', 'UTF-8'))) {
        // few modes of loading modules/commands from auto_require
        // as string-only name or as object with defined module name and file name
        if( typeof(mod) == 'string') {
            // single-string method
            let tt = grequire(null, mod);
            if(tt !== 'OK') console.log(`Can't load module: ${mod}\n\tReason:  ${tt}`);
        }else{
            // object method
            let varname = mod.title || mod.as || mod.name,
                modname = mod.module || mod.filename || mod.file;
            let tt = grequire(varname, modname);
            if(tt !== 'OK') console.log(`Can't load module: ${modname} as ${varname}\n\tReason:  ${tt}`);
        }
    }
    console.log('Ready at ' + new Date())
}

// start http server to prevent bot from dying
http.createServer(function(req, res) {
    res.writeHead(200).end('Working');
}).listen(3000);

// turning on everything

client.on('message', onMessage);
client.on('ready', onLogin);
// remember to place bot login token in bot-login.txt file in main app directory
client.login(fs.readFileSync('bot-login.txt', 'UTF-8'));
