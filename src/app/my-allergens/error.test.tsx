import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import MyAllergensError from "./error";

describe("MyAllergensError", () => {
  it("renders the heading", () => {
    render(<MyAllergensError error={new Error("Something broke")} />);
    expect(screen.getByText("My Allergens")).toBeInTheDocument();
  });

  it("displays the error message", () => {
    render(<MyAllergensError error={new Error("Test error message")} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders the alert icon", () => {
    render(<MyAllergensError error={new Error("err")} />);
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });
});
