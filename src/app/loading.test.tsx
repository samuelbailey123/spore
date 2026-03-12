import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import RootLoading from "./loading";

describe("RootLoading", () => {
  it("renders the dashboard skeleton", () => {
    const { container } = render(<RootLoading />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
