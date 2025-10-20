import './widget.css';

export { default as FhirWidget } from './FhirWidget';
export type { FhirWidgetProps } from './FhirWidget';
export { decodeWorkspace, findTemplateByName } from './utils';
export type { ExportedWorkspace } from './utils';

// For vanilla JS integration
if (typeof window !== 'undefined') {
  import('./FhirWidget').then(module => {
    (window as any).FhirWidget = module.default;
  });
}