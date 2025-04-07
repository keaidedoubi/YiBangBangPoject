// import {useFetcher} from "@remix-run/react";
// import React, {useEffect, useRef, useState} from "react";
// import {useNotification} from "~/components/NotificationContext";
// import {isNotificationContent, NotificationContent} from "~/components/Notification";
// import {urlParameterWrapper} from "~/common";
// import {MapData} from "~/lib/interface";

// interface useFetcherLoadProps<T, P=T> {
//   intent?: string,
//   received?: ((data: T, setValue: (value: P) => void) => void),
//   onError?: (content: NotificationContent) => void,
//   always?: () => void,
//   loadUrl?: string,
//   defaultValue?: P,
// }

// /**
//  * 自动加载数据的hook，T是fetcher的返回类型，P是useFetcherLoad处理后的返回类型
//  * @param intent SearchParams的intent参数
//  * @param received 获得data后的处理函数，setValue是对返回值处理的函数(T->P)
//  * @param onError 错误处理函数
//  * @param always 总是执行的函数
//  * @param loadUrl 从哪个loader中加载数据，默认为空
//  * @param defaultValue data的默认值
//  */
// export function useFetcherLoad<T, P=T>(
//   {
//     intent,
//     received,
//     onError,
//     always,
//     loadUrl = "",
//     defaultValue,
//   }: useFetcherLoadProps<T, P>
// ){

//   const fetcher = useFetcher();
//   const isLoading = useRef(false);
//   const {notice} = useNotification();
//   const [result, setResult] = useState<P|null>(defaultValue ?? null);

//   useEffect(() => {
//     const data = fetcher.data;
//     if(data !== undefined && fetcher.state === "idle" && isLoading.current){
//       isLoading.current = false;
//       if(isNotificationContent(data)){
//         notice(data);
//         onError?.(data);
//       }
//       else{
//         setResult(data as P);
//         received?.(data as T, setResult);
//       }
//       always?.();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [fetcher]);

//   const executeLoad = (args: MapData<unknown> = {}) => {
//     isLoading.current = true;
//     fetcher.load(urlParameterWrapper(loadUrl,{
//       ...(intent !== undefined ? {intent} : {}),
//       ...args
//     }));
//   };

//   return {
//     result,
//     executeLoad
//   };
// }

// interface MemorizedLoadProps<T, P> {
//   intent?: string,
//   received?: ((data: P) => void),
//   processReceived?: ((data: T) => P),
//   always?: (() => void),
//   loadUrl?: string,
// }

// /**
//  * 记录过去加载过的数据的hook,T是fetcher的返回类型，P是useFetcherLoad处理后的返回类型
//  * @param intent SearchParams的intent参数
//  * @param received 获得data后的处理函数
//  * @param always 总是执行的函数
//  * @param loadUrl 从哪个loader中加载数据，默认为空
//  * @param processReceived 对返回值处理的函数(T->P)
//  */
// export function useMemorizedFetcherLoad<T, P=T>(
//   {
//     intent,
//     received = undefined,
//     always = undefined,
//     loadUrl = "",
//     processReceived = (data: T) => data as unknown as P,
//   }: MemorizedLoadProps<T, P>,
// ){
//   const [result, setResult] = useState<P|null>(null);
//   const [resultMap, setResultMap] = useState<MapData<P>>({});
//   const [keyList, setKeyList] = useState<string[]>([]);
//   const isLoading = useRef(false);
//   const fetcher = useFetcher();
//   const {notice} = useNotification();

//   useEffect(() => {
//     const data = fetcher.data;
//     if(data !== undefined && fetcher.state === "idle" && isLoading.current){
//       isLoading.current = false;
//       if(isNotificationContent(data)){
//         notice(data);
//       }
//       else{
//         const ret = processReceived(data as T);
//         if(keyList.length > 0) {
//           setResultMap({...resultMap, [keyList[0]]: ret});
//           setKeyList(keyList.slice(1));
//         }
//         setResult(ret);
//         received?.(ret);
//       }
//       always?.();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [fetcher]);

//   const executeLoad = (key: string, args: MapData<unknown> = {}, resetMap = false) => {
//     if(resetMap){
//       setResultMap({});
//     }
//     if(!Object.hasOwn(resultMap, key) || resetMap) {
//       setKeyList([...(resetMap ? [] : keyList), key]);
//       isLoading.current = true;
//       fetcher.load(urlParameterWrapper(loadUrl,{
//         ...(intent !== undefined ? {intent} : {}),
//         ...args
//       }));
//     } else {
//       received?.(resultMap[key]);
//       always?.();
//       setResult(resultMap[key]);
//     }
//   };

//   const clear = () => setResultMap({});

//   return {
//     result,
//     executeLoad,
//     clear,
//   };
// }

