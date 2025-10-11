import { createConnectTransport } from "@connectrpc/connect-web";
import { createClient } from "@connectrpc/connect";
import { create } from "@bufbuild/protobuf";
import { HelloRequestSchema, HelloService } from "@/gen/hello_pb";
import type { HelloRequest, HelloResponse } from "@/gen/hello_pb";

// Configure the Connect transport
// This will use the Fetch API under the hood with CORS enabled
const transport = createConnectTransport({
  baseUrl: "http://localhost:3030", // Your Rust backend URL
  // You can add interceptors here for auth, logging, etc.
});

// Create a typed client for the HelloService
export const helloClient = createClient(HelloService, transport);

// Convenience wrapper that matches the old API but uses the new typed client
export async function sayHello(request: { name: string }): Promise<{ message: string }> {
  // Create a typed request using the schema
  const typedRequest = create(HelloRequestSchema, {
    name: request.name,
  });

  // Make the RPC call with full type safety
  const response = await helloClient.sayHello(typedRequest);

  // Return in the expected format
  return {
    message: response.message,
  };
}

// Export the types for use in components
export type { HelloRequest, HelloResponse };