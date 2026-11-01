import type { Link, LinkRepository } from "./link";

const codeAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
const codeLength = 7;
const managerCodeAlphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const managerCodeLength = 16;
const maximumCreateAttempts = 5;

export class InvalidTargetUrlError extends Error {
  constructor() {
    super("Target URL must be an absolute HTTP or HTTPS URL.");
    this.name = "InvalidTargetUrlError";
  }
}

export class LinkCodeCollisionError extends Error {
  constructor() {
    super("Could not generate a unique short code.");
    this.name = "LinkCodeCollisionError";
  }
}

export interface CreateLinkDependencies {
  generateCode?: () => string;
  generateManagerCode?: () => string;
  linkRepository: LinkRepository;
}

function generateRandomCode(alphabet: string, length: number): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(
    randomBytes,
    (value) => alphabet[value % alphabet.length],
  ).join("");
}

function generateCode(): string {
  return generateRandomCode(codeAlphabet, codeLength);
}

function generateManagerCode(): string {
  return generateRandomCode(managerCodeAlphabet, managerCodeLength);
}

export function formatManagerCode(managerCode: string): string {
  return managerCode.match(/.{1,4}/g)?.join("-") ?? managerCode;
}

function normalizeTargetUrl(value: string): string {
  let targetUrl: URL;

  try {
    targetUrl = new URL(value);
  } catch {
    throw new InvalidTargetUrlError();
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    throw new InvalidTargetUrlError();
  }

  return targetUrl.toString();
}

export async function createLink(
  targetUrlInput: string,
  dependencies: CreateLinkDependencies,
): Promise<Link> {
  const targetUrl = normalizeTargetUrl(targetUrlInput);
  const nextCode = dependencies.generateCode ?? generateCode;
  const nextManagerCode =
    dependencies.generateManagerCode ?? generateManagerCode;

  for (let attempt = 0; attempt < maximumCreateAttempts; attempt += 1) {
    const link = await dependencies.linkRepository.create({
      code: nextCode(),
      managerCode: nextManagerCode(),
      targetUrl,
    });

    if (link) {
      return link;
    }
  }

  throw new LinkCodeCollisionError();
}
