import { processAIRequest, AIRequest, AIResponse } from "../services/ai.service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // 建议添加 Authorization 以备将来使用
};

export async function handleChatRequest(request: Request): Promise<Response> {
  console.log("[chat.route.ts] INFO: Entered handleChatRequest.");

  // 处理OPTIONS预检请求
  if (request.method === "OPTIONS") {
    console.log("[chat.route.ts] INFO: Handling OPTIONS preflight request.");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 只处理POST请求
  if (request.method !== "POST") {
    console.log(`[chat.route.ts] WARN: Received a ${request.method} request, but only POST is allowed.`);
    return new Response(
      JSON.stringify({ error: "Only POST method is allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    // 关键日志：在解析JSON之前
    console.log("[chat.route.ts] INFO: Attempting to parse request body as JSON...");
    const body = await request.json();
    // 关键日志：在解析JSON之后
    console.log("[chat.route.ts] INFO: Successfully parsed JSON body.");

    const aiRequest: AIRequest = {
      input: body.input,
      messageList: body.messageList,
      apikey: body.apikey,
      systemInstruction: body.systemInstruction,
      temperature: body.temperature,
      intention_setting: body.intention_setting
    };

    // 调用AI服务前的日志
    console.log("[chat.route.ts] INFO: Calling processAIRequest service...");
    const aiResponse: AIResponse = await processAIRequest(aiRequest);
    console.log("[chat.route.ts] INFO: Received response from processAIRequest service.");

    // 根据AI服务响应返回结果
    const status = aiResponse.success ? 200 : 400;
    console.log(`[chat.route.ts] INFO: Responding with status ${status}.`);
    return new Response(
      JSON.stringify(aiResponse),
      { 
        status: status, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    // 捕获JSON解析错误或其他错误
    console.error("[chat.route.ts] ERROR: Error handling chat request:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to process request. Check if the request body is valid JSON.", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { 
        status: 400, // 请求体错误，应返回 400
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
