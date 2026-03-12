import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollenIndexCard } from "./pollen-index-card";
import type { PollenIndex } from "@/types/pollen";

const treeIndex: PollenIndex = {
  category: "tree",
  displayName: "Tree",
  value: 3,
  risk: "high",
  inSeason: true,
  color: "#22c55e",
};

const grassIndex: PollenIndex = {
  category: "grass",
  displayName: "Grass",
  value: 1,
  risk: "low",
  inSeason: true,
  color: "#3b82f6",
};

const weedIndex: PollenIndex = {
  category: "weed",
  displayName: "Weed",
  value: 0,
  risk: "none",
  inSeason: false,
  color: "#a855f7",
};

describe("PollenIndexCard", () => {
  it("renders the display name", () => {
    render(<PollenIndexCard index={treeIndex} />);
    expect(screen.getByText("Tree Pollen")).toBeInTheDocument();
  });

  it("renders the index value", () => {
    render(<PollenIndexCard index={treeIndex} />);
    expect(screen.getByText("Index: 3/5")).toBeInTheDocument();
  });

  it("shows out-of-season label when not in season", () => {
    render(<PollenIndexCard index={weedIndex} />);
    expect(screen.getByText(/Out of Season/)).toBeInTheDocument();
  });

  it("does not show out-of-season label when in season", () => {
    render(<PollenIndexCard index={treeIndex} />);
    expect(screen.queryByText(/Out of Season/)).not.toBeInTheDocument();
  });

  it("renders RiskIndicator with correct risk", () => {
    render(<PollenIndexCard index={treeIndex} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("does not render expanded content when expanded is false", () => {
    render(<PollenIndexCard index={treeIndex} expanded={false} />);
    expect(
      screen.queryByText(/~70% of allergy sufferers/)
    ).not.toBeInTheDocument();
  });

  it("does not render expanded content by default", () => {
    render(<PollenIndexCard index={treeIndex} />);
    expect(
      screen.queryByText(/~70% of allergy sufferers/)
    ).not.toBeInTheDocument();
  });

  it("renders expanded content when expanded is true", () => {
    render(<PollenIndexCard index={treeIndex} expanded />);
    expect(
      screen.getByText(/~70% of allergy sufferers/)
    ).toBeInTheDocument();
  });

  it("renders risk explanation text when expanded", () => {
    render(<PollenIndexCard index={treeIndex} expanded />);
    expect(
      screen.getByText(/Most allergy sufferers will experience significant symptoms/)
    ).toBeInTheDocument();
  });

  it("renders grass category card", () => {
    render(<PollenIndexCard index={grassIndex} />);
    expect(screen.getByText("Grass Pollen")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("renders weed category card", () => {
    render(<PollenIndexCard index={weedIndex} />);
    expect(screen.getByText("Weed Pollen")).toBeInTheDocument();
  });

  it("applies correct left-border color class for tree", () => {
    const { container } = render(<PollenIndexCard index={treeIndex} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-emerald-500");
  });

  it("applies correct left-border color class for grass", () => {
    const { container } = render(<PollenIndexCard index={grassIndex} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-blue-500");
  });

  it("applies correct left-border color class for weed", () => {
    const { container } = render(<PollenIndexCard index={weedIndex} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-purple-500");
  });

  it("renders affected percentage for none risk when expanded", () => {
    const noneTree: PollenIndex = { ...treeIndex, risk: "none", value: 0 };
    render(<PollenIndexCard index={noneTree} expanded />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders progress bar fill based on index value when expanded", () => {
    render(<PollenIndexCard index={treeIndex} expanded />);
    const fills = document.querySelectorAll('[style*="width"]');
    expect(fills.length).toBeGreaterThan(0);
  });
});
