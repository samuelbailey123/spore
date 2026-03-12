import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LearnPage from "./page";

vi.mock("@/components/learn/threshold-table", () => ({
  ThresholdTable: () => <div data-testid="threshold-table">ThresholdTable</div>,
}));

// Import real data to assert against actual content
import { pollenTypeSections, faqs } from "@/data/learn-content";

describe("LearnPage", () => {
  describe("page structure", () => {
    it("renders the page heading", () => {
      render(<LearnPage />);

      expect(screen.getByRole("heading", { name: "Learn About Pollen", level: 1 })).toBeInTheDocument();
    });

    it("renders the page sub-description", () => {
      render(<LearnPage />);

      expect(
        screen.getByText(/Deep dive into pollen science/)
      ).toBeInTheDocument();
    });

    it("renders the NAB threshold section heading", () => {
      render(<LearnPage />);

      expect(screen.getByText("NAB Pollen Count Thresholds")).toBeInTheDocument();
    });

    it("renders the threshold table quick reference description", () => {
      render(<LearnPage />);

      expect(screen.getByText(/Quick reference: what the numbers mean/)).toBeInTheDocument();
    });

    it("renders the ThresholdTable component", () => {
      render(<LearnPage />);

      expect(screen.getByTestId("threshold-table")).toBeInTheDocument();
    });
  });

  describe("content sections from pollenTypeSections", () => {
    it("renders a section article for every entry in pollenTypeSections", () => {
      render(<LearnPage />);

      pollenTypeSections.forEach((section) => {
        expect(screen.getByText(section.title)).toBeInTheDocument();
      });
    });

    it("renders the expected number of section articles", () => {
      render(<LearnPage />);

      // Each section renders an <article> element
      const articles = document.querySelectorAll("article");
      expect(articles.length).toBe(pollenTypeSections.length);
    });

    it("assigns correct id to each section article", () => {
      render(<LearnPage />);

      pollenTypeSections.forEach((section) => {
        const article = document.getElementById(section.slug);
        expect(article).not.toBeNull();
        expect(article?.tagName).toBe("ARTICLE");
      });
    });

    it("renders first section title: What is Pollen?", () => {
      render(<LearnPage />);

      expect(screen.getByText("What is Pollen?")).toBeInTheDocument();
    });

    it("renders tree pollen section title", () => {
      render(<LearnPage />);

      expect(screen.getByText("Tree Pollen — The Spring Trigger")).toBeInTheDocument();
    });

    it("renders grass pollen section title", () => {
      render(<LearnPage />);

      expect(screen.getByText("Grass Pollen — The Summer Scourge")).toBeInTheDocument();
    });

    it("renders weed pollen section title", () => {
      render(<LearnPage />);

      expect(screen.getByText("Weed Pollen — The Fall Finale")).toBeInTheDocument();
    });

    it("renders climate change section title", () => {
      render(<LearnPage />);

      expect(screen.getByText("Climate Change and Pollen")).toBeInTheDocument();
    });
  });

  describe("FAQ section", () => {
    it("renders the FAQ section heading", () => {
      render(<LearnPage />);

      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    });

    it("renders a question element for every entry in faqs", () => {
      render(<LearnPage />);

      faqs.forEach((faq) => {
        expect(screen.getByText(faq.question)).toBeInTheDocument();
      });
    });

    it("renders the first FAQ question text", () => {
      render(<LearnPage />);

      expect(
        screen.getByText("What's the difference between pollen count and pollen index?")
      ).toBeInTheDocument();
    });

    it("renders the 'does rain help or hurt' FAQ question", () => {
      render(<LearnPage />);

      expect(
        screen.getByText("Does rain help or hurt pollen allergies?")
      ).toBeInTheDocument();
    });
  });
});
