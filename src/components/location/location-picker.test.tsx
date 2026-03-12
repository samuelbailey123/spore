import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LocationPicker } from "./location-picker";
import * as locationContext from "@/context/location-context";

vi.mock("@/context/location-context", () => ({
  useLocation: vi.fn(),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// localStorage stub (jsdom in this project doesn't provide one)
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
  },
  get length() {
    return Object.keys(localStorageStore).length;
  },
  key: (index: number) => Object.keys(localStorageStore)[index] ?? null,
};

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
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(locationContext.useLocation).mockReturnValue(defaultLocationValue);
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
});

describe("LocationPicker", () => {
  it("renders the location name", () => {
    render(<LocationPicker />);
    expect(screen.getByText("Houston, TX")).toBeInTheDocument();
  });

  it("renders a trigger button", () => {
    render(<LocationPicker />);
    expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
  });

  it("opens the dropdown when button is clicked", async () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search address/i)).toBeInTheDocument();
  });

  it("shows 'Use my current location' option when open", () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Use my current location")).toBeInTheDocument();
  });

  it("calls requestGeolocation when current location is clicked", () => {
    const requestGeolocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      requestGeolocation,
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByText("Use my current location"));
    expect(requestGeolocation).toHaveBeenCalled();
  });

  it("closes dropdown after selecting current location", () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByText("Use my current location"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables button when loading", () => {
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      loading: true,
      name: "Loading...",
    });
    render(<LocationPicker />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("searches for locations after typing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });
  });

  it("shows no results message when search returns empty", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [], error: null }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "xyznonexistent" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("shows error message on search failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ data: [], error: "Search failed" }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "test query" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("Search failed")).toBeInTheDocument();
    });
  });

  it("shows error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "test query" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("Search failed. Please try again.")).toBeInTheDocument();
    });
  });

  it("calls setLocation when a search result is clicked", async () => {
    const setLocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      setLocation,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New York, NY"));
    expect(setLocation).toHaveBeenCalledWith(40.7128, -74.006, "New York, NY");
  });

  it("closes dropdown when a result is selected", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New York, NY"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("saves and displays recent locations", async () => {
    const setLocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      setLocation,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    const { unmount } = render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New York, NY"));
    unmount();

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("New York, NY")).toBeInTheDocument();
  });

  it("closes dropdown when clicking outside", () => {
    render(
      <div>
        <LocationPicker />
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes dropdown on Escape key", () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears search when clear button is clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(input).toHaveValue("");
    expect(screen.queryByText("Search Results")).not.toBeInTheDocument();
  });

  it("does not search when query is less than 2 characters", () => {
    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "a" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("debounces search calls", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], error: null }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "Ho" } });
    fireEvent.change(input, { target: { value: "Hou" } });
    fireEvent.change(input, { target: { value: "Hous" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("q=Hous");
  });

  it("shows searching state", async () => {
    let resolveSearch: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSearch = resolve;
      })
    );

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "Houston" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText("Searching...")).toBeInTheDocument();

    await act(async () => {
      resolveSearch!({
        ok: true,
        json: async () => ({ data: [], error: null }),
      });
    });
  });

  it("shows full address as subtitle in results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            lat: 40.7128,
            lng: -74.006,
            name: "New York, NY",
            fullAddress: "New York, New York, United States of America",
          },
        ],
        error: null,
      }),
    });

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(
        screen.getByText("New York, New York, United States of America")
      ).toBeInTheDocument();
    });
  });

  it("handles corrupted localStorage gracefully for recents", () => {
    localStorageMock.setItem("spore-recent-locations", "not valid json");

    render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    expect(screen.queryByText("Recent")).not.toBeInTheDocument();
  });

  it("limits recent locations to 5", async () => {
    const locations = Array.from({ length: 6 }, (_, i) => ({
      lat: i,
      lng: i,
      name: `Location ${i}`,
    }));
    localStorageMock.setItem("spore-recent-locations", JSON.stringify(locations.slice(0, 5)));

    const setLocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      setLocation,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 99, lng: 99, name: "New Place", fullAddress: "New Place, Earth" },
        ],
        error: null,
      }),
    });

    const { unmount } = render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New Place" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New Place")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New Place"));
    unmount();

    const stored = JSON.parse(localStorageMock.getItem("spore-recent-locations") ?? "[]");
    expect(stored).toHaveLength(5);
    expect(stored[0].name).toBe("New Place");
  });

  it("deduplicates recent locations", async () => {
    localStorageMock.setItem(
      "spore-recent-locations",
      JSON.stringify([{ lat: 40.7128, lng: -74.006, name: "New York, NY" }])
    );

    const setLocation = vi.fn();
    vi.mocked(locationContext.useLocation).mockReturnValue({
      ...defaultLocationValue,
      setLocation,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { lat: 40.7128, lng: -74.006, name: "New York, NY", fullAddress: "New York, USA" },
        ],
        error: null,
      }),
    });

    const { unmount } = render(<LocationPicker />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));

    const input = screen.getByPlaceholderText(/search address/i);
    fireEvent.change(input, { target: { value: "New York" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("New York, NY"));
    unmount();

    const stored = JSON.parse(localStorageMock.getItem("spore-recent-locations") ?? "[]");
    expect(stored).toHaveLength(1);
  });

  it("toggles dropdown open and closed", () => {
    render(<LocationPicker />);
    const button = screen.getByRole("button", { expanded: false });

    fireEvent.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { expanded: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
