import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForecast } from "./use-forecast";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

import useSWR from "swr";

const mockUseSWR = vi.mocked(useSWR);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("forecast fetcher function", () => {
  it("returns json on ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "test" }),
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useForecast(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    const result = await fetcher("/test");
    expect(result).toEqual({ data: "test" });
  });

  it("throws with body.error on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Bad request" }),
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useForecast(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Bad request");
  });

  it("throws fallback error when json parse fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => { throw new Error(); },
    } as unknown as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useForecast(29.76, -95.37));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Request failed with status 502");
  });
});

describe("useForecast", () => {
  it("returns null forecast when lat/lng are null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useForecast(null, null));
    expect(result.current.forecast).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it("passes null key to SWR when lat is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useForecast(null, -95.37));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("passes null key to SWR when lng is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useForecast(29.76, null));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("passes correct URL key to SWR when lat and lng are provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    renderHook(() => useForecast(29.76, -95.37));
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/pollen/forecast?lat=29.76&lng=-95.37",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("returns forecast data from successful response", () => {
    const mockForecast = [
      {
        date: "2024-06-15",
        indices: [],
        species: [],
      },
    ];
    mockUseSWR.mockReturnValue({
      data: { data: mockForecast, error: null, source: "google" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useForecast(29.76, -95.37));
    expect(result.current.forecast).toEqual(mockForecast);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null forecast when data.data is null", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "API error", source: "google" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useForecast(29.76, -95.37));
    expect(result.current.forecast).toBeNull();
  });

  it("returns error from data.error string", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "Forecast unavailable", source: "google" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useForecast(29.76, -95.37));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Forecast unavailable");
  });

  it("returns SWR fetch error when present", () => {
    const fetchError = new Error("Network error");
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: fetchError,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useForecast(29.76, -95.37));
    expect(result.current.error).toBe(fetchError);
  });

  it("passes correct SWR options including refreshInterval", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useForecast(29.76, -95.37));
    const options = mockUseSWR.mock.calls[0][2] as any;
    expect(options.revalidateOnFocus).toBe(false);
    expect(options.refreshInterval).toBe(3 * 60 * 60 * 1000);
    expect(options.dedupingInterval).toBe(5 * 60 * 1000);
  });

  it("returns null error when data is undefined and error is undefined", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useForecast(29.76, -95.37));
    expect(result.current.error).toBeNull();
  });
});
