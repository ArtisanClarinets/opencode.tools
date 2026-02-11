export { StandardTemplate, createStandardTemplate, StandardTemplateConfig } from './standard';
export { WhitepaperTemplate, createWhitepaperTemplate, WhitepaperTemplateConfig } from './whitepaper';
export { TechnicalTemplate, createTechnicalTemplate, TechnicalTemplateConfig } from './technical';

export type TemplateConfig = 
  | StandardTemplateConfig 
  | WhitepaperTemplateConfig 
  | TechnicalTemplateConfig;

export type TemplateType = 'standard' | 'whitepaper' | 'technical';

export function createTemplate(
  type: TemplateType,
  config?: Partial<TemplateConfig>
): StandardTemplate | WhitepaperTemplate | TechnicalTemplate {
  switch (type) {
    case 'standard':
      return new StandardTemplate(config as Partial<StandardTemplateConfig>);
    case 'whitepaper':
      return new WhitepaperTemplate(config as Partial<WhitepaperTemplateConfig>);
    case 'technical':
      return new TechnicalTemplate(config as Partial<TechnicalTemplateConfig>);
    default:
      return new StandardTemplate(config as Partial<StandardTemplateConfig>);
  }
}

export function getTemplateName(template: StandardTemplate | WhitepaperTemplate | TechnicalTemplate): string {
  return template.getTemplateName();
}

export function getTemplateStyling(
  template: StandardTemplate | WhitepaperTemplate | TechnicalTemplate
) {
  return template.getStyling();
}

export {
  StandardTemplate,
  WhitepaperTemplate,
  TechnicalTemplate,
  createStandardTemplate,
  createWhitepaperTemplate,
  createTechnicalTemplate,
};
