import { chmod, copyFile, lstat, mkdir, readlink, symlink, unlink } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const rootDirectory = resolve(import.meta.dir, "../..");
const examplePath = resolve(rootDirectory, ".env.example");
const developmentEnvPath = resolve(rootDirectory, ".env.dev");
const appDirectories = ["apps/api", "apps/client"];

async function pathExists(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

if (await pathExists(developmentEnvPath)) {
  console.log(".env.dev already exists; leaving it unchanged.");
} else {
  await copyFile(examplePath, developmentEnvPath);
  await chmod(developmentEnvPath, 0o600);
  console.log("Created .env.dev from .env.example.");
}

for (const appDirectory of appDirectories) {
  const linkPath = resolve(rootDirectory, appDirectory, ".env");
  const linkTarget = relative(dirname(linkPath), developmentEnvPath);
  const existing = await pathExists(linkPath);

  if (existing?.isSymbolicLink()) {
    if ((await readlink(linkPath)) === linkTarget) {
      console.log(`${appDirectory}/.env already points to .env.dev.`);
      continue;
    }

    await unlink(linkPath);
  } else if (existing) {
    throw new Error(
      `${appDirectory}/.env exists and is not a symlink. Move or remove it before running env:setup.`,
    );
  }

  await mkdir(dirname(linkPath), { recursive: true });
  await symlink(linkTarget, linkPath);
  console.log(`Linked ${appDirectory}/.env to .env.dev.`);
}
