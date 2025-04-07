// import {Session} from "@remix-run/node";
// import {redirect} from "@remix-run/react";
// import {NotificationContent} from "~/components/Notification";
// import {MapData} from "~/lib/interface";
// import {destroySession, getSession} from "~/sessions";
// import config from "~/config.json";
// import {isResponse, urlParameterWrapper} from "~/common";

// export enum RequestMethod {
//   GET = "GET",
//   POST = "POST",
//   PUT = "PUT",
//   DELETE = "DELETE",
//   PATCH = "PATCH",
//   HEAD = "HEAD",
// }

// interface checkResponseProps extends SendRequestProps {
//   request: Request;
//   res: Response;
//   session: Session;
// }

// async function checkResponse({request, session, res, url, body={}, serverUrl=config.serverUrl, ifError=undefined} : checkResponseProps) {
//   if (res.ok) {
//     const resData = await res.json();
//     return resData.data === undefined ? null : resData.data;
//   } else if(ifError != undefined) {
//     return ifError;
//   } else if (res.status === 401 && !request.url.includes("/login")) {
//     return redirect(urlParameterWrapper("/login",{from: request.url}), {
//       headers: {
//         "Set-Cookie": await destroySession(session),
//       },
//     });
//   } else if (res.status === 404 && !request.url.includes("/login")) {
//     return redirect("/");
//   } else {
//     try{
//       const resData = await res.json();
//       console.log(serverUrl + url, resData.code, resData.message);
//       return {
//         id: Date.now(),
//         code: resData.code,
//         message: resData.message,
//       } as NotificationContent;
//     }
//     catch(e){
//       console.log(serverUrl + url, res.status, res.statusText, JSON.stringify(body));
//       return {
//         id: Date.now(),
//         code: res.status,
//         message: res.statusText,
//       } as NotificationContent;
//     }
//   }
// }

// export interface SendRequestProps {
//   request: Request,
//   method: RequestMethod,
//   url: string,
//   body?: object,
//   serverUrl?: string
//   ifError?: object|undefined,
//   token?: string,
// }


// export async function sendRequest({request, method, url, body={}, serverUrl=config.serverUrl, ifError=undefined, token} : SendRequestProps) {
//   /*
//   发送请求,请求成功时response有data且data!=null则返回data,否则返回{...response,url},请求失败时返回NotificationContent
//   默认serverUrl为config.serverUrl,需要访问其他服务器时传入serverUrl
//   request为loader/action参数
//   serverUrl末尾不需要加'/'
//   url前需要加'/'
//   请求失败时若设置ifError则返回ifError
//   若需要自动redirect需要在loader/action中判断返回值是否shouldRedirect, 建议直接使用sendMultiRequests
//   仅支持json格式body
//   */
//   const session = await getSession(request.headers.get("Cookie"));
//   token = token ?? session.get("token")

//   console.log(`fetch: ${url} method:${method} body:${body ? JSON.stringify(body) : "{}"}`);

//   const res = await fetch(serverUrl + url, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? {"Authorization": `Bearer ${token}`} : {}),
//     },
//     ...(method !== "GET" && method !== "HEAD" && {body: JSON.stringify(body)}),
//   });
//   return await checkResponse({res, session, request, method, url, body, serverUrl, ifError});
// }

// export interface SendFileProps {
//   request: Request,
//   method: RequestMethod,
//   url: string,
//   body: File,
//   serverUrl?: string
//   ifError?: object|undefined
// }

// export async function sendFile({request, method, url, body, serverUrl=config.serverUrl, ifError=undefined} : SendFileProps) {
//   /*
//   发送请求,请求成功时response有data且data!=null则返回data,否则返回{...response,url},请求失败时返回NotificationContent
//   默认serverUrl为config.serverUrl,需要访问其他服务器时传入serverUrl
//   request为loader/action参数
//   serverUrl末尾需要加'/'
//   url前不需要加'/'
//   请求失败时若设置ifError则返回ifError
//   若需要自动redirect需要在loader/action中判断返回值是否shouldRedirect, 建议直接使用sendMultiRequests
//   */
//   const session = await getSession(request.headers.get("Cookie"));
//   const token = session.get("token");

//   console.log(`fetch file: ${url} ` + JSON.stringify({
//     method,
//     body: body.name,
//   }));

