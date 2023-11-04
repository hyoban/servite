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
    filePath: "src/pages/(ignore)/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/pages/page.tsx",
    isLayout: false,
    is404: false,
    meta: { title: "1234" },
  },
  {
    routePath: "/csr",
    filePath: "src/pages/(ignore)/csr/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/islands",
    filePath: "src/pages/islands/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/ssr",
    filePath: "src/pages/(ignore)/ssr/page.tsx",
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
                "component": "/src/pages/(ignore)/csr/page.tsx",
                "filePath": "src/pages/(ignore)/csr/page.tsx",
                "meta": {},
                "path": "/csr",
              },
              {
                "children": undefined,
                "component": "/src/pages/(ignore)/ssr/page.tsx",
                "filePath": "src/pages/(ignore)/ssr/page.tsx",
                "meta": {},
                "path": "/ssr",
              },
            ],
            "component": "/src/pages/(ignore)/layout.tsx",
            "filePath": "src/pages/(ignore)/layout.tsx",
            "meta": {},
            "path": "/",
          },
          {
            "children": undefined,
            "component": "/src/pages/page.tsx",
            "filePath": "src/pages/page.tsx",
            "meta": {
              "title": "1234",
            },
            "path": "/",
          },
          {
            "children": undefined,
            "component": "/src/pages/islands/page.tsx",
            "filePath": "src/pages/islands/page.tsx",
            "meta": {},
            "path": "/islands",
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
