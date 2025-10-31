// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   InlineLoading,
//   Pagination,
//   OverflowMenu,
//   OverflowMenuItem,
//   Tag,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
//   TableContainer,
// } from "@carbon/react";
// import { User, Building } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
// import type {
//   EmployeeResponseDto,
//   EmployeeQueryDto,
// } from "../../types/employee";
// import { useHRUIStore } from "../../stores/hr-ui-store";
// import { EmployeePhotoPreview } from "./employee-photo-preview";

// interface EmployeeListProps {
//   departmentId?: string;
//   queryOverrides?: Partial<EmployeeQueryDto>;
// }

// export const EmployeeList: React.FC<EmployeeListProps> = ({
//   departmentId,
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-employees");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...(departmentId ? { departmentId } : {}),
//     ...queryOverrides,
//   });
//   const { openEditEmployee } = useHRUIStore();
//   const queryResult = useEmployees(query);
//   const deleteMutation = useDeleteEmployee();

//   useEffect(() => {
//     setQuery((prev) => {
//       const nextDept = departmentId || undefined;
//       if (prev.departmentId === nextDept && prev.page === 1) return prev;
//       return {
//         ...prev,
//         page: 1,
//         ...(nextDept
//           ? { departmentId: nextDept }
//           : { departmentId: undefined }),
//       };
//     });
//   }, [departmentId]);

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const employees = (data?.data ?? []) as EmployeeResponseDto[];
//   const pagination = data?.pagination;

//   if (queryResult.isLoading && employees.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="employee-list">
//       {employees.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.photo.label")}</TableHeader>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("form.position.label")}</TableHeader>
//                 <TableHeader>{t("form.department.label")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>
//                     <div className="employee-photo-table-cell">
//                         <EmployeePhotoPreview
//                           mediaId={emp.photoMediaId}
//                           directUrl={emp.photo?.presignedUrl}
//                           alt={`${(emp.name?.[locale as 'en' | 'ne'] || emp.name?.en || emp.name?.ne) || ''} photo`}
//                           className="employee-photo-table"
//                         />
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.name?.[locale as 'en' | 'ne'] || emp.name?.en || emp.name?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.position?.[locale as 'en' | 'ne'] || emp.position?.en || emp.position?.ne || ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.department?.departmentName?.[locale as 'en' | 'ne'] || emp.department?.departmentName?.en || emp.department?.departmentName?.ne || ""}
//                   </TableCell>
//                   <TableCell>
//                     <Tag type={emp.isActive ? "green" : "gray"} size="sm">
//                       {emp.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="employee-list-actions-cell">
//                     <OverflowMenu
//                       flipped
//                       size="sm"
//                       aria-label={t("card.actions")}
//                     >
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditEmployee(emp)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(emp.id)}
//                       />
//                     </OverflowMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-state-content">
//             <div className="empty-state-icon">
//               <User size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
//             <p className="empty-state-description">
//               {t("list.noEmployeesDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && employees.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={query.page || pagination.page}
//             pageSize={query.limit || pagination.limit}
//             pageSizes={[12, 24, 48, 96]}
//             totalItems={pagination.total}
//             onChange={({ page, pageSize }) => {
//               // Always update both page and pageSize for consistency
//               setQuery((prev) => ({
//                 ...prev,
//                 page: page ?? prev.page ?? 1,
//                 limit: pageSize ?? prev.limit ?? 12,
//               }));
//             }}
//             size="md"
//           />
//         </div>
//       )}
//     </div>
//   );
// };



// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   InlineLoading,
//   Pagination,
//   OverflowMenu,
//   OverflowMenuItem,
//   Tag,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
//   TableContainer,
// } from "@carbon/react";
// import { User } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
// import type {
//   EmployeeResponseDto,
//   EmployeeQueryDto,
// } from "../../types/employee";
// import { useHRUIStore } from "../../stores/hr-ui-store";
// import { EmployeePhotoPreview } from "./employee-photo-preview";

// interface EmployeeListProps {
//   departmentId?: string;
//   queryOverrides?: Partial<EmployeeQueryDto>;
// }

