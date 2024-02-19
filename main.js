global.print = console.log
require('dotenv').config()

var fs = require("fs")
var fetch = require('node-fetch')

//// DISCORD INIT ////
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { Client, IntentsBitField, Partials, Collection, Events } = require('discord.js')
const client = new Client({ intents: Object.values(IntentsBitField.Flags), partials: Object.values(Partials) })

//// SLASH COMMANDS ////
client.commands = new Collection()
const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    if (!file.startsWith("!")) {
        const command = require(`./commands/${file}`)
        var commandJSON = JSON.stringify(command.data)
        commands.push(command.data)

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

const rest = new REST({ version: '10' }).setToken(process.env["TOKEN"])

var returned_commands = {}
async function registerSlashCommands() {
    try {
        print(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env["CLIENT_ID"], process.env["GUILD_ID"]),
            { body: commands },
        );

        data.forEach(entry => {
        	returned_commands[entry.name] = entry
        })

        print(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
}

ALL_CHANNELS = ID => {
    return ID.substr(0, ID.length-6) + (Number(ID.substr(-6)) - 1)
}

client.on("ready", async () => {
	print(`‼ Logged in as '${client.user.username}'`)

	await registerSlashCommands()

	["card", "uncard"].forEach(cmdName => {
		client.application.commands.permissions.set({
		 guild: process.env["GUILD_ID"],
		 command: returned_commands[cmdName].id,
		 token: process.env["GUILD_TOKEN"],
		 permissions: [
		   {
		     id: ALL_CHANNELS(process.env["GUILD_ID"]),
		     type: 3,
		     permission: false,
		   },
		   {
		     id: process.env["CHANNEL_ID"],
		     type: 3,
		     permission: true,
		   },
		]})
		  .then(console.log)
		  .catch(console.error);
	})
})

client.login(process.env["TOKEN"])

//////////////////
global.path = require('path')
global.express = require('express')
global.app = express()
global.httpserver = require('http').createServer(app);

app.use('/', express.static(path.join(__dirname, 'website')))

app.get("/", async (req, res) => {
	res.sendFile('/index.html', {root: path.resolve(__dirname, "website")})

	//  var search_params = new URLSearchParams({
	// 	"client_id": process.env["CLIENT_ID"],
	// 	"client_secret": process.env["CLIENT_SECRET"],
	// 	"grant_type": "client_credentials",
	// 	"scope": "applications.commands applications.commands.permissions.update",
	// })

	// var response = await fetch(`https://discord.com/api/v10/oauth2/token`, {
	// 	method: "POST",
	// 	body: search_params.toString(),
	// 	headers: {
	// 		"Content-Type": "application/x-www-form-urlencoded"
	// 	}
	// })

	// var data = await response.json()
	// res.send(data)
})

httpserver.listen((process.env["PORT"] || 3000), "0.0.0.0", (e) => {
	print("Server Listening!")
})