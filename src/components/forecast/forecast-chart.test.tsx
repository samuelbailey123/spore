import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ForecastChart } from "./forecast-chart";
import type { DailyForecast } from "@/types/pollen";

vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ content }: { content: (props: unknown) => React.ReactNode }) => {
    const rendered = content({
      active: true,
      label: "Sat, Jun 15",
      payload: [
        { name: "Tree", value: 3, color: "#22c55e" },
        { name: "Grass", value: 1, color: "#3b82f6" },
        { name: "Weed", value: 0, color: "#a855f7" },
      ],
    });
    const inactiveRendered = content({ active: false, payload: [], label: "" });
    return (
      <div data-testid="tooltip">
        {rendered}
        <div data-testid="tooltip-inactive">{inactiveRendered ?? "null"}</div>
      </div>
    );
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Legend: () => <div data-testid="legend" />,
}));

const mockForecast: DailyForecast[] = [
  {
    date: "2024-06-15",
    indices: [
      {
        category: "tree",
        displayName: "Tree",
        value: 3,
        risk: "high",
        inSeason: true,
        color: "#22c55e",
      },
      {
        category: "grass",
        displayName: "Grass",
        value: 1,
        risk: "low",
        inSeason: true,
        color: "#3b82f6",
      },
      {
        category: "weed",
        displayName: "Weed",
        value: 0,
        risk: "none",
        inSeason: false,
        color: "#a855f7",
      },
    ],
    species: [],
  },
  {
    date: "2024-06-16",
    indices: [
      {
        category: "tree",
        displayName: "Tree",
        value: 4,
        risk: "very_high",
        inSeason: true,
        color: "#22c55e",
      },
      {
        category: "grass",
        displayName: "Grass",
        value: 2,
        risk: "moderate",
        inSeason: true,
        color: "#3b82f6",
      },
      {
        category: "weed",
        displayName: "Weed",
        value: 1,
        risk: "low",
        inSeason: true,
        color: "#a855f7",
      },
    ],
    species: [],
  },
];

const forecastMissingCategories: DailyForecast[] = [
  {
    date: "2024-06-15",
    indices: [],
    species: [],
  },
];

describe("ForecastChart", () => {
  it("renders the heading", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByText("5-Day Pollen Forecast")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(
      screen.getByText("Universal Pollen Index (0-5) by category")
    ).toBeInTheDocument();
  });

  it("renders the recharts container", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("renders the area chart", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("renders tooltip content with category entries", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByText("Tree:")).toBeInTheDocument();
    expect(screen.getByText("Grass:")).toBeInTheDocument();
    expect(screen.getByText("Weed:")).toBeInTheDocument();
  });

  it("renders tooltip value with /5 suffix", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("renders risk label in tooltip", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByText("(High)")).toBeInTheDocument();
  });

  it("renders null for inactive tooltip", () => {
    render(<ForecastChart forecast={mockForecast} />);
    expect(screen.getByTestId("tooltip-inactive")).toHaveTextContent("null");
  });

  it("renders with empty forecast array", () => {
    render(<ForecastChart forecast={[]} />);
    expect(screen.getByText("5-Day Pollen Forecast")).toBeInTheDocument();
  });

  it("renders with forecast entries missing some categories (defaults to 0)", () => {
    render(<ForecastChart forecast={forecastMissingCategories} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });
});
