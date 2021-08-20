import React, { createContext, useContext } from "react";

export function useData() {}

export function usePopupModals() {
  // 返回一个用于动态创建弹出框架的函数
  return function (type: string, extraInfo: { [key: string]: string }) {};
}
