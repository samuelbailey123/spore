import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { LocationProvider, useLocation } from "./location-context";

// ── localStorage stub ──────────────────────────────────────────────────────

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
};

// ── geolocation stub ───────────────────────────────────────────────────────

const mockGetCurrentPosition = vi.fn();

// ── test consumer ──────────────────────────────────────────────────────────

function TestConsumer() {
  const loc = useLocation();
  return (
    <div>
      <span data-testid="lat">{loc.lat ?? "null"}</span>
      <span data-testid="lng">{loc.lng ?? "null"}</span>
      <span data-testid="name">{loc.name}</span>
      <span data-testid="loading">{String(loc.loading)}</span>
      <span data-testid="error">{loc.error ?? "null"}</span>
      <button
        data-testid="request-geo"
        onClick={() => loc.requestGeolocation()}
      />
      <button
        data-testid="set-location"
        onClick={() => loc.setLocation(51.5, -0.1, "London")}
      />
    </div>
  );
}

// ── setup / teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.clearAllMocks();

  Object.defineProperty(global.navigator, "geolocation", {
    value: { getCurrentPosition: mockGetCurrentPosition },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── tests ──────────────────────────────────────────────────────────────────

describe("LocationProvider — initial load via geolocation success", () => {
  it("sets location from geolocation when no stored value exists", async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 40.71, longitude: -74.01 } } as GeolocationPosition);
    });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("lat").textContent).toBe("40.71");
    expect(screen.getByTestId("lng").textContent).toBe("-74.01");
    expect(screen.getByTestId("name").textContent).toBe("Current Location");
  });

  it("persists geolocation result to localStorage", async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 40.71, longitude: -74.01 } } as GeolocationPosition);
    });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    const stored = JSON.parse(localStorageStore["spore-location"]);
    expect(stored.lat).toBe(40.71);
    expect(stored.lng).toBe(-74.01);
  });
});

describe("LocationProvider — initial load via geolocation error", () => {
  it("falls back to default location when geolocation fails", async () => {
    mockGetCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ message: "Denied" } as GeolocationPositionError);
      }
    );

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("name").textContent).toBe(
      "Houston, TX (default)"
    );
  });
});

describe("LocationProvider — initial load from localStorage", () => {
  it("loads stored location without calling geolocation", async () => {
    localStorageStore["spore-location"] = JSON.stringify({
      lat: 34.05,
      lng: -118.24,
      name: "Los Angeles",
    });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("lat").textContent).toBe("34.05");
    expect(screen.getByTestId("name").textContent).toBe("Los Angeles");
    expect(mockGetCurrentPosition).not.toHaveBeenCalled();
  });

  it("falls back to geolocation when stored JSON is corrupt", async () => {
    localStorageStore["spore-location"] = "not-valid-json{{";

    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 29.76, longitude: -95.37 } } as GeolocationPosition);
    });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("name").textContent).toBe("Current Location");
  });

  it("uses 'Your Location' as name fallback when stored name is missing", async () => {
    localStorageStore["spore-location"] = JSON.stringify({
      lat: 34.05,
      lng: -118.24,
    });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("name").textContent).toBe("Your Location");
  });
});

describe("LocationProvider — geolocation not available", () => {
  it("falls back to default when geolocation API is absent", async () => {
    // Delete the property so that `"geolocation" in navigator` returns false
    const navProto = Object.getPrototypeOf(global.navigator);
    const descriptor = Object.getOwnPropertyDescriptor(navProto, "geolocation") ??
      Object.getOwnPropertyDescriptor(global.navigator, "geolocation");

    // Override with a non-existent value by redefining on the instance
    const navigatorWithoutGeo = Object.create(
      Object.getPrototypeOf(global.navigator),
      Object.getOwnPropertyDescriptors(global.navigator)
    );
    delete (navigatorWithoutGeo as any).geolocation;
    vi.stubGlobal("navigator", navigatorWithoutGeo);

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    expect(screen.getByTestId("name").textContent).toBe(
      "Houston, TX (default)"
    );
  });
});

describe("LocationProvider — setLocation", () => {
  it("updates state and localStorage when setLocation is called", async () => {
    mockGetCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ message: "Denied" } as GeolocationPositionError);
      }
    );

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    act(() => {
      screen.getByTestId("set-location").click();
    });

    expect(screen.getByTestId("lat").textContent).toBe("51.5");
    expect(screen.getByTestId("lng").textContent).toBe("-0.1");
    expect(screen.getByTestId("name").textContent).toBe("London");

    const stored = JSON.parse(localStorageStore["spore-location"]);
    expect(stored.name).toBe("London");
  });
});

describe("LocationProvider — requestGeolocation", () => {
  it("updates location on successful requestGeolocation call", async () => {
    mockGetCurrentPosition
      .mockImplementationOnce(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ message: "Denied" } as GeolocationPositionError);
        }
      )
      .mockImplementationOnce((success: PositionCallback) => {
        success({
          coords: { latitude: 48.85, longitude: 2.35 },
        } as GeolocationPosition);
      });

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    act(() => {
      screen.getByTestId("request-geo").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("name").textContent).toBe("Current Location")
    );

    expect(screen.getByTestId("lat").textContent).toBe("48.85");
  });

  it("sets error state when requestGeolocation is denied", async () => {
    mockGetCurrentPosition
      .mockImplementationOnce(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({ message: "Denied" } as GeolocationPositionError);
        }
      )
      .mockImplementationOnce(
        (_success: PositionCallback, error: PositionErrorCallback) => {
          error({
            message: "User denied geolocation",
          } as GeolocationPositionError);
        }
      );

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    act(() => {
      screen.getByTestId("request-geo").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe(
        "User denied geolocation"
      )
    );
  });

  it("sets error when geolocation is not supported during requestGeolocation", async () => {
    mockGetCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({ message: "Denied" } as GeolocationPositionError);
      }
    );

    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false")
    );

    // Remove geolocation from navigator so the `in` check fails during requestGeolocation
    const navigatorWithoutGeo = Object.create(
      Object.getPrototypeOf(global.navigator),
      Object.getOwnPropertyDescriptors(global.navigator)
    );
    delete (navigatorWithoutGeo as any).geolocation;
    vi.stubGlobal("navigator", navigatorWithoutGeo);

    act(() => {
      screen.getByTestId("request-geo").click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe(
        "Geolocation not supported"
      )
    );
  });
});

describe("useLocation — outside provider", () => {
  it("throws when used outside LocationProvider", () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useLocation must be used within a LocationProvider");

    console.error = originalConsoleError;
  });
});
