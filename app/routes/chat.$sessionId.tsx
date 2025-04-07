import { Button, Divider, ScrollShadow, Tab, Tabs, Textarea, Tooltip } from "@heroui/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { param } from "framer-motion/client";
import { ArrowEmailForward, ChatLines, Computer, PlusSquare, Upload } from "iconoir-react";
import { useEffect, useState } from "react";
import { Await, redirect, useActionData } from "react-router";
import { Form } from "react-router-dom";
import { addContent, createSession, getSessionContent, vertifySessionId } from "~/services/chat.server";
import { getUserFromCookie } from "~/services/session.server";

export default function chatMainPage(){
    const [content, setContent] = useState("");
    const [selected, setSelected] = useState<"chat" | "course">("chat");
    const [isNewSession,setIsNewSession] = useState<boolean>(true);
    const actionResponse = useActionData();
    const LoaderData = useLoaderData<typeof loader>();
    const [sessionId,setSessionId] = useState('');
    // let chatContent: { content: string; role: string; }[] = [];
    const [chatContent,setChatContent] = useState<any>();
    let legacyContent: any[] = [];

    // useEffect(() => {
    //     legacyContent = LoaderData.sessionontent;
    //     // setChatContent(LoaderData.sessionontent);
    // }, []);

    useEffect(() => {
        // console.log(actionResponse?.res)
        if(actionResponse != undefined)
            setChatContent({ content:actionResponse.res, role:"user" })
    }, [actionResponse])

    useEffect(() => { // renew sessionIdParam
        if(LoaderData.sessionId != null)
            setSessionId(LoaderData.sessionId);
    }, [LoaderData.sessionId])

    function isChatContentNull(){
        // console.log(chatContent)
        // console.log(legacyContent)
        if(LoaderData.sessionontent == null){return(<></>)}
        else{return(
            LoaderData.sessionontent.map(( item:any )=> 
                <>
                    <Divider className="w-8/12 self-center my-3"></Divider>
                    <div className="text-center text-lg">{item.i}</div> 
                    <Divider className="w-6/12 self-center my-3"></Divider>
                    {/* <Suspense fallback={
                        <div className="w-full flex flex-col gap-2">
                        <Skeleton className="h-16 w-3/5 rounded-lg self-center"/>
                        </div>
                    }> */}
                        <Await resolve={item}>
                        {(item)=>
                            <p className="w-3/5 m-auto text-center h-full">
                                {item.o}
                            </p>
                        }
                        </Await>
                    {/* </Suspense> */}
                </>
            )
        )}
    }

    return(
    <div className="h-screen w-screen grid grid-rows-8 grid-cols-5 ">{/*className="font-sans p-4" */}
      {/* <div className="row-span-8 col-span-1 w-full h-screen"><SideBar/></div> */}
        <ScrollShadow className="w-full flex flex-col col-start-2 col-span-4 row-start-2 row-span-5 item-center">
            {isChatContentNull()}
        </ScrollShadow>

        <div className="col-start-2 col-span-4 row-start-7 flex flex-col">
            <Tabs variant="underlined" className="justify-center w-full mt-6 "
                selectedKey={selected}
                onSelectionChange={key => setSelected(key as "chat" | "course")}>
                <Tab key="chat" title={
                <div className="flex items-center space-x-2">
                    <ChatLines/>
                    <span>聊天</span>
                </div>}>
                </Tab>
                {/* <Tab key="course" title={
                <div className="flex items-center space-x-2">
                    <Computer/>
                    <span>入学教育</span>
                </div>}>
                </Tab> */}
            </Tabs>
            <Form method="post" className="w-8/12 m-auto my-2">
                <Textarea placeholder="问问万能的LLM吧" minRows={1} maxRows={3} variant="bordered" onChange={(e) => setContent(e.target.value)}
                name="content" type="text" endContent={
                    <Button isIconOnly className="bg-transparent mt-auto mb-auto" radius="sm" size="sm" type="submit"
                    onPress={()=>{  }}>
                    <ArrowEmailForward/>
                    </Button>
                }
                />
                <input readOnly className="hidden" type="text" name="sessionId" value={sessionId}/>
            </Form>
            <div className="content-end pb-2">
                <p className="text-slate-400 text-center">提示：本网站所有回复由AI自动生成，其内容不代表作者及学校的观点和立场。</p>
            </div>
        </div>
      <div className="col-start-5 ml-8 mt-2">
        <Tooltip content="分享">
          <Button isIconOnly className="bg-transparent mt-auto mb-auto" size="lg"
            onPress={(e) => share(e) }>
            <Upload/>
          </Button>
        </Tooltip>
        <Tooltip content="开启新对话">
          <Button isIconOnly className="z-2 bg-transparent mt-auto mb-auto ml-2" size="lg"
            onPress={(e) => {
                setSessionId('');
            }}>
            <PlusSquare/>
          </Button>
        </Tooltip>
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
    let sessionContent: any = []
    let isNewSession = true;
    // route protected by user session
    const userId = await getUserFromCookie(request);
    if (userId == null) {
        return redirect("/login");
    }

    if(sessionId != null){
      const vertify = await vertifySessionId(sessionId,userId);
      if(!vertify.notFound){
        sessionContent = await getSessionContent(sessionId);
        if(vertify.isBelong){ 
            isNewSession = false; 
            redirect("/chat");
        }
      }
    }
    return {
      'sessionId':sessionId,
      'url':url,
      'sessionontent':sessionContent,
      'userId':userId,
      'avatarUrl':avatarUrl,
      'isNewSession':isNewSession,
    };
}

export async function action({ request }:ActionFunctionArgs) {
    //action => submit from frontend
    const formData = await request.formData();
    const content = formData.get('content');
    let sessionId = formData.get('sessionId');
    const userId = await getUserFromCookie(request);
    let res;
    if (userId == null) {
        return redirect("/login");
    }
    if( typeof content == 'string' && typeof sessionId == 'string' ){
        if( sessionId == null || sessionId == ''){
            const resp =  await createSession(content,userId);
            res = resp.res;
            sessionId = resp.sessionId;
            redirect("/chat/"+sessionId);
        }
        else{
            res = await addContent(content,userId,sessionId);
        } 
    }
    else{ return {code:500,msg:'ERROR'} }
    const stream = res.body;

    const ret = await new Response(new ReadableStream({
    async start(controller) {
        for await (const chunk of stream) {
            console.log(chunk)
            controller.enqueue(chunk)
        }
        controller.close()
    }
    }));
    return({'sessionId':sessionId,'res':ret})
}

function share(e:any){
    return(<></>);
}