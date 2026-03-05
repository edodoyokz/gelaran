import { ModernTemplate } from "./modern";
import { ClassicTemplate } from "./classic";
import type { JSX } from "react";
import type { TicketPdfData, VoucherConfig } from "../types";

export type TemplateComponent = (props: {
  ticket: TicketPdfData;
  config: VoucherConfig;
}) => JSX.Element;

export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: ModernTemplate, // Temporary: minimal will be added later
};

export function getTemplate(componentKey: string): TemplateComponent {
  const Template = TEMPLATE_REGISTRY[componentKey];
  if (!Template) {
    console.warn(`Template "${componentKey}" not found, using modern`);
    return TEMPLATE_REGISTRY.modern;
  }
  return Template;
}

export function mergeVoucherConfig(
  defaultConfig: VoucherConfig,
  overrides?: Partial<VoucherConfig> | null
): VoucherConfig {
  if (!overrides) return defaultConfig;

  return {
    colors: { ...defaultConfig.colors, ...overrides.colors },
    assets: { ...defaultConfig.assets, ...overrides.assets },
    toggles: { ...defaultConfig.toggles, ...overrides.toggles },
    customSections: overrides.customSections ?? defaultConfig.customSections,
  };
}
