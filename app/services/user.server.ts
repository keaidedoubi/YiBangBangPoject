import { prisma } from "./db.server";

export async function checkIfAdmin(userId:string){
    await prisma.report.findFirst({ where:{ userId } })
    .then(( userGroup:any )=>{
        if( userGroup == 0 ){
            return true;
        }
        else { return false; }
   });
}

