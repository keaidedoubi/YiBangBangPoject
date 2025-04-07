// //接口中属性不全，需要时自行添加

// export type Permission = "BANNED" | "NORMAL" | "ADMIN" | "SUPER_ADMIN" | "ROOT";

// export interface ListData<T>{
//   totalSize: number,
//   begin: number,
//   list: T[],
// }

// export type MapData<T> = {
//   [key: string]: T,
// }

// export interface UserData {
//   email: string[],
//   hasAdmin: boolean,
//   id: number,
//   permission: Permission,
//   phone: string,
//   registrationTime: number
//   username: string,
//   seiue: {
//     archived: boolean,
//     realName: string,
//     studentId: string,
//   }[]
// }

// export type UserMapData = MapData<UserData>;

// export interface ServiceData {
//   id: number,
//   name: string,
//   description: string,
//   authorized: "ALL" | "NONE" | "BASIC",
// }

// export interface AuthorizationData {
//   id: number,
//   user: number,
//   service: number,
//   grantedAt: number,
//   cancel: boolean
// }