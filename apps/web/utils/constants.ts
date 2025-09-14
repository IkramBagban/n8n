// GET https://ikram1231.app.n8n.cloud/rest/workflows?includeScopes=true&filter=%7B%22isArchived%22%3Afalse%7D&skip=0&take=50&sortBy=updatedAt%3Adesc

export const workflows = {
  count: 2,
  data: [
    {
      createdAt: "2025-09-12T14:24:44.906Z",
      updatedAt: "2025-09-12T14:25:02.000Z",
      id: "kOhVp0MYeEFDxxUQ",
      name: "find gigs",
      active: false,
      isArchived: false,
      versionId: "ac1f9892-7300-4875-8a19-59d26ba0ab59",
      parentFolder: null,
      tags: [],
      homeProject: {
        id: "yHTa3rjcSa7Cka0t",
        type: "team",
        name: "fProject",
        icon: {
          type: "icon",
          value: "layers",
        },
      },
      sharedWithProjects: [],
      scopes: [
        "workflow:create",
        "workflow:delete",
        "workflow:execute",
        "workflow:list",
        "workflow:move",
        "workflow:read",
        "workflow:share",
        "workflow:update",
      ],
    },
    {
      createdAt: "2025-09-12T13:58:11.745Z",
      updatedAt: "2025-09-12T13:58:11.745Z",
      id: "0NWAQHzBtm0TWrDZ",
      name: "My workflow",
      active: false,
      isArchived: false,
      versionId: "7462456e-95bc-4e5d-bbae-bd8b9ad0ec19",
      parentFolder: null,
      tags: [],
      homeProject: {
        id: "LngNuUUiAQyyqOuL",
        type: "personal",
        name: "ikram   <ikrambagban.dev@gmail.com>",
        icon: null,
      },
      sharedWithProjects: [],
      scopes: [
        "workflow:create",
        "workflow:delete",
        "workflow:execute",
        "workflow:list",
        "workflow:move",
        "workflow:read",
        "workflow:share",
        "workflow:update",
      ],
    },
  ],
};

// GET https://ikram1231.app.n8n.cloud/rest/projects
export const projects = {
  data: [
    {
      createdAt: "2025-09-12T11:48:38.978Z",
      updatedAt: "2025-09-12T11:48:42.147Z",
      id: "LngNuUUiAQyyqOuL",
      name: "ikram   <ikrambagban.dev@gmail.com>",
      type: "personal",
      icon: null,
      description: null,
    },
    {
      createdAt: "2025-09-12T14:18:37.856Z",
      updatedAt: "2025-09-12T14:19:49.000Z",
      id: "yHTa3rjcSa7Cka0t",
      name: "fProject",
      type: "team",
      icon: {
        type: "icon",
        value: "layers",
      },
      description: "this is my project description",
    },
  ],
};
// GET https://krish1231.app.n8n.cloud/rest/active-workflows
export const activeWorkflows = { data: [] };
