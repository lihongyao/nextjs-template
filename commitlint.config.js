export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复 bug
        "docs", // 文档更新
        "style", // 代码格式（不影响逻辑）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试
        "build", // 构建系统或依赖更新
        "ci", // CI 配置修改
        "chore", // 杂项任务
        "revert", // 回滚
      ],
    ],
    "subject-case": [0],
  },
};
