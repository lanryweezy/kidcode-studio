import { ComponentSchemaMap } from './types';
import { OUTPUT_COMPONENTS } from './outputComponents';
import { INPUT_COMPONENTS } from './inputComponents';
import { DISPLAY_COMPONENTS } from './displayComponents';
import { COMMUNICATION_COMPONENTS } from './communicationComponents';
import { EXTRA_COMPONENTS } from './extraComponents';

export type { ComponentObject, ComponentSchema, ComponentSchemaMap } from './types';

export { OUTPUT_COMPONENTS } from './outputComponents';
export { INPUT_COMPONENTS } from './inputComponents';
export { DISPLAY_COMPONENTS } from './displayComponents';
export { COMMUNICATION_COMPONENTS } from './communicationComponents';
export { EXTRA_COMPONENTS } from './extraComponents';

export { COMPONENT_LABELS_MAP, createComponentObject, executeComponentMethod, getCompatibleComponents } from './utilities';

export const COMPONENT_SCHEMA: ComponentSchemaMap = {
  ...OUTPUT_COMPONENTS,
  ...INPUT_COMPONENTS,
  ...DISPLAY_COMPONENTS,
  ...COMMUNICATION_COMPONENTS,
  ...EXTRA_COMPONENTS,
};
