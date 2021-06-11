
// command created via bot on my main server
// mute removes all roles without verified roles and gives mute role (which disabled writing on all channels)
// you can modify it for your server

commands.set('mute', function(msg) {
    const target = msg.mentions.users.first();
    if (target) {
        const member = msg.guild.member(target);
        if (member) {
            let roles = [];
            for(let role of member.roles.cache) if(role[1].id !== '750670986252255303' && role[1].id !== '705890952581218476') roles.push(role[1].id);
            member.roles.remove(roles).then(() => {
                member.roles.add('789396283995586561').then(() => {
                    msg.channel.send('muted <@' + member + '>');
                })
            })
        }else msg.reply('member not found')
    }else msg.reply('mention your victim :smirk:')
})
