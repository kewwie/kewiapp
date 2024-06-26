import { Guild } from "discord.js";

import { KiwiClient } from "../../../client";
import { Event, Events } from "../../../types/event";

import { dataSource } from "../../../datasource";
import { GuildGroupEntity } from "../../../entities/GuildGroup";
import { GroupMemberEntity } from "../../../entities/GroupMember";

/**
 * @type {Event}
 */
export const GuildReady: Event = {
    name: Events.GuildReady,

    /**
     * @param {Guild} guild
     */
    async getGuildId(guild: Guild) {
        return guild.id;
    },

    /**
     * @param {KiwiClient} client
     * @param {Guild} guild
     */
    async execute(client: KiwiClient, guild: Guild) {
        const GuildGroupRepository = await dataSource.getRepository(GuildGroupEntity);
        const GroupMemberRepository = await dataSource.getRepository(GroupMemberEntity);

        var groups = await GuildGroupRepository.find({ where: { guildId: guild.id }});

        for (let group of groups) {
            var members = await GroupMemberRepository.find({ where: { groupId: group.groupId }});

            for (let member of members) {
                var guildMember = await guild.members.fetch(member.userId).catch(() => {});

                if (guildMember) {
                    var role = guildMember.roles.cache.find(role => role.id === group.roleId);
                    if (!role) {
                        await guildMember.roles.add(group.roleId).catch(() => {});
                    }
                }
            }
        }

        for (let member of await guild.members.fetch()) {
            member[1].roles.cache.forEach(async (role) => {
                var group = await GuildGroupRepository.findOne({ where: { roleId: role.id } });
                if (group) {
                    var groupMember = await GroupMemberRepository.findOne({ where: { groupId: group.groupId, userId: member[0] } });
                    if (!groupMember) {
                        member[1].roles.remove(role.id, "User is not in the group");
                    }
                }
            });

            for (let memberGroup of await GroupMemberRepository.find({ where: { userId: member[0] } })) {
                var group = await GuildGroupRepository.findOne({ where: { guildId: guild.id, groupId: memberGroup.groupId } });
                if (group) {
                    var role = member[1].roles.cache.find(role => role.id === group.roleId);
                    if (!role) {
                        await member[1].roles.add(group.roleId).catch(() => {});
                    }
                }
            }
        }
    }
}