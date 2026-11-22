import { clearCache } from "./operations/cache-clear";
import { createLinkCommand } from "./operations/link-create";
import { hardDeleteLink } from "./operations/link-delete";
import { softDeleteLink } from "./operations/link-soft-delete";
import type { CliOptions } from "./types";

export type { CliOptions } from "./types";

const codePattern = /^[a-z0-9]{7}$/;
const usage = [
  "Usage:",
  "  bun run cli link:create <target-url>",
  "  bun run cli link:delete <code>",
  "  bun run cli link:soft-delete <code>",
  "  bun run cli cache:clear <code>",
].join("\n");

export async function runCli(
  arguments_: string[],
  options: CliOptions,
): Promise<void> {
  const [command, argument, ...extraArguments] = arguments_;
  if (!argument || extraArguments.length > 0) throw new Error(usage);

  switch (command) {
    case "link:create":
      await createLinkCommand(argument, options);
      return;
    case "link:delete":
      if (!codePattern.test(argument)) throw new Error(usage);
      await hardDeleteLink(argument, options);
      return;
    case "link:soft-delete":
      if (!codePattern.test(argument)) throw new Error(usage);
      await softDeleteLink(argument, options);
      return;
    case "cache:clear":
      if (!codePattern.test(argument)) throw new Error(usage);
      await clearCache(argument, options);
      return;
    default:
      throw new Error(usage);
  }
}
