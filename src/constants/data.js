import {
  UserCircleIcon,
  DocumentTextIcon,
  UsersIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";


export const features = [
    {
      icon: "🚀",
      title: "Instant Digital Policy",
      description:
        "Get your insurance policy instantly with our automated digital process. No paperwork needed.",
    },
    {
      icon: "🛡️",
      title: "Comprehensive Coverage",
      description:
        "Choose from a wide range of coverage options tailored to your vehicle's needs.",
    },
    {
      icon: "⚡",
      title: "Quick Claims",
      description:
        "File and track claims digitally with our streamlined claims processing system.",
    },
  ];

  export const customerMenuItems = [
    {
      name: "Profile",
      icon: UserCircleIcon,
      path: "/dashboard/settings",
    },
    {
      name: "Browse Policies",
      icon: DocumentTextIcon,
      path: "/dashboard/browse-policies",
    },
    {
      name: "My Policies",
      icon: ClipboardDocumentListIcon,
      path: "/dashboard/my-policies",
    },
    {
      name: "File a Claim",
      icon: DocumentTextIcon,
      path: "/dashboard/file-claim",
    },
    {
      name: "My Claims",
      icon: ClipboardDocumentListIcon, // Make sure to import this icon DocumentDuplicateIcon
      path: "/dashboard/claims",
    },
  ];

export const AgentMenuItems = [
  {
    name: "Profile",
    icon: UserCircleIcon,
    path: "/agentDashboard/profile",
  },
  {
    name: "Assigned Customers",
    icon: UsersIcon,
    path: "/agentDashboard/customers",
  },
  {
    name: "Create Policy",
    icon: DocumentPlusIcon,
    path: "/agentDashboard/create-policy",
  },
  {
    name: "My Policies",
    icon: ClipboardDocumentListIcon,
    path: "/agentDashboard/policies",
  },
  {
    name: "Claims Queue",
    icon: DocumentTextIcon,
    path: "/agentDashboard/claims",
  }
];

export const AdminMenuItems = [
  {
    name: "Customers",
    icon: UsersIcon,
    path: "/adminDashboard/customers"
  },
  {
    name: "Agents",
    icon: UserGroupIcon,
    path: "/adminDashboard/agents"
  },
  {
    name: "Template Policies",
    icon: DocumentTextIcon,
    path: "/adminDashboard/template-policies"
  },
  {
    name: "Customer Policies",
    icon: ClipboardDocumentListIcon,
    path: "/adminDashboard/customer-policies"
  },
  {
    name: "Claims",
    icon: DocumentTextIcon,
    path: "/adminDashboard/claims"
  },
];
