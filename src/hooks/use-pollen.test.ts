import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePollen } from "./use-pollen";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

import useSWR from "swr";

const mockUseSWR = vi.mocked(useSWR);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetcher function", () => {
  it("calls fetch and returns json on ok response", async () => {
    const mockData = { data: "test" };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher, _opts) => {
      return { data: undefined, error: undefined, isLoading: true, mutate: vi.fn() } as any;
    });

    renderHook(() => usePollen(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    const result = await fetcher("/api/pollen/current?lat=29.76&lng=-95.37");
    expect(result).toEqual(mockData);
  });

  it("throws error with body.error message on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid coordinates" }),
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher, _opts) => {
      return { data: undefined, error: undefined, isLoading: true, mutate: vi.fn() } as any;
    });

    renderHook(() => usePollen(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Invalid coordinates");
  });

  it("throws fallback error when body.json() fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error("parse fail"); },
    } as unknown as Response);

    mockUseSWR.mockImplementation((_key, fetcher, _opts) => {
      return { data: undefined, error: undefined, isLoading: true, mutate: vi.fn() } as any;
    });

    renderHook(() => usePollen(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Request failed with status 500");
  });
});

describe("usePollen", () => {
  it("returns null pollen and isLoading true when lat/lng are null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePollen(null, null));
    expect(result.current.pollen).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it("passes null key to SWR when lat or lng is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => usePollen(null, -95.37));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("passes correct URL key to SWR when lat and lng are provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    } as any);

    renderHook(() => usePollen(29.76, -95.37));
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/pollen/current?lat=29.76&lng=-95.37&name=Your%20Location",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("encodes the name parameter in the URL", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    } as any);

    renderHook(() => usePollen(29.76, -95.37, "Houston, TX"));
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/pollen/current?lat=29.76&lng=-95.37&name=Houston%2C%20TX",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("returns pollen data from successful response", () => {
    const mockSnapshot = {
      location: { lat: 29.76, lng: -95.37, name: "Houston, TX" },
      timestamp: "2024-06-15T00:00:00Z",
      indices: [],
      species: [],
      healthRecommendations: [],
    };
    mockUseSWR.mockReturnValue({
      data: { data: mockSnapshot, error: null, source: "google" },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePollen(29.76, -95.37));
    expect(result.current.pollen).toEqual(mockSnapshot);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null pollen when data.data is null", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "Something went wrong", source: "google" },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePollen(29.76, -95.37));
    expect(result.current.pollen).toBeNull();
  });

  it("returns error from data.error string", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "API error occurred", source: "google" },
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePollen(29.76, -95.37));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("API error occurred");
  });

  it("returns error from SWR fetch error", () => {
    const fetchError = new Error("Network failure");
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: fetchError,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePollen(29.76, -95.37));
    expect(result.current.error).toBe(fetchError);
  });

  it("exposes refresh function from mutate", () => {
    const mutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate,
    } as any);

    const { result } = renderHook(() => usePollen(29.76, -95.37));
    result.current.refresh();
    expect(mutate).toHaveBeenCalled();
  });

  it("passes SWR options with refreshInterval and revalidateOnFocus false", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as any);

    renderHook(() => usePollen(29.76, -95.37));
    const options = mockUseSWR.mock.calls[0][2] as any;
    expect(options.revalidateOnFocus).toBe(false);
    expect(options.refreshInterval).toBe(30 * 60 * 1000);
  });
});
