import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthTipsCard } from "./health-tips-card";

describe("HealthTipsCard", () => {
  it("renders the heading", () => {
    render(<HealthTipsCard overallRisk="none" />);
    expect(screen.getByText("Health Tips")).toBeInTheDocument();
  });

  it("renders tips from HEALTH_TIPS when no apiRecommendations provided", () => {
    render(<HealthTipsCard overallRisk="none" />);
    expect(
      screen.getByText("Enjoy outdoor activities freely.")
    ).toBeInTheDocument();
  });

  it("renders low risk tips", () => {
    render(<HealthTipsCard overallRisk="low" />);
    expect(
      screen.getByText(
        "Most people can enjoy outdoor activities without issue."
      )
    ).toBeInTheDocument();
  });

  it("renders moderate risk tips", () => {
    render(<HealthTipsCard overallRisk="moderate" />);
    expect(
      screen.getByText(
        "Take antihistamines before symptoms start — they work best preventatively."
      )
    ).toBeInTheDocument();
  });

  it("renders high risk tips", () => {
    render(<HealthTipsCard overallRisk="high" />);
    expect(
      screen.getByText(
        "Limit outdoor activities, especially in the morning when pollen counts peak."
      )
    ).toBeInTheDocument();
  });

  it("renders very_high risk tips", () => {
    render(<HealthTipsCard overallRisk="very_high" />);
    expect(
      screen.getByText(
        "Stay indoors as much as possible, especially between 5am-10am."
      )
    ).toBeInTheDocument();
  });

  it("renders apiRecommendations when provided", () => {
    const recs = ["Take medication daily.", "Avoid parks this week."];
    render(
      <HealthTipsCard overallRisk="high" apiRecommendations={recs} />
    );
    expect(screen.getByText("Take medication daily.")).toBeInTheDocument();
    expect(screen.getByText("Avoid parks this week.")).toBeInTheDocument();
  });

  it("ignores HEALTH_TIPS when apiRecommendations is a non-empty array", () => {
    const recs = ["Custom recommendation."];
    render(
      <HealthTipsCard overallRisk="high" apiRecommendations={recs} />
    );
    expect(
      screen.queryByText(
        "Limit outdoor activities, especially in the morning when pollen counts peak."
      )
    ).not.toBeInTheDocument();
    expect(screen.getByText("Custom recommendation.")).toBeInTheDocument();
  });

  it("falls back to HEALTH_TIPS when apiRecommendations is an empty array", () => {
    render(<HealthTipsCard overallRisk="none" apiRecommendations={[]} />);
    expect(
      screen.getByText("Enjoy outdoor activities freely.")
    ).toBeInTheDocument();
  });

  it("renders multiple tips as list items", () => {
    render(<HealthTipsCard overallRisk="high" />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThan(1);
  });
});
