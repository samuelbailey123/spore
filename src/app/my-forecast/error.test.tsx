import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import MyForecastError from "./error";

describe("MyForecastError", () => {
  it("renders the heading", () => {
    render(<MyForecastError error={new Error("Something broke")} />);
    expect(screen.getByText("My Forecast")).toBeInTheDocument();
  });

  it("displays the error message", () => {
    render(<MyForecastError error={new Error("Test error message")} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders the alert icon", () => {
    render(<MyForecastError error={new Error("err")} />);
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });
});
