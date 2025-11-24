import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Color, FigmaLocalResponse, FigmaPublishedResponse, TokenMode, Tokens, VariableAlias } from "./type";

/**
 * 美术/研发集合名称约定
 * 1. 基础 tokens："primitives-color", "primitives-radius", "primitives-space"
 * 2. 皮肤 tokens: "semantic-color"
 * 3. 主题 tokens: "semantic-radius", "semantic-space"
 * 4. 字体 tokens: "text-style"
 */

// Figma API 访问令牌和文件Key
const figmaToken = "<Your_Token>";
const figmaFileKey = "<Your_FileKey>";

// 定义输出路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.resolve(__dirname, "../../");

const sourceDir = path.resolve(__root, "public/styles");
const tokensOutputDir = path.resolve(__root, "public/styles/tokens");
const skinsOutputDir = path.resolve(__root, "public/styles/skins");
const themesOutputDir = path.resolve(__root, "public/styles/themes");
const fontsOutputDir = path.resolve(__root, "public/styles/fonts");

// 接口地址
const host = `https://api.figma.com/v1/files/${figmaFileKey}/variables`;

(async function main() {
  // 1. 获取 Figma 变量数据
  console.log("Fetching Figma local variables...");
  const localSource = (await fetchFigmaVariables("/local")) as FigmaLocalResponse;

  console.log("Fetching Figma published variables...");
  const publishedSource = (await fetchFigmaVariables("/published")) as FigmaPublishedResponse;

  // 2. 解析变量数据
  console.log("Parsing variables...");
  const parsedVariables = parseVariables(localSource, publishedSource);

  // 3. 输出 source.json 供调试使用
  console.log("Generating source file...");
  ensureDir(sourceDir);
  const sourcePath = path.join(sourceDir, "figma-variables.json");
  fs.writeFileSync(sourcePath, JSON.stringify(parsedVariables, null, 2), "utf-8");

  // 4. 生成 CSS 变量文件
  console.log("Generating CSS variables...");
  generatorPrimitivesTokens(parsedVariables);
  generatorSkins(parsedVariables);
  generatorThemes(parsedVariables);
  generatorFonts(parsedVariables);
})();

/**
 * 确保目录存在
 * @param dir 目录路径
 */
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * 格式化变量名为 CSS 变量，如 neutral/s01/950 转换为 --neutral-s01-950
 * @param name 变量名
 */
function formatVariableName(name: string) {
  return `--${name
    .split("/")
    .map((s) => s.replace(/\s+/g, ""))
    .join("-")}`;
}

/**
 * 请求 Figma 变量数据
 * @param path
 */
async function fetchFigmaVariables(path: string) {
  const res = await fetch(`${host}${path}`, { headers: { "X-Figma-Token": figmaToken } });
  if (!res.ok) throw new Error(`Failed to fetch Figma variables: ${res.statusText}`);
  return res.json();
}

/**
 * 解析 Figma 变量数据
 * 由于本地变量数据可能包含未发布的变量，需结合已发布数据进行过滤
 * 注意点：
 * 1. 变量值可能是别名（VARIABLE_ALIAS），需进一步解析
 * 2. 颜色值需转换为十六进制字符串
 * 3. 浮点数值需添加单位（如 px）—— 根据实际情况处理
 * 4. text-style 集合的变量命名需包含模式名称前缀
 * 5. 只处理需要的变量集合
 * 6. 变量命名需格式化为 CSS 变量形式
 * 7. 生成的变量按集合和模式分类存储
 * 8. 已发布数据里面不会有真正的数据，只有 id 和 key，用于过滤本地数据（这是一个坑点）
 * 9. ...
 * @param localSource 本地变量数据
 * @param publishedSource 已发布变量数据
 * @returns
 */
