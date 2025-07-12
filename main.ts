import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleChatRequest } from "./routes/chat.route.ts";

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // 新增日志：记录所有收到的请求
  console.log(`[main.ts] INFO: Received ${request.method} request for ${url.pathname}`);

  // 使用 try...catch 包裹整个路由处理，防止意外错误导致服务崩溃
  try {
    // 路由分发
    if (url.pathname === "/" || url.pathname === "/chat") {
      // 新增日志：准备进入聊天处理逻辑
      console.log(`[main.ts] INFO: Routing to handleChatRequest...`);
      const response = await handleChatRequest(request);
      // 新增日志：聊天处理逻辑已完成
      console.log(`[main.ts] INFO: handleChatRequest finished.`);
      return response;
    }
    
    // 404 处理
    console.log(`[main.ts] WARN: No route matched for ${url.pathname}. Returning 404.`);
    return new Response(
      JSON.stringify({ error: "Not Found" }),
      { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    // 顶层错误捕获
    console.error(`[main.ts] FATAL: An unhandled error occurred in handleRequest:`, error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// 启动服务器
console.log("Server starting...");
serve(handleRequest, { port: 8000 });
console.log("Server running on http://localhost:8000");
console.log("Available endpoints:");
console.log("  POST / - Chat with AI");
console.log("  POST /chat - Chat with AI");
