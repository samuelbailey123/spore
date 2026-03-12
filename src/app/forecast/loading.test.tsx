import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ForecastLoading from "./loading";

describe("ForecastLoading", () => {
  it("renders the dashboard skeleton", () => {
    const { container } = render(<ForecastLoading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
