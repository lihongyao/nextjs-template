import type { GetDataReq, WidgetConfig } from "../types";

export interface FooterProps {
  text: string;
}
export default {
  type: "footer",
  getData: async (payload: GetDataReq) => {
    console.log("footer payload >>> ", payload);
    return {
      data: { component: payload.component, text: "Footer Component" },
    };
  },
} satisfies WidgetConfig<FooterProps>;
