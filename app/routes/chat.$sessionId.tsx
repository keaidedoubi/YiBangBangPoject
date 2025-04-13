import { Button, Divider, ScrollShadow, Tab, Tabs, Textarea, Tooltip } from "@heroui/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { param } from "framer-motion/client";
import { ArrowEmailForward, ChatLines, Computer, Cube, PlusSquare, Upload } from "iconoir-react";
import { useEffect, useMemo, useState } from "react";
import { Await, redirect, useActionData, useNavigate } from "react-router";
import { Form } from "react-router-dom";
import { addContent, createSession, getSessionContent, vertifySessionId } from "~/services/chat.server";
import { getUserFromCookie } from "~/services/session.server";
import { Readable } from 'node:stream';

import { useFetcher } from "@remix-run/react";
import { Skeleton } from "@heroui/react";
import { ArrowUp, User } from "iconoir-react";

export default function ChatMainPage() {
    const navigate = useNavigate();
    const loaderData = useLoaderData<typeof loader>();
    const [inputContent, setInputContent] = useState("");
    // 使用 loaderData.sessionContent 初始化历史消息
    const [messages, setMessages] = useState<Array<{ content: string; role: "user" | "assistant" }>>(
        loaderData.sessionContent ?? []
    );
    const [isLoading, setIsLoading] = useState(false);
    const fetcher = useFetcher();

    // 修改 useEffect 中的流处理逻辑
    useEffect(() => {
        const processStream = async (response: Response) => {
            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let assistantMessage = { content: "", role: "assistant" as const };
            let isNewSession = false;
            let sessionIdReceived = false;

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    // 确保 chunk 是 Uint8Array 类型
                    const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);

                    // 处理 SSE 协议数据
                    const textChunk = decoder.decode(chunk, { stream: true });
                    const lines = textChunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: {"sessionId":"')) {
                            const sessionId = line.match(/"sessionId":"([^"]+)"/)?.[1];
                            if (sessionId) {
                                window.history.replaceState(null, '', `/chat/${sessionId}`);
                                sessionIdReceived = true;
                            }
                            continue;
                        }

                        if (line === 'data: [DONE]') continue;

                        try {
                            const jsonString = line.replace(/^data: /, '');
                            const data = JSON.parse(jsonString);
                            const token = data.choices[0]?.delta?.content || '';

                            assistantMessage.content += token;
                            setMessages(prev => {
                                const lastMessage = prev[prev.length - 1];
                                if (lastMessage?.role === "assistant") {
                                    return [...prev.slice(0, -1), assistantMessage];
                                }
                                return [...prev, assistantMessage];
                            });
                        } catch (error) {
                            console.error("解析错误:", error);
                        }
                    }
                }
            } finally {
                setIsLoading(false);
                if (sessionIdReceived) {
                    // 可选：触发页面状态更新
                }
            }
        };

        if (fetcher.data && fetcher.data instanceof Response) {
            processStream(fetcher.data);
        }
    }, [fetcher.data]);

    // 提交表单处理
    // 修改后的提交处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputContent.trim()) return;

        // 添加用户消息
        const newUserMessage = { content: inputContent, role: "user" as const };
        setMessages(prev => [...prev, newUserMessage]);
        setInputContent("");
        setIsLoading(true);

        try {
            const response = await fetch(`/chat/${loaderData.sessionId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: inputContent,
                    sessionId: loaderData.sessionId
                })
               
            }); 
            // console.log("res",response)
            // 将响应对象存入状态
            fetcher.data = response;
        } catch (error) {
            console.error("请求失败:", error);
            setIsLoading(false);
        }
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
                                className={`max-w-xl p-3 rounded-lg ${message.role === "user"
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
                    <Form method="post" onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
                        <Textarea
                            value={inputContent}
                            name="content"
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
                    </Form>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        提示：本网站所有回复由AI自动生成，其内容不代表作者及学校的观点和立场。
                    </p>
                </div>
            </div>
        </div>
    );
}


let Conversation: any[] = [];

export async function loader({ request, params }: LoaderFunctionArgs) {
    // const userId = '';
    const { sessionId } = params;
    const avatarUrl = '';
    const url = request.url;
    // const param = new URL(url).searchParams;
    // const sessionId = param.get('sessionid');
    let sessionContent: any = [];
    let sessionAll: any = [];
    let isNewSession = true;
    // route protected by user session
    const userId = await getUserFromCookie(request);
    if (userId == null) {
        return redirect("/login");
    }
    if (sessionId != null && sessionId != '' && sessionId != 'new') {
        const vertify = await vertifySessionId(sessionId, userId);
        if (!vertify.notFound) {
            sessionAll = await getSessionContent(sessionId);
            sessionAll.forEach(element => {
                sessionContent.push({ content: element.i, role: "user" })
                sessionContent.push({ content: element.o, role: "assistant" })
                isNewSession = false;
            });
            if (!vertify.isBelong) {
                return redirect("/chat/new");
            }
        }
        else {
            return redirect("/chat/new");
        }
    }
    return {
        'sessionId': sessionId,
        'url': url,
        'sessionContent': sessionContent,
        'userId': userId,
        'avatarUrl': avatarUrl,
        'isNewSession': isNewSession,
    };
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.json();
    const content = formData.content;
    let sessionId = formData.sessionId;
    const userId = await getUserFromCookie(request);

    if (!userId) return redirect("/login");

    if (typeof content === 'string' && typeof sessionId === 'string') {
        let res: Response;
        let isNewSession = false;

        // 处理新会话创建
        if (!sessionId || sessionId === 'new') {
            const resp = await createSession(content, userId);
            res = resp.res;
            sessionId = resp.sessionId;
            isNewSession = true;
        } else {
            res = await addContent(content, userId, sessionId);
        }
 
        // 确保响应体是 Web ReadableStream
        const originalStream = res.body?.getReader();
        if (!originalStream) {
            return new Response("No response body", { status: 500 });
        }
        console.log(originalStream)
        //////
        return new Response(
            new ReadableStream({
                start(controller) {
                      controller.enqueue(1);
                    }
            }),
            {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    ...(isNewSession && { "X-New-Session-Id": sessionId })
                }
            }
        );
    }

    return new Response(JSON.stringify({ code: 500, msg: 'ERROR' }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
}

function share(e: any) {
    return (<></>);
}