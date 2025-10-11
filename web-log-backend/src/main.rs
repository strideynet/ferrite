use axum::Router;
use axum_connect::prelude::*;
use tower_http::cors::CorsLayer;


mod proto {
    // Include the generated code in a `proto` module.
    //
    // Note: I'm not super happy with this pattern. I hope to add support to `protoc-gen-prost` in
    // the near-ish future instead see:
    // https://github.com/neoeinstein/protoc-gen-prost/issues/82#issuecomment-1877107220 That will
    // better align with Buf.build's philosophy. This is how it works for now though.
    pub mod hello {
        include!(concat!(env!("OUT_DIR"), "/hello.v1.rs"));
    }
}

#[tokio::main]
async fn main() {
    // Build our application with a route. Note the `rpc` method which was added by `axum-connect`.
    // It expect a service method handler, wrapped in it's respective type. The handler (below) is
    // just a normal Rust function. Just like Axum, it also supports extractors!
    let app = Router::new()
        // Add a simple test route
        .route("/test", axum::routing::get(|| async { "Test endpoint working!" }))
        // A standard unary (POST based) Connect-Web request handler.
        .rpc(proto::hello::HelloService::say_hello(say_hello_unary));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3030")
        .await
        .unwrap();
    println!("🚀 Server running on http://{}", listener.local_addr().unwrap());
    println!("🧪 Test with: curl -X POST http://localhost:3030/hello.v1.HelloService/SayHello -H 'Content-Type: application/json' -d '{{\"name\":\"World\"}}'");
    axum::serve(listener, app.layer(CorsLayer::very_permissive()))
        .await
        .unwrap();
}

async fn say_hello_unary(request: proto::hello::HelloRequest) -> Result<proto::hello::HelloResponse, axum_connect::error::RpcError> {
    Ok(proto::hello::HelloResponse {
        message: format!(
            "Hello, {}! This is Ferrite speaking.",
            request.name
        ),
    })
}