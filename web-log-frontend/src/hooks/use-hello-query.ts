import { useMutation } from '@tanstack/react-query';
import { createClient } from '@connectrpc/connect';
import { HelloService } from '@/gen/hello_pb';
import { transport } from '@/lib/query-client';
import { create } from '@bufbuild/protobuf';
import { HelloRequestSchema } from '@/gen/hello_pb';

// Create the Connect client
const helloClient = createClient(HelloService, transport);

/**
 * TanStack Query mutation for the SayHello RPC
 *
 * Usage:
 * const helloMutation = useSayHello();
 * helloMutation.mutate({ name: "World" });
 */
export function useSayHello() {
  return useMutation({
    mutationKey: ['hello', 'sayHello'],
    mutationFn: async (params: { name: string }) => {
      // Create a typed request
      const request = create(HelloRequestSchema, {
        name: params.name,
      });

      // Make the RPC call
      const response = await helloClient.sayHello(request);

      return {
        message: response.message,
      };
    },
  });
}

/**
 * Alternative: If SayHello were a query (GET-like operation),
 * you would use useQuery instead:
 *
 * import { useQuery } from '@tanstack/react-query';
 *
 * export function useHelloQuery(name: string) {
 *   return useQuery({
 *     queryKey: ['hello', 'sayHello', name],
 *     queryFn: async () => {
 *       const request = create(HelloRequestSchema, { name });
 *       const response = await helloClient.sayHello(request);
 *       return response;
 *     },
 *     enabled: !!name, // Only run if name is provided
 *   });
 * }
 */