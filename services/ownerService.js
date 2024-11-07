exports.propertyBy = async(userData) => {
    let dataId;
      switch (userData.userType) {
        case 'CRM_EDITOR':
          dataId = 'all'
          break;
        case 'BUSINESS_OWNER':
          dataId = userData.id
          break;
        case 'BUSINESS_MANAGER':
          dataId = userData.ownerId
          break;
        case 'LISTING_MANAGER':
          dataId = userData.ownerId
          break;
        default:
          break;
      }
      return dataId;
}

exports.allPermission = async() => {
 return [
    {
        name: "Property",
        permissions: [
            {
                "id": 1,
                "permission_name": "Property Create",
                "slug": "property-create",
                "status": 1
            },
            {
                "id": 2,
                "permission_name": "Property View",
                "slug": "property-view",
                "status": 1
            },
            {
                "id": 3,
                "permission_name": "Property Edit",
                "slug": "property-edit",
                "status": 1,
            },
            {
                "id": 4,
                "permission_name": "Property Delete",
                "slug": "property-delete",
                "status": 1
            }
        ]
    },
  {
      name: "Branch",
      permissions: [
          {
              "id": 5,
              "permission_name": "Branch Create",
              "slug": "branch-create",
              "status": 1
          },
          {
              "id": 6,
              "permission_name": "Branch View",
              "slug": "branch-view",
              "status": 1
          },
          {
              "id": 7,
              "permission_name": "Branch Edit",
              "slug": "branch-edit",
              "status": 1,
          },
          {
              "id": 8,
              "permission_name": "Branch Delete",
              "slug": "branch-delete",
              "status": 1
          }
      ]
  },
  {
      name: "Property Asset",
      permissions: [
          {
              "id": 9,
              "permission_name": "Property Asset Create",
              "slug": "property-asset-create",
              "status": 1
          },
          {
              "id": 10,
              "permission_name": "Property Asset View",
              "slug": "property-asset-view",
              "status": 1
          },
          {
              "id": 11,
              "permission_name": "Property Asset Edit",
              "slug": "property-asset-edit",
              "status": 1,
          },
          {
              "id": 12,
              "permission_name": "Property Asset Delete",
              "slug": "property-asset-delete",
              "status": 1
          }
      ]
  },
  {
      name: "Reservation",
      permissions: [
          {
              "id": 13,
              "permission_name": "View Reservation",
              "slug": "reservation-view",
              "status": 1
          },
          {
              "id": 14,
              "permission_name": "Add Reservation",
              "slug": "reservation-create",
              "status": 1,
          },
          {
              "id": 15,
              "permission_name": "Edit Reservation",
              "slug": "reservation-edit",
              "status": 1
          },
          {
              "id": 16,
              "permission_name": "Delete Reservation",
              "slug": "reservation-delete",
              "status": 1
          }
      ]
  },
  {
      name: "Report",
      permissions: [
          {
              "id": 17,
              "permission_name": "Report View",
              "slug": "report-view",
              "status": 1
          },
          {
              "id": 18,
              "permission_name": "Revenue Report",
              "slug": "revenue-report",
              "status": 1
          },
          {
              "id": 19,
              "permission_name": "Upcoming Report",
              "slug": "upcoming-report",
              "status": 1,
          },
          {
              "id": 20,
              "permission_name": "Complete Report",
              "slug": "complete-report",
              "status": 1
          },
          {
              "id": 21,
              "permission_name": "Cancel Report",
              "slug": "cancel-report",
              "status": 1
          }
      ]
  },
  {
      name: "Roles",
      permissions: [
          {
              "id": 22,
              "permission_name": "Role Create",
              "slug": "role-create",
              "status": 1
          },
          {
              "id": 23,
              "permission_name": "Role View",
              "slug": "role-view",
              "status": 1
          },
          {
              "id": 24,
              "permission_name": "Role Edit",
              "slug": "role-edit",
              "status": 1,
          },
          {
              "id": 25,
              "permission_name": "Role Delete",
              "slug": "role-delete",
              "status": 1
          }
      ]
  },
  {
      name: "Employee",
      permissions: [
          {
              "id": 26,
              "permission_name": "Employee Create",
              "slug": "employee-create",
              "status": 1
          },
          {
              "id": 27,
              "permission_name": "Employee View",
              "slug": "employee-view",
              "status": 1
          },
          {
              "id": 28,
              "permission_name": "Employee Edit",
              "slug": "employee-edit",
              "status": 1,
          },
          {
              "id": 29,
              "permission_name": "Employee Delete",
              "slug": "employee-delete",
              "status": 1
          }
      ]
  },
]
}