// src/components/admin/AdminSidebar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  FileText,
  Brain,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const SIDEBAR_DATA = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    children: null,
  },
  {
    label: "Applications",
    icon: ClipboardList,
    children: [
      { label: "All Applications", path: "/admin/applications" },
      { label: "Submitted", path: "/admin/applications?status=submitted" },
      { label: "Under Review", path: "/admin/applications?status=under_review" },
      { label: "Verified", path: "/admin/applications?status=verified" },
      { label: "Admitted", path: "/admin/applications?status=admitted" },
      { label: "Rejected", path: "/admin/applications?status=rejected" },
    ],
  },
  {
    label: "Courses",
    icon: BookOpen,
    children: [
      { label: "All Courses", path: "/admin/courses" },
      { label: "Create Course", path: "/admin/courses/new" },
      { label: "Active Courses", path: "/admin/courses?status=active" },
      { label: "Inactive Courses", path: "/admin/courses?status=inactive" },
    ],
  },
  {
    label: "Forms",
    icon: FileText,
    children: [
      { label: "All Forms", path: "/admin/forms" },
      { label: "Create Form", path: "/admin/forms/new" }
    ],
  },
  {
    label: "Classification",
    icon: Brain,
    children: [
      { label: "Rules", path: "/admin/classification/rules" },
      { label: "Stats", path: "/admin/classification/stats" },
      { label: "Run Bulk Classification", path: "/admin/classification/run" },
    ],
  },
];

export default function AdminSidebar() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Fix #1: match on pathname AND query params, so siblings that share the
  // same base path (e.g. all the "Applications" filters) don't all light up
  // together. Exactly one child (the one whose query matches the current
  // URL) is considered active at a time.
  const isActive = (path) => {
    const [basePath, queryString] = path.split("?");

    if (pathname !== basePath) return false;

    if (queryString) {
      const targetParams = new URLSearchParams(queryString);
      const currentParams = new URLSearchParams(search);
      for (const [key, value] of targetParams.entries()) {
        if (currentParams.get(key) !== value) return false;
      }
      return true;
    }

    // Target has no query string -> only active if current URL also has none
    // (otherwise "All Applications" would stay highlighted under every filter)
    return search === "";
  };

  const [collapsed, setCollapsed] = useState(false);

  const computeExpanded = () => {
    const expanded = {};
    SIDEBAR_DATA.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => isActive(child.path));
        if (hasActiveChild) expanded[item.label] = true;
      }
    });
    return expanded;
  };

  const [expandedSections, setExpandedSections] = useState(computeExpanded);

  // Keep the correct section expanded whenever the route changes - this also
  // covers the case from fix #2, where a collapsed-sidebar click jumps
  // straight to a child route and the section should show as expanded/active
  // once the sidebar is opened again.
  useEffect(() => {
    setExpandedSections((prev) => ({ ...prev, ...computeExpanded }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  const [flyoutSection, setFlyoutSection] = useState(null);
  const flyoutTimer = useRef(null);

  const toggleSection = (label) => {
    if (collapsed) return;
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Fix #2: clicking a dropdown's icon while the sidebar is collapsed now
  // navigates to that section's first child instead of doing nothing.
  const handleParentClick = (item) => {
    if (collapsed) {
      if (item.children && item.children.length > 0) {
        navigate(item.children[0].path);
      }
      return;
    }
    toggleSection(item.label);
  };

  const handleMouseEnter = (label) => {
    if (!collapsed) return;
    clearTimeout(flyoutTimer.current);
    flyoutTimer.current = setTimeout(() => setFlyoutSection(label), 200);
  };

  const handleMouseLeave = () => {
    clearTimeout(flyoutTimer.current);
    setFlyoutSection(null);
  };

  // Flyout rendering
  const renderFlyout = (item) => {
    if (!collapsed || flyoutSection !== item.label) return null;
    return (
      <div
        className="absolute left-full top-0 ml-1 w-48 bg-[#1E2128] border border-white/10 rounded-lg shadow-xl py-1 z-50"
        onMouseEnter={() => clearTimeout(flyoutTimer.current)}
        onMouseLeave={handleMouseLeave}
      >
        {item.children.map((child) => (
          <Link
            key={child.path}
            to={child.path}
            className={`block px-4 py-2 text-sm transition ${isActive(child.path)
              ? "bg-accent/20 text-accent font-medium"
              : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            onClick={() => setFlyoutSection(null)}
          >
            {child.label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <aside
      className={`relative bg-[#1E2128] text-white min-h-[calc(100vh-80px)] shrink-0 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-60"
        }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition shadow-md z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="pt-8 flex-1 overflow-y-auto relative">
        {SIDEBAR_DATA.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedSections[item.label];
          const Icon = item.icon;
          const active = !hasChildren && isActive(item.path);
          const hasActiveChild =
            hasChildren && item.children.some((child) => isActive(child.path));

          // Direct link (Dashboard)
          if (!hasChildren) {
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`relative flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-md mx-2 ${active
                  ? "bg-accent/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  } ${collapsed ? "justify-center" : "px-4"}`}
                title={collapsed ? item.label : ""}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-accent rounded-r" />
                )}
                <Icon size={19} className={active ? "text-accent" : "text-white/40"} />
                {!collapsed && <span className="text-[15px] font-medium">{item.label}</span>}
              </Link>
            );
          }

          // Expandable section
          return (
            <div
              key={item.label}
              className="relative mx-2"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Parent button – no background, only hover, but icon reflects active child */}
              <button
                onClick={() => handleParentClick(item)}
                className={`w-full relative flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-md ${isExpanded
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  } ${collapsed ? "justify-center" : "px-4"}`}
                title={collapsed ? item.label : ""}
              >
                {hasActiveChild && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[3px] bg-accent rounded-r" />
                )}
                <Icon size={19} className={hasActiveChild ? "text-accent" : "text-white/40"} />
                {!collapsed && (
                  <>
                    <span className="text-[15px] font-medium flex-1 text-left">{item.label}</span>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-white/40" />
                    ) : (
                      <ChevronRight size={16} className="text-white/40" />
                    )}
                  </>
                )}
              </button>

              {/* Children (expanded mode) */}
              {!collapsed && isExpanded && (
                <div className="ml-4 pl-2 border-l border-white/10">
                  {item.children.map((child) => {
                    const childActive = isActive(child.path);
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 my-0.5 rounded-md text-sm transition-all duration-200 ${childActive
                          ? "bg-accent/20 text-accent font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Flyout (collapsed mode) */}
              {collapsed && renderFlyout(item)}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}