// export const EmployeeList: React.FC<EmployeeListProps> = ({
//   departmentId,
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-employees");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...(departmentId ? { departmentId } : {}),
//     ...queryOverrides,
//   });
//   const { openEditEmployee } = useHRUIStore();
//   const queryResult = useEmployees(query);
//   const deleteMutation = useDeleteEmployee();

//   useEffect(() => {
//     setQuery((prev) => {
//       const nextDept = departmentId || undefined;
//       if (prev.departmentId === nextDept && prev.page === 1) return prev;
//       return {
//         ...prev,
//         page: 1,
//         ...(nextDept
//           ? { departmentId: nextDept }
//           : { departmentId: undefined }),
//       };
//     });
//   }, [departmentId]);

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const employees = (data?.data ?? []) as EmployeeResponseDto[];
//   const pagination = data?.pagination;

//   // Convert numbers to Nepali digits when locale is 'ne'
//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
//       return String(n)
//         .split("")
//         .map((ch) => (/[0-9]/.test(ch) ? digits[Number(ch)] : ch))
//         .join("");
//     }
//     return String(n);
//   };

//   if (queryResult.isLoading && employees.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="employee-list">
//       {employees.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.photo.label")}</TableHeader>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("form.position.label")}</TableHeader>
//                 <TableHeader>{t("form.department.label")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>
//                     <div className="employee-photo-table-cell">
//                       <EmployeePhotoPreview
//                         mediaId={emp.photoMediaId}
//                         directUrl={emp.photo?.presignedUrl}
//                         alt={`${
//                           emp.name?.[locale as "en" | "ne"] ||
//                           emp.name?.en ||
//                           emp.name?.ne ||
//                           ""
//                         } photo`}
//                         className="employee-photo-table"
//                       />
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.name?.[locale as "en" | "ne"] ||
//                       emp.name?.en ||
//                       emp.name?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.position?.[locale as "en" | "ne"] ||
//                       emp.position?.en ||
//                       emp.position?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.department?.departmentName?.[
//                       locale as "en" | "ne"
//                     ] ||
//                       emp.department?.departmentName?.en ||
//                       emp.department?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell>
//                     <Tag type={emp.isActive ? "green" : "gray"} size="sm">
//                       {emp.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="employee-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditEmployee(emp)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(emp.id)}
//                       />
//                     </OverflowMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-state-content">
//             <div className="empty-state-icon">
//               <User size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
//             <p className="empty-state-description">
//               {t("list.noEmployeesDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && employees.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             {...({
//               page: query.page || pagination.page,
//               pageSize: query.limit || pagination.limit,
//               pageSizes: [12, 24, 48, 96],
//               totalItems: pagination.total,
//               itemsPerPageText:
//                 locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page",
//               pageNumberText: locale === "ne" ? "पृष्ठ" : "Page",
//               itemRangeText: (min: number, max: number, total: number) =>
//                 `${formatNumber(min)}–${formatNumber(max)} ${
//                   locale === "ne" ? "मध्ये" : "of"
//                 } ${formatNumber(total)}`,
//               renderPageSizeMenuItemText: (size: number) => formatNumber(size),
//               renderPageNumberText: (pageNumber: number) =>
//                 formatNumber(pageNumber),
//               onChange: ({ page, pageSize }: any) => {
//                 if (page !== undefined)
//                   setQuery((prev) => ({ ...prev, page }));
//                 if (pageSize !== undefined)
//                   setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
//               },
//               size: "md",
//             } as any)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };




// //gg
// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   InlineLoading,
//   Pagination,
//   OverflowMenu,
//   OverflowMenuItem,
//   Tag,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
//   TableContainer,
// } from "@carbon/react";
// import { User } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
// import type {
//   EmployeeResponseDto,
//   EmployeeQueryDto,
// } from "../../types/employee";
// import { useHRUIStore } from "../../stores/hr-ui-store";
// import { EmployeePhotoPreview } from "./employee-photo-preview";

// interface EmployeeListProps {
//   departmentId?: string;
//   queryOverrides?: Partial<EmployeeQueryDto>;
// }

// export const EmployeeList: React.FC<EmployeeListProps> = ({
//   departmentId,
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-employees");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...(departmentId ? { departmentId } : {}),
//     ...queryOverrides,
//   });

