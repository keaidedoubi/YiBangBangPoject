import { Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Pagination, ScrollShadow, Textarea } from "@heroui/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import SideBar from "~/components/SideBar";
import { adminGetReports, changeReportStatus } from "~/services/report.server";
import { getUserFromCookie } from "~/services/session.server";

type loaderdata = {
    allReports:Array<any> ,
    totalReports:number
}


export default function dashboard(){
    const loaderData = useLoaderData<loaderdata>();;
    const [currentPage, setCurrentPage] = useState(1);
    const [text, setText] = useState("");

    // const reportsCardRender 

    return(
        <div className="min-w-[480px] min-h-[780px] flex flex-col w-screen h-screen text-center">
            <div className="grid grid-rows-5 grid-cols-6 h-full">
                <SideBar username={"Admin"} userId={0}  />
                <div className="col-start-2 col-span-5 row-start-1 row-span-5 my-4">
                <ScrollShadow className=" w-4/5 m-auto max-h-[720px]">
                <div className="w-4/5 m-auto">
                { !loaderData.allReports ? (<p>Loading...</p>) : (
                    Array.from({ length: 10 }).map((_, i) => {
                    const report = loaderData.allReports[(currentPage - 1) * 10 + i];
                    return report ? (
                        <Card key={i} className="my-4">
                            
                            {/* <p>{report.status}</p> */}
                            <div className="text-row my-2">
                            <span className="text-gray-500 mx-2 text-sm">反馈id：{report.id}</span>
                            <span className="mx-2">状态:{
                                report.status=="pendding"?
                                <span className="text-yellow-500">反馈处理中</span>:
                                report.status=="success"?
                                <span className="text-emerald-500">反馈已被接纳</span>:
                                report.status=="fail"?
                                <span className="text-rose-500">反馈已被驳回</span>:<span className="text-rose-500">出现错误，请联系管理员</span>
                            }</span>
                            <span className="mx-2">用户id：{report.userId}</span>
                            
                            </div>
                            <span className="px-6">反馈内容：{report.content}</span>
                            <Form method="post">
                                <div className="py-2">
                                <Input className="hidden" type="text" name="reportId" value={report.id}></Input>
                                {/* <div className="flex flex-col"> */}
                                <Textarea  labelPlacement="outside" //label="Description"
                                    placeholder="请提交您的回复（敬请期待，该功能将在后续版本中更新）" variant="bordered" name="content" type="text"
                                    className="w-3/5 mx-auto my-2" minRows={1} maxRows={3}
                                    // value={text} onValueChange={setText}
                                    />
                                    <Button type="submit" className="mx-1"size="sm" variant="ghost" name="intent" value={"statusSucc"} color="success">采纳</Button>
                                    <Button type="submit" className="mx-1" size="sm" variant="ghost"  name="intent" value={"statusFail"} color="danger">驳回</Button>
                                    <Button type="submit" className="mx-1"size="sm" variant="ghost" name="intent" value={"statusPedd"}  color="warning">正在处理</Button>
                                    {/* </div> */}
                                    <Button type="submit" isDisabled variant="ghost" className="w-24 m-auto" name="intent" value={"sendReply"}>提交回复</Button>
                                </div>
                            </Form>
                        </Card>
                    ) : null; }
                ))}
                <Pagination loop showControls color="secondary" page={currentPage} total={ Math.ceil(loaderData.totalReports/10) } onChange={setCurrentPage} />
                </div>
                </ScrollShadow>
                </div>
            </div>
        </div>
    )
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const userId = await getUserFromCookie(request);
    if(userId == null){ 
        return redirect("/adminLogin"); 
    }
    const allReports = await adminGetReports(userId);
    
    return { allReports:allReports,totalReports:allReports.length};
}

export const action = async ({ request }: LoaderFunctionArgs) => {
    const formData = await request.formData();
    const userId = await getUserFromCookie(request);
    const intent = formData.get("intent");
    if(userId == null){ 
        return redirect("/adminLogin"); 
    }
    if( intent === "sendReply"){

    }
    else if(intent === "statusSucc" || intent === "statusFail" || intent === "statusPedd"){
        const reportId = formData.get("reportId");
        if(reportId != null){
            if(intent === "statusSucc"){
                const res = changeReportStatus(reportId,"success")
            }
            else if(intent === "statusFail"){
                const res = changeReportStatus(reportId,"fail")
            }
            else{
                const res = changeReportStatus(reportId,"pendding")
            }
        }
    }
    // const allReports = await adminGetReports(userId);
    return 0;
}