import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface BrandConfig {
  theme: string;
  skin: string;
}

// === 获取项目根目录 ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../");

// === 定义路径 ===
const STYLES_ROOT = path.resolve(ROOT_DIR, "src/assets/styles");
const GENERATED_DIR = path.resolve(STYLES_ROOT, "generated");
const BRAND_CONFIG_DIR = path.resolve(ROOT_DIR, "src/configs/brands");

// === 读取环境变量 ===
const APP = process.env.app ?? "afunx_br";
const ENV = process.env.env ?? "dev";

if (!APP || !ENV) {
  console.error("❌ 请设置环境变量 app 和 env");
  process.exit(1);
}

// === 动态导入品牌配置 ===
const brandConfigPath = path.resolve(BRAND_CONFIG_DIR, `${APP}.${ENV}.ts`);

let brandConfig: BrandConfig;
try {
  const mod = await import(brandConfigPath);
  brandConfig = mod.default as BrandConfig;
} catch (err) {
  console.error(`❌ 加载品牌配置失败: ${brandConfigPath}`);
  throw err;
}

// === 生成 CSS 引入内容 ===
const outputContent = `/**
 * ⚠️ 自动生成文件
 * 品牌: ${APP}
 * 环境: ${ENV}
 *
 * 请勿手动修改
 */

import "../core/index.css";
import "../themes/${brandConfig.theme}.css";
import "../skins/${brandConfig.skin}.css";
`;

// === 写入文件 ===
fs.mkdirSync(GENERATED_DIR, { recursive: true });

const outputFile = path.resolve(GENERATED_DIR, "brand.css.ts");
fs.writeFileSync(outputFile, outputContent, "utf8");

// === 打印日志 ===
console.log("✅ 品牌 CSS 已生成");
console.log("   文件 :", outputFile);
console.log("   品牌 :", APP);
console.log("   环境 :", ENV);
console.log("   主题 :", brandConfig.theme);
console.log("   皮肤 :", brandConfig.skin);
