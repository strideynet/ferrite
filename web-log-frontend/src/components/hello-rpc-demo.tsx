import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSayHello } from '@/hooks/use-hello-query'
import { Loader2 } from 'lucide-react'

export function HelloRpcDemo() {
  const [name, setName] = useState('')
  const helloMutation = useSayHello()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    helloMutation.mutate({ name: name.trim() })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RPC Demo with TanStack Query</CardTitle>
        <CardDescription>
          Test the Connect RPC connection to the Rust backend using TanStack Query
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Enter your name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={helloMutation.isPending}
            />
            {!name.trim() && helloMutation.isIdle && (
              <p className="text-sm text-muted-foreground">Please enter a name</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={helloMutation.isPending || !name.trim()}
          >
            {helloMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Hello'
            )}
          </Button>
        </form>

        {helloMutation.isSuccess && helloMutation.data && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg">
            <p className="font-semibold">Response from backend:</p>
            <p className="mt-1">{helloMutation.data.message}</p>
          </div>
        )}

        {helloMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p className="mt-1">
              {helloMutation.error instanceof Error
                ? helloMutation.error.message
                : 'An error occurred'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => helloMutation.reset()}
              className="mt-2"
            >
              Clear Error
            </Button>
          </div>
        )}

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-2 bg-muted rounded text-xs font-mono">
            <p>Status: {helloMutation.status}</p>
            <p>Attempts: {helloMutation.failureCount}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}