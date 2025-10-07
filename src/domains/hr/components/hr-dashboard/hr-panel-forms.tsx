"use client";

import React from 'react';
import { useHRUIStore } from '../../stores/hr-ui-store';
import { EmployeeCreateForm } from '../employees/employee-create-form';
import { EmployeeEditForm } from '../employees/employee-edit-form';
import { DepartmentCreateForm } from '../departments/department-create-form';
import { DepartmentEditForm } from '../departments/department-edit-form';

export const HRPanelForms: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { activeEntity, panelMode, panelEmployee, panelDepartment } = useHRUIStore();

  if (activeEntity === 'employee') {
    if (panelMode === 'create') return <EmployeeCreateForm onSuccess={onSuccess} />;
    if (panelMode === 'edit' && panelEmployee) return <EmployeeEditForm employee={panelEmployee} onSuccess={onSuccess} />;
  }

  if (activeEntity === 'department') {
    if (panelMode === 'create') return <DepartmentCreateForm onSuccess={onSuccess} />;
    if (panelMode === 'edit' && panelDepartment) return <DepartmentEditForm department={panelDepartment} onSuccess={onSuccess} />;
  }

  return null;
};


