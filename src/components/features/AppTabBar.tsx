"use client";

import { memo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/class-helpers";
import { type Route, Routes } from "@/lib/routes";
import Icon from "../ui/Icon";
import type { SvgPathName } from "../ui/Icon/svgPath_all";

export interface TabBarItemProps {
  path: Route;
  label: string;
  icon: SvgPathName;
}
export default memo(function AppTabBar() {
  const tabBarConfig: TabBarItemProps[] = [
    { path: Routes.Home, label: "首页", icon: "home" },
    { path: Routes.Cart, label: "购物车", icon: "cart" },
    { path: Routes.Order, label: "订单", icon: "order" },
    { path: Routes.Profile, label: "个人中心", icon: "profile" },
  ];
  const pathname = usePathname();
  return (
    <div data-name="AppTabBar" className=" fixed bottom-0 left-0 right-0  bg-[#1A1A1A] border-t-[2px] border-t-orange-500 rounded-t-[20px] ">
      <div className="h-[65px]  flex justify-around items-center">
        {tabBarConfig.map((item) => (
          <Link className="flex flex-col gap-1 " href={item.path} key={item.path}>
            <Icon className={cn("size-5")} color={pathname === item.path ? "orange" : "white"} name={item.icon} />
            <span className={cn("text-xs", pathname === item.path ? "text-[orange]" : "text-[white]")}>{item.label}</span>
          </Link>
        ))}
      </div>
      <div style={{ height: "env(safe-area-inset-bottom)" }} />
    </div>
  );
});
