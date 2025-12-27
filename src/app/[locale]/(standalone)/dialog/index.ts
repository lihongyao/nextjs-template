import { getGlobalDialog } from "@/components/ui/Dialog";

export const check = () => {
  const dialog = getGlobalDialog();
  dialog.open("X1Dialog", {
    exitAnimation: "slide-right-out",
  });
};
