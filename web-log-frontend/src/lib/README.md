# TanStack Query + Connect RPC Setup

This directory contains the configuration for TanStack Query with Connect RPC integration, providing type-safe RPC calls with powerful caching and state management.

## Architecture

### Core Files

- **`query-client.ts`**: TanStack Query client configuration and Connect transport setup
- **`rpc-client.ts`**: Connect client with convenience wrappers for backward compatibility

### Generated Code

- **`src/gen/`**: Auto-generated TypeScript types and service definitions from proto files
  - Run `pnpm run generate` to regenerate after proto changes

## Usage Examples

### Basic Mutation (for operations that change server state)

```typescript
import { useSayHello } from '@/hooks/use-hello-query';

function MyComponent() {
  const helloMutation = useSayHello();

  const handleSubmit = () => {
    helloMutation.mutate({ name: 'World' });
  };

  return (
    <div>
      {helloMutation.isPending && <p>Loading...</p>}
      {helloMutation.isSuccess && <p>{helloMutation.data.message}</p>}
      {helloMutation.isError && <p>Error: {helloMutation.error.message}</p>}
    </div>
  );
}
```

### Query (for idempotent read operations)

```typescript
import { useQuery } from '@tanstack/react-query';
import { helloClient } from '@/lib/rpc-client';

function MyComponent({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      // Call your RPC method here
      const response = await userClient.getUser({ id: userId });
      return response;
    },
    enabled: !!userId, // Only run when userId is available
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  return <div>Welcome, {data?.name}!</div>;
}
```

## Benefits

### 1. **Type Safety**
- Full TypeScript types generated from proto definitions
- Compile-time checking of request/response shapes
- IDE auto-completion for all fields

### 2. **Caching & State Management**
- Automatic caching of query results
- Background refetching to keep data fresh
- Optimistic updates for better UX
- Request deduplication

### 3. **Error Handling**
- Built-in retry logic with exponential backoff
- Type-safe error handling
- Network failure resilience

### 4. **Developer Experience**
- React Query DevTools for debugging
- Clear loading/error/success states
- Automatic cleanup and garbage collection

## Adding New Services

1. **Define your service in a `.proto` file**:
   ```protobuf
   service UserService {
     rpc GetUser(GetUserRequest) returns (GetUserResponse);
     rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
   }
   ```

2. **Generate TypeScript code**:
   ```bash
   pnpm run generate
   ```

3. **Create a hook**:
   ```typescript
   import { useMutation, useQuery } from '@tanstack/react-query';
   import { createClient } from '@connectrpc/connect';
   import { UserService } from '@/gen/user_pb';
   import { transport } from '@/lib/query-client';

   const userClient = createClient(UserService, transport);

   // For queries (GET-like operations)
   export function useUser(userId: string) {
     return useQuery({
       queryKey: ['user', userId],
       queryFn: async () => {
         const response = await userClient.getUser({ id: userId });
         return response;
       },
     });
   }

   // For mutations (POST/PUT/DELETE-like operations)
   export function useUpdateUser() {
     return useMutation({
       mutationFn: async (user: UpdateUserRequest) => {
         const response = await userClient.updateUser(user);
         return response;
       },
     });
   }
   ```

## Best Practices

1. **Use queries for read operations** that don't change server state
2. **Use mutations for write operations** that modify data
3. **Leverage query keys** for cache invalidation and refetching
4. **Handle loading and error states** in your UI
5. **Use optimistic updates** for instant feedback on mutations
6. **Invalidate related queries** after successful mutations

## Troubleshooting

### CORS Issues
Ensure your backend is configured to accept requests from your frontend origin.

### Type Errors After Proto Changes
Run `pnpm run generate` to regenerate TypeScript types.

### Query Not Refetching
Check your `queryKey` - it should include all dependencies that affect the query result.