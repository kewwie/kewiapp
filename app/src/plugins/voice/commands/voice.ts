import {
	ChatInputCommandInteraction
} from "discord.js";

import { KiwiClient } from "../../../client";

import { 
	CommandTypes,
	SlashCommandContexts,
	IntegrationTypes,
	OptionTypes,
    Command
} from "../../../types/command";

import { dataSource } from "../../../data/datasource";
import { VoiceActivity } from "../../../data/entities/VoiceActivity";

export const VoiceCmd: Command = {
	config: {
        name: "voice",
        description: "Voice Commands",
        type: CommandTypes.CHAT_INPUT,
        default_member_permissions: null,
        contexts: [SlashCommandContexts.GUILD],
        integration_types: [IntegrationTypes.GUILD],
        options: [
            {
                type: OptionTypes.SUB_COMMAND,
                name: "activity",
                description: "View a users voice chat activity",
                options: [
                    {
                        type: OptionTypes.USER,
                        name: "user",
                        description: "The user you want to check the activity of",
                        required: false
                    }
                ]
            }
        ]
    },

	/**
    * @param {ChatInputCommandInteraction} interaction
    * @param {KiwiClient} client
    */
	async execute(interaction: ChatInputCommandInteraction, client: KiwiClient): Promise<void> {
        const VoiceActivityRepository = await dataSource.getRepository(VoiceActivity);
        switch (interaction.options.getSubcommand()) {
            case "activity": {
                var user = interaction.options.getUser("user") || interaction.user;
                if (!user) {
                    interaction.reply("User not found");
                    return;
                } 

                var voiceActivity = await VoiceActivityRepository.findOne(
                    { where: { userId: user.id, guildId: interaction.guild.id } }
                );

                if (!voiceActivity || voiceActivity.minutes < 0) {
                    interaction.reply("No voice activity found for this user");
                    return;
                }
                
                
                var uTag= await client.getTag({ name: user.username, discriminator: user.discriminator });
                interaction.reply(`**${uTag}** has been in voice chat for **${Math.floor(voiceActivity.minutes)}** minutes`);
                break;
            }
        }
    }
}