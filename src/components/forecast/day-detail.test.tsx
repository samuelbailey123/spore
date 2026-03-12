import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayDetail } from "./day-detail";
import type { DailyForecast } from "@/types/pollen";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockDay: DailyForecast = {
  date: "2024-06-15",
  indices: [
    {
      category: "tree",
      displayName: "Tree",
      value: 3,
      risk: "high",
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
      value: 0,
      risk: "none",
      inSeason: false,
      color: "#a855f7",
    },
  ],
  species: [
    {
      name: "Oak",
      slug: "oak",
      category: "tree",
      indexValue: 3,
      risk: "high",
      inSeason: true,
    },
  ],
};

const mockDayNoSpecies: DailyForecast = {
  date: "2024-06-16",
  indices: [
    {
      category: "tree",
      displayName: "Tree",
      value: 1,
      risk: "low",
      inSeason: true,
      color: "#22c55e",
    },
  ],
  species: [],
};

describe("DayDetail", () => {
  it("renders the formatted date", () => {
    render(<DayDetail day={mockDay} />);
    expect(screen.getByText("Saturday, June 15, 2024")).toBeInTheDocument();
  });

  it("renders pollen index cards for each index", () => {
    render(<DayDetail day={mockDay} />);
    expect(screen.getByText("Tree Pollen")).toBeInTheDocument();
    expect(screen.getByText("Grass Pollen")).toBeInTheDocument();
    expect(screen.getByText("Weed Pollen")).toBeInTheDocument();
  });

  it("renders species breakdown when species are present", () => {
    render(<DayDetail day={mockDay} />);
    expect(screen.getByText("Species Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Oak")).toBeInTheDocument();
  });

  it("does not render species breakdown when species is empty", () => {
    render(<DayDetail day={mockDayNoSpecies} />);
    expect(
      screen.queryByText("Species Breakdown")
    ).not.toBeInTheDocument();
  });

  it("renders index cards in expanded mode", () => {
    render(<DayDetail day={mockDay} />);
    expect(
      screen.getByText(/~70% of allergy sufferers/)
    ).toBeInTheDocument();
  });

  it("renders a different date correctly", () => {
    render(<DayDetail day={mockDayNoSpecies} />);
    expect(screen.getByText("Sunday, June 16, 2024")).toBeInTheDocument();
  });
});
