import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SpeciesIndexPage from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/species/species-card", () => ({
  SpeciesCard: ({ species }: { species: { name: string; slug: string } }) => (
    <div data-testid={`species-card-${species.slug}`}>{species.name}</div>
  ),
}));

// Import real data to drive assertions from a single source of truth
import { species, getSpeciesByCategory } from "@/data/species";

describe("SpeciesIndexPage", () => {
  describe("page heading and description", () => {
    it("renders the page heading", () => {
      render(<SpeciesIndexPage />);

      expect(screen.getByRole("heading", { name: "Pollen Species Guide", level: 1 })).toBeInTheDocument();
    });

    it("renders the species count in the description", () => {
      render(<SpeciesIndexPage />);

      expect(
        screen.getByText(`${species.length} species profiles covering trees, grasses, and weeds`)
      ).toBeInTheDocument();
    });
  });

  describe("Trees section", () => {
    it("renders the Trees section heading with correct count", () => {
      render(<SpeciesIndexPage />);

      const trees = getSpeciesByCategory("tree");
      expect(screen.getByText(`Trees (${trees.length})`)).toBeInTheDocument();
    });

    it("renders a SpeciesCard for each tree species", () => {
      render(<SpeciesIndexPage />);

      const trees = getSpeciesByCategory("tree");
      trees.forEach((s) => {
        expect(screen.getByTestId(`species-card-${s.slug}`)).toBeInTheDocument();
      });
    });

    it("renders Oak species card", () => {
      render(<SpeciesIndexPage />);

      expect(screen.getByTestId("species-card-oak")).toBeInTheDocument();
    });

    it("renders Birch species card", () => {
      render(<SpeciesIndexPage />);

      expect(screen.getByTestId("species-card-birch")).toBeInTheDocument();
    });
  });

  describe("Grasses section", () => {
    it("renders the Grasses section heading with correct count", () => {
      render(<SpeciesIndexPage />);

      const grasses = getSpeciesByCategory("grass");
      expect(screen.getByText(`Grasses (${grasses.length})`)).toBeInTheDocument();
    });

    it("renders a SpeciesCard for each grass species", () => {
      render(<SpeciesIndexPage />);

      const grasses = getSpeciesByCategory("grass");
      grasses.forEach((s) => {
        expect(screen.getByTestId(`species-card-${s.slug}`)).toBeInTheDocument();
      });
    });

    it("renders Timothy Grass species card", () => {
      render(<SpeciesIndexPage />);

      expect(screen.getByTestId("species-card-timothy-grass")).toBeInTheDocument();
    });
  });

  describe("Weeds section", () => {
    it("renders the Weeds section heading with correct count", () => {
      render(<SpeciesIndexPage />);

      const weeds = getSpeciesByCategory("weed");
      expect(screen.getByText(`Weeds (${weeds.length})`)).toBeInTheDocument();
    });

    it("renders a SpeciesCard for each weed species", () => {
      render(<SpeciesIndexPage />);

      const weeds = getSpeciesByCategory("weed");
      weeds.forEach((s) => {
        expect(screen.getByTestId(`species-card-${s.slug}`)).toBeInTheDocument();
      });
    });

    it("renders Ragweed species card", () => {
      render(<SpeciesIndexPage />);

      expect(screen.getByTestId("species-card-ragweed")).toBeInTheDocument();
    });
  });

  describe("all species are rendered", () => {
    it("renders the correct total number of SpeciesCard components", () => {
      render(<SpeciesIndexPage />);

      // Every species in the data file must have exactly one card
      species.forEach((s) => {
        expect(screen.getByTestId(`species-card-${s.slug}`)).toBeInTheDocument();
      });
    });
  });
});