//   const { openEditEmployee } = useHRUIStore();
//   const queryResult = useEmployees(query);
//   const deleteMutation = useDeleteEmployee();

//   useEffect(() => {
//     setQuery((prev) => {
//       const nextDept = departmentId || undefined;
//       if (prev.departmentId === nextDept && prev.page === 1) return prev;
//       return {
//         ...prev,
//         page: 1,
//         ...(nextDept ? { departmentId: nextDept } : { departmentId: undefined }),
//       };
//     });
//   }, [departmentId]);

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const employees = (data?.data ?? []) as EmployeeResponseDto[];
//   const pagination = data?.pagination;

//   // Convert numbers to Nepali digits when locale is 'ne'
//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
//       return String(n)
//         .split("")
//         .map((ch) => (/[0-9]/.test(ch) ? digits[Number(ch)] : ch))
//         .join("");
//     }
//     return String(n);
//   };

//   // Localize dropdown options for per-page items (12, 24, 48, 96)
//   const localizedPageSizes = locale === "ne"
//     ? [12, 24, 48, 96].map((n) => ({
//         text: formatNumber(n),
//         value: n,
//       }))
//     : [12, 24, 48, 96].map((n) => ({
//         text: String(n),
//         value: n,
//       }));

//   if (queryResult.isLoading && employees.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="employee-list">
//       {employees.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.photo.label")}</TableHeader>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("form.position.label")}</TableHeader>
//                 <TableHeader>{t("form.department.label")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>
//                     <div className="employee-photo-table-cell">
//                       <EmployeePhotoPreview
//                         mediaId={emp.photoMediaId}
//                         directUrl={emp.photo?.presignedUrl}
//                         alt={`${
//                           emp.name?.[locale as "en" | "ne"] ||
//                           emp.name?.en ||
//                           emp.name?.ne ||
//                           ""
//                         } photo`}
//                         className="employee-photo-table"
//                       />
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.name?.[locale as "en" | "ne"] ||
//                       emp.name?.en ||
//                       emp.name?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.position?.[locale as "en" | "ne"] ||
//                       emp.position?.en ||
//                       emp.position?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.department?.departmentName?.[
//                       locale as "en" | "ne"
//                     ] ||
//                       emp.department?.departmentName?.en ||
//                       emp.department?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell>
//                     <Tag type={emp.isActive ? "green" : "gray"} size="sm">
//                       {emp.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="employee-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditEmployee(emp)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(emp.id)}
//                       />
//                     </OverflowMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-state-content">
//             <div className="empty-state-icon">
//               <User size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
//             <p className="empty-state-description">
//               {t("list.noEmployeesDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && employees.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={query.page || pagination.page}
//             pageSize={query.limit || pagination.limit}
//             // ✅ Localized sizes now show १२, २४, ४८, ९६ in Nepali
//             pageSizes={localizedPageSizes.map((p) => p.value)}
//             totalItems={pagination.total}
//             itemsPerPageText={
//               locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page"
//             }
//             pageNumberText={locale === "ne" ? "पृष्ठ" : "Page"}
//             itemRangeText={(min, max, total) =>
//               `${formatNumber(min)}–${formatNumber(max)} ${
//                 locale === "ne" ? "मध्ये" : "of"
//               } ${formatNumber(total)}`
//             }
//             onChange={({ page, pageSize }: any) => {
//               if (page !== undefined)
//                 setQuery((prev) => ({ ...prev, page }));
//               if (pageSize !== undefined)
//                 setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
//             }}
//             size="md"
//           />
//         </div>
//       )}
//     </div>
//   );
// };




// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   InlineLoading,
//   Pagination,
//   OverflowMenu,
//   OverflowMenuItem,
//   Tag,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
//   TableContainer,
// } from "@carbon/react";
// import { User } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
// import type {
//   EmployeeResponseDto,
//   EmployeeQueryDto,
// } from "../../types/employee";
// import { useHRUIStore } from "../../stores/hr-ui-store";
// import { EmployeePhotoPreview } from "./employee-photo-preview";

