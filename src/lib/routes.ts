export const Routes = {
  Home: "/",
  Login: "/details",
  Details: "/details",
  Dialog: "/dialog",
  DynamicComps: "/dynamic-comps",
  Examples: "/examples",
  Mine: "/mine",
  Products: "/products",
  ThemeAndSkin: "/theme-and-skin",
  I18n: "/i18n",
  Motion: "/motion",
  MotionSub: "/motion/sub",
  ModalProfile: "/modal-profile",
} as const;

export type Route = keyof typeof Routes;
