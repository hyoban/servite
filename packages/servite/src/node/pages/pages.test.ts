import { expect, test } from "vitest"

import { createRoutes } from "./manager"

const pageList1 = [
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

const pageList2 = [
  {
    routePath: "/a",
    filePath: "src/pages/a/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/pages/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/pages/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
]

const NO_ROOT_LAYOUT = [
  {
    routePath: "/a",
    filePath: "src/pages/a/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/pages/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/b",
    filePath: "src/pages/b/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/b",
    filePath: "src/pages/b/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
]

const testGroup = [pageList1, pageList2, NO_ROOT_LAYOUT]

testGroup.forEach((pageList, index) => {
  test(`create-routes-${index}`, () => {
    expect(createRoutes(pageList)).toMatchFileSnapshot(
      `snapshot/create-routes-${index}.js`,
    )
  })
})
