import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpeciesCard } from "./species-card";
import type { SpeciesProfile } from "@/types/species";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const treeSpecies: SpeciesProfile = {
  slug: "oak",
  name: "Oak",
  scientificName: "Quercus",
  category: "tree",
  description: "A common tree that produces significant pollen.",
  allergySeverity: "severe",
  bloomPeriod: { start: 3, end: 5 },
  peakMonths: [4],
  crossReactivity: ["Birch"],
  prevalence: "Very common",
  grainSize: "20-35 µm",
  tips: ["Take antihistamines."],
};

const grassSpecies: SpeciesProfile = {
  slug: "bermuda-grass",
  name: "Bermuda Grass",
  scientificName: "Cynodon dactylon",
  category: "grass",
  description: "A warm-season grass.",
  allergySeverity: "moderate",
  bloomPeriod: { start: 4, end: 10 },
  peakMonths: [6, 7],
  crossReactivity: [],
  prevalence: "Common",
  grainSize: "25-30 µm",
  tips: [],
};

const weedSpecies: SpeciesProfile = {
  slug: "ragweed",
  name: "Ragweed",
  scientificName: "Ambrosia artemisiifolia",
  category: "weed",
  description: "A major cause of hay fever.",
  allergySeverity: "mild",
  bloomPeriod: { start: 8, end: 10 },
  peakMonths: [9],
  crossReactivity: [],
  prevalence: "Common",
  grainSize: "15-25 µm",
  tips: [],
};

describe("SpeciesCard", () => {
  it("renders the species name", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(screen.getByText("Oak")).toBeInTheDocument();
  });

  it("renders the scientific name", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(screen.getByText("Quercus")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(
      screen.getByText("A common tree that produces significant pollen.")
    ).toBeInTheDocument();
  });

  it("renders the category label", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(screen.getByText("tree")).toBeInTheDocument();
  });

  it("renders the grain size", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(screen.getByText("20-35 µm")).toBeInTheDocument();
  });

  it("renders severe allergen label", () => {
    render(<SpeciesCard species={treeSpecies} />);
    expect(screen.getByText("Severe Allergen")).toBeInTheDocument();
  });

  it("renders moderate allergen label", () => {
    render(<SpeciesCard species={grassSpecies} />);
    expect(screen.getByText("Moderate Allergen")).toBeInTheDocument();
  });

  it("renders mild allergen label", () => {
    render(<SpeciesCard species={weedSpecies} />);
    expect(screen.getByText("Mild Allergen")).toBeInTheDocument();
  });

  it("links to the correct species detail page", () => {
    render(<SpeciesCard species={treeSpecies} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/species/oak");
  });

  it("applies tree border class", () => {
    const { container } = render(<SpeciesCard species={treeSpecies} />);
    const card = container.querySelector("div");
    expect(card?.className).toContain("border-l-emerald-500");
  });

  it("applies grass border class", () => {
    const { container } = render(<SpeciesCard species={grassSpecies} />);
    const card = container.querySelector("div");
    expect(card?.className).toContain("border-l-blue-500");
  });

  it("applies weed border class", () => {
    const { container } = render(<SpeciesCard species={weedSpecies} />);
    const card = container.querySelector("div");
    expect(card?.className).toContain("border-l-purple-500");
  });

  it("renders grass category label", () => {
    render(<SpeciesCard species={grassSpecies} />);
    expect(screen.getByText("grass")).toBeInTheDocument();
  });

  it("renders weed category label", () => {
    render(<SpeciesCard species={weedSpecies} />);
    expect(screen.getByText("weed")).toBeInTheDocument();
  });
});
