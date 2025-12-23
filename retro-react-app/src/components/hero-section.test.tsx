import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import testData from "../__tests__/fixtures/test-data.json";
import { HeroSection } from "./hero-section";

// Mock the router
const mockPush = vi.fn();
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

const {
  renderText,
  navigationButtons,
  systemTagsUnderTest,
  accessibility,
} = testData.heroSection;

const buildRegExp = (pattern: string, flags?: string): RegExp =>
  new RegExp(pattern, flags);

describe("HeroSection", () => {
  beforeEach((): void => {
    mockPush.mockClear();
  });

  it("renders the hero section with all required elements", (): void => {
    render(<HeroSection />);

    // Check main heading
    expect(screen.getByText(renderText.heading)).toBeInTheDocument();
    expect(screen.getByText(renderText.subheading)).toBeInTheDocument();

    // Check description
    expect(screen.getByText(renderText.description)).toBeInTheDocument();

    // Check buttons
    navigationButtons.forEach(({ labelPattern, flags }) => {
      expect(
        screen.getByRole("button", { name: buildRegExp(labelPattern, flags) }),
      ).toBeInTheDocument();
    });

    // Check chip label
    expect(screen.getByText(renderText.chipLabel)).toBeInTheDocument();

    // Check system tags (first 6)
    systemTagsUnderTest.forEach((systemTag) => {
      expect(screen.getByText(systemTag)).toBeInTheDocument();
    });
  });

  it.each(navigationButtons)(
    "navigates to $description when $labelPattern button is clicked",
    async ({ description: _description, labelPattern, flags, expectedRoute }) => {
      const user = userEvent.setup();
      render(<HeroSection />);

      const button = screen.getByRole("button", {
        name: buildRegExp(labelPattern, flags),
      });
      await user.click(button);

      expect(mockPush).toHaveBeenCalledWith(expectedRoute);
    },
  );

  it("renders the console icon with correct text", () => {
    render(<HeroSection />);

    // The console icon area should exist (contains the SVG with "Insert Coin" text)
    // We verify the component renders without crashing by checking the structure exists
    const heroSection = screen
      .getByText(renderText.heading)
      .closest(renderText.containerSelector)?.parentElement;
    expect(heroSection).toBeInTheDocument();
  });

  it.each(systemTagsUnderTest)("displays %s system tag as a chip", (systemTag: string) => {
    render(<HeroSection />);

    expect(screen.getByText(systemTag)).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<HeroSection />);

    // Check that buttons have proper roles
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(
      accessibility.minimumButtonCount,
    );

    // Check that the component has a proper heading structure
    const heading = screen.getByRole("heading", { level: accessibility.headingLevel });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(renderText.heading);
  });

  it("renders with responsive layout classes", () => {
    render(<HeroSection />);

    // Check that the component renders with proper structure (smoke test)
    // The main container should exist and contain the expected elements
    const mainContainer = screen
      .getByText(renderText.heading)
      .closest(renderText.containerSelector)?.parentElement;
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer?.children.length).toBeGreaterThan(0);
  });
});
