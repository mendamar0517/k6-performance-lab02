import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
  // Baseline test: 5 virtual users for 30 seconds
  vus: 5,
  duration: "30s",
};

export default function () {
  // Allowed public k6 test target
  const res = http.get("https://test.k6.io");

  // Verify that the server returns a successful response
  check(res, {
    "status 200 байна": (r) => r.status === 200,
  });

  sleep(1);
}
