import { Button, Card, Form, ScrollShadow, Textarea, user } from "@heroui/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { use } from "framer-motion/client";
import { useEffect, useState } from "react";
import NavBar from "~/components/NavBar";
import Particles from "~/components/ui/Particles";
import { prisma } from "~/services/db.server";
import { getReports, sendReport } from "~/services/report.server";
import { getUserFromCookie, userCookie } from "~/services/session.server";

export default function Report() {
    const [text, setText] = useState<string>("");
    const reports = useLoaderData<Array<Object>>();
    //   const [Reports, setReports] = useState<Array<Object>>([]);

    //   const [Reports, setReports] = useState<any>();

    //   useEffect(() => {
    //     if(reports){
    //         setReports(reports);
    //     }
    //   })
    const [color, setColor] = useState("#ffffff");
    useEffect(() => {
        setColor("#000000");
    }, []);

    return (
        <div className="min-w-[480px] min-h-[780px] flex flex-col w-screen h-screen text-center">
            {/* <SideBar/> */}
            <NavBar isLogin={true}/>
            <div className="w-full h-full grid grid-rows-8 grid-cols-5 ">
                <Particles
                    className="absolute inset-0"
                    quantity={150}
                    ease={80}
                    color={color}
                    refresh
                />
                <Card className="mt-8 col-start-2 col-span-3 row-start-1 row-span-3">
                    <div className="m-auto w-full ">
                        <h1 className="my-2 text-xl">提交反馈</h1>
                        <Form method="post">
                            <Textarea labelPlacement="outside" //label="Description"
                                placeholder="请输入您的建议" variant="bordered" name="content" type="text"
                                className="w-3/5 mx-auto" minRows={4} maxRows={5}
                                value={text} onValueChange={setText}
                            />
                            <Button type="submit" variant="ghost" className="w-24 m-auto">提交</Button>
                        </Form>
                    </div>
                </Card>
                <div className="col-start-2 col-span-3 row-start-4 mt-4">
                <h2 className="text-xl">我的反馈</h2>
                <ScrollShadow className=" w-full m-auto max-h-[300px]">
                    {!reports ? (
                        <p>暂无反馈</p>
                    ) : (reports.map((report: any) => (
                        <Card className="my-4 mx-2 py-4">
                            {/* <p>id:{report.id}</p> */}
                            <p>状态:{
                                report.status=="pendding"?
                                <span className="text-yellow-500">反馈处理中</span>:
                                report.status=="success"?
                                <span className="text-emerald-500">反馈已被接纳</span>:
                                report.status=="fail"?
                                <span className="text-rose-500">反馈已被驳回</span>:<span className="text-rose-500">出现错误，请联系管理员</span>
                            }</p>
                            <p>反馈内容:</p>
                            <ScrollShadow className="max-w-fit px-6 m-auto">
                                <div>{report.content}</div>
                            </ScrollShadow>
                            {!report.replies ? (<span className="text-gray-500">暂无回复</span>) : (report.replies.map((reply: any) => (
                                <div>
                                    <p>{reply.id}</p>
                                    <p>{reply.content} - {reply.isAdmin ? "管理员" : "用户"}</p>
                                </div>
                            )))}
                        </Card>
                    )))
                    }
                     </ScrollShadow>
                </div>
               
            </div>
        </div>
    );
}

export const loader: LoaderFunction = async ({ request }) => {
    // route protected by user session
    const userId = await getUserFromCookie(request);
    if (userId == null) {
        return redirect("/login");
    }
    const report = await getReports(userId);
    // console.log(report);
    return report;
};

export const action: ActionFunction = async ({ request }) => {
    const userId = await getUserFromCookie(request);
    const formData = await request.formData();
    const content = formData.get("content");

    if (userId == null) {
        return redirect("/login");
    }
    if (content != null) {
        const res = await sendReport(content as string, userId);
        console.log(res)
    }
    // 创建新的反馈
    // await prisma.report.create({
    //   data: {
    //     userId,
    //     content,
    //     status: "pending",
    //   },
    // });

    return null;
};
