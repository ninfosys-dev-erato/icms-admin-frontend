import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "next-intl";
import { OfficeSettingsForm } from "@/domains/office-settings";
import { useOfficeSettingsStore } from "@/domains/office-settings/stores/office-settings-store";
import enMessages from "../../../locales/en/domains/office-settings.json";

// Mock the store
jest.mock("@/domains/office-settings/stores/office-settings-store");
jest.mock("@/shared/hooks/use-language-font", () => ({
  useLanguageFont: () => ({ locale: "en" }),
}));

const mockUseOfficeSettingsStore =
  useOfficeSettingsStore as jest.MockedFunction<typeof useOfficeSettingsStore>;

// Mock settings data
const mockSettings = {
  id: "test-id",
  directorate: { en: "Test Directorate", ne: "परीक्षण निर्देशनालय" },
  officeName: { en: "Test Office", ne: "परीक्षण कार्यालय" },
  officeAddress: { en: "Test Address", ne: "परीक्षण ठेगाना" },
  email: "test@example.gov.np",
  phoneNumber: { en: "+977-123456789", ne: "+९७७-१२३४५६७८९" },
  website: "https://test.gov.np",
  xLink: "https://x.com/test",
  youtube: "https://youtube.com/test",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <IntlProvider messages={{ officeSettings: enMessages }} locale="en">
      {component}
    </IntlProvider>
  );
};

