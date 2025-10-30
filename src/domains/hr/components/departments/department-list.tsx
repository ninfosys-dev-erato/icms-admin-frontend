// "use client";

// import React, { useEffect, useState } from "react";
// import "../../styles/hr.css";
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
// import { Building, User } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import {
//   useDeleteDepartment,
//   useDepartments,
// } from "../../hooks/use-hr-queries";
// import type {
//   DepartmentResponseDto,
//   DepartmentQueryDto,
// } from "../../types/department";
// import { useHRUIStore } from "../../stores/hr-ui-store";

// interface DepartmentListProps {
//   queryOverrides?: Partial<DepartmentQueryDto>;
// }

// export const DepartmentList: React.FC<DepartmentListProps> = ({
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-departments");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...queryOverrides,
//   });
//   const { openEditDepartment } = useHRUIStore();
//   const queryResult = useDepartments(query);
//   const deleteMutation = useDeleteDepartment();

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const departments = (data?.data ?? []) as DepartmentResponseDto[];
//   const pagination = data?.pagination;

//   // format numbers into Nepali digits when locale is 'ne'
//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०","१","२","३","४","५","६","७","८","९"];
//       return String(n)
//         .split("")
//         .map((ch) => (/[0-9]/.test(ch) ? digits[Number(ch)] : ch))
//         .join("");
//     }
//     return String(n);
//   };

//   if (queryResult.isLoading && departments.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="department-list">
//       {departments.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("card.parentDepartment")}</TableHeader>
//                 <TableHeader>{t("card.departmentHead")}</TableHeader>
//                 <TableHeader>{t("card.employeeCount")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {departments.map((dept) => (
//                 <TableRow key={dept.id}>
//                   <TableCell className="font-en">
//                     {dept.departmentName?.[locale as 'en' | 'ne'] || dept.departmentName?.en || dept.departmentName?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.parent?.departmentName?.[locale as 'en' | 'ne'] || dept.parent?.departmentName?.en || dept.parent?.departmentName?.ne || ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.departmentHead
//                       ? dept.departmentHead.name?.[locale as 'en' | 'ne'] || dept.departmentHead.name?.en || dept.departmentHead.name?.ne || ""
//                       : ""}
//                   </TableCell>
//                   <TableCell>{formatNumber(dept.employees?.length ?? 0)}</TableCell>
//                   <TableCell>
//                     <Tag type={dept.isActive ? "green" : "gray"} size="sm">
//                       {dept.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="department-list-actions-cell">
//                     <OverflowMenu
//                       flipped
//                       size="sm"
//                       aria-label={t("card.actions")}
//                     >
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditDepartment(dept)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(dept.id)}
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
//               <Building size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
//             <p className="empty-state-description">
//               {t("list.noDepartmentsDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && departments.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={pagination.page}
//             pageSize={pagination.limit}
//             pageSizes={[12, 24, 48, 96]}
//             totalItems={pagination.total}
//             onChange={({ page, pageSize }) => {
//               if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
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
// import "../../styles/hr.css";
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
// import { Building } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import {
//   useDeleteDepartment,
//   useDepartments,
// } from "../../hooks/use-hr-queries";
// import type {
//   DepartmentResponseDto,
//   DepartmentQueryDto,
// } from "../../types/department";
// import { useHRUIStore } from "../../stores/hr-ui-store";

// interface DepartmentListProps {
//   queryOverrides?: Partial<DepartmentQueryDto>;
// }

// export const DepartmentList: React.FC<DepartmentListProps> = ({
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-departments");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...queryOverrides,
//   });
//   const { openEditDepartment } = useHRUIStore();
//   const queryResult = useDepartments(query);
//   const deleteMutation = useDeleteDepartment();

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const departments = (data?.data ?? []) as DepartmentResponseDto[];
//   const pagination = data?.pagination;

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

