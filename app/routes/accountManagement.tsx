import { Alert, Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, form, Input, modal, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, useDisclosure } from "@heroui/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { col, label } from "framer-motion/client";
import { Archive, MoreHoriz, Plus, ProfileCircle, User, UserScan } from "iconoir-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SideBar from "~/components/SideBar";
import { addNewUsers, deleteUsers, getAllUserInfo, resetPassword } from "~/services/accountManagement";
import { getUserFromCookie } from "~/services/session.server";
import { checkIfAdmin } from "~/services/user.server";

type User = {
  id: string,
  username: string,
  userGroup: number,
  reports: Array<any>
}
type VisibleColumns = Set<string> | "all";
type alertData = {
  userId:string,
  newPass:string
};

const INITIAL_VISIBLE_COLUMNS = ["id", "username", "userGroup", "reports", "actions"];
export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "USERNAME", uid: "username", sortable: true },
  // { name:"PASSWORD",uid:"password" },
  { name: "USERGROUP", uid: "userGroup", sortable: true },
  { name: "REPORTS", uid: "reports" },
  { name: "ACTIONS", uid: "actions" },
];
export const USERGROUP = [
  { key: "0", label: "管理员" },
  { key: "1", label: "用户" },
]


export default function accountManagement() {
  const [newUserId, setNewUserId] = useState<string>('');
  const [newUserUsername, setNewUserUsername] = useState<string>('');
  const [selectUserGroup, setSelectUserGruop] = useState<number>(1);
  const [selectedDropdown, setSelectedDropdown] = useState<string>('');
  const [alertValue,setAlertValue] = useState<alertData>({ userId:'2',newPass:'1'});
  const loaderData: Array<any> = useLoaderData();
  const actionData: any = useActionData();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedKeys, setSelectedKeys] = useState();
  const [visibleColumns, setVisibleColumns] = React.useState<VisibleColumns>(
    new Set(INITIAL_VISIBLE_COLUMNS), // 或者 "all"
  );
  const [modalMode, setModalMode] = useState<any>();//useState<"reset"|"delete"|"add">();

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        // changing the rows border radius
        // first
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        // middle
        "group-data-[middle=true]/tr:before:rounded-none",
        // last
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    [],
  );

  const handleOpen = (mode: string,dropdownid?:string) => {
    setModalMode(mode);
    if(dropdownid != undefined && dropdownid != null){
      if(dropdownid == '1'){ return alert("警告：该管理员账号不可删除") }
      setSelectedDropdown(dropdownid);
    }
    onOpen();
  };

  //渲染单元格
  const renderCell = useCallback((user: User, columnKey: React.Key) => {
    // console.log(user);
    // console.log(columnKey)
    const cellValue = user[columnKey as keyof User];
    switch (columnKey) {
      case "id":
        return (
          <div>
            <p>{cellValue}</p>
          </div>
        );
      case "username":
        return (
          <div>
            <p>{cellValue}</p>
            {/* <p>{user.username}</p> */}
          </div>
        );
      case "userGroup":
        return (
          <div>
            {user.userGroup}
          </div>
        );
      case "reports":
        return (
          <div>
            {user.reports}
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <MoreHoriz className="text-bold-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu onAction={(key) => setModalMode(key)}>
                <DropdownItem key="reset" onPress={() => { setSelectedDropdown(""); handleOpen("reset",user.id); }}>重置密码</DropdownItem>
                <DropdownItem key="edit" onPress={() => { setSelectedDropdown(""); handleOpen("edit",user.id) }}>编辑用户</DropdownItem>
                <DropdownItem key="delete" onPress={() => { setSelectedDropdown(""); handleOpen("delete",user.id) }}>删除用户</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);


  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") {
      return columns; // 如果 visibleColumns 是 "all"，返回所有列
    }
    // 如果 visibleColumns 是 Set<string>，过滤列
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns, columns]);



  //表格上部
  const topContent = useMemo(() => {

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          {/* <Input
          isClearable
          classNames={{
            base: "w-full sm:max-w-[44%]",
            inputWrapper: "border-1",
          }}
          placeholder="Search by name..."
          size="sm"
          startContent={<SearchIcon className="text-default-300" />}
          value={filterValue}
          variant="bordered"
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        /> */}
          <div className="flex gap-3">
            {/* <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Status
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown> */}
            {/* <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                size="sm"
                variant="flat"
              >
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={visibleColumns}
              selectionMode="multiple"
              onSelectionChange={setVisibleColumns}
            >
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown> */}
            <Button className="bg-foreground text-background" endContent={<Plus />} size="sm" onPress={() => handleOpen("add")}>
              添加新账号
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {loaderData.length} users</span>
          <label className="flex items-center text-default-400 text-small">
            每页行数：
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [])

  //表格下部

  // const items = React.useMemo(() => {
  //   const start = (page - 1) * rowsPerPage;
  //   const end = start + rowsPerPage;

  //   return filteredItems.slice(start, end);
  // }, [page, filteredItems, rowsPerPage]);
  const [filterValue, setFilterValue] = React.useState("");
  const hasSearchFilter = Boolean(filterValue);
  const pages = Math.ceil(loaderData.length / rowsPerPage);
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        {/* <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${items.length} selected`}
        </span> */}
      </div>
    );
  }, [selectedKeys, page, pages, hasSearchFilter]);//items.length

  const alertVisible = useMemo(() => {
    if(actionData == null || actionData == undefined)
    { return false }
    if(actionData.newPass != undefined && actionData.userId != undefined){
      setAlertValue(actionData);
      return true;
    }
    else{ return false; }
  },[actionData])

  return (
    <div className="min-w-[480px] min-h-[780px] flex flex-col w-screen h-screen text-center">
      <div className="grid grid-rows-5 grid-cols-6 h-full">
        <SideBar username={"Admin"} userId={0} />
        <div className="col-start-2 col-span-5 row-start-1 row-span-5">
        <Alert description={"请务必保存好新密码"} title={
          <div className="flex text-center">
            <p className="my-auto text-lg">{alertValue.userId}</p>
            <p className="m-2">该账号的的新密码为：</p>
            <p className="my-auto bold text-lg">{alertValue.newPass}</p>
          </div>
          } 
            className="w-3/5 m-auto mt-4 before:bg-warning bg-default-50 dark:bg-background shadow-sm
            border-1 border-default-200 dark:border-default-100
            relative before:content-[''] before:absolute before:z-10
            before:left-0 before:top-[-1px] before:bottom-[-1px] before:w-1
            rounded-l-none border-l-0"color="warning"
            isVisible={alertVisible}/>
          <Table
            className="w-4/5 m-auto mt-12"
            isCompact
            removeWrapper
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            aria-label="Table"
            classNames={classNames}
            topContent={topContent}
            topContentPlacement="outside"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            checkboxesProps={{
              classNames: {
                wrapper: "after:bg-foreground after:text-background text-background",
              },
            }}
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn key={column.uid} allowsSorting={column.sortable}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody emptyContent={"No users found"} items={loaderData}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                (modalMode == "delete") ? (
                  <Form method="post">
                    <ModalHeader>
                      <p className="text-xl bold">危险操作</p>
                    </ModalHeader>
                    <ModalBody>
                      <p>确认要删除此用户吗？此操作无法撤销。</p>
                      <Input className="hidden" name="users" value={selectedDropdown}></Input>
                    </ModalBody>
                    <ModalFooter>
                      <Button  color="primary" variant="flat" onPress={onClose}>
                        取消
                      </Button>
                      <Button color="danger" type="submit"
                        name="intent" value={"deluser"} onPress={onClose}>
                        确定
                      </Button>
                    </ModalFooter>
                  </Form>
                ) : (modalMode == "reset") ? (
                  <Form method="post">
                    <ModalHeader>
                      <p className="text-xl bold">危险操作</p>
                    </ModalHeader>
                    <ModalBody>
                      <p>确认要重置此用户的密码吗？此操作无法撤销。</p>
                      <Input className="hidden" name="users" value={selectedDropdown}></Input>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" variant="flat" onPress={onClose}>
                        取消
                      </Button>
                      <Button type="submit" color="danger"
                        name="intent" value={"resetuser"} onPress={onClose}>
                        确定
                      </Button>
                    </ModalFooter>
                  </Form>
                ) : (modalMode == "add") ? (
                  <>
                    <Form method="post">
                      <ModalHeader className="flex flex-col gap-1">添加用户</ModalHeader>
                      <ModalBody>
                        <Input
                          name="userid"
                          isRequired
                          value={newUserId}
                          onChange={(e) => setNewUserId(e.target.value)}
                          label="学号"
                          placeholder="用户id（学号）"
                          variant="bordered"
                          endContent={
                            <UserScan />
                          }
                        />
                        <Input
                          // endContent={
                          //   <ProfileCircle/>
                          // }
                          name="username"
                          value={newUserUsername}
                          onChange={(e) => setNewUserUsername(e.target.value)}
                          label="用户名"
                          placeholder="可指定用户名，不指定则由系统随机生成"
                          variant="bordered"
                        />
                        <div className="flex py-2 px-1 justify-between">
                          <Select
                            name="usergroup"
                            isRequired
                            className="max-w-xs"
                            // endContent={ <Archive/> }
                            label="请选择用户组"
                            placeholder="选择用户组"
                            selectedKeys={[selectUserGroup]}
                            variant="bordered"
                            onChange={(e: any) => { setSelectUserGruop(e.target.value) }}
                          >
                            {USERGROUP.map((ug) => (
                              <SelectItem key={ug.key}>{ug.label}</SelectItem>
                            ))}
                          </Select>
                        </div>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="danger" variant="flat" onPress={onClose}>
                          取消
                        </Button>
                        <Button type="submit" isDisabled={newUserId == "" || newUserId == null || selectUserGroup == null} color="primary"
                          name="intent" value={"adduser"} onPress={onClose}>
                          确定
                        </Button>
                      </ModalFooter>
                    </Form>
                  </>
                ) : <></>
              )}
            </ModalContent>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserFromCookie(request);
  if (userId == null || !checkIfAdmin(userId)) {
    return redirect("/login")
  }
  const allUsers = await getAllUserInfo();
  return allUsers;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await getUserFromCookie(request);
  const formData = await request.formData();
  const intent = formData.get("intent")
  if (userId == null || !checkIfAdmin(userId)) {
    return redirect("/login")
  }
  if (intent === "adduser") {
    const users = [{
      userId: formData.get('userid'),
      username: formData.get('username'),
      userGroup: Number(formData.get('usergroup')),
      Password: ''
    }]
    await addNewUsers(users);
    console.log(users)
  }
  else if (intent === "deluser" || intent === "resetuser") {
    const users = formData.get("users");
    if( users == null || typeof users != 'string'){ return { status:401 } }
    if( intent === "deluser" ){
      if(users == '1'){ return json({ status:400 }) }
      let UsersArr = [];
      UsersArr.push(users);
      const res = await deleteUsers(UsersArr);
    }
    else{
      const newPass = await resetPassword(users);
      return json({ newPass: newPass,userId:users });
    }
  }
  // console.log(formData)
  // console.log(formData.get("userid"))
  return 0;
}
