import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TrendsPage from "./page";

vi.mock("@/context/location-context", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-history", () => ({
  useHistory: vi.fn(),
}));

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading skeleton</div>,
}));

vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: ({ formatter }: { formatter?: (value: unknown, name: unknown) => unknown }) => {
    if (formatter) {
      const result = formatter(120, "Tree");
      return (
        <div data-testid="tooltip-formatter">
          {Array.isArray(result) ? result.join(" | ") : String(result)}
        </div>
      );
    }
    return null;
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => null,
}));

import { useLocation } from "@/context/location-context";
import { useHistory } from "@/hooks/use-history";

const mockUseLocation = vi.mocked(useLocation);
const mockUseHistory = vi.mocked(useHistory);

const baseLocation = {
  lat: 29.76,
  lng: -95.37,
  name: "Houston",
  loading: false,
  error: null,
  setLocation: vi.fn(),
  requestGeolocation: vi.fn(),
};

const makeHistoryPoint = (date: string) => ({
  date,
  treeCount: 120,
  grassCount: 45,
  weedCount: 10,
  treeRisk: "high" as const,
  grassRisk: "moderate" as const,
  weedRisk: "low" as const,
});

const baseHistory = [
  makeHistoryPoint("2026-03-10T08:00:00Z"),
  makeHistoryPoint("2026-03-10T12:00:00Z"),
  makeHistoryPoint("2026-03-11T08:00:00Z"),
];

describe("TrendsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("renders skeleton when location is loading", () => {
      mockUseLocation.mockReturnValue({ ...baseLocation, loading: true });
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByText("Pollen Trends")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });

    it("renders skeleton when history data is loading", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: true });

      render(<TrendsPage />);

      expect(screen.getByText("Pollen Trends")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("renders error message when history fetch fails", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({
        history: null,
        error: new Error("Ambee API key not configured"),
        isLoading: false,
      });

      render(<TrendsPage />);

      expect(screen.getByText("Pollen Trends")).toBeInTheDocument();
      expect(screen.getByText("Ambee API key not configured")).toBeInTheDocument();
      expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    });
  });

  describe("empty / no data state", () => {
    it("renders no-data message when history is null", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(
        screen.getByText(/No historical data available for this location and time range/)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    });

    it("renders no-data message when history is an empty array", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: [], error: null, isLoading: false });

      render(<TrendsPage />);

      expect(
        screen.getByText(/No historical data available for this location and time range/)
      ).toBeInTheDocument();
    });

    it("mentions Ambee API key requirement in no-data message", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(
        screen.getByText(/Historical pollen data requires the Ambee API key to be configured/)
      ).toBeInTheDocument();
    });
  });

  describe("normal rendering with data", () => {
    it("renders the Tooltip formatter output", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByTestId("tooltip-formatter")).toHaveTextContent("120 grains/m³ | Tree");
    });

    it("renders the chart area when history data is available", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });

    it("renders the Grain Count Over Time sub-heading", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByText("Grain Count Over Time")).toBeInTheDocument();
    });

    it("renders the page heading and sub-description", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByText("Pollen Trends")).toBeInTheDocument();
      expect(screen.getByText("Historical grain counts (grains/m³) from Ambee")).toBeInTheDocument();
    });

    it("renders the About Historical Data section", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByText("About Historical Data")).toBeInTheDocument();
    });

    it("renders the grain count explanation text", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(
        screen.getByText(/Historical pollen data is sourced from Ambee/)
      ).toBeInTheDocument();
    });

    it("does not render skeleton or error when data loads successfully", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: baseHistory, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.queryByTestId("dashboard-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByText(/Ambee API key not configured/)).not.toBeInTheDocument();
    });
  });

  describe("range selector buttons", () => {
    it("renders the 24h range button", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByRole("button", { name: "24h" })).toBeInTheDocument();
    });

    it("renders the 48h range button", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      expect(screen.getByRole("button", { name: "48h" })).toBeInTheDocument();
    });

    it("defaults to 48h range selected (RANGES[1])", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      const button48h = screen.getByRole("button", { name: "48h" });
      // The active button has bg-zinc-900 class applied
      expect(button48h.className).toContain("bg-zinc-900");
    });

    it("switches active range to 24h when clicked", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      const button24h = screen.getByRole("button", { name: "24h" });
      fireEvent.click(button24h);

      expect(button24h.className).toContain("bg-zinc-900");
    });

    it("deactivates 48h button after switching to 24h", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      fireEvent.click(screen.getByRole("button", { name: "24h" }));

      const button48h = screen.getByRole("button", { name: "48h" });
      expect(button48h.className).not.toContain("bg-zinc-900");
    });

    it("re-selects 48h after switching back from 24h", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      fireEvent.click(screen.getByRole("button", { name: "24h" }));
      fireEvent.click(screen.getByRole("button", { name: "48h" }));

      const button48h = screen.getByRole("button", { name: "48h" });
      expect(button48h.className).toContain("bg-zinc-900");
    });

    it("calls useHistory with updated date range after switching to 24h", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUseHistory.mockReturnValue({ history: null, error: null, isLoading: false });

      render(<TrendsPage />);

      // Capture the initial call args (48h = days: 2, so from is 2 days ago)
      const initialCalls = mockUseHistory.mock.calls.length;

      fireEvent.click(screen.getByRole("button", { name: "24h" }));

      // After clicking 24h, useHistory should be called again
      expect(mockUseHistory.mock.calls.length).toBeGreaterThan(initialCalls);
    });
  });
});
