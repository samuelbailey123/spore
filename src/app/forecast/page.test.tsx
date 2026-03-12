import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ForecastPage from "./page";

vi.mock("@/context/location-context", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-forecast", () => ({
  useForecast: vi.fn(),
}));

vi.mock("@/components/forecast/forecast-chart", () => ({
  ForecastChart: ({ forecast }: { forecast: unknown[] }) => (
    <div data-testid="forecast-chart">ForecastChart ({forecast.length} days)</div>
  ),
}));

vi.mock("@/components/forecast/day-detail", () => ({
  DayDetail: ({ day }: { day: { date: string } }) => (
    <div data-testid="day-detail">DayDetail for {day.date}</div>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading skeleton</div>,
}));

vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => null,
}));

import { useLocation } from "@/context/location-context";
import { useForecast } from "@/hooks/use-forecast";

const mockUseLocation = vi.mocked(useLocation);
const mockUseForecast = vi.mocked(useForecast);

const baseLocation = {
  lat: 29.76,
  lng: -95.37,
  name: "Houston",
  loading: false,
  error: null,
  setLocation: vi.fn(),
  requestGeolocation: vi.fn(),
};

const makeForecastDay = (date: string, dayOffset = 0) => ({
  date,
  indices: [
    { category: "tree" as const, displayName: "Tree", value: 3 + dayOffset, risk: "high" as const, inSeason: true, color: "#22c55e" },
    { category: "grass" as const, displayName: "Grass", value: 1, risk: "low" as const, inSeason: true, color: "#3b82f6" },
    { category: "weed" as const, displayName: "Weed", value: 0, risk: "none" as const, inSeason: false, color: "#a855f7" },
  ],
  species: [],
});

const baseForecast = [
  makeForecastDay("2026-03-11"),
  makeForecastDay("2026-03-12", 1),
  makeForecastDay("2026-03-13", 2),
];

describe("ForecastPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("renders skeleton when location is loading", () => {
      mockUseLocation.mockReturnValue({ ...baseLocation, loading: true });
      mockUseForecast.mockReturnValue({ forecast: null, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText("Pollen Forecast")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });

    it("renders skeleton when forecast is loading", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: null, error: null, isLoading: true });

      render(<ForecastPage />);

      expect(screen.getByText("Pollen Forecast")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("renders error message when forecast fetch fails", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({
        forecast: null,
        error: new Error("Unable to reach pollen service"),
        isLoading: false,
      });

      render(<ForecastPage />);

      expect(screen.getByText("Pollen Forecast")).toBeInTheDocument();
      expect(screen.getByText("Unable to reach pollen service")).toBeInTheDocument();
      expect(screen.queryByTestId("forecast-chart")).not.toBeInTheDocument();
    });
  });

  describe("empty / no data state", () => {
    it("renders no-data message when forecast is null", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: null, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText("No forecast data available for your location.")).toBeInTheDocument();
      expect(screen.queryByTestId("forecast-chart")).not.toBeInTheDocument();
    });

    it("renders no-data message when forecast is an empty array", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: [], error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText("No forecast data available for your location.")).toBeInTheDocument();
    });
  });

  describe("normal rendering with data", () => {
    it("renders forecast chart and day detail with forecast data", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText("Pollen Forecast")).toBeInTheDocument();
      expect(screen.getByTestId("forecast-chart")).toBeInTheDocument();
      expect(screen.getByTestId("day-detail")).toBeInTheDocument();
    });

    it("shows the day count in the sub-heading", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText(`${baseForecast.length}-day pollen outlook for your area`)).toBeInTheDocument();
    });

    it("labels first day button as Today", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    });

    it("labels second day button as Tomorrow", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByRole("button", { name: "Tomorrow" })).toBeInTheDocument();
    });

    it("labels subsequent days with formatted date", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByRole("button", { name: "Fri, Mar 13" })).toBeInTheDocument();
    });

    it("defaults to showing day 0 (Today) in DayDetail", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      expect(screen.getByText(`DayDetail for ${baseForecast[0].date}`)).toBeInTheDocument();
    });
  });

  describe("user interaction — day selection", () => {
    it("switches to the selected day when a day button is clicked", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      fireEvent.click(screen.getByRole("button", { name: "Tomorrow" }));

      expect(screen.getByText(`DayDetail for ${baseForecast[1].date}`)).toBeInTheDocument();
    });

    it("switches to day 2 when a later date button is clicked", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      fireEvent.click(screen.getByRole("button", { name: "Fri, Mar 13" }));

      expect(screen.getByText(`DayDetail for ${baseForecast[2].date}`)).toBeInTheDocument();
    });

    it("switches back to Today after selecting another day", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseForecast.mockReturnValue({ forecast: baseForecast, error: null, isLoading: false });

      render(<ForecastPage />);

      fireEvent.click(screen.getByRole("button", { name: "Tomorrow" }));
      fireEvent.click(screen.getByRole("button", { name: "Today" }));

      expect(screen.getByText(`DayDetail for ${baseForecast[0].date}`)).toBeInTheDocument();
    });
  });
});
