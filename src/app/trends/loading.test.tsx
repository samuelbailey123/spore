import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TrendsLoading from "./loading";

describe("TrendsLoading", () => {
  it("renders the dashboard skeleton", () => {
    const { container } = render(<TrendsLoading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
