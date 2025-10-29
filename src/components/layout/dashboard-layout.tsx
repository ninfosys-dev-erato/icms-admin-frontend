
"use client";

import React, { ReactNode } from "react";
import {
  Theme,
  Content,
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderGlobalBar,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
  HeaderMenuButton,
} from "@carbon/react";
import {
  Dashboard,
  Document,
  Image,
  Folder,
  User,
  Settings,
  Home,
  Menu,
  Building,
  Link,
  Language,
} from "@carbon/icons-react";
// Using IBM Products for advanced page components, not terminal
import { PageHeader } from "@carbon/ibm-products";
import { useTranslations } from "next-intl";
import { usePathname } from "@/lib/i18n/routing";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { UserProfileMenu } from "@/shared/components/user-profile-menu";
import { NotificationCenter } from "@/shared/components/notification-center";
import { useLanguageFont } from "@/shared/hooks/use-language-font";
import { useUIStore } from "@/stores/ui-store";
import "./dashboard-layout.css";
import { useResponsive } from "@/shared/hooks/use-responsive";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  translationKey?: string;
  icon?: React.ComponentType<any>;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const { isNepali } = useLanguageFont();
  const t = useTranslations();
  const pathname = usePathname();
  const { theme, setSideNavExpanded } = useUIStore();
  const { isDesktop } = useResponsive();

  // Navigation items configuration
  const navigationItems: NavigationItem[] = [
    // {
    //   href: "/admin/dashboard",
    //   label: t("nav.dashboard"),
    //   translationKey: "nav.dashboard",
    //   // icon: Dashboard,
    // },
    {
      href: "/admin/content-management",
      label: t("nav.contentManagement"),
      translationKey: "nav.contentManagement",
      // icon: Document,
    },
    {
      // href: "/admin/dashboard/media",
      href: "/admin/media",
      label: t("nav.media"),
      translationKey: "nav.media",
      // icon: Image,
    },
    {
      // href: "/admin/dashboard/documents",
      href: "/admin/documents",
      label: t("nav.documents"),
      translationKey: "nav.documents",
      // icon: Folder,
    },
    {
      // href: "/admin/dashboard/human-resources",
      href: "/admin/human-resources",
      label: t("nav.humanResources"),
      translationKey: "nav.humanResources",
      // icon: User,
    },
    {
      // href: "/admin/dashboard/sliders",
      href: "/admin/sliders",
      label: t("nav.sliders"),
      translationKey: "nav.sliders",
      // icon: Image,
    },
    {
      // href: "/admin/dashboard/important-links",
      href: "/admin/important-links",
      label: t("nav.importantLinks"),
      translationKey: "nav.importantLinks",
      // icon: Link,
    },
    {
      // href: "/admin/dashboard/navigation",
      href: "/admin/navigation",
      label: t("nav.navigation"),
      translationKey: "nav.navigation",
      // icon: Menu,
    },
    {
      // href: "/admin/dashboard/headers",
      href: "/admin/headers",
      label: t("nav.headers"),
      translationKey: "nav.headers",
      // icon: Building,
    },
    {
      // href: "/admin/dashboard/office-settings",
      href: "/admin/office-settings",
      label: t("nav.officeSettings"),
      translationKey: "nav.officeSettings",
      // icon: Settings,
    },
    {
      // href: "/admin/dashboard/office-descriptions",
      href: "/admin/office-descriptions",
      label: t("nav.officeDescriptions"),
      translationKey: "nav.officeDescriptions",
      // icon: Document,
    },
    {
      // href: "/admin/dashboard/user-settings",
      href: "/admin/user-settings",
      label: t("nav.users"),
      translationKey: "nav.users",
      // icon: User,
    },
    {
      // href: "/admin/dashboard/internationalization",
      href: "/admin/internationalization",
      label: t("nav.internationalization"),
      translationKey: "nav.internationalization",
      // icon: Language,
    },
  ];

  // Check if a navigation item is active
  const isActive = (href: string) => {
  //   if (href === "/admin/dashboard") {
  //     return pathname === "/admin/dashboard";
  //   }
  //   return pathname.startsWith(href);
  // };
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <Theme theme={theme}>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header aria-label="iCMS">
              <SkipToContent href="#main-content" />
              <HeaderMenuButton
                aria-label="Open menu"
                isActive={isSideNavExpanded}
                onClick={() => {
                  onClickSideNavExpand();
                  setSideNavExpanded(!isSideNavExpanded);
                }}
              />
              {/* <HeaderName href="/admin/dashbaord" prefix=""> */}
              <HeaderName href="/admin/content-management" prefix="">
                iCMS
              </HeaderName>
              <HeaderNavigation aria-label="iCMS" />
              <HeaderGlobalBar>
                <LanguageSwitcher variant="button" showLabels={false} />
                <NotificationCenter />
                <UserProfileMenu />
              </HeaderGlobalBar>
            </Header>
            {(isDesktop || isSideNavExpanded) && (
              <SideNav
                aria-label="Side navigation"
                expanded={isDesktop ? true : isSideNavExpanded}
                isFixedNav={isDesktop}
                isChildOfHeader={false}
                isRail={isDesktop}
                onOverlayClick={() => {
                  onClickSideNavExpand();
                  setSideNavExpanded(false);
                }}
              >
                <SideNavItems>
                  {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    const IconComponent = item.icon;
                    return (
                      <SideNavLink
                        key={item.href}
                        href={item.href}
                        isActive={active}
                        className="font-dynamic"
                        renderIcon={IconComponent ? () => <IconComponent size={16} /> : undefined}
                      >
                        {item.translationKey
                          ? (t as any)(item.translationKey, {
                              default: item.label,
                            })
                          : item.label}
                      </SideNavLink>
                    );
                  })}
                </SideNavItems>
              </SideNav>
            )}
            <Content id="main-content" tabIndex={-1}>
              {children}
            </Content>
          </>
        )}
      />
    </Theme>
  );
};
