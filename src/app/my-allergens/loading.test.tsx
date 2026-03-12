import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="skeleton" />,
}));

import MyAllergensLoading from "./loading";

describe("MyAllergensLoading", () => {
  it("renders the heading", () => {
    render(<MyAllergensLoading />);
    expect(screen.getByText("My Allergens")).toBeInTheDocument();
  });

  it("renders the skeleton", () => {
    render(<MyAllergensLoading />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });
});
