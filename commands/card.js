const { SlashCommandBuilder } = require('discord.js')

const COMMAND_INFO = {
	name: "card",
	description: "Cast a vote to give someone smart card"
}

const command = new SlashCommandBuilder()
command.setName(COMMAND_INFO.name)
command.setDescription(COMMAND_INFO.description)

//// Additional SlashCommand Arguments ////

const choice = (val) => {return {name: val, value: val}}

command.addUserOption(option => option.setName("member")
	.setDescription("User to apply smart card to")
	.setRequired(true)
)

///////////////////////////////////////////

const POS_EMOJI = "🟢"
const NEG_EMOJI = "🔴"
var VALUES = {}
VALUES[POS_EMOJI] = 1
VALUES[NEG_EMOJI] = -1

async function execute(interaction) {
	var {client, guild} = interaction
	let opt_member = interaction.options.get("member")
	var {member, user} = opt_member

	var msg = await interaction.reply({content: `# Do we add <@${member.id}>? | 0 Votes`, fetchReply: true })
	await msg.react(POS_EMOJI) // isGreen
	await msg.react(NEG_EMOJI) // isRed
	await msg.fetch()

	const filter = (reaction, user) => (reaction.emoji.name == POS_EMOJI || reaction.emoji.name == NEG_EMOJI)
	var collector = msg.createReactionCollector({ dispose: true, filter, time: (60_000 * 60) })

	var total = 1
	function update(val, r) {
		total += val

		print("New Total: ", total)
		r.message.edit(r.message.content.split(" | ")[0] + " | " + `${total} Votes`)

		if (total >= 3) {
			collector.stop()
		}
	}

	collector.on('collect', r => {
		update(VALUES[r.emoji.name], r)
	})
	collector.on('remove', r => {
		update((VALUES[r.emoji.name])*-1, r)
	})
	collector.on('end', async r => {
		print("Result: ", total)
		if (total >= 3) {
			await member.roles.add(process.env["SMART_CARD_ID"])
			await msg.reply(`Welcome, <@${member.id}>! 🎉`)
			print(`Gave smart card to ${user.username}!`)
		}
	})
}

module.exports = {
	data: command.toJSON(),
	execute: execute
}