//   const res = await fetch(serverUrl + url, {
//     method,
//     headers: {
//       "Content-Type": "application/octet-stream",
//       "Authorization": `Bearer ${token}`,
//     },
//     body: body.stream(),
//     duplex: "half",
//   });
//   return await checkResponse({res, session, request, method, url, body, serverUrl, ifError});
// }

// export async function awaitForAllValuesInObject<T extends object>(data: object): Promise<T>{
//   const result: MapData<unknown> = {};
//   const promiseList = [];
//   const keyList = [];
//   for(const [key, value] of Object.entries(data)){
//     promiseList.push(value);
//     keyList.push(key);
//   }
//   const ret = await Promise.all(promiseList);
//   for(let i = 0; i < keyList.length; i++ ){
//     result[keyList[i]] = ret[i];
//   }
//   return result as T;
// }


// export type SendMultiRequestsProps<T extends string> = {
//   [key in T]: {
//     method: RequestMethod,
//     url: string,
//     body?: object,
//     requiredIntent?: boolean,
//     serverUrl?: string,
//     ifError?: object|undefined,
//     condition?: boolean|undefined, //表示是否获取
//   }
// }

// type SendMultiRequestsResult<T extends string> = {
//   //eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key in T]: NotificationContent|any;
// }

// export async function sendMultiRequests<T extends SendMultiRequestsProps<Exclude<keyof T,number|symbol>>>(request: Request, requestMap: T, intentList: string[]|null = null ):Promise<SendMultiRequestsResult<Exclude<keyof T, number | symbol>>>
// {
//   /*
//   发送多个请求,返回形如{requestMap.key: data}的对象
//   intentList存在时仅会返回intentList中包含的元素
//   requiredIntent表示是否必须该项在intentList中时才发送请求
//   */
//   const result: SendMultiRequestsResult<Exclude<keyof T,number|symbol>> = {} as SendMultiRequestsResult<Exclude<keyof T,number|symbol>>;
//   const promiseList = [];
//   const keyList = [];
//   for(const [key, value] of Object.entries<{
//     method: RequestMethod,
//     url: string,
//     body?: object,
//     requiredIntent?: boolean,
//     serverUrl?: string,
//     ifError?: object|undefined,
//     condition?: boolean|undefined,
//   }>(requestMap)){
//     if(intentList != null && !intentList.includes(key)){
//       continue;
//     }
//     if(value.requiredIntent && !intentList?.includes(key)){
//       continue;
//     }
//     if(value.condition === false){
//       continue;
//     }
//     promiseList.push(sendRequest({request, ...value}));
//     keyList.push(key);
//   }
//   const ret = await Promise.all(promiseList);
//   for(let i = 0; i < keyList.length; i++ ){
//     if(shouldRedirect(ret[i])){
//       return ret[i];
//     }
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     result[keyList[i]] = ret[i];
//   }
//   return result;
// }

// export interface RedirectResponse extends Response {
//   status: 302
// }

// export function shouldRedirect(data: object): data is RedirectResponse {
//   return isResponse(data) && data.status === 302;
// }

// export async function awaitThenReturnInLoader<T1 extends SendMultiRequestsResult<string>[]|SendMultiRequestsResult<string>, T2 extends MapData<object>>(
//   multiData: T1,
//   extraData: T2 = {} as T2,
// ): Promise<(T1&T2)|RedirectResponse>{
//   /*
//   自动等待所有promise完成
//   可以判断返回值object中是否有需要redirect，并自动返回
//   仅支持检查子一级
//   multiData传输需要展开放入返回值的对象(可为列表)，一般为sendMultiRequests的返回值
//   原因是sendMultiRequests在需要redirect时会直接返回Response, 将Response展开会出问题
//   extraData传输剩余的的返回对象
//   */
//   const extraDataRes = await awaitForAllValuesInObject<T2>(extraData);
//   const multiDataRes:SendMultiRequestsResult<string>[] = await Promise.all(Array.isArray(multiData) ? multiData : [multiData]) as SendMultiRequestsResult<string>[];
//   for(const value of [...Object.values(extraDataRes),...multiDataRes]){
//     if(shouldRedirect(value)){
//       return value;
//     }
//   }

//   return {...extraDataRes, ...Object.assign({}, ...multiDataRes)};
// }


