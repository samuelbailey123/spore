import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpeciesBreakdown } from "./species-breakdown";
import type { SpeciesCount } from "@/types/pollen";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockSpecies: SpeciesCount[] = [
  {
    name: "Oak",
    slug: "oak",
    category: "tree",
    indexValue: 4,
    risk: "very_high",
    inSeason: true,
  },
  {
    name: "Bermuda Grass",
    slug: "bermuda-grass",
    category: "grass",
    indexValue: 2,
    risk: "moderate",
    inSeason: true,
  },
  {
    name: "Ragweed",
    slug: "ragweed",
    category: "weed",
    indexValue: 1,
    risk: "low",
    inSeason: true,
  },
];

describe("SpeciesBreakdown", () => {
  it("renders the heading", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(screen.getByText("Species Breakdown")).toBeInTheDocument();
  });

  it("renders empty state message when species is empty", () => {
    render(<SpeciesBreakdown species={[]} />);
    expect(
      screen.getByText(/Detailed species data is not available/)
    ).toBeInTheDocument();
  });

  it("still renders heading in empty state", () => {
    render(<SpeciesBreakdown species={[]} />);
    expect(screen.getByText("Species Breakdown")).toBeInTheDocument();
  });

  it("renders species names", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(screen.getByText("Oak")).toBeInTheDocument();
    expect(screen.getByText("Bermuda Grass")).toBeInTheDocument();
    expect(screen.getByText("Ragweed")).toBeInTheDocument();
  });

  it("renders category labels", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(screen.getByText("tree")).toBeInTheDocument();
    expect(screen.getByText("grass")).toBeInTheDocument();
    expect(screen.getByText("weed")).toBeInTheDocument();
  });

  it("renders index values", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(screen.getByText("4/5")).toBeInTheDocument();
    expect(screen.getByText("2/5")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("renders links to species detail pages", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    const oakLink = screen.getByRole("link", { name: /Oak/ });
    expect(oakLink).toHaveAttribute("href", "/species/oak");
  });

  it("sorts species by indexValue descending", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs[0]).toBe("/species/oak");
    expect(hrefs[1]).toBe("/species/bermuda-grass");
    expect(hrefs[2]).toBe("/species/ragweed");
  });

  it("renders description subtitle when species are present", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(
      screen.getByText("Individual species currently in season, ranked by severity")
    ).toBeInTheDocument();
  });

  it("renders risk indicators for each species", () => {
    render(<SpeciesBreakdown species={mockSpecies} />);
    expect(screen.getByText("Very High")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("renders correct dot color for tree category", () => {
    const { container } = render(<SpeciesBreakdown species={[mockSpecies[0]]} />);
    const dot = container.querySelector("[style*='background-color']");
    expect(dot).toBeTruthy();
    const bg = (dot as HTMLElement).style.backgroundColor;
    expect(bg === "#22c55e" || bg === "rgb(34, 197, 94)").toBe(true);
  });

  it("renders correct dot color for grass category", () => {
    const { container } = render(<SpeciesBreakdown species={[mockSpecies[1]]} />);
    const dot = container.querySelector("[style*='background-color']");
    expect(dot).toBeTruthy();
    const bg = (dot as HTMLElement).style.backgroundColor;
    expect(bg === "#3b82f6" || bg === "rgb(59, 130, 246)").toBe(true);
  });

  it("renders correct dot color for weed category", () => {
    const { container } = render(<SpeciesBreakdown species={[mockSpecies[2]]} />);
    const dot = container.querySelector("[style*='background-color']");
    expect(dot).toBeTruthy();
    const bg = (dot as HTMLElement).style.backgroundColor;
    expect(bg === "#a855f7" || bg === "rgb(168, 85, 247)").toBe(true);
  });
});