describe("OfficeSettingsForm", () => {
  const mockStoreActions = {
    loading: false,
    error: null,
    isEditing: false,
    isUploading: false,
    createSettings: jest.fn(),
    updateSettings: jest.fn(),
    upsertSettings: jest.fn(),
    uploadBackgroundPhoto: jest.fn(),
    removeBackgroundPhoto: jest.fn(),
    setEditing: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOfficeSettingsStore.mockReturnValue(mockStoreActions);
  });

  describe("Rendering", () => {
    it("should render form sections correctly", () => {
      renderWithIntl(<OfficeSettingsForm />);

      expect(screen.getByText("Basic Information")).toBeInTheDocument();
      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(screen.getByText("Social Media & Links")).toBeInTheDocument();
    });

    it("should render translatable fields with tabs", () => {
      renderWithIntl(<OfficeSettingsForm />);

      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("नेपाली")).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      renderWithIntl(<OfficeSettingsForm />);

      expect(
        screen.getByLabelText(/Directorate \(English\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Office Name \(English\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Office Address \(English\)/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Phone Number \(English\)/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/Website/)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/X \(Twitter\) Profile/)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/YouTube Channel/)).toBeInTheDocument();
    });

    it("should show edit button when not in editing mode", () => {
      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      expect(screen.getByText("Edit Settings")).toBeInTheDocument();
      expect(screen.queryByText("Update Settings")).not.toBeInTheDocument();
    });

    it("should show action buttons when in editing mode", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        isEditing: true,
      });

      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      expect(screen.getByText("Update Settings")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should switch between English and Nepali tabs", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      const nepaliTab = screen.getByText("नेपाली");
      fireEvent.click(nepaliTab);

      await waitFor(() => {
        expect(
          screen.getByLabelText(/Directorate \(नेपाली\)/)
        ).toBeInTheDocument();
      });
    });

    it("should handle form input changes", () => {
      renderWithIntl(<OfficeSettingsForm />);

      const emailInput = screen.getByLabelText(/Email Address/);
      fireEvent.change(emailInput, { target: { value: "new@example.gov.np" } });

      expect(emailInput).toHaveValue("new@example.gov.np");
    });

    it("should enable editing mode when edit button is clicked", () => {
      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      const editButton = screen.getByText("Edit Settings");
      fireEvent.click(editButton);

      expect(mockStoreActions.setEditing).toHaveBeenCalledWith(true);
    });

    it("should cancel editing and reset form", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        isEditing: true,
      });

      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockStoreActions.setEditing).toHaveBeenCalledWith(false);
      expect(mockStoreActions.clearError).toHaveBeenCalled();
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      const submitButton = screen.getByText("Create Settings");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Directorate is required")).toBeInTheDocument();
        expect(screen.getByText("Office name is required")).toBeInTheDocument();
        expect(
          screen.getByText("Office address is required")
        ).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(
          screen.getByText("Phone number is required")
        ).toBeInTheDocument();
      });
    });

    it("should validate email format", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      const emailInput = screen.getByLabelText(/Email Address/);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      const submitButton = screen.getByText("Create Settings");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid email address")
        ).toBeInTheDocument();
      });
    });

    it("should validate URL formats", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      const websiteInput = screen.getByLabelText(/Website/);
      fireEvent.change(websiteInput, { target: { value: "invalid-url" } });

      const submitButton = screen.getByText("Create Settings");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Please enter a valid website URL")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should create new settings when no existing settings", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Directorate \(English\)/), {
        target: { value: "Test Directorate" },
      });
      fireEvent.change(screen.getByLabelText(/Office Name \(English\)/), {
        target: { value: "Test Office" },
      });
      fireEvent.change(screen.getByLabelText(/Office Address \(English\)/), {
        target: { value: "Test Address" },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/), {
        target: { value: "test@example.gov.np" },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number \(English\)/), {
        target: { value: "+977-123456789" },
      });

      const submitButton = screen.getByText("Create Settings");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStoreActions.createSettings).toHaveBeenCalled();
      });
    });

    it("should update existing settings", async () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        isEditing: true,
      });

      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      const emailInput = screen.getByLabelText(/Email Address/);
      fireEvent.change(emailInput, {
        target: { value: "updated@example.gov.np" },
      });

      const submitButton = screen.getByText("Update Settings");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockStoreActions.updateSettings).toHaveBeenCalledWith(
          mockSettings.id,
          expect.objectContaining({
            email: "updated@example.gov.np",
          })
        );
      });
    });

    it("should handle upsert for new settings", async () => {
      renderWithIntl(<OfficeSettingsForm />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Directorate \(English\)/), {
        target: { value: "Test Directorate" },
      });
      fireEvent.change(screen.getByLabelText(/Office Name \(English\)/), {
        target: { value: "Test Office" },
      });
      fireEvent.change(screen.getByLabelText(/Office Address \(English\)/), {
        target: { value: "Test Address" },
      });
      fireEvent.change(screen.getByLabelText(/Email Address/), {
        target: { value: "test@example.gov.np" },
      });
      fireEvent.change(screen.getByLabelText(/Phone Number \(English\)/), {
        target: { value: "+977-123456789" },
      });

      const upsertButton = screen.getByText("Save Settings");
      fireEvent.click(upsertButton);

      await waitFor(() => {
        expect(mockStoreActions.upsertSettings).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error messages", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        error: "Failed to save settings",
      });

      renderWithIntl(<OfficeSettingsForm />);

      expect(screen.getByText("Failed to save settings")).toBeInTheDocument();
    });

    it("should clear error when close button is clicked", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        error: "Failed to save settings",
      });

      renderWithIntl(<OfficeSettingsForm />);

      const closeButton = screen.getByRole("button", { name: "×" });
      fireEvent.click(closeButton);

      expect(mockStoreActions.clearError).toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should show loading state during submission", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        loading: true,
      });

      renderWithIntl(<OfficeSettingsForm />);

      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("should disable form during loading", () => {
      mockUseOfficeSettingsStore.mockReturnValue({
        ...mockStoreActions,
        loading: true,
      });

      renderWithIntl(<OfficeSettingsForm />);

      const emailInput = screen.getByLabelText(/Email Address/);
      expect(emailInput).toBeDisabled();
    });
  });

  describe("Background Photo Upload", () => {
    it("should render background photo section when settings exist", () => {
      renderWithIntl(<OfficeSettingsForm settings={mockSettings} />);

      expect(screen.getByText("Background Photo")).toBeInTheDocument();
    });

    it("should not render background photo section for new settings", () => {
      renderWithIntl(<OfficeSettingsForm />);

      expect(screen.queryByText("Background Photo")).not.toBeInTheDocument();
    });
  });
});
