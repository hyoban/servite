import { expect, test } from "vitest"

import { createRoutes } from "./manager"

const pageList0 = [
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

const ROOT_WITH_GROUP1 = [
  {
    routePath: "/c/d",
    filePath: "src/pages/(group)/c/d/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/c",
    filePath: "src/pages/(group)/c/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/c",
    filePath: "src/pages/(group)/c/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/a",
    filePath: "src/pages/a/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/c",
    filePath: "src/pages/(group)/c/layout.tsx",
    isLayout: true,
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

const NO_ROOT_LAYOUT2 = [
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

const ROOT_WITH_NESTED_PAGE3 = [
  {
    routePath: "/",
    filePath: "src/app/layout.tsx",
    isLayout: true,
    is404: false,
    meta: {},
  },
  {
    routePath: "/",
    filePath: "src/app/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/hello",
    filePath: "src/app/hello/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
  {
    routePath: "/hello/world",
    filePath: "src/app/hello/world/page.tsx",
    isLayout: false,
    is404: false,
    meta: {},
  },
]

const testGroup = {
  pageList1: pageList0,
  pageList2: ROOT_WITH_GROUP1,
  "no-root-layout": NO_ROOT_LAYOUT2,
  "root-with-nested-page": ROOT_WITH_NESTED_PAGE3,
}

Object.entries(testGroup).forEach(([key, value], index) => {
  test(`create-routes-${key}`, () => {
    expect(createRoutes(value)).toMatchFileSnapshot(
      `snapshot/create-routes-${index}.js`,
    )
  })
})
