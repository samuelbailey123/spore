import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AllergenProvider, useAllergens } from "./allergen-context";

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  }),
};

vi.stubGlobal("localStorage", localStorageMock);

function TestConsumer() {
  const { allergens, toggleAllergen, setAllergens, clearAllergens } =
    useAllergens();
  return (
    <div>
      <span data-testid="allergens">{JSON.stringify(allergens)}</span>
      <button onClick={() => toggleAllergen("oak")}>Toggle Oak</button>
      <button onClick={() => toggleAllergen("birch")}>Toggle Birch</button>
      <button onClick={() => setAllergens(["ragweed", "grass-general"])}>
        Set Ragweed+Grass
      </button>
      <button onClick={() => clearAllergens()}>Clear</button>
    </div>
  );
}

describe("AllergenProvider", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("starts with an empty allergen list", () => {
    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );
    expect(screen.getByTestId("allergens")).toHaveTextContent("[]");
  });

  it("loads stored allergens from localStorage", () => {
    localStorageStore["spore-allergens"] = JSON.stringify(["oak", "birch"]);

    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    expect(screen.getByTestId("allergens")).toHaveTextContent(
      '["oak","birch"]'
    );
  });

  it("ignores corrupt localStorage data", () => {
    localStorageStore["spore-allergens"] = "not-json{{{";

    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    expect(screen.getByTestId("allergens")).toHaveTextContent("[]");
  });

  it("ignores non-array localStorage data", () => {
    localStorageStore["spore-allergens"] = JSON.stringify({ foo: "bar" });

    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    expect(screen.getByTestId("allergens")).toHaveTextContent("[]");
  });

  it("toggleAllergen adds and removes a species", async () => {
    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    await act(async () => {
      screen.getByText("Toggle Oak").click();
    });
    expect(screen.getByTestId("allergens")).toHaveTextContent('["oak"]');

    await act(async () => {
      screen.getByText("Toggle Oak").click();
    });
    expect(screen.getByTestId("allergens")).toHaveTextContent("[]");
  });

  it("setAllergens replaces the full list", async () => {
    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    await act(async () => {
      screen.getByText("Set Ragweed+Grass").click();
    });
    expect(screen.getByTestId("allergens")).toHaveTextContent(
      '["ragweed","grass-general"]'
    );
  });

  it("clearAllergens empties the list", async () => {
    localStorageStore["spore-allergens"] = JSON.stringify(["oak"]);

    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    await act(async () => {
      screen.getByText("Clear").click();
    });
    expect(screen.getByTestId("allergens")).toHaveTextContent("[]");
  });

  it("persists changes to localStorage", async () => {
    render(
      <AllergenProvider>
        <TestConsumer />
      </AllergenProvider>
    );

    await act(async () => {
      screen.getByText("Toggle Oak").click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "spore-allergens",
      JSON.stringify(["oak"])
    );
  });

  it("throws when useAllergens is used outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAllergens must be used within an AllergenProvider"
    );

    spy.mockRestore();
  });
});
