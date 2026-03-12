import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="skeleton" />,
}));

import MyForecastLoading from "./loading";

describe("MyForecastLoading", () => {
  it("renders the heading", () => {
    render(<MyForecastLoading />);
    expect(screen.getByText("My Forecast")).toBeInTheDocument();
  });

  it("renders the skeleton", () => {
    render(<MyForecastLoading />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });
});