// interface EmployeeListProps {
//   departmentId?: string;
//   queryOverrides?: Partial<EmployeeQueryDto>;
// }

// export const EmployeeList: React.FC<EmployeeListProps> = ({
//   departmentId,
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-employees");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...(departmentId ? { departmentId } : {}),
//     ...queryOverrides,
//   });

//   const { openEditEmployee } = useHRUIStore();
//   const queryResult = useEmployees(query);
//   const deleteMutation = useDeleteEmployee();

//   const data = queryResult.data;
//   const employees = (data?.data ?? []) as EmployeeResponseDto[];
//   const pagination = data?.pagination;

//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०","१","२","३","४","५","६","७","८","९"];
//       return String(n).replace(/[0-9]/g, (ch) => digits[Number(ch)]);
//     }
//     return String(n);
//   };

//   const localizedPageSizes = locale === "ne"
//     ? [12, 24, 48, 96].map((n) => ({ text: formatNumber(n), value: n }))
//     : [12, 24, 48, 96].map((n) => ({ text: String(n), value: n }));

//   if (queryResult.isLoading && employees.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="employee-list">
//       {employees.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.photo.label")}</TableHeader>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("form.position.label")}</TableHeader>
//                 <TableHeader>{t("form.department.label")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>
//                     <div className="employee-photo-table-cell">
//                       <EmployeePhotoPreview
//                         mediaId={emp.photoMediaId}
//                         directUrl={emp.photo?.presignedUrl}
//                         alt={`${
//                           emp.name?.[locale as "en" | "ne"] ||
//                           emp.name?.en ||
//                           emp.name?.ne ||
//                           ""
//                         } photo`}
//                         className="employee-photo-table"
//                       />
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.name?.[locale as "en" | "ne"] ||
//                       emp.name?.en ||
//                       emp.name?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.position?.[locale as "en" | "ne"] ||
//                       emp.position?.en ||
//                       emp.position?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.department?.departmentName?.[
//                       locale as "en" | "ne"
//                     ] ||
//                       emp.department?.departmentName?.en ||
//                       emp.department?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell>
//                     <Tag type={emp.isActive ? "green" : "gray"} size="sm">
//                       {emp.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="employee-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditEmployee(emp)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(emp.id)}
//                       />
//                     </OverflowMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-state-content">
//             <div className="empty-state-icon">
//               <User size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
//             <p className="empty-state-description">
//               {t("list.noEmployeesDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && employees.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={query.page || pagination.page}
//             pageSize={query.limit || pagination.limit}
//             pageSizes={localizedPageSizes.map((p) => p.value)}
//             totalItems={pagination.total}
//             itemsPerPageText={
//               locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page"
//             }
//             pageNumberText={locale === "ne" ? "पृष्ठ" : "Page"}
//             itemRangeText={(min, max, total) =>
//               `${formatNumber(min)}–${formatNumber(max)} ${
//                 locale === "ne" ? "मध्ये" : "of"
//               } ${formatNumber(total)}`
//             }
//             onChange={({ page, pageSize }: any) => {
//               if (page !== undefined)
//                 setQuery((prev) => ({ ...prev, page }));
//               if (pageSize !== undefined)
//                 setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
//             }}
//             size="md"
//           />
//         </div>
//       )}

//       {/* ✅ Add the same patch effect */}
//       <PaginationNepaliFix locale={locale} />
//     </div>
//   );
// };

// // ✅ Reuse the same component
// const PaginationNepaliFix = ({ locale }: { locale: string }) => {
//   useEffect(() => {
//     if (locale !== "ne") return;

//     const digitMap: Record<string, string> = {
//       "0": "०",
//       "1": "१",
//       "2": "२",
//       "3": "३",
//       "4": "४",
//       "5": "५",
//       "6": "६",
//       "7": "७",
//       "8": "८",
//       "9": "९",
//     };

//     const convertToNepali = (text: string) =>
//       text.replace(/[0-9]/g, (d) => digitMap[d] || d);

//     document.querySelectorAll(".cds--pagination__button, .cds--select-option, .cds--pagination__text").forEach((el) => {
//       el.childNodes.forEach((n) => {
//         if (n.nodeType === Node.TEXT_NODE) {
//           n.textContent = convertToNepali(n.textContent || "");
//         }
//       });
//     });
//   }, [locale]);