function parseVariables(localSource: FigmaLocalResponse, publishedSource: FigmaPublishedResponse) {
  /**
   * 1. 获取已发布的集合和变量ID列表
   */
  const publishedCollectionKeys = new Set(Object.keys(publishedSource.meta.variableCollections));
  const publishedVariableKeys = new Set(Object.keys(publishedSource.meta.variables));

  /**
   * 2. 在本地数据中过滤出已发布的集合和变量对应的数据体
   */
  const variableCollections = Object.fromEntries(Object.entries(localSource.meta.variableCollections).filter(([key]) => publishedCollectionKeys.has(key)));
  const variables = Object.fromEntries(Object.entries(localSource.meta.variables).filter(([key]) => publishedVariableKeys.has(key)));

  /**
   * 3. 定义变量，存储解析结果（json）
   */
  const parsedVariables: Tokens = {};

  /**
   * 4. 遍历集合，解析变量
   */

  for (const collection of Object.values(variableCollections)) {
    const { modes, variableIds, name: collectionName } = collection;

    const modesData: TokenMode[] = [];

    for (const mode of modes) {
      const modeData: TokenMode = { name: mode.name, values: [] };

      for (const varId of variableIds) {
        const variable = variables[varId];
        if (!variable) continue; // 安全校验

        /**
         * 获取当前 mode 下的变量值（初始值）
         */
        let value = variable.valuesByMode[mode.modeId];

        /**
         * 处理引用变量 (VARIABLE_ALIAS)
         * 判断 value 是否是别名，即语义化变量，引用了另一个变量
         */
        if (value && typeof value === "object" && (value as VariableAlias).type === "VARIABLE_ALIAS") {
          const aliasVar = variables[(value as VariableAlias).id];
          if (!aliasVar) continue;
          value = `var(${formatVariableName(aliasVar.name)})`;
        }

        /**
         * 处理颜色
         */
        if (variable.resolvedType === "COLOR" && typeof value === "object") {
          value = figmaColorToHex(value as Color);
        }

        /**
         * 处理浮点数
         */
        if (variable.resolvedType === "FLOAT" && typeof value === "number") {
          value = `${value}px`;
        }

        /**
         * 处理字体 Tokens key
         */
        let key = variable.name;
        if (collectionName === "text-style") {
          key = `${mode.name}-${key}`;
        }

        key = formatVariableName(key);

        /**
         * 存储
         */
        modeData.values.push({ key, value: value as string });
      }

      modesData.push(modeData);
    }

    parsedVariables[collectionName] = { modes: modesData };
  }

  return parsedVariables;
}

/**
 * 将 Figma 颜色对象转换为十六进制字符串
 * @param color Figma 颜色对象
 */
function figmaColorToHex(color: Color): string {
  const { r, g, b, a } = color;
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  const alphaHex = a === 1 ? "" : toHex(a);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;
}

/**
 * 获取文件头
 * @returns
 */
function getFileHeader() {
  const now = new Date().toISOString();
  return `/* 
  温馨提示：
  📢 本文件由自动化脚本 gen-figma-variables 生成，请勿手动修改
  ⏰ 生成时间：${now}
*/\n\n`;
}

/**
 * 📃 生成基础的 tokens
 * @param tokens 变量数据
 */
