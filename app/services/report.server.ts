import { prisma } from "./db.server";
import { getUserFromCookie } from "./session.server";


export async function sendReport(content:string,userId:string) {
  const createReport = await prisma.report.create({ data:{
    content,
    userId,
    status: "pendding" // or any default status value
  }});
  return createReport;
}

export async function getReports(userId:string) {
  const reports = await prisma.report.findMany({ where:{ userId } });
  return reports;
}

export async function sendReply(content:string,userId:string,reportId:string) {

  // const createReply = await prisma.reply.create({ data:{
  //   content,
  //   userId,
  //   reportId
  // } });
  // return createReply;
}

export async function adminGetReports(userId:string) {
  await prisma.user.findUnique({ where:{ id:userId } })
    .then(( user:any )=>{ if(user.userGroup != 0){ return { status:403 }; }});
  const allReports = await prisma.report.findMany();
  return allReports;
}



export async function changeReportStatus(reportId:any, newStatus:string) {
  // await prisma.report.findUnique({ where })
  const changeStatus = await prisma.report.update({
    where: { id: reportId }, 
    data: {
      status: newStatus, 
    },
  });
  return changeStatus
}