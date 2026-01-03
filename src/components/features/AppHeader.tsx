"use client";

import { memo } from "react";
export default memo(function AppHeader() {
  return (
    <div data-name="AppHeader" className="fixed w-full top-0 left-0 h-14 bg-[#1A1A1A] flex justify-center items-center">
      <span className="text-xl text-white">App Header</span>
    </div>
  );
});
