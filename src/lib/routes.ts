export const Routes = {
  Home: "/",
  Cart: "/cart",
  Order: "/order",
  Profile: "/profile",
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
  CdnImage: "/cdn-image",
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
