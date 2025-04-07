import { Image, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";

interface NavBarProp {
  isLogin: boolean;
}

const NavBar: React.FC<NavBarProp> = ({ isLogin }) => {
  return(
    <Navbar position="static" className="border-b-1">
      <NavbarBrand >
        <div className="flex justify-center">
          
        </div>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-8" justify="center">
        <NavbarItem>
          <Link href="/" className="border-y-1 border-white hover:border-b-cyan-700 text-black">首页</Link>
        </NavbarItem>
        <NavbarItem>
          {!isLogin?
          (<Link href="/login" className="border-y-1 border-white hover:border-b-cyan-700 text-black">登录</Link>):
          (<Link href="/logout" className="border-y-1 border-white hover:border-b-cyan-700 text-black">退出登录</Link>)}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
export default NavBar;