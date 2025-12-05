import type { GetDataReq, WidgetConfig } from "../types";

export interface CardProps {
  name: string;
  list: number[];
}

export default {
  type: "card",
  getData: async (payload: GetDataReq) => {
    console.log("card payload >>> ", payload);
    return {
      data: { name: "Card Component", list: [1, 2, 3, 4] },
    };
  },
} satisfies WidgetConfig<CardProps>;
