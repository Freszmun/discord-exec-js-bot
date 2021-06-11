
// command created via bot on my main server
// unmute adds role giving access to write on all channels and deletes mute role
// you can modify it for your server

commands.set('unmute', function(msg) {
    const target = msg.mentions.users.first();
    if (target) {
        const member = msg.guild.member(target);
        if (member) {
            member.roles.add('710522902335979591').then(() => {
                member.roles.remove('789396283995586561').then(() => {
                    msg.channel.send('unmuted <@' + member + '>');
                })
            })
        } else msg.reply('member not found')
    } else msg.reply('you must mention member')
})
