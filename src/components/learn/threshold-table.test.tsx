import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThresholdTable } from "./threshold-table";

describe("ThresholdTable", () => {
  it("renders the table", () => {
    render(<ThresholdTable />);
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Very High")).toBeInTheDocument();
  });

  it("renders all pollen categories", () => {
    render(<ThresholdTable />);
    expect(screen.getByText("tree")).toBeInTheDocument();
    expect(screen.getByText("grass")).toBeInTheDocument();
    expect(screen.getByText("weed")).toBeInTheDocument();
  });

  it("includes NAB attribution", () => {
    render(<ThresholdTable />);
    expect(screen.getByText(/NAB/)).toBeInTheDocument();
  });
});
