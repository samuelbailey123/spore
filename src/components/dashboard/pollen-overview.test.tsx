import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollenOverview } from "./pollen-overview";
import type { PollenIndex } from "@/types/pollen";

const mockIndices: PollenIndex[] = [
  {
    category: "tree",
    displayName: "Tree",
    value: 2,
    risk: "moderate",
    inSeason: true,
    color: "#22c55e",
  },
  {
    category: "grass",
    displayName: "Grass",
    value: 1,
    risk: "low",
    inSeason: true,
    color: "#3b82f6",
  },
  {
    category: "weed",
    displayName: "Weed",
    value: 4,
    risk: "very_high",
    inSeason: true,
    color: "#a855f7",
  },
];

describe("PollenOverview", () => {
  it("renders empty state when indices is empty", () => {
    render(<PollenOverview indices={[]} />);
    expect(
      screen.getByText("No pollen data available for this location.")
    ).toBeInTheDocument();
  });

  it("renders pollen index cards for each index", () => {
    render(<PollenOverview indices={mockIndices} />);
    expect(screen.getByText("Tree Pollen")).toBeInTheDocument();
    expect(screen.getByText("Grass Pollen")).toBeInTheDocument();
    expect(screen.getByText("Weed Pollen")).toBeInTheDocument();
  });

  it("renders cards in expanded mode", () => {
    render(<PollenOverview indices={mockIndices} />);
    expect(
      screen.getByText(/~40% of allergy sufferers/)
    ).toBeInTheDocument();
  });

  it("renders a single index without crashing", () => {
    render(<PollenOverview indices={[mockIndices[0]]} />);
    expect(screen.getByText("Tree Pollen")).toBeInTheDocument();
  });

  it("does not render empty-state message when indices are present", () => {
    render(<PollenOverview indices={mockIndices} />);
    expect(
      screen.queryByText("No pollen data available for this location.")
    ).not.toBeInTheDocument();
  });
});
