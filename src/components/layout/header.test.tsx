import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./header";
import * as locationContext from "@/context/location-context";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/context/location-context", () => ({
  useLocation: vi.fn(),
}));

const defaultLocationValue = {
  name: "Houston, TX",
  requestGeolocation: vi.fn(),
  loading: false,
  lat: 29.76,
  lng: -95.37,
  error: null,
  setLocation: vi.fn(),
};

beforeEach(() => {
  vi.mocked(locationContext.useLocation).mockReturnValue(defaultLocationValue);
});

describe("Header", () => {
  it("renders the Spore brand name", () => {
    render(<Header />);
    expect(screen.getAllByText("Spore").length).toBeGreaterThan(0);
  });

  it("renders all navigation items", () => {
    render(<Header />);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Forecast").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Learn").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Species").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trends").length).toBeGreaterThan(0);
  });

  it("renders the location name from context", () => {
    render(<Header />);
    expect(screen.getByText("Houston, TX")).toBeInTheDocument();
  });

  it("renders the location button", () => {
    render(<Header />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls requestGeolocation when button is clicked", () => {
    const requestGeolocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      requestGeolocation,
    });
    render(<Header />);
    fireEvent.click(screen.getByRole("button"));
    expect(requestGeolocation).toHaveBeenCalled();
  });

  it("button is not disabled when not loading", () => {
    render(<Header />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("disables button when loading is true", () => {
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      loading: true,
      name: "Loading...",
    });
    render(<Header />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading name when loading", () => {
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      loading: true,
      name: "Loading...",
    });
    render(<Header />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders logo link to home", () => {
    render(<Header />);
    const homeLinks = screen.getAllByRole("link", { name: /Spore/ });
    expect(homeLinks[0]).toHaveAttribute("href", "/");
  });

  it("renders dashboard link pointing to /", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: "Dashboard" });
    expect(links[0]).toHaveAttribute("href", "/");
  });

  it("renders forecast link pointing to /forecast", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: "Forecast" });
    expect(links[0]).toHaveAttribute("href", "/forecast");
  });

  it("renders species link pointing to /species", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: "Species" });
    expect(links[0]).toHaveAttribute("href", "/species");
  });

  it("renders trends link pointing to /trends", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: "Trends" });
    expect(links[0]).toHaveAttribute("href", "/trends");
  });

  it("renders learn link pointing to /learn", () => {
    render(<Header />);
    const links = screen.getAllByRole("link", { name: "Learn" });
    expect(links[0]).toHaveAttribute("href", "/learn");
  });
});
