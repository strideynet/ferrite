import { createQueryOptions, createMutationOptions } from '@connectrpc/connect-query';
import { HelloService } from '@/gen/hello_pb';
import { transport } from '@/lib/query-client';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * Connect Query provides automatic generation of TanStack Query options from your service definitions.
 * This gives you perfect type safety with minimal boilerplate.
 */

// Create query/mutation options for the HelloService
const helloServiceOptions = {
  // If SayHello were a query (idempotent GET-like operation)
  sayHelloQuery: (name: string) =>
    createQueryOptions(
      HelloService,
      {
        sayHello: { name }
      },
      {
        transport,
      }
    ),

  // For mutations (POST-like operations that change state)
  sayHelloMutation: () =>
    createMutationOptions(
      HelloService,
      'sayHello',
      {
        transport,
      }
    ),
};

/**
 * Example hooks using the Connect Query options
 */

// Query hook (use for idempotent operations)
export function useHelloQuery(name: string, enabled = true) {
  return useQuery({
    ...helloServiceOptions.sayHelloQuery(name),
    enabled: enabled && !!name,
  });
}

// Mutation hook (use for operations that change server state)
export function useHelloMutation() {
  return useMutation(helloServiceOptions.sayHelloMutation());
}

/**
 * Benefits of Connect Query:
 *
 * 1. **Type Safety**: Full TypeScript types from your proto definitions
 * 2. **Auto-completion**: IDE knows exactly what fields are available
 * 3. **Query Keys**: Automatically generated and consistent
 * 4. **Error Handling**: Connect errors are properly typed
 * 5. **Request/Response Types**: No manual type definitions needed
 * 6. **Optimistic Updates**: Easy to implement with typed responses
 * 7. **Cache Management**: TanStack Query's powerful caching with typed data
 */