# Installation:
`npm i fs http discord.js`
<br><br>
Create file `bot-login.txt` in main app directory.<br>
Put discord `bot token` in this file.
<br><br>
Replace `fullControlAdmin` value in app.js to your discord user id.
This will allow only you to execute javascript code on bot.
# Using bot:
### Executing javascript code (as bot controller admin):
!q javascript<br>
&nbsp;&nbsp;&nbsp;&nbsp;multi-line code<br>
`!q single-line code`<br>
**You can use !q or q, both is working**
### Executing moderator/admin commands:
`!c <command_name> <arguments...>`<br>
`c <command_name> <arguments...>`<br>
**You can use !c or c here too**
### Creating/removing own commands (as bot controller admin):
!c create_command <command-name> &#96;&#96;&#96;commands.set('command-name', function(msg, content) {<br>
// your command code...<br>
})&#96;&#96;&#96;<br>
`!c remove_command <command-name>`<br><br>
### Do not use !c remove_command create_command, this can kill your server.
Joke, if you do that you will need to restart bot if you want to add more commands.<br>
If you want to block adding/removing commands for YOURSELF you can simply
comment create/remove_command in this file.<br>
Commands can be modified from files in commands directory.
<br><br>
**Remember, you can modify everything in any time. But you need to know what you're doing when you want to modify "native" functions.**
Otherwise you will need to shutdown bot by `q process.exit()` or ssh, command line, etc and start bot again.
