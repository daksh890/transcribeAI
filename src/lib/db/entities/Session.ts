import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column, OneToMany} from "typeorm";

@Entity({ name: "sessions" })
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("users", "sessions", { onDelete: "CASCADE" })
  user!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({type: "timestamp", nullable: true })
  expiresAt!: Date | null;

  @OneToMany("transcriptions", "sessions")
  transcriptions!: any[];
  
}
