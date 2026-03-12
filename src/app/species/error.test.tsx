import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SpeciesError from "./error";

describe("SpeciesError", () => {
  it("renders error message", () => {
    const error = new Error("Species load failed");
    render(<SpeciesError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Species load failed")).toBeInTheDocument();
    expect(screen.getByText("Unable to load species data")).toBeInTheDocument();
  });

  it("renders fallback message when error.message is empty", () => {
    const error = new Error("");
    render(<SpeciesError error={error} reset={vi.fn()} />);
    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    render(<SpeciesError error={new Error("fail")} reset={reset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
