const {
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	Interaction,
	Client
} = require("discord.js");
const { env } = require("../env");
const { 
	CommandTypes,
	SlashCommandContexts,
	IntegrationTypes,
	OptionTypes,
	Permissions
} = require("../utils/commandTypes");

module.exports = {
	config: {
        name: "list",
        description: "List Commands",
        type: CommandTypes.CHAT_INPUT,
        default_member_permissions: Permissions.ManageChannels,
        contexts: [SlashCommandContexts.GUILD],
        integration_types: [IntegrationTypes.GUILD],
        options: [
            {
                type: OptionTypes.SUB_COMMAND,
                name: "create",
                description: "Create a list",
                options: [
                    {
                        type: OptionTypes.STRING,
                        name: "users",
                        description: "Example: Kewi,Soja,Timjan",
                        required: true
                    }
                ]
            }
        ]
    },

	/**
    * 
    * @param {Interaction} interaction
    * @param {Client} client
    */
	async execute(interaction, client) {
		var usersString = interaction.options.getString('users');
		var users = usersString.split(",");

		var buttons = [];
		var userText = "";

	    for (let user of users) {
			if (!user) break;
			var button = new ButtonBuilder()
				.setCustomId('update-list_' + user)
				.setLabel(user)
				.setStyle(ButtonStyle.Primary);

			buttons.push(button);
			userText += `${user}\n`
		}

		var rows = [];


		for (var i = 0; i < buttons.length; i += 3) {
			rows.push(
				new ActionRowBuilder()
					.addComponents(
						buttons.slice(i, (i + 3))
					)
			);
		}

		await interaction.reply({
			content: "List has been created",
			ephemeral: true
		});

		await interaction.channel.send({
			content: userText,
			components: rows,
		})
	},
}