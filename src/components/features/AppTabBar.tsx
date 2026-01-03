"use client";

import { memo } from "react";
import { Link } from "@/i18n/navigation";
import { Routes } from "@/lib/routes";

export default memo(function AppTabBar() {
  const tabBarConfig = [
    { path: Routes.Home, label: "首页", icon: "home" },
    { path: Routes.Cart, label: "购物车", icon: "cart" },
    { path: Routes.Order, label: "订单", icon: "order" },
    { path: Routes.Profile, label: "个人中心", icon: "user" },
  ];

  return (
    <div data-name="AppTabBar" className=" fixed bottom-0 left-0 right-0  bg-[#1A1A1A] border-t-[2px] border-t-orange-500 rounded-t-[20px] ">
      <div className="h-[65px]  flex justify-around items-center">
        {tabBarConfig.map((item) => (
          <Link className="text-white" href={item.path} key={item.path}>
            {item.label}
          </Link>
        ))}
      </div>
      <div
        style={{
          height: "env(safe-area-inset-bottom)",
        }}
      ></div>
    </div>
  );
});
