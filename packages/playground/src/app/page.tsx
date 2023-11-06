import "./index.css"

import { Helmet, useLoaderData } from "servite/client"

import type { LoaderFunctionArgs } from "servite/client"

export function loader(context: LoaderFunctionArgs) {
  return {
    hello: context.pathname,
  }
}

export default function Page() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <h1>Page</h1>
      <p>{data.hello}</p>
    </div>
  )
}
