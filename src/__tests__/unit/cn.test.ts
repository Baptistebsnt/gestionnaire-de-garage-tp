import { describe, it, expect } from "vitest";
import { cn } from "../../lib/cn";

describe("cn", () => {
  it("joins multiple strings with a space", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("filters out false values", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  it("filters out null values", () => {
    expect(cn("foo", null, "bar")).toBe("foo bar");
  });

  it("filters out undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns the single class as-is", () => {
    expect(cn("only-one")).toBe("only-one");
  });

  it("handles all falsy values", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});
