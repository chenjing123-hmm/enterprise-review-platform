/**
 * 设计 Token 统一导出
 * 用于前端 Tailwind CSS 和后台 Ant Design 5 的主题注入
 */

import tokens from './tokens.json';

export const designTokens = tokens;

// 色彩 Token
export const colors = tokens.colors;

// 字体 Token
export const typography = tokens.typography;

// 间距 Token
export const spacing = tokens.spacing;

// 阴影 Token
export const shadows = tokens.shadows;

// 圆角 Token
export const radii = tokens.radii;

// Tailwind CSS 映射函数
export function toTailwindConfig() {
  const { colors, spacing, shadows, radii } = tokens;
  return {
    colors: {
      primary: {
        DEFAULT: colors.primary['500'].value,
        50: colors.primary['50'].value,
        100: colors.primary['100'].value,
        200: colors.primary['200'].value,
        300: colors.primary['300'].value,
        400: colors.primary['400'].value,
        500: colors.primary['500'].value,
        600: colors.primary['600'].value,
        700: colors.primary['700'].value,
        800: colors.primary['800'].value,
        900: colors.primary['900'].value,
      },
      success: colors.semantic.success.value,
      warning: colors.semantic.warning.value,
      danger: colors.semantic.error.value,
      info: colors.semantic.info.value,
      neutral: Object.fromEntries(
        Object.entries(colors.neutral).map(([k, v]) => [k, (v as any).value])
      ),
    },
    spacing: Object.fromEntries(
      Object.entries(spacing).map(([k, v]) => [k, (v as any).value])
    ),
    boxShadow: Object.fromEntries(
      Object.entries(shadows).map(([k, v]) => [k, (v as any).value])
    ),
    borderRadius: Object.fromEntries(
      Object.entries(radii).map(([k, v]) => [k, (v as any).value])
    ),
  };
}

// Ant Design 5 主题 Token 映射函数
export function toAntdTheme() {
  const { colors, typography } = tokens;
  return {
    token: {
      colorPrimary: colors.primary['500'].value,
      borderRadius: parseInt(radii.base.value),
      fontFamily: `${typography.fontFamily.sans.value}, ${typography.fontFamily.mono.value}`,
      fontSize: parseInt(typography.fontSize.base.value),
      colorBgContainer: colors.neutral['0'].value,
      colorText: colors.neutral['900'].value,
      colorSuccess: colors.semantic.success.value,
      colorWarning: colors.semantic.warning.value,
      colorError: colors.semantic.error.value,
      colorInfo: colors.semantic.info.value,
    },
    components: {
      Table: {
        headerBg: colors.neutral['50'].value,
        rowHoverBg: colors.neutral['100'].value,
      },
    },
  };
}