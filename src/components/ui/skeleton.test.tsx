import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, DashboardSkeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders a div", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });

  it("applies rounded-md class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("rounded-md");
  });

  it("applies background color class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("bg-zinc-200");
  });

  it("merges custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-full");
  });

  it("renders without className prop", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("DashboardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders three card skeleton placeholders", () => {
    const { container } = render(<DashboardSkeleton />);
    const grid = container.querySelector(".grid");
    expect(grid?.children.length).toBe(3);
  });

  it("renders the species breakdown skeleton section", () => {
    const { container } = render(<DashboardSkeleton />);
    const sections = container.querySelectorAll(".rounded-lg");
    expect(sections.length).toBeGreaterThan(3);
  });

  it("renders multiple skeleton items in the list section", () => {
    const { container } = render(<DashboardSkeleton />);
    const allSkeletons = container.querySelectorAll(".animate-pulse");
    expect(allSkeletons.length).toBeGreaterThan(5);
  });
});
