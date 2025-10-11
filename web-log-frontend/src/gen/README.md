# Generated Protocol Buffer Code

This directory contains TypeScript code generated from the protocol buffer definitions in `web-log-backend/proto/`.

## DO NOT EDIT

Files in this directory are automatically generated and should not be edited manually. Any changes will be lost when the code is regenerated.

## Regenerating Code

To regenerate the TypeScript types and Connect client code from the proto files:

```bash
pnpm run generate
```

This command will:
1. Read all `.proto` files from `../web-log-backend/proto/`
2. Generate TypeScript types using `@bufbuild/protoc-gen-es`
3. Generate Connect client code using `@connectrpc/protoc-gen-connect-es`
4. Output all generated files to this directory

## Generated Files

- `*_pb.ts`: Contains the TypeScript types for your protocol buffer messages
- `*_connect.ts`: Contains the Connect service definitions for RPC methods

## Usage Example

```typescript
import { helloClient } from "@/lib/api-client";
import { create } from "@bufbuild/protobuf";
import { HelloRequestSchema } from "@/gen/hello_pb";

// Create a typed request
const request = create(HelloRequestSchema, {
  name: "World",
});

// Make the RPC call with full type safety
const response = await helloClient.sayHello(request);
console.log(response.message); // TypeScript knows this is a string
```