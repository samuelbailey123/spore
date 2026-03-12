import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { DailyForecast } from "@/types/pollen";

let mockAllergens: string[] = [];
const mockForecast: DailyForecast[] = [
  {
    date: "2026-03-12",
    indices: [],
    species: [
      {
        name: "Oak",
        slug: "oak",
        category: "tree",
        indexValue: 4,
        risk: "very_high",
        inSeason: true,
      },
    ],
  },
  {
    date: "2026-03-13",
    indices: [],
    species: [
      {
        name: "Oak",
        slug: "oak",
        category: "tree",
        indexValue: 1,
        risk: "low",
        inSeason: true,
      },
    ],
  },
];

let mockLocationLoading = false;
let mockForecastError: Error | null = null;
let mockForecastLoading = false;
let mockForecastData: DailyForecast[] | null = mockForecast;

vi.mock("@/context/allergen-context", () => ({
  useAllergens: () => ({
    allergens: mockAllergens,
    toggleAllergen: vi.fn(),
    setAllergens: vi.fn(),
    clearAllergens: vi.fn(),
  }),
}));

vi.mock("@/context/location-context", () => ({
  useLocation: () => ({
    lat: 29.76,
    lng: -95.37,
    name: "Houston, TX",
    loading: mockLocationLoading,
    error: null,
    setLocation: vi.fn(),
    requestGeolocation: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-forecast", () => ({
  useForecast: () => ({
    forecast: mockForecastData,
    error: mockForecastError,
    isLoading: mockForecastLoading,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("lucide-react", () => ({
  AlertCircle: () => <span data-testid="alert-icon" />,
  Lightbulb: () => <span data-testid="lightbulb-icon" />,
}));

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/forecast/personalized-day-card", () => ({
  PersonalizedDayCard: ({ day, isWorst, index }: { day: { date: string }; isWorst: boolean; index: number }) => (
    <div data-testid={`personalized-day-${index}`}>
      {day.date} {isWorst ? "WORST" : ""}
    </div>
  ),
}));

import MyForecastPage from "./page";

describe("MyForecastPage", () => {
  beforeEach(() => {
    mockAllergens = [];
    mockLocationLoading = false;
    mockForecastError = null;
    mockForecastLoading = false;
    mockForecastData = mockForecast;
  });

  it("shows loading skeleton while location loads", () => {
    mockLocationLoading = true;
    render(<MyForecastPage />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("shows loading skeleton while forecast loads", () => {
    mockAllergens = ["oak"];
    mockForecastLoading = true;
    render(<MyForecastPage />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("shows empty state when no allergens selected", () => {
    render(<MyForecastPage />);
    expect(
      screen.getByText("You haven't selected any allergens yet.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select your allergens")
    ).toBeInTheDocument();
  });

  it("links to my-allergens from empty state", () => {
    render(<MyForecastPage />);
    const link = screen.getByText("Select your allergens");
    expect(link.closest("a")).toHaveAttribute("href", "/my-allergens");
  });

  it("shows error state", () => {
    mockAllergens = ["oak"];
    mockForecastError = new Error("API failed");
    render(<MyForecastPage />);
    expect(screen.getByText("API failed")).toBeInTheDocument();
  });

  it("shows no-data state when forecast is empty", () => {
    mockAllergens = ["oak"];
    mockForecastData = [];
    render(<MyForecastPage />);
    expect(
      screen.getByText("No forecast data available for your location.")
    ).toBeInTheDocument();
  });

  it("renders personalized day cards", () => {
    mockAllergens = ["oak"];
    render(<MyForecastPage />);
    expect(screen.getByTestId("personalized-day-0")).toBeInTheDocument();
    expect(screen.getByTestId("personalized-day-1")).toBeInTheDocument();
  });

  it("highlights the worst day", () => {
    mockAllergens = ["oak"];
    render(<MyForecastPage />);
    expect(screen.getByTestId("personalized-day-0")).toHaveTextContent("WORST");
  });

  it("shows allergen tips section", () => {
    mockAllergens = ["oak"];
    render(<MyForecastPage />);
    expect(
      screen.getByText("Tips for your allergens")
    ).toBeInTheDocument();
  });

  it("shows location name in subtitle", () => {
    mockAllergens = ["oak"];
    render(<MyForecastPage />);
    expect(screen.getByText(/Houston, TX/)).toBeInTheDocument();
  });

  it("pluralises allergen count when multiple selected", () => {
    mockAllergens = ["oak", "birch"];
    render(<MyForecastPage />);
    expect(screen.getByText(/2 allergens/)).toBeInTheDocument();
  });

  it("shows singular allergen when only one selected", () => {
    mockAllergens = ["oak"];
    render(<MyForecastPage />);
    expect(screen.getByText(/1 allergen\b/)).toBeInTheDocument();
  });
});
