import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrendsError from "./error";

describe("TrendsError", () => {
  it("renders error message", () => {
    const error = new Error("Trends load failed");
    render(<TrendsError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Trends load failed")).toBeInTheDocument();
    expect(screen.getByText("Unable to load trends")).toBeInTheDocument();
  });

  it("renders fallback message when error.message is empty", () => {
    const error = new Error("");
    render(<TrendsError error={error} reset={vi.fn()} />);
    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    render(<TrendsError error={new Error("fail")} reset={reset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
