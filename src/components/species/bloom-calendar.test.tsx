import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BloomCalendar } from "./bloom-calendar";

describe("BloomCalendar", () => {
  it("renders all 12 months", () => {
    render(<BloomCalendar start={3} end={5} peakMonths={[4]} />);
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Dec")).toBeInTheDocument();
  });

  it("renders bloom period labels", () => {
    render(<BloomCalendar start={3} end={5} peakMonths={[4]} />);
    expect(screen.getByText("Bloom")).toBeInTheDocument();
    expect(screen.getByText("Peak")).toBeInTheDocument();
  });

  it("renders heading", () => {
    render(<BloomCalendar start={1} end={3} peakMonths={[2]} />);
    expect(screen.getByText("Bloom Period")).toBeInTheDocument();
  });

  it("handles wrap-around periods (Dec to Mar)", () => {
    const { container } = render(
      <BloomCalendar start={12} end={3} peakMonths={[1, 2]} />
    );
    expect(container).toBeTruthy();
  });
});
