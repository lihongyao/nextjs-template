import type { ComponentInfo } from "@/types";
import type { GetDataReq, WidgetConfig } from "../types";

export interface NestedProps {
  component: ComponentInfo;
}
export default {
  type: "nested",
  getData: async (payload: GetDataReq) => {
    console.log("nested payload >>> ", payload);
    return {
      data: { component: payload.component },
    };
  },
} satisfies WidgetConfig<NestedProps>;
