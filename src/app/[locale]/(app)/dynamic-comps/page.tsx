import { ClientOnly } from "@/components/features/ClientOnly";
import type { WidgetConfig } from "@/components/widgets/types";
import { loadDynamicComponent } from "@/lib/helpers";
import type { ComponentInfo } from "@/types";

async function fetchComps(): Promise<ComponentInfo[]> {
  return [
    { type: "banner", lang_attr: { lang: 1 } },
    { type: "card", lang_attr: { lang: 2 } },
    { type: "footer", lang_attr: { lang: 3 } },
    { type: "divider", lang_attr: { lang: 4 } },
    { type: "nested", lang_attr: { lang: 5 } },
  ];
}

export default async function DynamicCompsPage() {
  console.log("__DynamicCompsPage__");

  // 1️⃣ 获取后台组件配置
  const comps = await fetchComps();

  // 2️⃣ 动态加载本地组件配置
  const configModules = await Promise.all(
    comps.map(async (c) => {
      try {
        const mod = await import(`../../../../components/widgets/${c.type}/index.ts`);
        return mod.default;
      } catch (error) {
        console.log(error);
        console.warn(`组件 ${c.type} 加载失败`);
        return null;
      }
    }),
  );
  const widgetConfigs: WidgetConfig[] = configModules.filter(Boolean) ?? [];

  // 3️⃣ 执行 getData,获取组件数据
  const dataResults = await Promise.all(
    widgetConfigs.map(async (cfg) => {
      const component = comps.find((c) => c.type === cfg.type)!;
      return cfg.getData?.({ component });
    }),
  );

  // 4️⃣ 构造最终渲染数据
  const renderData = widgetConfigs.map((cfg, idx) => ({
    type: cfg.type,
    data: dataResults[idx]?.data ?? {},
  }));

  // 5️⃣ 渲染客户端组件 + Suspense
  return (
    <>
      {renderData.map((item) => {
        const ClientComp = loadDynamicComponent(item.type, "client");
        const SuspenseComp = loadDynamicComponent(item.type, "suspense");

        return (
          <ClientOnly key={item.type} fallback={<SuspenseComp {...item.data} />}>
            <ClientComp {...item.data} />
          </ClientOnly>
        );
      })}
    </>
  );
}
