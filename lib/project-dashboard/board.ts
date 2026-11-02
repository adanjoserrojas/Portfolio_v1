import "server-only";
import { unstable_cache } from "next/cache";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./aws";
import { publicBoardSchema } from "./model";
export const readBoard = unstable_cache(
  async () => {
    const result = await db.send(
      new GetCommand({
        TableName: process.env.BOARD_TABLE!,
        Key: { pk: "PUBLIC" },
        ConsistentRead: true,
      }),
    );
    if (!result.Item) return { revision: 0, updatedAt: "", projects: [] };
    return publicBoardSchema.parse(result.Item);
  },
  ["buildlog-public-board-v1"],
  { tags: ["buildlog-board"], revalidate: 300 },
);
