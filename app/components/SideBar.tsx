import {
  Listbox,
  ListboxItem
} from "@heroui/listbox";
import { Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Image, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, User, useDisclosure } from "@heroui/react";
import { useLocation, useNavigate, useSubmit } from "@remix-run/react";
import { Bookmark, BookmarkBook, Clock, Git, Home, QuestionMark, SendMail, Settings, StatsReport } from "iconoir-react";
import { useEffect, useState } from "react";
// import config from '../services/servicesConfig.json';


const ListBoxItems = [
  {
    key:"/",
    content:"主页",
    icon:<Home/>
  },
  {
    key:"dashboard",
    content:"工作台",
    icon:<Git/>
  },
  {
    key:"accountmanagement",
    content:"账号管理",
    icon:<StatsReport/>,
  }, 
  {
    key:"report",
    content:"反馈",
    icon:<SendMail/>,
  }
  // {
  //   key:"favorite",
  //   content:"收藏",
  //   icon:<Bookmark/>,
  //   description:"开发中，敬请期待"
  // }
]

export default function SideBar({username = "", userId = 0 }: { username:string, userId:number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const historyModal = useDisclosure();
  const isHistoryModalOpen = historyModal.isOpen;
  const onHistoryModalOpen= historyModal.onOpen;
  const onHistoryModalClose = historyModal.onClose;
  const [isDismiss, setIsDismiss] = useState(false);
  const submit = useSubmit();

  return(
    <div className="w-full min-w-[150px] max-w-[240px] h-full border-neutral-300 border-r-2 col-start-1 row-start-1 row-span-5 ">

      {/* <Modal backdrop="opaque" size="xl" isOpen={isHistoryModalOpen} onClose={onHistoryModalClose} >
        <ModalContent>
        {(onHistoryModalClose) => (
            <>
              <ModalHeader className="text-slate-600">
                <span className="m-auto text-2xl">产品说明</span>
              </ModalHeader>
              <ModalBody className="pt-0">
                历史
              </ModalBody>
              <ModalFooter className="flex gap-12 justify-center">
                <Button color="primary" onPress={ () => { onHistoryModalClose(); if (isDismiss) submit({
                  intent: "dismiss",
                  username: username,
                  userId: userId
                }, {
                  method: "POST",
                  action: "/dashboard"
                }); } }>
                  启动！
                </Button>
              </ModalFooter>
            </>)}
        </ModalContent>
      </Modal> */}

      <div className="w-full flex justify-center pt-4">
        <Link href={location.pathname}>{/*https://subit.org.cn/ */}
          {/* <Image className="flex" width={150} src="/SubIT-Normal.svg"/> */}
        </Link>
      </div>
      {/*ListboxWrapper*/}
      <div className="w-full px-1 py-4 flex flex-col">{/*border-default-200 dark:border-default-100 border-small */}
        {/* <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <div className="flex flex-row ml-4 mb-4">
              <User as="button" avatarProps={{ isBordered: true, src: userId === 0 ? "" : "" }}//config.ssoRedirectServerUrl + "/avatar/" + userId.toString()
                name={username === "" ? "未登录" : username} className="transition-transform"
              />
            </div>
          </DropdownTrigger>
          <DropdownMenu variant="flat">
            <DropdownItem key="settings" className="h-fit gap-2" as={Link} href={config.ssoUrl + `/sso?from=${config.domain.startsWith("http") ? config.domain : "http://" + config.domain}`} startContent={<Settings/>}>
              {username === "" ? "登录" : "个人设置"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> */}
        <Listbox aria-label="Actions" disabledKeys={["favorite"]}
          onAction={(key) => { 
            if(key == "1"){ onOpen(); }
            else if(key == "history"){ onHistoryModalOpen(); }
            else{ navigate('/'+key); } 
          }}>
          { ListBoxItems.map((item) => (
            <ListboxItem className="h-11" key={item.key} startContent={item.icon} >
              {item.content}
            </ListboxItem>
          ))}
        </Listbox>
      </div>
    </div>
  );
}