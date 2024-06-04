import {
    GuildMember
} from "discord.js";

import { KiwiClient } from "../../../client";

import { Events, Event } from "../../../types/event";

import { dataSource } from "../../../data/datasource";
import { Group } from "../../../data/entities/Group";
import { GroupMember } from "../../../data/entities/GroupMember";

import { GroupsPlugin } from "..";

/**
 * @type {Event}
 */
export const GuildMemberUpdate: Event = {
    name: Events.GuildMemberUpdate,

    /**
    * @param {Client} client
    * @param {GuildMember} oldMember
    * @param {GuildMember} newMember
    */
    async execute(client: KiwiClient, oldMember: GuildMember, newMember: GuildMember) {
        const GroupsRepository = await dataSource.getRepository(Group);
        const GroupMembersRepository = await dataSource.getRepository(GroupMember);

        if (await client.getGuildPlugin(newMember.guild.id, GroupsPlugin.config.name)) {
            
            newMember.roles.cache.forEach(async (role) => {
                var group = await GroupsRepository.findOne({ where: { roleId: role.id } });
                if (group) {
                    var groupMember = await GroupMembersRepository.findOne({ where: { groupId: group.groupId, userId: newMember.id } });
                    if (!groupMember) {
                        newMember.roles.remove(role.id, "User is not in the group");
                    }
                }
            });

            for (var groupMember of await GroupMembersRepository.find({ where: { userId: newMember.id } })) {
                var group = await GroupsRepository.findOne({ where: { guildId: newMember.guild.id, groupId: groupMember.groupId } });
                if (group) {
                    var role = newMember.guild.roles.cache.get(group.roleId);
                    if (role && !newMember.roles.cache.has(role.id)) {
                        newMember.roles.add(role.id, "User is a member of the group");
                    }
                }
            }
        }
    }
}