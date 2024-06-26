import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("pending_messages")
export class PendingMessageEntity {
    @PrimaryGeneratedColumn()
    _id: number;

    @Column({ name: "guild_id", type: 'bigint' })
    guildId: string;

    @Column({ name: "user_id", type: 'bigint' })
    userId: string;

    @Column({ name: "message_id", type: 'bigint' })
    messageId: string;
}