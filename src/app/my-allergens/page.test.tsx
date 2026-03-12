import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

const mockAllergens: string[] = [];
const mockToggle = vi.fn();
const mockClear = vi.fn();

vi.mock("@/context/allergen-context", () => ({
  useAllergens: () => ({
    allergens: mockAllergens,
    toggleAllergen: mockToggle,
    setAllergens: vi.fn(),
    clearAllergens: mockClear,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  X: () => <span data-testid="x-icon" />,
}));

import MyAllergensPage from "./page";

describe("MyAllergensPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllergens.length = 0;
  });

  it("renders the page title", () => {
    render(<MyAllergensPage />);
    expect(screen.getByText("My Allergens")).toBeInTheDocument();
  });

  it("renders all three category sections", () => {
    render(<MyAllergensPage />);
    expect(screen.getByText(/Trees/)).toBeInTheDocument();
    expect(screen.getByText(/Grasses/)).toBeInTheDocument();
    expect(screen.getByText(/Weeds/)).toBeInTheDocument();
  });

  it("renders toggle cards for species", () => {
    render(<MyAllergensPage />);
    expect(screen.getByText("Oak")).toBeInTheDocument();
    expect(screen.getByText("Ragweed")).toBeInTheDocument();
    expect(screen.getByText("Timothy Grass")).toBeInTheDocument();
  });

  it("does not show success banner when no allergens selected", () => {
    render(<MyAllergensPage />);
    expect(screen.queryByText(/allergen.*selected/i)).not.toBeInTheDocument();
  });

  it("shows success banner when allergens are selected", () => {
    mockAllergens.push("oak", "birch");
    render(<MyAllergensPage />);
    expect(screen.getByText(/2 allergens selected/)).toBeInTheDocument();
  });

  it("shows singular text for one allergen", () => {
    mockAllergens.push("oak");
    render(<MyAllergensPage />);
    expect(screen.getByText(/1 allergen selected/)).toBeInTheDocument();
  });

  it("shows clear button when allergens are selected", () => {
    mockAllergens.push("oak");
    render(<MyAllergensPage />);
    expect(screen.getByText("Clear all")).toBeInTheDocument();
  });

  it("does not show clear button when no allergens selected", () => {
    render(<MyAllergensPage />);
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });

  it("links to personalized forecast from success banner", () => {
    mockAllergens.push("oak");
    render(<MyAllergensPage />);
    const link = screen.getByText("View your personalized forecast");
    expect(link.closest("a")).toHaveAttribute("href", "/my-forecast");
  });
});
