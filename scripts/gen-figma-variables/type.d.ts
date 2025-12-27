// 公共类型
export type VariableResolvedType = "BOOLEAN" | "FLOAT" | "STRING" | "COLOR";

// 颜色类型示例，如果需要可扩展
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface VariableAlias {
  id: string;
  type: "VARIABLE_ALIAS";
}

export type VariableScope = string[];
export type VariableCodeSyntax = Record<string, string>;

// ------------------- Local 接口 -------------------
export interface FigmaLocalVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: VariableResolvedType;
  valuesByMode: Record<string, boolean | number | string | Color | VariableAlias>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: VariableScope[];
  codeSyntax: VariableCodeSyntax;
}

export interface FigmaLocalVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: Array<{ modeId: string; name: string; parentModeId: string }>;
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
  variableIds: string[];
  isExtension: boolean;
  parentVariableCollectionId: string;
  inheritedVariableIds: string[];
  localVariableIds: string[];
  variableOverrides: Record<string, Record<string, boolean | number | string | Color | VariableAlias>>;
  deletedButReferenced: boolean;
}

export interface FigmaLocalResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaLocalVariable>;
    variableCollections: Record<string, FigmaLocalVariableCollection>;
  };
}

// ------------------- Published 接口 -------------------
export interface FigmaPublishedVariable {
  id: string;
  subscribed_id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: VariableResolvedType;
  updatedAt: string;
}

export interface FigmaPublishedVariableCollection {
  id: string;
  subscribed_id: string;
  name: string;
  key: string;
  updatedAt: string;
}

export interface FigmaPublishedResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaPublishedVariable>;
    variableCollections: Record<string, FigmaPublishedVariableCollection>;
  };
}

// ------------------- Tokens 接口 -------------------
export interface TokenMode {
  name: string;
  values: TokenModeValue[];
}

export interface TokenModeValue {
  key: string;
  value: string;
}

export interface Tokens {
  [key: string]: {
    modes: TokenMode[];
  };
}

export type Nested<T> = {
  [key: string]: Nested<T> | T;
};