//   if (queryResult.isLoading && departments.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="department-list">
//       {departments.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("card.parentDepartment")}</TableHeader>
//                 <TableHeader>{t("card.departmentHead")}</TableHeader>
//                 <TableHeader>{t("card.employeeCount")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {departments.map((dept) => (
//                 <TableRow key={dept.id}>
//                   <TableCell className="font-en">
//                     {dept.departmentName?.[locale as "en" | "ne"] ||
//                       dept.departmentName?.en ||
//                       dept.departmentName?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.parent?.departmentName?.[locale as "en" | "ne"] ||
//                       dept.parent?.departmentName?.en ||
//                       dept.parent?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.departmentHead
//                       ? dept.departmentHead.name?.[locale as "en" | "ne"] ||
//                         dept.departmentHead.name?.en ||
//                         dept.departmentHead.name?.ne ||
//                         ""
//                       : ""}
//                   </TableCell>
//                   <TableCell>{formatNumber(dept.employees?.length ?? 0)}</TableCell>
//                   <TableCell>
//                     <Tag type={dept.isActive ? "green" : "gray"} size="sm">
//                       {dept.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="department-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditDepartment(dept)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(dept.id)}
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
//               <Building size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
//             <p className="empty-state-description">
//               {t("list.noDepartmentsDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && departments.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             {...({
//               page: pagination.page,
//               pageSize: pagination.limit,
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




// ////gg
// "use client";

// import React, { useEffect, useState } from "react";
// import "../../styles/hr.css";
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
// import { Building } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import {
//   useDeleteDepartment,
//   useDepartments,
// } from "../../hooks/use-hr-queries";
// import type {
//   DepartmentResponseDto,
//   DepartmentQueryDto,
// } from "../../types/department";
// import { useHRUIStore } from "../../stores/hr-ui-store";

// interface DepartmentListProps {
//   queryOverrides?: Partial<DepartmentQueryDto>;
// }

// export const DepartmentList: React.FC<DepartmentListProps> = ({
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-departments");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...queryOverrides,
//   });
//   const { openEditDepartment } = useHRUIStore();
//   const queryResult = useDepartments(query);
//   const deleteMutation = useDeleteDepartment();

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const departments = (data?.data ?? []) as DepartmentResponseDto[];
//   const pagination = data?.pagination;

//   // convert numbers to Nepali digits
//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०","१","२","३","४","५","६","७","८","९"];
//       return String(n)
//         .split("")
//         .map((ch) => (/[0-9]/.test(ch) ? digits[Number(ch)] : ch))
//         .join("");
//     }
//     return String(n);
//   };

//   // Convert the available pageSizes themselves into Nepali digits
//   const localizedPageSizes = locale === "ne"
//     ? [12, 24, 48, 96].map((n) => ({
//         text: formatNumber(n),
//         value: n,
//       }))
//     : [12, 24, 48, 96].map((n) => ({
//         text: String(n),
//         value: n,
//       }));

//   if (queryResult.isLoading && departments.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="department-list">
//       {departments.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("card.parentDepartment")}</TableHeader>
//                 <TableHeader>{t("card.departmentHead")}</TableHeader>
//                 <TableHeader>{t("card.employeeCount")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {departments.map((dept) => (
//                 <TableRow key={dept.id}>
//                   <TableCell className="font-en">
//                     {dept.departmentName?.[locale as "en" | "ne"] ||
//                       dept.departmentName?.en ||
//                       dept.departmentName?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.parent?.departmentName?.[locale as "en" | "ne"] ||
//                       dept.parent?.departmentName?.en ||
//                       dept.parent?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.departmentHead
//                       ? dept.departmentHead.name?.[locale as "en" | "ne"] ||
//                         dept.departmentHead.name?.en ||
//                         dept.departmentHead.name?.ne ||
//                         ""
//                       : ""}
//                   </TableCell>
//                   <TableCell>{formatNumber(dept.employees?.length ?? 0)}</TableCell>
//                   <TableCell>
//                     <Tag type={dept.isActive ? "green" : "gray"} size="sm">
//                       {dept.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="department-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditDepartment(dept)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(dept.id)}
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
//               <Building size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
//             <p className="empty-state-description">
//               {t("list.noDepartmentsDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && departments.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             // ✅ Use normal props only (no renderPageSizeMenuItemText / renderPageNumberText)
//             page={pagination.page}
//             pageSize={pagination.limit}
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
//               if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
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




// //new
// "use client";

// import React, { useEffect, useState } from "react";
// import "../../styles/hr.css";
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
// import { Building } from "@carbon/icons-react";
// import { useTranslations, useLocale } from "next-intl";
// import {
//   useDeleteDepartment,
//   useDepartments,
// } from "../../hooks/use-hr-queries";
// import type {
//   DepartmentResponseDto,
//   DepartmentQueryDto,
// } from "../../types/department";
// import { useHRUIStore } from "../../stores/hr-ui-store";

// interface DepartmentListProps {
//   queryOverrides?: Partial<DepartmentQueryDto>;
// }