//   return null;
// };



// "use client";

// import React, { useEffect, useState } from "react";
// import {
//   InlineLoading,
//   Pagination,
//   OverflowMenu,
//   OverflowMenuItem,
//   Tag,
//   Table,
//   TableHead,
//   TableRow,
//   TableHeader,
//   TableBody,
//   TableCell,
//   TableContainer,
// } from "@carbon/react";
// import { User } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
// import type {
//   EmployeeResponseDto,
//   EmployeeQueryDto,
// } from "../../types/employee";
// import { useHRUIStore } from "../../stores/hr-ui-store";
// import { EmployeePhotoPreview } from "./employee-photo-preview";

// interface EmployeeListProps {
//   departmentId?: string;
//   queryOverrides?: Partial<EmployeeQueryDto>;
// }

// export const EmployeeList: React.FC<EmployeeListProps> = ({
//   departmentId,
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-employees");
//   const locale = useLocale();

//   const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...(departmentId ? { departmentId } : {}),
//     ...queryOverrides,
//   });

//   const { openEditEmployee } = useHRUIStore();
//   const queryResult = useEmployees(query);
//   const deleteMutation = useDeleteEmployee();

//   const data = queryResult.data;
//   const employees = (data?.data ?? []) as EmployeeResponseDto[];
//   const pagination = data?.pagination;

//   // ✅ Safe number-to-Nepali formatter
//   const formatNumber = (n: number | string): string => {
//     if (locale === "ne") {
//       const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
//       return String(n).replace(/[0-9]/g, (ch) => {
//         const idx = Number(ch);
//         return Number.isNaN(idx) ? ch : digits[idx] ?? ch;
//       });
//     }
//     return String(n);
//   };

//   const localizedPageSizes =
//     locale === "ne"
//       ? [12, 24, 48, 96].map((n) => ({ text: formatNumber(n), value: n }))
//       : [12, 24, 48, 96].map((n) => ({ text: String(n), value: n }));

//   if (queryResult.isLoading && employees.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="employee-list">
//       {employees.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.photo.label")}</TableHeader>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("form.position.label")}</TableHeader>
//                 <TableHeader>{t("form.department.label")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>
//                     <div className="employee-photo-table-cell">
//                       <EmployeePhotoPreview
//                         mediaId={emp.photoMediaId}
//                         directUrl={emp.photo?.presignedUrl}
//                         alt={`${
//                           emp.name?.[locale as "en" | "ne"] ||
//                           emp.name?.en ||
//                           emp.name?.ne ||
//                           ""
//                         } photo`}
//                         className="employee-photo-table"
//                       />
//                     </div>
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.name?.[locale as "en" | "ne"] ||
//                       emp.name?.en ||
//                       emp.name?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.position?.[locale as "en" | "ne"] ||
//                       emp.position?.en ||
//                       emp.position?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {emp.department?.departmentName?.[
//                       locale as "en" | "ne"
//                     ] ||
//                       emp.department?.departmentName?.en ||
//                       emp.department?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell>
//                     <Tag type={emp.isActive ? "green" : "gray"} size="sm">
//                       {emp.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="employee-list-actions-cell">
//                     <OverflowMenu
//                       flipped
//                       size="sm"
//                       aria-label={t("card.actions")}
//                     >
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditEmployee(emp)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(emp.id)}
//                       />
//                     </OverflowMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <div className="empty-state">
//           <div className="empty-state-content">
//             <div className="empty-state-icon">
//               <User size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
//             <p className="empty-state-description">
//               {t("list.noEmployeesDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && employees.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={query.page || pagination.page}
//             pageSize={query.limit || pagination.limit}
//             pageSizes={localizedPageSizes.map((p) => p.value)}
//             totalItems={pagination.total}
//             itemsPerPageText={
//               locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page"
//             }
//             pageNumberText={locale === "ne" ? "पृष्ठ" : "Page"}
//             itemRangeText={(min, max, total) =>
//               `${formatNumber(min)}–${formatNumber(max)} ${
//                 locale === "ne" ? "मध्ये" : "of"
//               } ${formatNumber(total)}`
//             }
//             onChange={({ page, pageSize }: any) => {
//               if (page !== undefined)
//                 setQuery((prev) => ({ ...prev, page }));
//               if (pageSize !== undefined)
//                 setQuery((prev) => ({
//                   ...prev,
//                   limit: pageSize,
//                   page: 1,
//                 }));
//             }}
//             size="md"
//           />
//         </div>
//       )}

