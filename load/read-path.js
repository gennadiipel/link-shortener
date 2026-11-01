import { check, fail } from "k6";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";

const baseUrl = (__ENV.BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const targetUrl = __ENV.TARGET_URL ?? "https://example.com";
const rate = Number(__ENV.READ_PATH_RATE ?? "100");
const duration = __ENV.READ_PATH_DURATION ?? "30s";
const preAllocatedVUs = Number(__ENV.READ_PATH_PRE_ALLOCATED_VUS ?? "20");
const maxVUs = Number(__ENV.READ_PATH_MAX_VUS ?? "200");
const p50LimitMs = Number(__ENV.READ_PATH_P50_MS ?? "20");
const p95LimitMs = Number(__ENV.READ_PATH_P95_MS ?? "50");

const redirectSuccess = new Rate("short_link_redirect_success");
const redirectDuration = new Trend("short_link_redirect_duration", true);

export const options = {
  scenarios: {
    cache_hit: {
      duration,
      executor: "constant-arrival-rate",
      maxVUs,
      preAllocatedVUs,
      rate,
      timeUnit: "1s",
    },
  },
  thresholds: {
    short_link_redirect_duration: [
      `p(50)<${p50LimitMs}`,
      `p(95)<${p95LimitMs}`,
    ],
    short_link_redirect_success: ["rate>0.99"],
  },
};

export function setup() {
  const createResponse = http.post(
    `${baseUrl}/api/links`,
    JSON.stringify({ targetUrl }),
    {
      headers: { "Content-Type": "application/json" },
      redirects: 0,
      tags: { name: "create_link_setup" },
    },
  );

  if (
    !check(createResponse, {
      "setup creates a short link": (response) => response.status === 201,
    })
  ) {
    fail(`Unable to create a load-test link: HTTP ${createResponse.status}`);
  }

  const { shortUrl } = createResponse.json();
  const warmResponse = http.get(shortUrl, {
    redirects: 0,
    tags: { name: "warm_short_link_cache" },
  });

  if (
    !check(warmResponse, {
      "setup warms the short-link cache": (response) => response.status === 302,
    })
  ) {
    fail(`Unable to warm the short-link cache: HTTP ${warmResponse.status}`);
  }

  return { shortUrl };
}

export default function ({ shortUrl }) {
  const response = http.get(shortUrl, {
    redirects: 0,
    tags: { name: "short_link_redirect" },
  });
  const success = check(response, {
    "short link returns 302": (result) => result.status === 302,
    "short link sets no-store": (result) =>
      result.headers["Cache-Control"] === "no-store",
  });

  redirectSuccess.add(success);
  redirectDuration.add(response.timings.duration);
}
