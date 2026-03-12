import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer", () => {
  it("renders the data source attribution", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Pollen data from Google Pollen API and Ambee/)
    ).toBeInTheDocument();
  });

  it("renders the NAB standards attribution", () => {
    render(<Footer />);
    expect(
      screen.getByText(/NAB \(National Allergy Bureau\) standards/)
    ).toBeInTheDocument();
  });

  it("renders the medical disclaimer", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Not medical advice/)
    ).toBeInTheDocument();
  });

  it("renders the allergist consultation message", () => {
    render(<Footer />);
    expect(
      screen.getByText(/Consult your allergist for personalised guidance/)
    ).toBeInTheDocument();
  });

  it("renders a footer element", () => {
    render(<Footer />);
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });
});