// interface SubmitData<T extends ContentType> {
//   submitArgs?:
//     T extends "json" ? MapData<unknown> :
//       T extends "file" ? MapData<string | File> :
//         T extends "form" | "reactForm" ? FormData:
//           never
// }

// interface useFetcherSubmitProps<T extends ContentType = "json"> {
//   intent?: string,
//   received?: ((data: unknown, requestData: SubmitData<T>) => void),
//   onError?: (content: NotificationContent, requestData: SubmitData<T>) => void,
//   always?: ((requestData: SubmitData<T>) => void),
//   type?: T,
// }

// type SubmitArgs<T extends ContentType> =
//   T extends "json" ? MapData<unknown> :
//     T extends "file" ? FormData :
//       T extends "form" ? FormData :
//         T extends "reactForm" ? React.FormEvent<HTMLFormElement>:
//           never

// type ContentType = "file" | "json" | "form" | "reactForm";

// /**
//  * 提交数据的hook, onError会自动notice(NotificationContent)
//  * @param intent 提交的intent参数，form模式下Remix Form中可以在submit的button中添加intent字段，如果没有该字段则使用函数参数intent
//  * @param received 提交成功后的处理函数
//  * @param onError 错误处理函数
//  * @param always 总是执行的函数
//  * @param type 提交的类型，json为json数据，file为文件，form为表单
//  */
// export function useFetcherSubmit<T extends ContentType = "json">(
//   {
//     intent,
//     received,
//     onError,
//     always,
//     type = "json" as T,
//   }: useFetcherSubmitProps<T>
// ):
//   T extends "json" ? (args?: SubmitArgs<T>, extraIntent?: string) => void :
//     T extends "file" ? (args: SubmitArgs<T>, extraIntent?: string) => void :
//       T extends "form" ? (args: SubmitArgs<T>) => void:
//         () => void
// {
//   const fetcher = useFetcher();
//   const isSubmitting = useRef(false);
//   const {notice} = useNotification();
//   const requestData = useRef<SubmitData<T>>({});

//   useEffect(() => {
//     const data = fetcher.data;
//     if(data !== undefined && fetcher.state === "idle" && isSubmitting.current){
//       isSubmitting.current = false;
//       if(isNotificationContent(data)){
//         notice(data);
//         onError?.(data, requestData.current);
//       }
//       else{
//         received?.(data, requestData.current);
//       }
//       always?.(requestData.current);
//       requestData.current = {};
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [fetcher]);

//   /*
//    extraIntent是每个submit可以单独设置的intent
//    */
//   if(type === "json"){
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     return (args: MapData<unknown> = {}, extraIntent?: string) => {
//       const parameters = {
//         ...(extraIntent !== undefined ? {intent: extraIntent} : intent !== undefined ? {intent} : {}),
//         ...args
//       };
//       requestData.current = {submitArgs: parameters} as SubmitData<T>;
//       isSubmitting.current = true;
//       fetcher.submit(
//         parameters, {
//           method: "post",
//         }
//       );
//     };
//   }
//   else if(type === "file") {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     return (args: MapData<string | File>, extraIntent?: string | undefined) => {
//       const formData = new FormData();
//       extraIntent !== undefined ? formData.append("intent", extraIntent) : intent !== undefined ? formData.append("intent", intent) : null;
//       Object.keys(args).forEach((key) => {
//         formData.append(key, args[key]);
//       });
//       requestData.current = {submitArgs: formData} as SubmitData<T>;
//       isSubmitting.current = true;
//       fetcher.submit(
//         formData,
//         {
//           method: "post",
//           encType: "multipart/form-data"
//         }
//       );
//     };
//   }
//   else if(type === "form") {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     return (form: FormData) => {
//       requestData.current = {submitArgs: form} as SubmitData<T>;
//       isSubmitting.current = true;
//       fetcher.submit(
//         form,
//         {
//           method: "post",
//         }
//       );
//     };
//   }
//   else if(type === "reactForm") {
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error
//     return (form: React.FormEvent<HTMLFormElement>) => {
//       form.preventDefault();
//       const formData = new FormData(form.currentTarget);
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-expect-error
//       formData.append("intent", (form.nativeEvent as SubmitEvent)?.submitter?.value ?? intent ?? "");
//       requestData.current = {submitArgs: formData} as SubmitData<T>;
//       isSubmitting.current = true;
//       fetcher.submit(
//         formData,
//         {
//           method: "post",
//         }
//       );
//     };
//   }
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-expect-error
//   return ()=>{};
// }

// export function useKeyPress(targetKey: string, callback: () => void){
//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === targetKey) {
//         callback();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [targetKey, callback]);
// }

// export function useFirstLoad(callback: () => unknown){
//   const isFirstLoad = useRef(true);
//   useEffect(() => {
//     if(isFirstLoad){
//       callback();
//       isFirstLoad.current=false;
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
// }