import { describe, expect, test } from "bun:test";
import { InvalidTargetUrlError, normalizeTargetUrl } from "../src/index";

describe("normalizeTargetUrl", () => {
  test.each([
    ["https://example.com", "https://example.com/"],
    [
      "http://example.com/path?q=value#section",
      "http://example.com/path?q=value#section",
    ],
    ["  https://EXAMPLE.com/some path  ", "https://example.com/some%20path"],
    ["http://localhost:8080/page", "http://localhost:8080/page"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeTargetUrl(input)).toBe(expected);
  });

  test.each([
    "",
    "   ",
    "example.com",
    "/relative-path",
    "https://",
    "https://exa mple.com",
    "ftp://example.com",
    "mailto:test@example.com",
    "javascript:alert(1)",
    "data:text/plain,hello",
  ])("rejects %j", (input) => {
    expect(() => normalizeTargetUrl(input)).toThrow(InvalidTargetUrlError);
  });
});
