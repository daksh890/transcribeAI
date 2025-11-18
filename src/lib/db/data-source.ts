// lib/db/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";

import * as Entities from "./entities/index";

const globalForDataSource = global as unknown as {
  dataSource?: DataSource;
};


const shouldUseSSL = process.env.DATABASE_SSL === "true"; 
// console.log("🔵 Using SSL =", shouldUseSSL);


// Create a new DataSource instance
const createDataSource = () =>
  new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // OK for MVP; disable in production
    logging: false,
    ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
    entities: Object.values(Entities),
  });

export const getDataSource = async () => {
  if (!globalForDataSource.dataSource) {
    globalForDataSource.dataSource = createDataSource();
    await globalForDataSource.dataSource.initialize();
    console.log("🟢 DataSource initialized successfully");

  } else if (!globalForDataSource.dataSource.isInitialized) {
    try {
      await globalForDataSource.dataSource.initialize();
      console.log("🟢 DataSource initialized successfully");
    } catch (err) {
      console.error("🔴 DataSource initialization FAILED");
      console.error(err);
      throw err;
    }
  }

  return globalForDataSource.dataSource;
};
