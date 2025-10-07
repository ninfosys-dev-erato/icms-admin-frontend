import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { TranslatableField } from "@/domains/office-settings";
import enMessages from "../../../locales/en/domains/office-settings.json";

// Mock the language font hook
jest.mock("@/shared/hooks/use-language-font", () => ({
  useLanguageFont: () => ({ locale: "en" }),
}));

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <IntlProvider messages={{ officeSettings: enMessages }} locale="en">
      {component}
    </IntlProvider>
  );
};

describe("TranslatableField", () => {
  const defaultProps = {
    label: "Test Field",
    value: { en: "English Value", ne: "नेपाली मान" },
    onChange: jest.fn(),
    placeholder: { en: "Enter English", ne: "नेपाली प्रविष्ट गर्नुहोस्" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with English and Nepali tabs", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("नेपाली")).toBeInTheDocument();
    });

    it("should render English input by default", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      expect(screen.getByLabelText("Test Field (English)")).toBeInTheDocument();
      expect(screen.getByDisplayValue("English Value")).toBeInTheDocument();
    });

    it("should not render Nepali input initially", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      expect(
        screen.queryByLabelText("Test Field (नेपाली)")
      ).not.toBeInTheDocument();
    });

    it("should show required asterisk when required prop is true", () => {
      renderWithIntl(<TranslatableField {...defaultProps} required />);

      expect(
        screen.getByLabelText("Test Field (English) *")
      ).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = renderWithIntl(
        <TranslatableField {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Tab Switching", () => {
    it("should switch to Nepali tab when clicked", async () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Test Field (नेपाली)")
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("नेपाली मान")).toBeInTheDocument();
      });
    });

    it("should switch back to English tab when clicked", async () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      // Switch to Nepali first
      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      // Switch back to English
      const englishTab = screen.getByText("English");
      fireEvent.click(englishTab);

      await waitFor(() => {
        expect(
          screen.getByLabelText("Test Field (English)")
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue("English Value")).toBeInTheDocument();
      });
    });

    it("should maintain active tab state", async () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      await waitFor(() => {
        expect(nepaliTab).toHaveClass("active");
      });
    });
  });

  describe("Input Handling", () => {
    it("should call onChange with updated English value", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      const englishInput = screen.getByLabelText("Test Field (English)");
      fireEvent.change(englishInput, {
        target: { value: "New English Value" },
      });

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        en: "New English Value",
        ne: "नेपाली मान",
      });
    });

    it("should call onChange with updated Nepali value", async () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      // Switch to Nepali tab
      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      await waitFor(() => {
        const nepaliInput = screen.getByLabelText("Test Field (नेपाली)");
        fireEvent.change(nepaliInput, { target: { value: "नयाँ नेपाली मान" } });

        expect(defaultProps.onChange).toHaveBeenCalledWith({
          en: "English Value",
          ne: "नयाँ नेपाली मान",
        });
      });
    });

    it("should preserve other language value when updating one", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      const englishInput = screen.getByLabelText("Test Field (English)");
      fireEvent.change(englishInput, { target: { value: "Updated English" } });

      expect(defaultProps.onChange).toHaveBeenCalledWith({
        en: "Updated English",
        ne: "नेपाली मान", // Nepali value should be preserved
      });
    });
  });

  describe("Placeholder Handling", () => {
    it("should show English placeholder", () => {
      renderWithIntl(
        <TranslatableField {...defaultProps} value={{ en: "", ne: "" }} />
      );

      const englishInput = screen.getByLabelText("Test Field (English)");
      expect(englishInput).toHaveAttribute("placeholder", "Enter English");
    });

    it("should show Nepali placeholder when on Nepali tab", async () => {
      renderWithIntl(
        <TranslatableField {...defaultProps} value={{ en: "", ne: "" }} />
      );

      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      await waitFor(() => {
        const nepaliInput = screen.getByLabelText("Test Field (नेपाली)");
        expect(nepaliInput).toHaveAttribute(
          "placeholder",
          "नेपाली प्रविष्ट गर्नुहोस्"
        );
      });
    });
  });

  describe("Validation", () => {
    it("should show invalid state when invalid prop is true", () => {
      renderWithIntl(<TranslatableField {...defaultProps} invalid />);

      const englishInput = screen.getByLabelText("Test Field (English)");
      expect(englishInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should show invalid text when provided", () => {
      renderWithIntl(
        <TranslatableField
          {...defaultProps}
          invalid
          invalidText="This field is required"
        />
      );

      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should disable inputs when disabled prop is true", () => {
      renderWithIntl(<TranslatableField {...defaultProps} disabled />);

      const englishInput = screen.getByLabelText("Test Field (English)");
      expect(englishInput).toBeDisabled();
    });

    it("should disable tab buttons when disabled", () => {
      renderWithIntl(<TranslatableField {...defaultProps} disabled />);

      const englishTab = screen.getByText("English");
      const nepaliTab = screen.getByText("नेपाली");

      expect(englishTab).toBeDisabled();
      expect(nepaliTab).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      expect(screen.getByLabelText("Test Field (English)")).toBeInTheDocument();
    });

    it("should have proper tab roles", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      const englishTab = screen.getByText("English");
      const nepaliTab = screen.getByText("नेपाली");

      expect(englishTab).toHaveAttribute("type", "button");
      expect(nepaliTab).toHaveAttribute("type", "button");
    });
  });

  describe("Hydration Safety", () => {
    it("should render English input on server side", () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      // Should show English input by default (no tabs initially)
      expect(screen.getByLabelText("Test Field (English)")).toBeInTheDocument();
    });

    it("should show tabs after client-side hydration", async () => {
      renderWithIntl(<TranslatableField {...defaultProps} />);

      // Wait for client-side hydration
      await waitFor(() => {
        expect(screen.getByText("English")).toBeInTheDocument();
        expect(screen.getByText("नेपाली")).toBeInTheDocument();
      });
    });
  });
});
