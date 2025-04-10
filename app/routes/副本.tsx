import { Button, Divider, ScrollShadow, Tab, Tabs, Textarea, Tooltip } from "@heroui/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { param } from "framer-motion/client";
import { ArrowEmailForward, ChatLines, Computer, Cube, PlusSquare, Upload } from "iconoir-react";
import { useEffect, useMemo, useState } from "react";
import { Await, redirect, useActionData } from "react-router";
import { Form } from "react-router-dom";
import { addContent, createSession, getSessionContent, vertifySessionId } from "~/services/chat.server";
import { getUserFromCookie } from "~/services/session.server";


import {  useFetcher } from "@remix-run/react";
import { Skeleton } from "@heroui/react";
import { ArrowUp, User } from "iconoir-react";

export default function ChatMainPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [inputContent, setInputContent] = useState("");
  // 使用 loaderData.sessionContent 初始化历史消息
  const [messages, setMessages] = useState<Array<{ content: string; role: "user" | "assistant" }>>(
    loaderData.sessionContent ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const fetcher = useFetcher();

//   useMemo(()=>{console.log(messages)},[messages])
  useEffect(() => {
    console.log('收到 fetcher 数据:', fetcher.data);
    if (fetcher.data && fetcher.data.readableStream) {
      const reader = fetcher.data.readableStream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { content: "", role: "assistant" as const };

      const readChunk = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(line => line.trim() !== "");

          for (const line of lines) {
            if (line === "data: [DONE]") continue;

            try {
              const data = JSON.parse(line.replace("data: ", ""));
              const token = data.choices[0]?.delta?.content || "";
              assistantMessage.content += token;

              // 更新最后一条消息
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1]?.role === "assistant") {
                  newMessages[newMessages.length - 1] = assistantMessage;
                } else {
                  newMessages.push(assistantMessage);
                }
                return newMessages;
              });
            } catch (error) {
              console.error("Error parsing chunk:", error);
            }
          }
        }
        setIsLoading(false);
      };

      readChunk();
    }
  }, [fetcher.data]);

  // 提交表单处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    // 添加用户消息
    const newUserMessage = { content: inputContent, role: "user" as const };
    setMessages(prev => [...prev, newUserMessage]);
    setInputContent("");
    setIsLoading(true);

    // 提交请求，后端会返回流式输出数据
    fetcher.submit(
      { content: inputContent, sessionId: loaderData.sessionId },
      { method: "post", encType: "application/json" }
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="w-64 bg-white border-r p-4">
        <div className="mb-4">
          <Button fullWidth color="primary" startContent={<PlusSquare fontSize={16} />}>
            新对话
          </Button>
        </div>
        
        <ScrollShadow className="h-[calc(100vh-120px)]">
          {loaderData.history?.map((session: any) => (
            <div
              key={session.id}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              <div className="text-sm truncate">{session.title}</div>
              <div className="text-xs text-gray-500">{session.date}</div>
            </div>
          ))}
        </ScrollShadow>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
      <ScrollShadow className="flex-1 p-4 space-y-4 overflow-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xl p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white border"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "user" ? (
                    <User fontSize={16} />
                  ) : (
                    <Cube fontSize={16} />
                  )}
                  <span className="text-sm font-medium">
                    {message.role === "user" ? "您" : "AI助手"}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl p-3 rounded-lg bg-white border">
                <div className="flex items-center gap-2">
                  <Cube fontSize={16} />
                  <span className="text-sm font-medium">AI助手</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollShadow>

        {/* 输入区域 */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="请输入您的问题..."
              minRows={1}
              maxRows={6}
              classNames={{
                input: "pr-12",
              }}
            />
            <Button
              type="submit"
              isIconOnly
              className="absolute right-2 bottom-2 bg-transparent hover:bg-gray-100"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin" />
              ) : (
                <ArrowUp fontSize={18} />
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-2">
            提示：本网站所有回复由AI自动生成，其内容不代表作者及学校的观点和立场。
          </p>
        </div>
      </div>
    </div>
  );
}


let Conversation: any[] = [];

export async function loader({ request,params }:LoaderFunctionArgs) {
    // const userId = '';
    const { sessionId } = params;
    const avatarUrl = '';
    const url = request.url;
    // const param = new URL(url).searchParams;
    // const sessionId = param.get('sessionid');
    let sessionContent : any = [];
    let sessionAll : any = []; 
    let isNewSession = true;
    // route protected by user session
    const userId = await getUserFromCookie(request);
    if (userId == null) {
        return redirect("/login");
    }
    if(sessionId != null && sessionId != '' && sessionId != 'new'){
      const vertify = await vertifySessionId(sessionId,userId);
      if(!vertify.notFound){
        sessionAll = await getSessionContent(sessionId);
        sessionAll.forEach(element => {
            sessionContent.push({content: element.i ,role:"user" })
            sessionContent.push({content: element.o ,role:"assistant" })
            isNewSession = false;
        });
        if(!vertify.isBelong){ 
            return redirect("/chat/new");
        }
      }
      else{
        return redirect("/chat/new");
      }
    }
    return {
      'sessionId':sessionId,
      'url':url,
      'sessionContent':sessionContent,
      'userId':userId,
      'avatarUrl':avatarUrl,
      'isNewSession':isNewSession,
    };
}

// 在 action 处理中返回可读流
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();
  const content = formData.content;
  let sessionId = formData.sessionId;
  const userId = await getUserFromCookie(request);
  let res;
  if (userId == null) {
      return redirect("/login");
  }
  if (typeof content == 'string' && typeof sessionId == 'string') {
      if (sessionId == null || sessionId == '' || sessionId == 'new') {
          const resp = await createSession(content, userId);
          res = resp.res;
          sessionId = resp.sessionId;
      } else {
          res = await addContent(content, userId, sessionId);
      }
  } else { 
      return { code: 500, msg: 'ERROR' }; 
  }
  const stream = res.body;

  let ret = await new Response(new ReadableStream({
    async start(controller) {
      // 修改此处：将 chunk 转换为 Uint8Array（如果 chunk 为字符串）
      for await (const chunk of stream) {
        console.log(chunk);
        controller.enqueue(
          typeof chunk === 'string'
            ? new TextEncoder().encode(chunk)
            : chunk
        );
      }
      controller.close();
    }
  }));
  return new Response(ret.body, {
      headers: {
         "Content-Type": "text/event-stream",
         "Cache-Control": "no-cache",
         "Connection": "keep-alive"
      }
  });
}

function share(e:any){
    return(<></>);
}