import React, { createContext, useContext } from "react";

export function useData() {}

export function useDialogModals() {
  // 返回一个用于动态创建弹出窗口的函数
  return function (type: string, extraInfo: { [key: string]: string }) {};
}
