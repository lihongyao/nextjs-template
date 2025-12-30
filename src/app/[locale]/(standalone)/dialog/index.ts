import { getGlobalDialog } from "@/components/ui/Dialog";

export const openWithGlobalInstance = () => {
  const dialog = getGlobalDialog();
  dialog.open("X1Dialog", {
    exitAnimation: "slide-right-out",
    onAfterClose() {
      console.log("X1 closed");
    },
  });
};