//       {/* ✅ Add the pagination fix hook */}
//       <PaginationNepaliFix locale={locale} />
//     </div>
//   );
// };

// // ✅ Nepali number conversion hook for Carbon pagination
// const PaginationNepaliFix = ({ locale }: { locale: string }) => {
//   useEffect(() => {
//     if (locale !== "ne") return;

//     const digitMap: Record<string, string> = {
//       "0": "०",
//       "1": "१",
//       "2": "२",
//       "3": "३",
//       "4": "४",
//       "5": "५",
//       "6": "६",
//       "7": "७",
//       "8": "८",
//       "9": "९",
//     };

//     const convertToNepali = (text: string): string =>
//       text.replace(/[0-9]/g, (d) => digitMap[d] || d);

//     const updatePaginationText = () => {
//       document
//         .querySelectorAll(
//           ".cds--pagination__button, .cds--select-option, .cds--pagination__text"
//         )
//         .forEach((el) => {
//           el.childNodes.forEach((n) => {
//             if (n.nodeType === Node.TEXT_NODE) {
//               n.textContent = convertToNepali(n.textContent || "");
//             }
//           });
//         });
//     };

//     // Run once after render, and again after dropdown opens
//     const observer = new MutationObserver(updatePaginationText);
//     observer.observe(document.body, {
//       subtree: true,
//       childList: true,
//     });

//     updatePaginationText();

//     return () => observer.disconnect();
//   }, [locale]);

//   return null;
// };




//lll
"use client";

import React, { useEffect, useState } from "react";
import {
  InlineLoading,
  Pagination,
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
} from "@carbon/react";
import { User } from "@carbon/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { useDeleteEmployee, useEmployees } from "../../hooks/use-hr-queries";
import type {
  EmployeeResponseDto,
  EmployeeQueryDto,
} from "../../types/employee";
import { useHRUIStore } from "../../stores/hr-ui-store";
import { EmployeePhotoPreview } from "./employee-photo-preview";

