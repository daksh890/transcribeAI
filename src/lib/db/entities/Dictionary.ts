import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn
} from "typeorm";

@Entity({ name: "dictionaries" })
export class Dictionary {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { array: true, default: [] })
  words!: string[];

  @OneToOne("users", "dictionary", { onDelete: "CASCADE" })
  @JoinColumn()
  user!: any;

  @CreateDateColumn()
  createdAt!: Date;
}
