import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from "typeorm";

@Entity({ name: "transcriptions" })
export class Transcription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  text!: string;

  @ManyToOne("sessions", "transcriptions", { onDelete: "CASCADE" })
  session!: any;

  @CreateDateColumn()
  createdAt!: Date;
}