interface EmployeeListProps {
  departmentId?: string;
  queryOverrides?: Partial<EmployeeQueryDto>;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  departmentId,
  queryOverrides = {},
}) => {
  const t = useTranslations("hr-employees");
  const locale = useLocale();

  const [query, setQuery] = useState<Partial<EmployeeQueryDto>>({
    page: 1,
    limit: 12,
    ...(departmentId ? { departmentId } : {}),
    ...queryOverrides,
  });

  const { openEditEmployee } = useHRUIStore();
  const queryResult = useEmployees(query);
  const deleteMutation = useDeleteEmployee();

  const data = queryResult.data;
  const employees = (data?.data ?? []) as EmployeeResponseDto[];
  const pagination = data?.pagination;

  // ✅ Convert to Nepali digits
  const formatNumber = (n: number | string): string => {
    if (locale === "ne") {
      const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
      return String(n).replace(/[0-9]/g, (ch) => {
        const idx = Number(ch);
        return Number.isNaN(idx) ? ch : digits[idx] ?? ch;
      });
    }
    return String(n);
  };

  const localizedPageSizes =
    locale === "ne"
      ? [12, 24, 48, 96].map((n) => ({ text: formatNumber(n), value: n }))
      : [12, 24, 48, 96].map((n) => ({ text: String(n), value: n }));

  if (queryResult.isLoading && employees.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="employee-list">
      {employees.length > 0 ? (
        <TableContainer title={t("list.title")} description={t("subtitle")}>
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{t("form.photo.label")}</TableHeader>
                <TableHeader>{t("form.name.label")}</TableHeader>
                <TableHeader>{t("form.position.label")}</TableHeader>
                <TableHeader>{t("form.department.label")}</TableHeader>
                <TableHeader>{t("card.active")}</TableHeader>
                <TableHeader>{t("card.actions")}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="employee-photo-table-cell">
                      <EmployeePhotoPreview
                        mediaId={emp.photoMediaId}
                        directUrl={emp.photo?.presignedUrl}
                        alt={`${
                          emp.name?.[locale as "en" | "ne"] ||
                          emp.name?.en ||
                          emp.name?.ne ||
                          ""
                        } photo`}
                        className="employee-photo-table"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.name?.[locale as "en" | "ne"] ||
                      emp.name?.en ||
                      emp.name?.ne}
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.position?.[locale as "en" | "ne"] ||
                      emp.position?.en ||
                      emp.position?.ne ||
                      ""}
                  </TableCell>
                  <TableCell className="font-en">
                    {emp.department?.departmentName?.[
                      locale as "en" | "ne"
                    ] ||
                      emp.department?.departmentName?.en ||
                      emp.department?.departmentName?.ne ||
                      ""}
                  </TableCell>
                  <TableCell>
                    <Tag type={emp.isActive ? "green" : "gray"} size="sm">
                      {emp.isActive ? t("card.active") : t("card.inactive")}
                    </Tag>
                  </TableCell>
                  <TableCell className="employee-list-actions-cell">
                    <OverflowMenu
                      flipped
                      size="sm"
                      aria-label={t("card.actions")}
                    >
                      <OverflowMenuItem
                        itemText={t("card.edit")}
                        onClick={() => openEditEmployee(emp)}
                      />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={t("card.delete")}
                        onClick={() => deleteMutation.mutate(emp.id)}
                      />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <User size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.noEmployees")}</h3>
            <p className="empty-state-description">
              {t("list.noEmployeesDescription")}
            </p>
          </div>
        </div>
      )}

      {!!pagination && employees.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={query.page || pagination.page}
            pageSize={query.limit || pagination.limit}
            pageSizes={localizedPageSizes.map((p) => p.value)}
            totalItems={pagination.total}
            itemsPerPageText={
              locale === "ne" ? "प्रति पृष्ठ वस्तुहरू" : "Items per page"
            }
            pageNumberText={locale === "ne" ? "पृष्ठ" : "Page"}
            itemRangeText={(min, max, total) =>
              `${formatNumber(min)}–${formatNumber(max)} ${
                locale === "ne" ? "मध्ये" : "of"
              } ${formatNumber(total)}`
            }
            onChange={({ page, pageSize }: any) => {
              if (page !== undefined)
                setQuery((prev) => ({ ...prev, page }));
              if (pageSize !== undefined)
                setQuery((prev) => ({
                  ...prev,
                  limit: pageSize,
                  page: 1,
                }));
            }}
            size="md"
          />
        </div>
      )}

      <PaginationNepaliFix locale={locale} />
    </div>
  );
};

// ✅ Nepali number + text patch for Carbon pagination
const PaginationNepaliFix = ({ locale }: { locale: string }) => {
  useEffect(() => {
    if (locale !== "ne") return;

    const digitMap: Record<string, string> = {
      "0": "०",
      "1": "१",
      "2": "२",
      "3": "३",
      "4": "४",
      "5": "५",
      "6": "६",
      "7": "७",
      "8": "८",
      "9": "९",
    };

    const convertToNepali = (text: string): string => {
      if (!text) return text;
      let result = text.replace(/[0-9]/g, (d) => digitMap[d] || d);
      result = result
        .replace(/\bof\b/gi, "मध्ये")
        .replace(/\bpage\b/gi, "पृष्ठ");
      return result;
    };

    const updatePaginationText = () => {
      document
        .querySelectorAll(
          ".cds--pagination__button, .cds--select-option, .cds--pagination__text"
        )
        .forEach((el) => {
          el.childNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) {
              n.textContent = convertToNepali(n.textContent || "");
            }
          });
        });
    };

    const observer = new MutationObserver(updatePaginationText);
    observer.observe(document.body, { subtree: true, childList: true });

    updatePaginationText();
    return () => observer.disconnect();
  }, [locale]);

  return null;
};