export function generatorPrimitivesTokens(tokens: Tokens) {
  const tokensOutputFile = path.join(tokensOutputDir, "index.css");
  ensureDir(tokensOutputDir);

  const header = getFileHeader();

  let cssContent = ":root {\n";

  // 处理 primitives 开头的 tokens
  Object.entries(tokens).forEach(([collectionName, collection]) => {
    if (!collectionName.includes("primitives")) return;
    collection.modes.forEach((mode) => {
      cssContent += `  /* ${collectionName} - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += "\n";
    });
  });

  // 处理 text-style
  if (tokens["text-style"]) {
    const textStyleCollection = tokens["text-style"];
    textStyleCollection.modes.forEach((mode) => {
      cssContent += `  /* text-style - ${mode.name} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += "\n";
    });
  }

  cssContent += "}\n";

  fs.writeFileSync(tokensOutputFile, header + cssContent, "utf-8");
  console.log(`✅ Primitives tokens 已生成: ${tokensOutputFile}`);
}

/**
 * 📃 生成皮肤 Tokens
 * @param tokens
 */
export function generatorSkins(tokens: Tokens) {
  ensureDir(skinsOutputDir);
  const header = getFileHeader();

  const semanticColorCollection = tokens["semantic-color"];
  if (!semanticColorCollection) return;

  semanticColorCollection.modes.forEach((mode) => {
    const filePath = path.join(skinsOutputDir, `${mode.name}.css`);

    let cssContent = `/* semantic-color - ${mode.name} */\n`;
    cssContent += `[data-skin="${mode.name}"] {\n`;
    mode.values.forEach((v) => {
      cssContent += `  ${v.key}: ${v.value};\n`;
    });
    cssContent += "}\n";

    fs.writeFileSync(filePath, header + cssContent, "utf-8");
    console.log(`✅ Skin CSS 已生成: ${filePath}`);
  });
}

/**
 * 📃 生成主题 Tokens
 * @param tokens
 */
export function generatorThemes(tokens: Tokens) {
  ensureDir(themesOutputDir);
  const header = getFileHeader();

  const themeCollections = ["semantic-radius", "semantic-space"];
  const modeNamesSet = new Set<string>();

  // 收集所有模式名称
  themeCollections.forEach((collectionName) => {
    const collection = tokens[collectionName];
    if (!collection) return;
    collection.modes.forEach((mode) => {
      modeNamesSet.add(mode.name);
    });
  });

  const modeNames = Array.from(modeNamesSet).sort();

  modeNames.forEach((modeName) => {
    const filePath = path.join(themesOutputDir, `${modeName}.css`);

    let cssContent = `/* ${modeName} */\n`;
    cssContent += `[data-theme="${modeName}"] {\n`;

    themeCollections.forEach((collectionName) => {
      const collection = tokens[collectionName];
      if (!collection) return;
      const mode = collection.modes.find((m) => m.name === modeName);
      if (!mode) return;

      cssContent += `  /* ${collectionName} */\n`;
      mode.values.forEach((v) => {
        cssContent += `  ${v.key}: ${v.value};\n`;
      });
      cssContent += "\n";
    });

    cssContent += "}\n";

    fs.writeFileSync(filePath, header + cssContent, "utf-8");
    console.log(`✅ Theme CSS 已生成: ${filePath}`);
  });
}

/**
 * 📃 生成字体 class CSS 文件
 * @param tokens 解析好的 tokens
 */
export function generatorFonts(tokens: Tokens) {
  ensureDir(fontsOutputDir);
  const header = getFileHeader();

  const textStyleCollection = tokens["text-style"];
  if (!textStyleCollection) return;

  const filePath = path.join(fontsOutputDir, `index.css`);
  let cssContent = `${header}\n`;

  // 默认 H5
  cssContent += `/* h5 */\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === "h5")
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, "");
        cssContent += `.${className} { font-size: var(${v.key}); }\n`;
      });
    });

  // Tablet 媒体查询
  cssContent += `\n/* tablet */\n@media (min-width: 1024px) {\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === "h5")
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, "");
        const tabletVar = v.key.replace(/^--h5-/, "--tablet-");
        cssContent += `  .${className} { font-size: var(${tabletVar}); }\n`;
      });
    });
  cssContent += `}\n`;

  // PC 媒体查询
  cssContent += `\n/* pc */\n@media (min-width: 1440px) {\n`;
  textStyleCollection.modes
    .filter((mode) => mode.name === "h5")
    .forEach((mode) => {
      mode.values.forEach((v) => {
        const className = v.key.replace(/^--h5-/, "");
        const pcVar = v.key.replace(/^--h5-/, "--pc-");
        cssContent += `  .${className} { font-size: var(${pcVar}); }\n`;
      });
    });
  cssContent += `}\n`;

  fs.writeFileSync(filePath, cssContent, "utf-8");
  console.log(`✅ Fonts CSS 已生成: ${filePath}`);
}
