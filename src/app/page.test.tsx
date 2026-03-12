import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

vi.mock("@/context/location-context", () => ({
  useLocation: vi.fn(),
}));

vi.mock("@/hooks/use-pollen", () => ({
  usePollen: vi.fn(),
}));

vi.mock("@/components/dashboard/pollen-overview", () => ({
  PollenOverview: ({ indices }: { indices: unknown[] }) => (
    <div data-testid="pollen-overview">PollenOverview ({indices.length} indices)</div>
  ),
}));

vi.mock("@/components/dashboard/species-breakdown", () => ({
  SpeciesBreakdown: () => <div data-testid="species-breakdown">SpeciesBreakdown</div>,
}));

vi.mock("@/components/dashboard/health-tips-card", () => ({
  HealthTipsCard: ({ overallRisk }: { overallRisk: string }) => (
    <div data-testid="health-tips-card">HealthTipsCard risk={overallRisk}</div>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  DashboardSkeleton: () => <div data-testid="dashboard-skeleton">Loading skeleton</div>,
}));

import { useLocation } from "@/context/location-context";
import { usePollen } from "@/hooks/use-pollen";

const mockUseLocation = vi.mocked(useLocation);
const mockUsePollen = vi.mocked(usePollen);

const baseLocation = {
  lat: 29.76,
  lng: -95.37,
  name: "Houston",
  loading: false,
  error: null,
  setLocation: vi.fn(),
  requestGeolocation: vi.fn(),
};

const basePollenSnapshot = {
  location: { lat: 29.76, lng: -95.37, name: "Houston, TX" },
  timestamp: "2026-03-11T14:30:00Z",
  indices: [
    { category: "tree" as const, displayName: "Tree", value: 3, risk: "high" as const, inSeason: true, color: "#22c55e" },
    { category: "grass" as const, displayName: "Grass", value: 1, risk: "low" as const, inSeason: true, color: "#3b82f6" },
    { category: "weed" as const, displayName: "Weed", value: 0, risk: "none" as const, inSeason: false, color: "#a855f7" },
  ],
  species: [
    { name: "Oak", slug: "oak", category: "tree" as const, indexValue: 4, risk: "very_high" as const, inSeason: true },
  ],
  healthRecommendations: ["Wear a mask outdoors."],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("renders skeleton and loading message when location is loading", () => {
      mockUseLocation.mockReturnValue({ ...baseLocation, loading: true });
      mockUsePollen.mockReturnValue({ pollen: null, error: null, isLoading: false, refresh: vi.fn() });

      render(<DashboardPage />);

      expect(screen.getByText("Pollen Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Loading your location...")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });

    it("renders skeleton when pollen data is loading", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({ pollen: null, error: null, isLoading: true, refresh: vi.fn() });

      render(<DashboardPage />);

      expect(screen.getByText("Pollen Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Loading your location...")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("renders error message when pollen fetch fails", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: null,
        error: new Error("Failed to fetch pollen data"),
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText("Pollen Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Unable to load pollen data")).toBeInTheDocument();
      expect(
        screen.getByText(/Failed to fetch pollen data/)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("pollen-overview")).not.toBeInTheDocument();
    });

    it("renders error with try refreshing guidance", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: null,
        error: new Error("Network error"),
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/Try refreshing the page or changing your location/)).toBeInTheDocument();
    });
  });

  describe("empty / no data state", () => {
    it("renders no-data message when pollen is null after load", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({ pollen: null, error: null, isLoading: false, refresh: vi.fn() });

      render(<DashboardPage />);

      expect(
        screen.getByText(
          /No pollen data available. This may be because pollen monitoring is not available/
        )
      ).toBeInTheDocument();
      expect(screen.queryByTestId("pollen-overview")).not.toBeInTheDocument();
      expect(screen.queryByTestId("species-breakdown")).not.toBeInTheDocument();
    });

    it("shows location name from hook when pollen is null", () => {
      mockUseLocation.mockReturnValue({ ...baseLocation, name: "Austin, TX" });
      mockUsePollen.mockReturnValue({ pollen: null, error: null, isLoading: false, refresh: vi.fn() });

      render(<DashboardPage />);

      expect(screen.getByText("Austin, TX")).toBeInTheDocument();
    });
  });

  describe("normal rendering with data", () => {
    it("renders all dashboard child components when data is available", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: basePollenSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText("Pollen Dashboard")).toBeInTheDocument();
      expect(screen.getByTestId("pollen-overview")).toBeInTheDocument();
      expect(screen.getByTestId("species-breakdown")).toBeInTheDocument();
      expect(screen.getByTestId("health-tips-card")).toBeInTheDocument();
    });

    it("shows location name from pollen snapshot", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: basePollenSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText("Houston, TX")).toBeInTheDocument();
    });

    it("shows formatted timestamp when pollen timestamp is present", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: basePollenSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });

    it("does not render timestamp when pollen has no timestamp", () => {
      const snapshotWithoutTimestamp = { ...basePollenSnapshot, timestamp: "" };
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: snapshotWithoutTimestamp,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    });

    it("passes correct overallRisk to HealthTipsCard when highest index is very_high", () => {
      const highRiskSnapshot = {
        ...basePollenSnapshot,
        indices: [
          ...basePollenSnapshot.indices,
          { category: "tree" as const, displayName: "Tree", value: 5, risk: "very_high" as const, inSeason: true, color: "#22c55e" },
        ],
      };
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: highRiskSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/risk=very_high/)).toBeInTheDocument();
    });

    it("passes none as overallRisk when all indices are none", () => {
      const noRiskSnapshot = {
        ...basePollenSnapshot,
        indices: [
          { category: "tree" as const, displayName: "Tree", value: 0, risk: "none" as const, inSeason: false, color: "#22c55e" },
        ],
      };
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: noRiskSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.getByText(/risk=none/)).toBeInTheDocument();
    });

    it("does not render skeleton or error when data loads successfully", () => {
      mockUseLocation.mockReturnValue(baseLocation);
      mockUsePollen.mockReturnValue({
        pollen: basePollenSnapshot,
        error: null,
        isLoading: false,
        refresh: vi.fn(),
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId("dashboard-skeleton")).not.toBeInTheDocument();
      expect(screen.queryByText("Unable to load pollen data")).not.toBeInTheDocument();
    });
  });
});
