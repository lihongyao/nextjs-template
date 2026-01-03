import AppHeader from "../features/AppHeader";
import AppTabBar from "../features/AppTabBar";

export default function H5Layout(props: { children: React.ReactNode }) {
  return (
    <div data-name="H5Layout" className="pt-14 pb-[80px]">
      <AppHeader />
      {props.children}
      <AppTabBar />
    </div>
  );
}
