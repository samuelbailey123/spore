import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SpeciesLoading from "./loading";

describe("SpeciesLoading", () => {
  it("renders the dashboard skeleton", () => {
    const { container } = render(<SpeciesLoading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
