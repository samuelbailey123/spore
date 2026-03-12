import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonalizedDayCard } from "./personalized-day-card";
import type { PersonalizedDay } from "@/types/allergen";

const mockDay: PersonalizedDay = {
  date: "2026-03-12",
  relevantSpecies: [
    {
      name: "Oak",
      slug: "oak",
      category: "tree",
      indexValue: 4,
      risk: "very_high",
      inSeason: true,
    },
    {
      name: "Birch",
      slug: "birch",
      category: "tree",
      indexValue: 2,
      risk: "moderate",
      inSeason: true,
    },
  ],
  impactScore: 6,
  worstAllergen: "Oak",
  risk: "high",
};

const emptyDay: PersonalizedDay = {
  date: "2026-03-13",
  relevantSpecies: [],
  impactScore: 0,
  worstAllergen: null,
  risk: "none",
};

describe("PersonalizedDayCard", () => {
  it("renders the date label as Today for index 0", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={0} />
    );
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("renders Tomorrow for index 1", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={1} />
    );
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("renders formatted date for index > 1", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={2} />
    );
    expect(screen.getByText(/Thu, Mar 12/)).toBeInTheDocument();
  });

  it("shows risk level badge", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={0} />
    );
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("shows impact score", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={0} />
    );
    expect(screen.getByText("6.0")).toBeInTheDocument();
  });

  it("lists relevant species with UPI values", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={0} />
    );
    expect(screen.getByText("Oak")).toBeInTheDocument();
    expect(screen.getByText("4.0 UPI")).toBeInTheDocument();
    expect(screen.getByText("Birch")).toBeInTheDocument();
    expect(screen.getByText("2.0 UPI")).toBeInTheDocument();
  });

  it("shows Worst Day badge when isWorst is true", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={true} index={0} />
    );
    expect(screen.getByText("Worst Day")).toBeInTheDocument();
  });

  it("does not show Worst Day badge when isWorst is false", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={0} />
    );
    expect(screen.queryByText("Worst Day")).not.toBeInTheDocument();
  });

  it("shows empty state when no relevant species", () => {
    render(
      <PersonalizedDayCard day={emptyDay} isWorst={false} index={0} />
    );
    expect(
      screen.getByText("No data for your allergens on this day.")
    ).toBeInTheDocument();
  });

  it("has correct test id", () => {
    render(
      <PersonalizedDayCard day={mockDay} isWorst={false} index={2} />
    );
    expect(screen.getByTestId("personalized-day-2")).toBeInTheDocument();
  });
});
