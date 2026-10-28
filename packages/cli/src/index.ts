import { createDatabase, KyselyLinkRepository } from "@lapinamk-ls/database";
import { createLink } from "@lapinamk-ls/domain";

export interface CliOptions {
  databaseUrl: string;
}

export async function runCli(
  arguments_: string[],
  options: CliOptions,
): Promise<void> {
  const [command, targetUrl, ...extraArguments] = arguments_;

  if (command !== "link:create" || !targetUrl || extraArguments.length > 0) {
    throw new Error("Usage: bun run cli link:create <target-url>");
  }

  const database = createDatabase(options.databaseUrl);

  try {
    const link = await createLink(targetUrl, {
      linkRepository: new KyselyLinkRepository(database),
    });

    console.log(`Created link ${link.code} -> ${link.targetUrl}`);
  } finally {
    await database.destroy();
  }
}
