import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup the DOM after each test (required without globals: true)
afterEach(() => {
  cleanup();
});
