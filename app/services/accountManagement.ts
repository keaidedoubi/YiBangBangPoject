import { prisma } from "./db.server";
import crypto, { generateKey } from 'crypto';

function generateRandomString(length = 8,chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    // 将字节映射到可用字符的索引范围内
    const index = bytes[i] % chars.length;
    result += chars[index];
  }
  return result;
}

export async function getAllUserInfo(){
    const allUser = await prisma.user.findMany();
    return allUser;
}

export async function addNewUsers(userInfo:Array<any>) {
    userInfo.forEach((user,i,userI)=>{
        if(user.username == ""){
            userI[i].username = generateRandomString(6)+String(Date.now()%10000);
            userI[i].Password = generateRandomString(12);
        }
    })
    try {
        const createMany = await prisma.user.createMany({
          data: userInfo.map((user) => ({
            id: user.userId,
            username: user.username,
            Password:user.Password,
            userGroup: user.userGroup,
          })),
        //   skipDuplicates: true, // 可选：如果 userid 重复则跳过
        })
        return createMany
      } catch (error) {
        console.error('Error creating users:', error)
        throw error // 将错误抛出，让调用者处理
      } finally {
        await prisma.$disconnect()
    }
}

export async function resetPassword(userId:string){
    const newPass = generateRandomString(12);
    const resetPasswd = await prisma.user.update({
        where: { id: userId }, 
        data: {
          Password: newPass, 
        },
      });
    return newPass;
}

export async function deleteUsers(userIds:Array<string>){
    const del = await prisma.user.deleteMany({ where:{ id:{ in:userIds }} })
    return del;
}