import { Helmet } from "servite/client"

export default function Page() {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      hello
    </div>
  )
}
