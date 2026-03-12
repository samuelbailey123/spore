import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskIndicator } from "./risk-indicator";

describe("RiskIndicator", () => {
  it("renders the risk label", () => {
    render(<RiskIndicator risk="high" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders none level", () => {
    render(<RiskIndicator risk="none" />);
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("renders very_high level", () => {
    render(<RiskIndicator risk="very_high" />);
    expect(screen.getByText("Very High")).toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { container } = render(<RiskIndicator risk="low" size="sm" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("text-xs");
  });

  it("applies lg size classes", () => {
    const { container } = render(<RiskIndicator risk="moderate" size="lg" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("text-base");
  });

  it("applies custom className", () => {
    const { container } = render(
      <RiskIndicator risk="high" className="custom-class" />
    );
    const span = container.querySelector("span");
    expect(span?.className).toContain("custom-class");
  });
});
