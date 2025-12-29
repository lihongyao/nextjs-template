import type { GetDataReq, WidgetConfig } from "../types";

export interface BannerProps {
  title: string;
  banners: string[];
}

export default {
  type: "banner",
  getData: async (payload: GetDataReq) => {
    console.log("banner payload >>> ", payload);
    return {
      data: {
        component: payload.component,
        title: "Banner Component",
        banners: ["A", "B", "C"],
      },
    };
  },
} satisfies WidgetConfig<BannerProps>;
