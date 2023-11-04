import { expect, test } from "vitest"

import { createRoutes } from "./manager"

const pages = [
  {
    routePath: "/",
    filePath: "src/pages/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/pages/(admin)/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-articles",
    filePath: "src/pages/(admin)/carbon-neutrality-articles/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-articles/:id",
    filePath: "src/pages/(admin)/carbon-neutrality-articles/:id/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-enterprises",
    filePath: "src/pages/(admin)/carbon-neutrality-enterprises/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-enterprises/:id",
    filePath: "src/pages/(admin)/carbon-neutrality-enterprises/:id/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-ranks",
    filePath: "src/pages/(admin)/carbon-neutrality-ranks/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-ranks/:id",
    filePath: "src/pages/(admin)/carbon-neutrality-ranks/:id/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-reports",
    filePath: "src/pages/(admin)/carbon-neutrality-reports/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/carbon-neutrality-reports/:id",
    filePath: "src/pages/(admin)/carbon-neutrality-reports/:id/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/login",
    filePath: "src/pages/login/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/login",
    filePath: "src/pages/login/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/renewable-purchases",
    filePath: "src/pages/(admin)/renewable-purchases/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/renewable-purchases/:id",
    filePath: "src/pages/(admin)/renewable-purchases/:id/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/users",
    filePath: "src/pages/(admin)/users/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
]

test("createRoutes", () => {
  expect(createRoutes(pages)).toMatchInlineSnapshot(`
    [
      {
        "children": [
          {
            "children": [
              {
                "children": undefined,
                "component": "/src/pages/(admin)/users/page.tsx",
                "filePath": "src/pages/(admin)/users/page.tsx",
                "meta": {},
                "path": "/users",
              },
              {
                "children": undefined,
                "component": "/src/pages/(admin)/renewable-purchases/page.tsx",
                "filePath": "src/pages/(admin)/renewable-purchases/page.tsx",
                "meta": {},
                "path": "/renewable-purchases",
              },
              {
                "children": undefined,
                "component": "/src/pages/(admin)/carbon-neutrality-ranks/page.tsx",
                "filePath": "src/pages/(admin)/carbon-neutrality-ranks/page.tsx",
                "meta": {},
                "path": "/carbon-neutrality-ranks",
              },
              {
                "children": undefined,
                "component": "/src/pages/(admin)/carbon-neutrality-reports/page.tsx",
                "filePath": "src/pages/(admin)/carbon-neutrality-reports/page.tsx",
                "meta": {},
                "path": "/carbon-neutrality-reports",
              },
              {
                "children": undefined,
                "component": "/src/pages/(admin)/carbon-neutrality-articles/page.tsx",
                "filePath": "src/pages/(admin)/carbon-neutrality-articles/page.tsx",
                "meta": {},
                "path": "/carbon-neutrality-articles",
              },
              {
                "children": undefined,
                "component": "/src/pages/(admin)/carbon-neutrality-enterprises/page.tsx",
                "filePath": "src/pages/(admin)/carbon-neutrality-enterprises/page.tsx",
                "meta": {},
                "path": "/carbon-neutrality-enterprises",
              },
            ],
            "component": "/src/pages/(admin)/layout.tsx",
            "filePath": "src/pages/(admin)/layout.tsx",
            "meta": {},
            "path": "/",
          },
          {
            "children": [
              {
                "children": undefined,
                "component": "/src/pages/login/page.tsx",
                "filePath": "src/pages/login/page.tsx",
                "meta": {},
                "path": "/login",
              },
            ],
            "component": "/src/pages/login/layout.tsx",
            "filePath": "src/pages/login/layout.tsx",
            "meta": {},
            "path": "/login",
          },
        ],
        "component": "/src/pages/layout.tsx",
        "filePath": "src/pages/layout.tsx",
        "meta": {},
        "path": "/",
      },
    ]
  `)
})
