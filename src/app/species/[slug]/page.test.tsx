import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SpeciesPage, { generateStaticParams, generateMetadata } from "./page";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/components/species/bloom-calendar", () => ({
  BloomCalendar: ({ start, end }: { start: number; end: number }) => (
    <div data-testid="bloom-calendar">
      BloomCalendar start={start} end={end}
    </div>
  ),
}));

import { notFound } from "next/navigation";
import { species, getSpeciesBySlug } from "@/data/species";

const mockNotFound = vi.mocked(notFound);

/**
 * Wraps the async SpeciesPage component into a synchronous renderable
 * by pre-resolving params.
 */
async function renderSpeciesPage(slug: string) {
  const Component = await SpeciesPage({ params: Promise.resolve({ slug }) });
  return render(Component as React.ReactElement);
}

describe("SpeciesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateStaticParams", () => {
    it("returns an entry for every species slug", async () => {
      const params = await generateStaticParams();
      const slugs = params.map((p) => p.slug);

      expect(slugs).toHaveLength(species.length);
      species.forEach((s) => {
        expect(slugs).toContain(s.slug);
      });
    });

    it("returns objects with a slug property", async () => {
      const params = await generateStaticParams();
      params.forEach((p) => {
        expect(p).toHaveProperty("slug");
        expect(typeof p.slug).toBe("string");
      });
    });
  });

  describe("generateMetadata", () => {
    it("returns correct metadata for a known slug", async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: "oak" }) });
      expect(meta.title).toContain("Oak");
      expect(meta.description).toBeTruthy();
    });

    it("returns Species Not Found title for unknown slug", async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ slug: "unknown-plant" }) });
      expect(meta.title).toBe("Species Not Found");
    });

    it("truncates description to 160 characters", async () => {
      const oakSpecies = getSpeciesBySlug("oak")!;
      const meta = await generateMetadata({ params: Promise.resolve({ slug: "oak" }) });
      expect((meta.description as string).length).toBeLessThanOrEqual(160);
      expect(meta.description).toBe(oakSpecies.description.slice(0, 160));
    });
  });

  describe("not found state", () => {
    it("calls notFound() for an unrecognised slug", async () => {
      await expect(
        renderSpeciesPage("does-not-exist")
      ).rejects.toThrow("NEXT_NOT_FOUND");

      expect(mockNotFound).toHaveBeenCalledTimes(1);
    });
  });

  describe("Oak species page", () => {
    it("renders the species name heading", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByRole("heading", { name: "Oak", level: 1 })).toBeInTheDocument();
    });

    it("renders the scientific name", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("Quercus")).toBeInTheDocument();
    });

    it("renders the category label", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("tree pollen")).toBeInTheDocument();
    });

    it("renders the allergy severity badge", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("severe allergen")).toBeInTheDocument();
    });

    it("renders the description text", async () => {
      const oak = getSpeciesBySlug("oak")!;
      await renderSpeciesPage("oak");

      expect(screen.getByText(oak.description)).toBeInTheDocument();
    });

    it("renders grain size stat", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("20-30 micrometres")).toBeInTheDocument();
    });

    it("renders allergy severity stat in the stats grid", async () => {
      await renderSpeciesPage("oak");

      // sp.allergySeverity is lowercase "severe"; CSS capitalize does not apply in jsdom
      expect(screen.getByText("severe")).toBeInTheDocument();
    });

    it("renders the Grain Size label", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("Grain Size")).toBeInTheDocument();
    });

    it("renders the Prevalence stat text", async () => {
      const oak = getSpeciesBySlug("oak")!;
      await renderSpeciesPage("oak");

      expect(screen.getByText(oak.prevalence)).toBeInTheDocument();
    });

    it("renders the BloomCalendar component", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByTestId("bloom-calendar")).toBeInTheDocument();
    });

    it("passes correct start/end to BloomCalendar", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("BloomCalendar start=3 end=5")).toBeInTheDocument();
    });

    it("renders Cross-Reactivity section heading", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("Cross-Reactivity")).toBeInTheDocument();
    });

    it("renders cross-reactivity items", async () => {
      const oak = getSpeciesBySlug("oak")!;
      await renderSpeciesPage("oak");

      oak.crossReactivity.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("renders Practical Tips section heading", async () => {
      await renderSpeciesPage("oak");

      expect(screen.getByText("Practical Tips")).toBeInTheDocument();
    });

    it("renders all tips", async () => {
      const oak = getSpeciesBySlug("oak")!;
      await renderSpeciesPage("oak");

      oak.tips.forEach((tip) => {
        expect(screen.getByText(tip)).toBeInTheDocument();
      });
    });

    it("renders the back link to /species", async () => {
      await renderSpeciesPage("oak");

      const backLink = screen.getByRole("link", { name: /All Species/ });
      expect(backLink).toHaveAttribute("href", "/species");
    });
  });

  describe("Ragweed species page (weed category)", () => {
    it("renders the Ragweed heading", async () => {
      await renderSpeciesPage("ragweed");

      expect(screen.getByRole("heading", { name: "Ragweed", level: 1 })).toBeInTheDocument();
    });

    it("renders the weed category label", async () => {
      await renderSpeciesPage("ragweed");

      expect(screen.getByText("weed pollen")).toBeInTheDocument();
    });

    it("renders the scientific name Ambrosia", async () => {
      await renderSpeciesPage("ragweed");

      expect(screen.getByText("Ambrosia")).toBeInTheDocument();
    });
  });

  describe("Grass-General species page (grass category)", () => {
    it("renders the Grass (General) heading", async () => {
      await renderSpeciesPage("grass-general");

      expect(screen.getByRole("heading", { name: "Grass (General)", level: 1 })).toBeInTheDocument();
    });

    it("renders the grass category label", async () => {
      await renderSpeciesPage("grass-general");

      expect(screen.getByText("grass pollen")).toBeInTheDocument();
    });
  });

  describe("mild severity species page (Pine)", () => {
    it("renders mild allergen badge for Pine", async () => {
      await renderSpeciesPage("pine");

      // CSS uppercase does not apply in jsdom; DOM text is lowercase
      expect(screen.getByText("mild allergen")).toBeInTheDocument();
    });

    it("renders mild as the severity stat text in the stats grid", async () => {
      await renderSpeciesPage("pine");

      expect(screen.getByText("mild")).toBeInTheDocument();
    });
  });
});
