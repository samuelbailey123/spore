import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RootError from "./error";

describe("RootError", () => {
  it("renders error message", () => {
    const error = new Error("Something broke");
    render(<RootError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Something broke")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders fallback message when error.message is empty", () => {
    const error = new Error("");
    render(<RootError error={error} reset={vi.fn()} />);
    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    render(<RootError error={new Error("fail")} reset={reset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
