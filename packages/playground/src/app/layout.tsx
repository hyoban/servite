export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Root Layout</h1>
      {children}
    </div>
  )
}
