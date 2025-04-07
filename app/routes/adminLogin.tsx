import {
    Button,
    Input,
    Divider,
    Tabs,
    Tab,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Link
  } from "@heroui/react";
  import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
  import {
    Form
  } from "@remix-run/react";
  import { Mail, Lock, DoubleCheck, Eye, EyeClosed, User } from "iconoir-react";
  import { useEffect, useMemo, useState } from "react";
//   import {urlParameterWrapper} from "~/common";
//   import {useFetcherSubmit} from "~/components/hook";
  import {isNotificationContent} from "~/components/Notification";
  import {useNotification} from "~/components/NotificationContext";
import Meteors from "~/components/ui/Meteors";
  import {RequestMethod, sendRequest, shouldRedirect} from "~/lib/request";
import { checkLogin, userCookie } from "~/services/session.server";
  
export default function adminLogin() {

    const [password, setPassword] = useState<string>("");
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const isInvalidPassword = useMemo(() => {
      if (password === "") return false;
      if (password.length < 8 || password.length > 20) return true;
      if (!/[a-z]/.test(password)) return true;
      if (!/[A-Z]/.test(password)) return true;
      if (!/[0-9]/.test(password)) return true;
      if (!/^[a-zA-Z0-9!@#$%^&*()_+-=]*$/.test(password)) return true;
      return false;
    }, [password]);
  
  
    const [username, setUsername] = useState<string>("");
    const isInvalidUsername = useMemo(() => {
      if (username === "") return false;
      if (username.length < 2 || username.length > 20) return true;
      if (!/^[A-Za-z0-9\u4E00-\u9FFF_.-]*$/.test(username)) return true;
      return false;
    }, [username]);
    
    const [account, setAccount] = useState<string>("");
  
    return (
      <div className="flex items-center justify-center gap-3 flex-col w-[calc(100vw-2em)] max-w-[700px] min-h-[calc(100vh-12em)] m-auto">
        <Card className="w-[calc(100vw-2em)] max-w-[400px] m-auto">
          <Form method="post" >{/*onSubmit={submitForm} */}
            <CardHeader className="flex gap-3">
              <p className="justify-start text-xl font-bold pl-2">
                {"登录"}
              </p>
            </CardHeader>
            <Divider />
            <CardBody className="pb-0 flex flex-col">
                    <Input
                    
                      value={account}
                      onValueChange={setAccount}
                      isRequired
                      endContent={
                        <div className="flex items-center">
                          <User />
                        </div>
                      }
                      label="用户名"
                    //   type={passwordVisible ? "text" : "password"}
                    // className="w-full mx-0 px-0"
                      name="username"
                      placeholder="请输入你的用户名"
                      variant="bordered"
                    />
              <Input
                value={password}
                onValueChange={setPassword}
                isRequired
                endContent={
                <div className="flex items-center">
                    <Button isIconOnly variant="light" size="sm" onClick={() => setPasswordVisible(prev => !prev)}>
                        {passwordVisible ? <Eye /> : <EyeClosed />}
                    </Button>
                    <Divider orientation="vertical" className="mx-1" />
                    <Lock />
                </div>
                }
                    label="密码"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="请输入你的密码"
                    variant="bordered"
                />
            </CardBody>
            <Divider className="my-3" />
            <CardFooter className="flex justify-end pt-0">
                <p className="text-sm">忘记密码请联系技术中心</p>
                <Link size="sm" className="mx-2" href="/login">用户登录</Link>
                <div className="flex flex-col md:flex-row md:items-center items-end space-x-4">
                  <Button color="primary" type="submit" name="intent" value={"adminLogin"} isDisabled={
                    account === "" || password === "" // && selectedLoginType=== "password"|| isInvalid 
                  }>
                    登录
                  </Button>
                </div>
            </CardFooter>
          </Form>
        </Card>
      </div>
      // TODO: add captcha
    );
}
  
  
export const loader = async ({ request }: LoaderFunctionArgs) => {
    // const session = await getSession(request.headers.get("Cookie"));
    // if (session.has("token")) {
    //   return redirectWithToken(request, session.get("token") as string);
    // }
    return null;
}
  
export const action = async ({ request }: ActionFunctionArgs) => {
    
    const formData = await request.formData();

    // let isRefresh = false;
    // let saveToken = false;
    let id = '';
    let loginSuccessful;

    await checkLogin(formData,'adminLogin').then((res) => {
        loginSuccessful = res.res;
        id = res.userId;
    }).catch((err) => { return err;});

    if(loginSuccessful!=null){
        if (loginSuccessful) { //登录成功
            // console.log(id);
            const cookie = await userCookie.serialize({ userId:id });
            console.log(cookie);
            return redirect("/dashboard", {
                headers: {
                    "set-Cookie": cookie,
                }
              });
        }
        else{
            return { message: "登录失败，请检查用户名和密码是否正确" };
        }
    }
    return 0;


    // if(intent === "")

    // if (intent === "register") {
    //   req.url = "auth/register";
    //   req.body = {
    //     username: formData.get("username"),
    //     password: formData.get("password"),
    //     email: formData.get("email"),
    //     code: formData.get("code"),
    //   };
    //   isRefresh = true;
    // } else if (intent === "resetPassword") {
    //   req.url = "auth/resetPassword";
    //   req.body = {
    //     email: formData.get("email"),
    //     code: formData.get("code"),
    //     password: formData.get("password"),
    //   };
    //   isRefresh = true;
    // } else if (intent === "emailLogin") {
    //   req.url = "auth/loginByCode";
    //   req.body = {
    //     email: formData.get("email"),
    //     code: formData.get("code"),
    //   };
    //   saveToken = true;
    // } else if (intent === "passwordLogin") {
    //   req.url = "auth/login";
    //   req.body = {
    //     email: formData.get("email"),
    //     password: formData.get("password"),
    //   };
    //   saveToken = true;
    // } else if (intent === "sendCodeLogin") {
    //   req.url = "auth/sendEmailCode";
    //   req.body = {
    //     email: formData.get("email"),
    //     usage: "LOGIN",
    //   };
    //   saveToken = true;
    // } else if (intent === "sendCodeRegister") {
    //   req.url = "auth/sendEmailCode";
    //   req.body = {
    //     email: formData.get("email"),
    //     usage: "REGISTER",
    //   };
    // } else if (intent === "sendCodeReset") {
    //   req.url = "auth/sendEmailCode";
    //   req.body = {
    //     email: formData.get("email"),
    //     usage: "RESET_PASSWORD",
    //   };
    // }
  
    // const res = await sendRequest({
    //   request,
    //   method: RequestMethod.POST,
    //   ...req,
    // });
  
    // if(shouldRedirect(res)){
    //   return res;
    // }
  
    // if(saveToken && res?.token){
    //   // 这么写的原因是token被commitSession后需要跳转页面生效，但服务端session已经更新了，不进行判断会导致loader里面的session.has卡死
    //   session.set("token", res.token);
    //   return redirectWithToken(request, res.token,{
    //     headers: {
    //       "Set-Cookie": await commitSession(session),
    //     },
    //   });
    // }
  
    // // 不能回传notificationContent否则被判定为error
    // return json(
    //   isNotificationContent(res) ? res : { isRefresh },
    //   {
    //     headers: {
    //       "Set-Cookie": await commitSession(session),
    //     },
    //   }
    // );
}