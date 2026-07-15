/**
 * IR Exporters — Generate target-specific code from IR nodes.
 * 
 * Each exporter takes IR nodes and produces code for a specific platform:
 * - TypeScript (existing codeGenerator.ts)
 * - Godot (GDScript)
 * - React Native (JSX)
 * 
 * The key insight: all exporters read from the SAME IR types.
 * Adding a new backend = writing one new exporter, not modifying the interpreter.
 */

export { exportToGodot, generateGDScriptFromIR, generateGodotProject } from './godotExporter';
export type { GodotExportResult } from './godotExporter';
export { exportToReactNative, generateReactNativeComponent } from './reactNativeExporter';
export type { ReactNativeExportResult } from './reactNativeExporter';
