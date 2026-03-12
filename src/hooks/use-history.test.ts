import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHistory } from "./use-history";

vi.mock("swr", () => ({
  default: vi.fn(),
}));

import useSWR from "swr";

const mockUseSWR = vi.mocked(useSWR);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("history fetcher function", () => {
  it("returns json on ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", "2024-01-31"));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    const result = await fetcher("/test");
    expect(result).toEqual({ data: [] });
  });

  it("throws with body.error on non-ok response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "Invalid range" }),
    } as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", "2024-01-31"));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Invalid range");
  });

  it("throws fallback error when json parse fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error(); },
    } as unknown as Response);

    mockUseSWR.mockImplementation((_key, fetcher) => {
      return { data: undefined, error: undefined, isLoading: true } as any;
    });

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", "2024-01-31"));

    const fetcher = mockUseSWR.mock.calls[0][1] as (url: string) => Promise<unknown>;
    await expect(fetcher("/test")).rejects.toThrow("Request failed with status 500");
  });
});

describe("useHistory", () => {
  it("returns null history when lat is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() =>
      useHistory(null, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.history).toBeNull();
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("returns null key when lng is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useHistory(29.76, null, "2024-01-01", "2024-01-31"));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("returns null key when from is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useHistory(29.76, -95.37, null, "2024-01-31"));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("returns null key when to is null", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", null));
    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object));
  });

  it("passes correct URL key to SWR when all params are provided", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", "2024-01-31"));
    expect(mockUseSWR).toHaveBeenCalledWith(
      "/api/pollen/history?lat=29.76&lng=-95.37&from=2024-01-01&to=2024-01-31",
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("returns history data from successful response", () => {
    const mockHistory = [
      {
        date: "2024-01-15",
        treeCount: 100,
        grassCount: 20,
        weedCount: 50,
        treeRisk: "low" as const,
        grassRisk: "none" as const,
        weedRisk: "moderate" as const,
      },
    ];
    mockUseSWR.mockReturnValue({
      data: { data: mockHistory, error: null, source: "ambee" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useHistory(29.76, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.history).toEqual(mockHistory);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns null history when data.data is null", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "History not found", source: "ambee" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useHistory(29.76, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.history).toBeNull();
  });

  it("returns error from data.error string", () => {
    mockUseSWR.mockReturnValue({
      data: { data: null, error: "History unavailable", source: "ambee" },
      error: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useHistory(29.76, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("History unavailable");
  });

  it("returns SWR fetch error when present", () => {
    const fetchError = new Error("Network error");
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: fetchError,
      isLoading: false,
    } as any);

    const { result } = renderHook(() =>
      useHistory(29.76, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.error).toBe(fetchError);
  });

  it("passes correct SWR options with refreshInterval of 0", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useHistory(29.76, -95.37, "2024-01-01", "2024-01-31"));
    const options = mockUseSWR.mock.calls[0][2] as any;
    expect(options.refreshInterval).toBe(0);
    expect(options.revalidateOnFocus).toBe(false);
    expect(options.dedupingInterval).toBe(10 * 60 * 1000);
  });

  it("returns null error when nothing is set", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() =>
      useHistory(29.76, -95.37, "2024-01-01", "2024-01-31")
    );
    expect(result.current.error).toBeNull();
  });
});
