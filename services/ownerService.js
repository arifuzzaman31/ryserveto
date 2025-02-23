exports.propertyBy = async (userData) => {
  let dataId;
  switch (userData.userType) {
    case "CRM_EDITOR":
      dataId = "all";
      break;
    case "BUSINESS_OWNER":
      dataId = userData.id;
      break;
    case "BUSINESS_MANAGER":
      dataId = userData.ownerId;
      break;
    case "LISTING_MANAGER":
      dataId = userData.ownerId;
      break;
    default:
      break;
  }
  return dataId;
};

exports.allPermission = async () => {
  return [
    {
      name: "Property",
      permissions: [
        {
          id: 1,
          permission_name: "Property Create",
          slug: "property-create",
          status: 1,
        },
        {
          id: 2,
          permission_name: "Property View",
          slug: "property-view",
          status: 1,
        },
        {
          id: 3,
          permission_name: "Property Edit",
          slug: "property-edit",
          status: 1,
        },
        {
          id: 4,
          permission_name: "Property Delete",
          slug: "property-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Branch",
      permissions: [
        {
          id: 5,
          permission_name: "Branch Create",
          slug: "branch-create",
          status: 1,
        },
        {
          id: 6,
          permission_name: "Branch View",
          slug: "branch-view",
          status: 1,
        },
        {
          id: 7,
          permission_name: "Branch Edit",
          slug: "branch-edit",
          status: 1,
        },
        {
          id: 8,
          permission_name: "Branch Delete",
          slug: "branch-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Reservation",
      permissions: [
        {
          id: 9,
          permission_name: "View Reservation",
          slug: "reservation-view",
          status: 1,
        },
        {
          id: 10,
          permission_name: "Add Reservation",
          slug: "reservation-create",
          status: 1,
        },
        {
          id: 11,
          permission_name: "Edit Reservation",
          slug: "reservation-edit",
          status: 1,
        },
        {
          id: 12,
          permission_name: "Delete Reservation",
          slug: "reservation-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Report",
      permissions: [
        {
          id: 13,
          permission_name: "Report View",
          slug: "report-view",
          status: 1,
        },
        {
          id: 14,
          permission_name: "Revenue Report",
          slug: "revenue-report",
          status: 1,
        },
        {
          id: 15,
          permission_name: "Upcoming Report",
          slug: "upcoming-report",
          status: 1,
        },
        {
          id: 16,
          permission_name: "Complete Report",
          slug: "complete-report",
          status: 1,
        },
        {
          id: 17,
          permission_name: "Cancel Report",
          slug: "cancel-report",
          status: 1,
        },
      ],
    },
    {
      name: "Roles",
      permissions: [
        {
          id: 18,
          permission_name: "Role Create",
          slug: "role-create",
          status: 1,
        },
        {
          id: 19,
          permission_name: "Role View",
          slug: "role-view",
          status: 1,
        },
        {
          id: 20,
          permission_name: "Role Edit",
          slug: "role-edit",
          status: 1,
        },
        {
          id: 21,
          permission_name: "Role Delete",
          slug: "role-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Employee",
      permissions: [
        {
          id: 22,
          permission_name: "Employee Create",
          slug: "employee-create",
          status: 1,
        },
        {
          id: 23,
          permission_name: "Employee View",
          slug: "employee-view",
          status: 1,
        },
        {
          id: 24,
          permission_name: "Employee Edit",
          slug: "employee-edit",
          status: 1,
        },
        {
          id: 25,
          permission_name: "Employee Delete",
          slug: "employee-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Food",
      permissions: [
        {
          id: 26,
          permission_name: "Food Create",
          slug: "food-create",
          status: 1,
        },
        {
          id: 27,
          permission_name: "Food View",
          slug: "food-view",
          status: 1,
        },
        {
          id: 28,
          permission_name: "Food Edit",
          slug: "food-edit",
          status: 1,
        },
        {
          id: 29,
          permission_name: "Food Delete",
          slug: "food-delete",
          status: 1,
        },
      ],
    },
    {
      name: "Event",
      permissions: [
        {
          id: 30,
          permission_name: "Event Create",
          slug: "event-create",
          status: 1,
        },
        {
          id: 31,
          permission_name: "Event View",
          slug: "event-view",
          status: 1,
        },
        {
          id: 32,
          permission_name: "Event Edit",
          slug: "event-edit",
          status: 1,
        },
        {
          id: 33,
          permission_name: "Event Delete",
          slug: "event-delete",
          status: 1,
        },
        {
          id: 34,
          permission_name: "Event Booking",
          slug: "event-booking",
          status: 1,
        },
      ],
    },
    {
      name: "Home Layout",
      permissions: [
        {
          id: 35,
          permission_name: "Layout Create",
          slug: "layout-create",
          status: 1,
        },
        {
          id: 36,
          permission_name: "Layout View",
          slug: "layout-view",
          status: 1,
        },
        {
          id: 37,
          permission_name: "Layout Edit",
          slug: "layout-edit",
          status: 1,
        },
        {
          id: 38,
          permission_name: "Layout Delete",
          slug: "layout-delete",
          status: 1,
        }
      ],
    },
    {
      name: "Table",
      permissions: [
        {
          id: 39,
          permission_name: "Table Create",
          slug: "table-create",
          status: 1,
        },
        {
          id: 40,
          permission_name: "Table View",
          slug: "table-view",
          status: 1,
        },
        {
          id: 41,
          permission_name: "Table Edit",
          slug: "table-edit",
          status: 1,
        },
        {
          id: 42,
          permission_name: "Table Delete",
          slug: "table-delete",
          status: 1,
        }
      ],
    },
  ];
};
