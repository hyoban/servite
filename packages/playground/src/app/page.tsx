import { useState } from "react"
import { useHead, useLoaderData } from "servite/client"

import type { LoaderFunctionArgs } from "servite/client"

export function loader(context: LoaderFunctionArgs) {
  return {
    hello: context.pathname,
  }
}

export default function Page() {
  const data = useLoaderData<typeof loader>()

  const [a, setA] = useState(0)

  useHead({
    title: "My Page",
    meta: [
      {
        name: "description",
        content: "My page description",
      },
    ],
  })

  return (
    <div>
      <h1>{a}</h1>
      <p>{data.hello}</p>
      <button onClick={() => setA(a + 1)}>Click</button>
    </div>
  )
}