// export const DepartmentList: React.FC<DepartmentListProps> = ({
//   queryOverrides = {},
// }) => {
//   const t = useTranslations("hr-departments");
//   const locale = useLocale();
//   const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
//     page: 1,
//     limit: 12,
//     ...queryOverrides,
//   });
//   const { openEditDepartment } = useHRUIStore();
//   const queryResult = useDepartments(query);
//   const deleteMutation = useDeleteDepartment();

//   useEffect(() => {
//     setQuery((prev) => {
//       const next = { ...prev, page: 1, ...queryOverrides };
//       const changed =
//         JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
//       return changed ? next : prev;
//     });
//   }, [JSON.stringify(queryOverrides)]);

//   const data = queryResult.data;
//   const departments = (data?.data ?? []) as DepartmentResponseDto[];
//   const pagination = data?.pagination;

//   const formatNumber = (n: number | string) => {
//     if (locale === "ne") {
//       const digits = ["०","१","२","३","४","५","६","७","८","९"];
//       return String(n)
//         .split("")
//         .map((ch) => (/[0-9]/.test(ch) ? digits[Number(ch)] : ch))
//         .join("");
//     }
//     return String(n);
//   };

//   const localizedPageSizes = locale === "ne"
//     ? [12, 24, 48, 96].map((n) => ({ text: formatNumber(n), value: n }))
//     : [12, 24, 48, 96].map((n) => ({ text: String(n), value: n }));

//   if (queryResult.isLoading && departments.length === 0) {
//     return (
//       <div className="loading-container">
//         <InlineLoading description={t("status.loading")} />
//       </div>
//     );
//   }

//   return (
//     <div className="department-list">
//       {departments.length > 0 ? (
//         <TableContainer title={t("list.title")} description={t("subtitle")}>
//           <Table size="md" useZebraStyles>
//             <TableHead>
//               <TableRow>
//                 <TableHeader>{t("form.name.label")}</TableHeader>
//                 <TableHeader>{t("card.parentDepartment")}</TableHeader>
//                 <TableHeader>{t("card.departmentHead")}</TableHeader>
//                 <TableHeader>{t("card.employeeCount")}</TableHeader>
//                 <TableHeader>{t("card.active")}</TableHeader>
//                 <TableHeader>{t("card.actions")}</TableHeader>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {departments.map((dept) => (
//                 <TableRow key={dept.id}>
//                   <TableCell className="font-en">
//                     {dept.departmentName?.[locale as "en" | "ne"] ||
//                       dept.departmentName?.en ||
//                       dept.departmentName?.ne}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.parent?.departmentName?.[locale as "en" | "ne"] ||
//                       dept.parent?.departmentName?.en ||
//                       dept.parent?.departmentName?.ne ||
//                       ""}
//                   </TableCell>
//                   <TableCell className="font-en">
//                     {dept.departmentHead
//                       ? dept.departmentHead.name?.[locale as "en" | "ne"] ||
//                         dept.departmentHead.name?.en ||
//                         dept.departmentHead.name?.ne ||
//                         ""
//                       : ""}
//                   </TableCell>
//                   <TableCell>{formatNumber(dept.employees?.length ?? 0)}</TableCell>
//                   <TableCell>
//                     <Tag type={dept.isActive ? "green" : "gray"} size="sm">
//                       {dept.isActive ? t("card.active") : t("card.inactive")}
//                     </Tag>
//                   </TableCell>
//                   <TableCell className="department-list-actions-cell">
//                     <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
//                       <OverflowMenuItem
//                         itemText={t("card.edit")}
//                         onClick={() => openEditDepartment(dept)}
//                       />
//                       <OverflowMenuItem
//                         hasDivider
//                         isDelete
//                         itemText={t("card.delete")}
//                         onClick={() => deleteMutation.mutate(dept.id)}
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
//               <Building size={48} />
//             </div>
//             <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
//             <p className="empty-state-description">
//               {t("list.noDepartmentsDescription")}
//             </p>
//           </div>
//         </div>
//       )}

//       {!!pagination && departments.length > 0 && (
//         <div className="pagination-container">
//           <Pagination
//             page={pagination.page}
//             pageSize={pagination.limit}
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
//               if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
//               if (pageSize !== undefined)
//                 setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
//             }}
//             size="md"
//           />
//         </div>
//       )}

//       {/* ✅ Add this effect below pagination */}
//       <PaginationNepaliFix locale={locale} />
//     </div>
//   );
// };

// // ✅ Reusable hook component for Nepali number patch
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




