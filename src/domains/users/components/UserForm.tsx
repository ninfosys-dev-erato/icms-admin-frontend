"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Grid,
  Column,
  TextInput,
  PasswordInput,
  Toggle,
  Button,
  InlineLoading,
  FormGroup,
} from "@carbon/react";
import { RoleSelector } from "./RoleSelector";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserFormData,
} from "../types/user";
import { useCreateUser, useUpdateUser } from "../hooks/use-user-queries";
import { Reset } from "@carbon/icons-react";
import { useUserUIStore } from "../stores/user-ui-store";
import { useTranslations } from "next-intl";

interface Props {
  mode: "create" | "edit";
  user?: User;
  onSuccess?: () => void;
}

export const UserForm: React.FC<Props> = ({ mode, user, onSuccess }) => {
  const t = useTranslations("users");
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const setGlobalSubmitting = useUserUIStore((s) => s.setSubmitting);
  const createFormState = useUserUIStore((s) => s.createFormState);
  const formStateById = useUserUIStore((s) => s.formStateById);
  const updateFormField = useUserUIStore((s) => s.updateFormField);
  const resetCreateForm = useUserUIStore((s) => s.resetCreateForm);
  const initializeEditForm = useUserUIStore((s) => s.initializeEditForm);

  const currentForm: UserFormData = useMemo<UserFormData>(() => {
    if (mode === "create") return createFormState;
    if (user && formStateById[user.id])
      return formStateById[user.id] as UserFormData;
    return {
      email: user?.email ?? "",
      password: "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      role: (user?.role ?? "VIEWER") as UserFormData["role"],
      isActive: (user?.status ?? "ACTIVE") === "ACTIVE",
    };
  }, [mode, user, createFormState, formStateById]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && user) {
      initializeEditForm(user);
    }
  }, [mode, user, initializeEditForm]);

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (
      !currentForm.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email)
    )
      e.email = t("form.email.validation.required");
    if (
      mode === "create" &&
      (!currentForm.password || currentForm.password.length < 8)
    )
      e.password = t("form.password.validation.minLength");
    if (!currentForm.firstName)
      e.firstName = t("form.firstName.validation.required");
    if (!currentForm.lastName)
      e.lastName = t("form.lastName.validation.required");
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [currentForm, mode, t]);

  const submitForm = useCallback(async () => {
    setSubmitting(true);
    setGlobalSubmitting(true);
    try {
      if (mode === "create") {
        const payload: CreateUserRequest = {
          email: currentForm.email,
          password: currentForm.password,
          firstName: currentForm.firstName,
          lastName: currentForm.lastName,
          role: currentForm.role,
          status: currentForm.isActive ? "ACTIVE" : "INACTIVE",
          isActive: currentForm.isActive,
        };
        await createMutation.mutateAsync(payload);
        resetCreateForm();
      } else if (user) {
        const payload: UpdateUserRequest = {
          email: currentForm.email,
          ...(currentForm.password ? { password: currentForm.password } : {}),
          firstName: currentForm.firstName,
          lastName: currentForm.lastName,
          role: currentForm.role,
          status: currentForm.isActive ? "ACTIVE" : "INACTIVE",
          isActive: currentForm.isActive,
        } as UpdateUserRequest;
        await updateMutation.mutateAsync({ id: user.id, data: payload });
      }
      onSuccess?.();
    } finally {
      setSubmitting(false);
      setGlobalSubmitting(false);
    }
  }, [
    mode,
    currentForm,
    user,
    createMutation,
    updateMutation,
    resetCreateForm,
    setGlobalSubmitting,
    onSuccess,
  ]);

  // Listen for submit event on the parent CreateSidePanel form (to avoid nested forms)
  useEffect(() => {
    const formContainer = document.getElementById("user-form");
    const parentForm = formContainer?.closest("form");
    if (!parentForm) return;

    const handleParentFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (!validate()) return;
      void submitForm();
    };

    parentForm.addEventListener("submit", handleParentFormSubmit);
    return () => {
      parentForm.removeEventListener("submit", handleParentFormSubmit);
    };
  }, [mode, user, currentForm, submitForm, validate]);

  const handleReset = () => {
    if (mode === "edit" && user) {
      initializeEditForm(user);
      setErrors({});
      return;
    }
    resetCreateForm();
    setErrors({});
  };

  return (
    <div>
      {submitting && (
        <div style={{ marginBottom: "1rem" }}>
          <InlineLoading
            description={mode === "create" ? "Creating" : "Updating"}
          />
        </div>
      )}
      <div id="user-form">
        {/* Top action bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            marginTop: '-0.5rem'
          }}
        >
          <h3 style={{fontSize:'16px'}}>{t("sections.basicInfo")}</h3>
          {mode === 'create' ?

          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={handleReset}
            type="button"
            disabled={
              createMutation.isPending || updateMutation.isPending || submitting
            }
          >
            Reset
          </Button>
          : 
          ""
          }
        </div>
        <Grid fullWidth>
          <Column lg={16} md={8} sm={4}>
            <TextInput
              id="email"
              labelText="Email"
              value={currentForm.email}
              onChange={(e) =>
                updateFormField(
                  mode === "create" ? "create" : user?.id || "create",
                  "email",
                  e.target.value
                )
              }
              invalid={!!errors.email}
              invalidText={errors.email}
              required
            />

            <div style={{ marginTop: "1rem" }}>
              <PasswordInput
                id="password"
                labelText={
                  mode === "create"
                    ? t("form.password.labelCreate")
                    : t("form.password.labelEdit")
                }
                value={currentForm.password}
                onChange={(e) =>
                  updateFormField(
                    mode === "create" ? "create" : user?.id || "create",
                    "password",
                    e.target.value
                  )
                }
                invalid={!!errors.password}
                invalidText={errors.password}
                {...(mode === "create" ? { required: true } : {})}
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <TextInput
                id="firstName"
                labelText={t("form.firstName.label")}
                value={currentForm.firstName}
                onChange={(e) =>
                  updateFormField(
                    mode === "create" ? "create" : user?.id || "create",
                    "firstName",
                    e.target.value
                  )
                }
                invalid={!!errors.firstName}
                invalidText={errors.firstName}
                required
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <TextInput
                id="lastName"
                labelText={t("form.lastName.label")}
                value={currentForm.lastName}
                onChange={(e) =>
                  updateFormField(
                    mode === "create" ? "create" : user?.id || "create",
                    "lastName",
                    e.target.value
                  )
                }
                invalid={!!errors.lastName}
                invalidText={errors.lastName}
                required
              />
            </div>

            <div style={{ marginTop: "1rem" }}>
              <RoleSelector
                value={currentForm.role}
                onChange={(role) =>
                  updateFormField(
                    mode === "create" ? "create" : user?.id || "create",
                    "role",
                    role
                  )
                }
              />
            </div>

            <div style={{ marginTop: "2rem" }}>
              <FormGroup legendText={t("form.isActive.label")}>
                <Toggle
                  id="isActive"
                  labelText=""
                  toggled={currentForm.isActive}
                  onToggle={(checked) =>
                    updateFormField(
                      mode === "create" ? "create" : user?.id || "create",
                      "isActive",
                      checked
                    )
                  }
                />
              </FormGroup>
            </div>
          </Column>
        </Grid>
      </div>
    </div>
  );
};
