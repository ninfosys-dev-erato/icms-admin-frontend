"use client";

import React, { useMemo, useState } from "react";
import { Layer, Button, Breadcrumb, BreadcrumbItem } from "@carbon/react";
import { Add } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import "@/lib/ibm-products/config";
import { useHRUIStore } from "../../stores/hr-ui-store";
import { useDepartments, useEmployees } from "../../hooks/use-hr-queries";
import { HRPanelForms } from "./hr-panel-forms";
import "../../styles/hr.css";
import { EmployeeList } from "../employees/employee-list";
import { DepartmentList } from "../departments/department-list";
import { Close } from "@carbon/icons-react";
import { debugAuthState } from "@/lib/auth-utils";
import SidePanelForm from "@/components/shared/side-panel-form";

export const HRContainer: React.FC = () => {
  const t = useTranslations("hr");
  const {
    panelOpen,
    panelMode,
    activeEntity,
    openCreateDepartment,
    openCreateEmployee,
    closePanel,
    isSubmitting,
    setSubmitting,
    selectedTabIndex,
    setSelectedTabIndex,
  } = useHRUIStore();
  const [employeeFilters, setEmployeeFilters] = useState<{
    isActive?: boolean;
    departmentId?: string;
  }>({});
  const [departmentFilters, setDepartmentFilters] = useState<{
    isActive?: boolean;
  }>({});

  const employeesQuery = useEmployees({
    page: 1,
    limit: 12,
    ...employeeFilters,
  });
  const departmentsQuery = useDepartments({
    page: 1,
    limit: 12,
    ...departmentFilters,
  });

  const tHr = useTranslations("hr");
  const tEmp = useTranslations("hr-employees");
  const tDept = useTranslations("hr-departments");

  const panelTitle = useMemo(() => {
    if (activeEntity === "department")
      return panelMode === "edit"
        ? tDept("form.editTitle")
        : tDept("form.createTitle");
    if (activeEntity === "employee")
      return panelMode === "edit"
        ? tEmp("form.editTitle")
        : tEmp("form.createTitle");
    return "";
  }, [activeEntity, panelMode, tEmp, tDept]);

  const primaryText = useMemo(() => {
    if (activeEntity === "department")
      return isSubmitting ? tDept("form.saving") : tDept("form.save");
    if (activeEntity === "employee")
      return isSubmitting ? tEmp("form.saving") : tEmp("form.save");
    return "";
  }, [activeEntity, isSubmitting, tEmp, tDept]);

  const secondaryText = useMemo(() => {
    if (activeEntity === "department") return tDept("form.cancel");
    if (activeEntity === "employee") return tEmp("form.cancel");
    return "";
  }, [activeEntity, tEmp, tDept]);

  const handleCreateNew = () => {
    if (selectedTabIndex === 0) {
      openCreateEmployee();
    } else {
      openCreateDepartment();
    }
  };

  return (
    <Layer className="hr-container">
      {/* Page Header */}
      <div className="hr-header">
        <Breadcrumb noTrailingSlash className="hr-header-breadcrumb">
          <BreadcrumbItem href="#">
            {t("breadcrumbs.home", { default: "Home" })}
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{tHr("title")}</BreadcrumbItem>
        </Breadcrumb>
        <div className="hr-header-row">
          <div className="hr-header-title-group">
            <h1 className="hr-header-title">{tHr("title")}</h1>
            <p className="hr-header-subtitle">{tHr("subtitle")}</p>
          </div>
          <div className="hr-header-actions">
            <Button
              size="lg"
              renderIcon={Add}
              onClick={handleCreateNew}
              kind="primary"
            >
              {selectedTabIndex === 0
                ? tEmp("list.createNew")
                : tDept("list.createNew")}
            </Button>
            {/* Debug button - remove in production */}
            {/* {process.env.NODE_ENV === 'development' && (
              <Button 
                size="lg" 
                onClick={debugAuthState} 
                kind="ghost"
                className="hr-header-debug-btn"
              >
                Debug Auth
              </Button>
            )} */}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="hr-tabs-container">
        <div className="hr-main-tabs">
          <button
            type="button"
            className={`hr-tab-button ${selectedTabIndex === 0 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(0)}
          >
            {tEmp("list.title")}
          </button>
          <button
            type="button"
            className={`hr-tab-button ${selectedTabIndex === 1 ? "active" : ""}`}
            onClick={() => setSelectedTabIndex(1)}
          >
            {tDept("list.title")}
          </button>
        </div>

        {/* Tab Content */}
        <div className="hr-tab-content">
          {selectedTabIndex === 0 && (
            <div className="hr-tab-pane">
              <EmployeeList />
            </div>
          )}
          {selectedTabIndex === 1 && (
            <div className="hr-tab-pane">
              <DepartmentList />
            </div>
          )}
        </div>
      </div>

      {/* Right side panel for create/edit */}
      <SidePanelForm
        title={panelTitle}
        subtitle={
          panelMode === "edit"
            ? activeEntity === "employee"
              ? useHRUIStore.getState().panelEmployee?.name?.en
              : useHRUIStore.getState().panelDepartment?.departmentName?.en
            : undefined
        }
        open={!!panelOpen}
        onRequestClose={() => {
          if (!isSubmitting) {
            closePanel();
          }
        }}
        primaryButtonText={
          isSubmitting
            ? panelMode === "edit"
              ? t("actions.updating")
              : t("actions.creating")
            : panelMode === "edit"
              ? t("actions.update")
              : t("actions.createNew")
        }
        secondaryButtonText={t("actions.cancel")}
        onRequestSubmit={async () => {
          if (isSubmitting) return;
          setSubmitting(true);
          // Photo update logic
          const state = useHRUIStore.getState();
          const employee = state.panelEmployee;
          const employeeId = employee?.id;
          const selectedFile = employeeId ? state.selectedFileById?.[employeeId] : undefined;
          const uploadPhotoMutation = state.uploadPhotoMutation;
          const setSelectedFile = state.setSelectedFile;
          if (selectedFile && employeeId && uploadPhotoMutation) {
            await uploadPhotoMutation.mutateAsync({
              id: employeeId,
              file: selectedFile,
            });
            setSelectedFile(employeeId, null);
          }
          const formContainer = document.getElementById("hr-form");
          if (formContainer) {
            const form = formContainer.closest("form") as HTMLFormElement;
            if (form) {
              const submitEvent = new Event("submit", {
                cancelable: true,
                bubbles: true,
              });
              form.dispatchEvent(submitEvent);
            } else {
              const customSubmitEvent = new CustomEvent("formSubmit", {
                bubbles: true,
              });
              formContainer.dispatchEvent(customSubmitEvent);
            }
          } else {
            setSubmitting(false);
          }
        }}
        selectorPageContent="#main-content"
        // formTitle={t('sections.basicInfo')}
        selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
        className="hr-sidepanel-form"
      >
        <div className="hr-sidepanel-close-btn">
          <Button
            kind="ghost"
            hasIconOnly
            size="sm"
            iconDescription={t("actions.cancel")}
            onClick={closePanel}
            renderIcon={Close}
          />
        </div>
        <div id="hr-form">
          <HRPanelForms onSuccess={closePanel} />
        </div>
      </SidePanelForm>
    </Layer>
  );
};
