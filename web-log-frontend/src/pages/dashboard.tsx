import { HelloRpcDemo } from '@/components/hello-rpc-demo'

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your amateur radio logging dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <HelloRpcDemo />

        {/* Placeholder for other dashboard cards */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Recent Contacts</h2>
          <p className="text-muted-foreground text-sm">
            No contacts logged yet
          </p>
        </div>
      </div>
    </div>
  )
}
