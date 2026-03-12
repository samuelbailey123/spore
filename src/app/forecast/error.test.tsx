import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ForecastError from "./error";

describe("ForecastError", () => {
  it("renders error message", () => {
    const error = new Error("Forecast failed");
    render(<ForecastError error={error} reset={vi.fn()} />);
    expect(screen.getByText("Forecast failed")).toBeInTheDocument();
    expect(screen.getByText("Unable to load forecast")).toBeInTheDocument();
  });

  it("renders fallback message when error.message is empty", () => {
    const error = new Error("");
    render(<ForecastError error={error} reset={vi.fn()} />);
    expect(
      screen.getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    render(<ForecastError error={new Error("fail")} reset={reset} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(reset).toHaveBeenCalledOnce();
  });
});
