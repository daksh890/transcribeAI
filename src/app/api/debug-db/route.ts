import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";
import { User } from "@/lib/db/entities/User";

// Simple route to check if the database connection is working

// export async function GET() {
//   try {
//     const ds = await getDataSource();
//     return NextResponse.json({ status: "connected", entities: ds.entityMetadatas.length });
//   } catch (e) {
//     return NextResponse.json({ error: (e as Error).message });
//   }
// }

export async function GET() {
  try {
    const ds = await getDataSource();

    // Check if entity exists.
    const entityExists = ds.hasMetadata(User);

    // Check if physical table exists in the DB
    const result = await ds.query(
      `SELECT to_regclass('public."user"') AS table_exists;`
    );

    const tableExists = !!result[0]?.table_exists;

    return NextResponse.json({
      status: "connected",
      entityExists,
      tableExists,
    });
  } catch (err: unknown) {
        let message = "Something went wrong.";

        if (err instanceof Error) {
            message = err.message;
        }
        
        return NextResponse.json(
            { error: "Something went wrong.", details: message },
            { status: 500 }
        );
    }
}
