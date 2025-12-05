import type { ComponentInfo } from "@/types";

type NestedObject = Record<string, unknown>;

/**
 * 获取组件渲染所需的数据 - 请求参数
 */
export interface GetDataReq {
  /** 接口返回的组件配置 */
  component: ComponentInfo;
}

/**
 * 获取组件渲染所需的数据 - 响应结果
 * 有的组件可能不需要在服务端拿数据，只需拿组件配置，只需在 getData 中返回 { data: payload.component } 即可。
 * 注意：data 数据和组件 Props 是一致的，也就是说，假设组件 props 是 { name: string }，那么返回值应该是 { data: { name: 'xxx' } }
 * @param data 渲染所需的数据
 */
export interface GetDataRes<T = NestedObject> {
  data: T;
}

/**
 * 动态组件配置
 */
export interface WidgetConfig<T = NestedObject> {
  /** 组件类型，必须和接口返回的组件中的 type 值一致 */
  type: string;

  /**
   * 在 SSR 阶段获取组件渲染所需的数据（按需）
   * @param payload 后端返回的组件配置 ComponentInfo
   * @retrun GetDataRes<T>
   */
  getData?: (payload: GetDataReq) => Promise<GetDataRes<T>>;
}