"use client";

import React, { useEffect, useState } from "react";
import "../../styles/hr.css";
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
import { Building } from "@carbon/icons-react";
import { useTranslations, useLocale } from "next-intl";
import {
  useDeleteDepartment,
  useDepartments,
} from "../../hooks/use-hr-queries";
import type {
  DepartmentResponseDto,
  DepartmentQueryDto,
} from "../../types/department";
import { useHRUIStore } from "../../stores/hr-ui-store";

interface DepartmentListProps {
  queryOverrides?: Partial<DepartmentQueryDto>;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  queryOverrides = {},
}) => {
  const t = useTranslations("hr-departments");
  const locale = useLocale();
  const [query, setQuery] = useState<Partial<DepartmentQueryDto>>({
    page: 1,
    limit: 12,
    ...queryOverrides,
  });

  const { openEditDepartment } = useHRUIStore();
  const queryResult = useDepartments(query);
  const deleteMutation = useDeleteDepartment();

  useEffect(() => {
    setQuery((prev) => {
      const next = { ...prev, page: 1, ...queryOverrides };
      const changed =
        JSON.stringify({ ...prev, page: 1 }) !== JSON.stringify(next);
      return changed ? next : prev;
    });
  }, [JSON.stringify(queryOverrides)]);

  const data = queryResult.data;
  const departments = (data?.data ?? []) as DepartmentResponseDto[];
  const pagination = data?.pagination;

  const formatNumber = (n: number | string) => {
    if (locale === "ne") {
      const digits = ["०","१","२","३","४","५","६","७","८","९"];
      return String(n).replace(/[0-9]/g, (ch) => digits[Number(ch)] || ch);
    }
    return String(n);
  };

  const localizedPageSizes =
    locale === "ne"
      ? [12, 24, 48, 96].map((n) => ({ text: formatNumber(n), value: n }))
      : [12, 24, 48, 96].map((n) => ({ text: String(n), value: n }));

  if (queryResult.isLoading && departments.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t("status.loading")} />
      </div>
    );
  }

  return (
    <div className="department-list">
      {departments.length > 0 ? (
        <TableContainer title={t("list.title")} description={t("subtitle")}>
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{t("form.name.label")}</TableHeader>
                <TableHeader>{t("card.parentDepartment")}</TableHeader>
                <TableHeader>{t("card.departmentHead")}</TableHeader>
                <TableHeader>{t("card.employeeCount")}</TableHeader>
                <TableHeader>{t("card.active")}</TableHeader>
                <TableHeader>{t("card.actions")}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-en">
                    {dept.departmentName?.[locale as "en" | "ne"] ||
                      dept.departmentName?.en ||
                      dept.departmentName?.ne}
                  </TableCell>
                  <TableCell className="font-en">
                    {dept.parent?.departmentName?.[locale as "en" | "ne"] ||
                      dept.parent?.departmentName?.en ||
                      dept.parent?.departmentName?.ne ||
                      ""}
                  </TableCell>
                  <TableCell className="font-en">
                    {dept.departmentHead
                      ? dept.departmentHead.name?.[locale as "en" | "ne"] ||
                        dept.departmentHead.name?.en ||
                        dept.departmentHead.name?.ne ||
                        ""
                      : ""}
                  </TableCell>
                  <TableCell>{formatNumber(dept.employees?.length ?? 0)}</TableCell>
                  <TableCell>
                    <Tag type={dept.isActive ? "green" : "gray"} size="sm">
                      {dept.isActive ? t("card.active") : t("card.inactive")}
                    </Tag>
                  </TableCell>
                  <TableCell className="department-list-actions-cell">
                    <OverflowMenu flipped size="sm" aria-label={t("card.actions")}>
                      <OverflowMenuItem
                        itemText={t("card.edit")}
                        onClick={() => openEditDepartment(dept)}
                      />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={t("card.delete")}
                        onClick={() => deleteMutation.mutate(dept.id)}
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
              <Building size={48} />
            </div>
            <h3 className="empty-state-title">{t("list.noDepartments")}</h3>
            <p className="empty-state-description">
              {t("list.noDepartmentsDescription")}
            </p>
          </div>
        </div>
      )}

      {!!pagination && departments.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
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
              if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
              if (pageSize !== undefined)
                setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
            }}
            size="md"
          />
        </div>
      )}

      <PaginationNepaliFix locale={locale} />
    </div>
  );
};

// ✅ Shared Pagination localization hook
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
