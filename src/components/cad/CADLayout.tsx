import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';
import { CADState, CADObject3D, CADOperationType, CADMirrorPlane, INITIAL_CAD_STATE } from '../../types/cad';
import {
  createBoxParameters, createCylinderParameters, createSphereParameters, setParameterValue,
  applyFillet, applyChamfer, applyShell, applyLinearArray, applyCircularArray, applyMirror,
} from '../../services/cadParametrics';
import { exportCADModel } from '../../services/cadExporter';
import { applyAssemblyConstraint } from '../../services/cadAssembly';
import CADViewport, { CADViewportHandle } from './CADViewport';
import CADToolbar from './CADToolbar';
import ModelTree from './ModelTree';
import PropertiesPanel from './PropertiesPanel';
import OperationsPanel from './OperationsPanel';
import SketchMode from './SketchMode';
import MeasurementTool from './MeasurementTool';
import BOMPanel from './BOMPanel';
import PrintPreview from './PrintPreview';
import { CAD_TEMPLATES, CADTemplate } from './CADTemplates';

const genId = () => Math.random().toString(36).substring(2, 10);

interface CADLayoutProps {
  onBack: () => void;
}

const CADLayout: React.FC<CADLayoutProps> = ({ onBack }) => {
  const [state, setState] = useState<CADState>(INITIAL_CAD_STATE);
  const [leftPanelWidth, setLeftPanelWidth] = useState(240);
  const [rightPanelWidth, setRightPanelWidth] = useState(260);
  const [leftTab, setLeftTab] = useState<'tree' | 'templates'>('tree');
  const [rightTab, setRightTab] = useState<'properties' | 'operations' | 'bom' | 'print'>('properties');
  const viewportRef = useRef<CADViewportHandle>(null);

  const updateState = useCallback((updates: Partial<CADState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const pushHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-30), prev.objects],
      redoStack: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const prevObjects = prev.undoStack[prev.undoStack.length - 1];
      return {
        ...prev,
        undoStack: prev.undoStack.slice(0, -1),
        redoStack: [prev.objects, ...prev.redoStack],
        objects: prevObjects,
        selectedObjectIds: [],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const nextObjects = prev.redoStack[0];
      return {
        ...prev,
        redoStack: prev.redoStack.slice(1),
        undoStack: [...prev.undoStack, prev.objects],
        objects: nextObjects,
        selectedObjectIds: [],
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const addObject = useCallback((type: 'box' | 'cylinder' | 'sphere') => {
    pushHistory();
    const id = genId();
    let obj: CADObject3D;

    switch (type) {
      case 'box':
        obj = {
          id, name: `Box ${state.objects.length + 1}`, type: 'box',
          materialId: state.materialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createBoxParameters(30, 30, 30),
          geometry: new THREE.BoxGeometry(3, 3, 3),
        };
        break;
      case 'cylinder':
        obj = {
          id, name: `Cylinder ${state.objects.length + 1}`, type: 'cylinder',
          materialId: state.materialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createCylinderParameters(15, 30, 24),
          geometry: new THREE.CylinderGeometry(1.5, 1.5, 3, 24),
        };
        break;
      case 'sphere':
        obj = {
          id, name: `Sphere ${state.objects.length + 1}`, type: 'sphere',
          materialId: state.materialId,
          position: { x: 0, y: 1.5, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          visible: true, locked: false, children: [],
          parameters: createSphereParameters(15, 24, 16),
          geometry: new THREE.SphereGeometry(1.5, 24, 16),
        };
        break;
    }

    setState(s => ({
      ...s,
      objects: [...s.objects, obj!],
      selectedObjectIds: [id],
    }));
  }, [state.objects.length, state.materialId, pushHistory]);

  const selectObject = useCallback((id: string) => {
    setState(s => ({
      ...s,
      selectedObjectIds: id ? [id] : [],
      activeTool: 'none',
    }));
  }, []);

  const deleteObject = useCallback((id: string) => {
    pushHistory();
    setState(s => ({
      ...s,
      objects: s.objects.filter(o => o.id !== id),
      selectedObjectIds: s.selectedObjectIds.filter(sid => sid !== id),
    }));
  }, [pushHistory]);

  const duplicateObject = useCallback((id: string) => {
    pushHistory();
    const obj = state.objects.find(o => o.id === id);
    if (!obj) return;
    const newId = genId();
    const dup: CADObject3D = {
      ...obj,
      id: newId,
      name: `${obj.name} (Copy)`,
      position: { x: obj.position.x + 2, y: obj.position.y, z: obj.position.z + 2 },
      geometry: obj.geometry?.clone(),
      parameters: obj.parameters.map(p => ({ ...p })),
    };
    setState(s => ({
      ...s,
      objects: [...s.objects, dup],
      selectedObjectIds: [newId],
    }));
  }, [state.objects, pushHistory]);

  const toggleVisibility = useCallback((id: string) => {
    setState(s => ({
      ...s,
      objects: s.objects.map(o => o.id === id ? { ...o, visible: !o.visible } : o),
    }));
  }, []);

  const toggleLock = useCallback((id: string) => {
    setState(s => ({
      ...s,
      objects: s.objects.map(o => o.id === id ? { ...o, locked: !o.locked } : o),
    }));
  }, []);

  const renameObject = useCallback((id: string, name: string) => {
    setState(s => ({
      ...s,
      objects: s.objects.map(o => o.id === id ? { ...o, name } : o),
    }));
  }, []);

  const changeParameter = useCallback((objectId: string, paramName: string, value: number) => {
    pushHistory();
    setState(s => ({
      ...s,
      objects: s.objects.map(o => {
        if (o.id !== objectId) return o;
        return setParameterValue(o, paramName, value);
      }),
    }));
  }, [pushHistory]);

  const changePosition = useCallback((objectId: string, axis: 'x' | 'y' | 'z', value: number) => {
    pushHistory();
    setState(s => ({
      ...s,
      objects: s.objects.map(o => {
        if (o.id !== objectId) return o;
        return { ...o, position: { ...o.position, [axis]: value } };
      }),
    }));
  }, [pushHistory]);

  const changeRotation = useCallback((objectId: string, axis: 'x' | 'y' | 'z', value: number) => {
    pushHistory();
    setState(s => ({
      ...s,
      objects: s.objects.map(o => {
        if (o.id !== objectId) return o;
        return { ...o, rotation: { ...o.rotation, [axis]: value } };
      }),
    }));
  }, [pushHistory]);

  const changeMaterial = useCallback((materialId: string) => {
    updateState({ materialId });
    setState(s => ({
      ...s,
      materialId,
      objects: s.objects.map(o =>
        s.selectedObjectIds.includes(o.id) ? { ...o, materialId } : o
      ),
    }));
  }, [updateState]);

  const handleOperation = useCallback((type: CADOperationType, params: Record<string, number | string>) => {
    if (state.selectedObjectIds.length === 0 && type !== 'extrude') return;
    pushHistory();

    if (type === 'fillet' || type === 'chamfer' || type === 'shell') {
      const targetObj = state.objects.find(o => state.selectedObjectIds.includes(o.id));
      if (!targetObj || !targetObj.geometry) return;

      let newGeo: THREE.BufferGeometry;
      if (type === 'fillet') {
        newGeo = applyFillet(targetObj.geometry, params.radius as number);
      } else if (type === 'chamfer') {
        newGeo = applyChamfer(targetObj.geometry, params.distance as number);
      } else {
        newGeo = applyShell(targetObj.geometry, params.wallThickness as number);
      }

      const newType = type === 'fillet' ? 'fillet' as const : type === 'chamfer' ? 'chamfer' as const : 'shell' as const;

      setState(s => ({
        ...s,
        objects: s.objects.map(o =>
          o.id === targetObj.id
            ? {
              ...o,
              type: newType,
              geometry: newGeo,
              name: `${targetObj.name} (${type})`,
              parameters: [
                ...o.parameters,
                ...(type === 'fillet'
                  ? [{ name: 'filletRadius', type: 'length' as const, value: params.radius as number, min: 0.5, max: 50, step: 0.5, label: 'Fillet Radius' }]
                  : type === 'chamfer'
                    ? [{ name: 'chamferDistance', type: 'length' as const, value: params.distance as number, min: 0.5, max: 50, step: 0.5, label: 'Chamfer Distance' }]
                    : [{ name: 'wallThickness', type: 'length' as const, value: params.wallThickness as number, min: 0.5, max: 50, step: 0.5, label: 'Wall Thickness' }]
                ),
              ],
            }
            : o
        ),
      }));
      return;
    }

    if (type === 'linear_array' || type === 'circular_array' || type === 'mirror') {
      const targetObj = state.objects.find(o => state.selectedObjectIds.includes(o.id));
      if (!targetObj || !targetObj.geometry) return;

      let newGeo: THREE.BufferGeometry;
      const count = (params.count as number) || 5;
      const spacing = (params.spacing as number) || 20;
      const radius = (params.radius as number) || 30;
      const axis = (params.axis as 'X' | 'Y' | 'Z') || 'X';
      const plane = (params.plane as CADMirrorPlane) || 'XY';

      if (type === 'linear_array') {
        newGeo = applyLinearArray(targetObj.geometry, axis, count, spacing);
      } else if (type === 'circular_array') {
        newGeo = applyCircularArray(targetObj.geometry, axis, count, radius);
      } else {
        newGeo = applyMirror(targetObj.geometry, plane);
      }

      const newId = genId();
      const newObj: CADObject3D = {
        ...targetObj,
        id: newId,
        name: `${targetObj.name} (${type.replace('_', ' ')})`,
        type: 'pattern',
        geometry: newGeo,
        position: { ...targetObj.position },
        parameters: [],
      };

      setState(s => ({
        ...s,
        objects: [...s.objects, newObj],
        selectedObjectIds: [newId],
      }));
      return;
    }

    if (type === 'union' || type === 'subtract' || type === 'intersect') {
      if (state.selectedObjectIds.length < 2) return;
      const objs = state.selectedObjectIds
        .map(id => state.objects.find(o => o.id === id))
        .filter((o): o is CADObject3D => !!o && !!o.geometry);

      if (objs.length < 2) return;

      const newId = genId();
      const geo1 = objs[0].geometry!.clone();
      const geo2 = objs[1].geometry!.clone();

      geo2.translate(
        objs[1].position.x - objs[0].position.x,
        objs[1].position.y - objs[0].position.y,
        objs[1].position.z - objs[0].position.z,
      );

      let resultGeo: THREE.BufferGeometry;
      if (type === 'union') {
        resultGeo = mergeSimple(geo1, geo2);
      } else if (type === 'subtract') {
        geo2.scale(-1, -1, -1);
        geo2.computeVertexNormals();
        resultGeo = mergeSimple(geo1, geo2);
      } else {
        resultGeo = geo1;
      }

      const newObj: CADObject3D = {
        id: newId,
        name: `${objs[0].name} ${type} ${objs[1].name}`,
        type: 'boolean',
        materialId: objs[0].materialId,
        position: { ...objs[0].position },
        rotation: { ...objs[0].rotation },
        scale: { ...objs[0].scale },
        visible: true,
        locked: false,
        children: [],
        parameters: [],
        geometry: resultGeo,
      };

      setState(s => ({
        ...s,
        objects: [...s.objects.filter(o => !state.selectedObjectIds.includes(o.id)), newObj],
        selectedObjectIds: [newId],
      }));
      return;
    }

    setState(s => ({
      ...s,
      activeOperation: type,
    }));
  }, [state.selectedObjectIds, state.objects, pushHistory]);

  const handleExport = useCallback(async (options: { format: 'stl' | 'stl_binary' | 'obj' | 'gltf' | 'glb' | '3mf' | 'step'; unit: 'mm' | 'cm' | 'inch'; includeColors: boolean }) => {
    const visibleObjects = state.objects.filter(o => o.visible && o.geometry);
    if (visibleObjects.length === 0) return;
    try {
      await exportCADModel(visibleObjects, options);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [state.objects]);

  const loadTemplate = useCallback((template: CADTemplate) => {
    pushHistory();
    const objects = template.create();
    setState(s => ({
      ...s,
      objects,
      selectedObjectIds: [],
    }));
  }, [pushHistory]);

  const selectedObject = state.objects.find(o => state.selectedObjectIds.includes(o.id)) || null;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-b border-slate-200 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"
        >
          <ArrowLeft size={14} />
          Home
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <span className="text-sm font-bold text-slate-700">3D Creator</span>
      </div>

      <CADToolbar
        state={state}
        onStateChange={updateState}
        onExport={handleExport}
        onAddObject={addObject}
        onUndo={undo}
        onRedo={redo}
      />

      <div className="flex-1 flex min-h-0">
        <div
          className="border-r border-slate-200 bg-white shrink-0 overflow-hidden"
          style={{ width: leftPanelWidth }}
        >
          <div className="flex border-b border-slate-200">
            {(['tree', 'templates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  leftTab === tab
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="h-[calc(100%-32px)] overflow-hidden">
            {leftTab === 'tree' ? (
              <ModelTree
                objects={state.objects}
                sketches={state.sketches}
                selectedIds={state.selectedObjectIds}
                onSelect={selectObject}
                onToggleVisibility={toggleVisibility}
                onToggleLock={toggleLock}
                onDelete={deleteObject}
                onDuplicate={duplicateObject}
                onRename={renameObject}
              />
            ) : (
              <TemplatePanel templates={CAD_TEMPLATES} onLoad={loadTemplate} />
            )}
          </div>
        </div>

        <div className="flex-1 relative min-h-0">
          {state.activeTool !== 'none' && state.activeSketchId ? (
            <SketchMode
              sketch={state.sketches.find(s => s.id === state.activeSketchId) || null}
              activeTool={state.activeTool}
              onShapeAdd={(shape) => {
                const sketchId = state.activeSketchId || genId();
                setState(s => ({
                  ...s,
                  sketches: s.sketches.map(sk =>
                    sk.id === sketchId
                      ? { ...sk, shapes: [...sk.shapes, shape] }
                      : sk
                  ),
                }));
              }}
              onShapeRemove={(shapeId) => {}}
              onToolChange={(tool) => updateState({ activeTool: tool })}
              onClose={() => updateState({ activeTool: 'none', activeSketchId: null })}
            />
          ) : (
            <>
              <CADViewport
                ref={viewportRef}
                state={state}
                onStateChange={updateState}
                onObjectSelect={selectObject}
              />
              <MeasurementTool
                objects={state.objects.filter(o => state.selectedObjectIds.includes(o.id))}
                measureMode={state.measureMode}
                measurePoints={state.measurePoints}
                onPointAdd={(p) => updateState({ measurePoints: [...state.measurePoints, p] })}
                onClear={() => updateState({ measurePoints: [], measureMode: 'none' })}
              />
            </>
          )}
        </div>

        <div
          className="border-l border-slate-200 bg-white shrink-0 overflow-hidden"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex border-b border-slate-200">
            {(['properties', 'operations', 'bom', 'print'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${
                  rightTab === tab
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'bom' ? 'BOM' : tab === 'print' ? 'Print' : tab}
              </button>
            ))}
          </div>
          <div className="h-[calc(100%-32px)] overflow-hidden">
            {rightTab === 'properties' && (
              <PropertiesPanel
                selectedObject={selectedObject}
                materialId={state.materialId}
                onParameterChange={changeParameter}
                onMaterialChange={changeMaterial}
                onPositionChange={changePosition}
                onRotationChange={changeRotation}
              />
            )}
            {rightTab === 'operations' && (
              <OperationsPanel
                state={state}
                onOperation={handleOperation}
                onStateChange={updateState}
                hasSelection={state.selectedObjectIds.length > 0}
              />
            )}
            {rightTab === 'bom' && (
              <BOMPanel objects={state.objects} />
            )}
            {rightTab === 'print' && (
              <PrintPreview objects={state.objects} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function mergeSimple(geo1: THREE.BufferGeometry, geo2: THREE.BufferGeometry): THREE.BufferGeometry {
  const pos1 = geo1.attributes.position;
  const pos2 = geo2.attributes.position;
  const idx1 = geo1.index;
  const idx2 = geo2.index;

  const totalVerts = pos1.count + pos2.count;
  const totalTris = (idx1 ? idx1.count : pos1.count) + (idx2 ? idx2.count : pos2.count);

  const positions = new Float32Array(totalVerts * 3);
  const normals = new Float32Array(totalVerts * 3);
  const indices: number[] = [];

  for (let i = 0; i < pos1.count; i++) {
    positions[i * 3] = pos1.getX(i);
    positions[i * 3 + 1] = pos1.getY(i);
    positions[i * 3 + 2] = pos1.getZ(i);
  }
  if (geo1.attributes.normal) {
    const n1 = geo1.attributes.normal;
    for (let i = 0; i < n1.count; i++) {
      normals[i * 3] = n1.getX(i);
      normals[i * 3 + 1] = n1.getY(i);
      normals[i * 3 + 2] = n1.getZ(i);
    }
  }

  const offset = pos1.count;
  for (let i = 0; i < pos2.count; i++) {
    positions[(offset + i) * 3] = pos2.getX(i);
    positions[(offset + i) * 3 + 1] = pos2.getY(i);
    positions[(offset + i) * 3 + 2] = pos2.getZ(i);
  }
  if (geo2.attributes.normal) {
    const n2 = geo2.attributes.normal;
    for (let i = 0; i < n2.count; i++) {
      normals[(offset + i) * 3] = n2.getX(i);
      normals[(offset + i) * 3 + 1] = n2.getY(i);
      normals[(offset + i) * 3 + 2] = n2.getZ(i);
    }
  }

  if (idx1) {
    for (let i = 0; i < idx1.count; i++) indices.push(idx1.getX(i));
  } else {
    for (let i = 0; i < pos1.count; i++) indices.push(i);
  }
  if (idx2) {
    for (let i = 0; i < idx2.count; i++) indices.push(idx2.getX(i) + offset);
  } else {
    for (let i = 0; i < pos2.count; i++) indices.push(i + offset);
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

const TemplatePanel: React.FC<{ templates: CADTemplate[]; onLoad: (t: CADTemplate) => void }> = ({ templates, onLoad }) => {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, Record<string, number>>>({});

  const handleParamChange = (templateId: string, paramName: string, value: number) => {
    setTemplateParams(prev => ({
      ...prev,
      [templateId]: { ...(prev[templateId] || {}), [paramName]: value },
    }));
  };

  return (
    <div className="p-3 space-y-2 overflow-y-auto h-full">
      <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide">Templates</h4>
      {templates.map(tpl => {
        const hasParams = tpl.defaultParams && Object.keys(tpl.defaultParams).length > 0;
        const isExpanded = expandedTemplate === tpl.id;

        return (
          <div key={tpl.id} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => {
                if (hasParams) {
                  setExpandedTemplate(isExpanded ? null : tpl.id);
                } else {
                  onLoad(tpl);
                }
              }}
              className="w-full flex items-start gap-2 p-2.5 hover:bg-cyan-50 transition-all text-left group"
            >
              <span className="text-xl">{tpl.icon}</span>
              <div className="flex-1">
                <div className="text-[11px] font-bold text-slate-700 group-hover:text-cyan-600">{tpl.name}</div>
                <div className="text-[10px] text-slate-400">{tpl.description}</div>
              </div>
              {hasParams && <span className="text-[10px] text-slate-400">{isExpanded ? '▾' : '▸'}</span>}
            </button>

            {isExpanded && hasParams && (
              <div className="px-2.5 pb-2.5 space-y-2 border-t border-slate-100">
                {Object.entries(tpl.defaultParams!).map(([key, param]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[10px] text-slate-500">{param.label}</span>
                      <span className="font-mono text-[10px]">
                        {(templateParams[tpl.id]?.[key] ?? param.value)}mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={templateParams[tpl.id]?.[key] ?? param.value}
                      onChange={e => handleParamChange(tpl.id, key, parseFloat(e.target.value))}
                      className="w-full h-1 rounded-full appearance-none bg-slate-200 accent-cyan-500"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const params = templateParams[tpl.id] || {};
                    const defaults: Record<string, number> = {};
                    if (tpl.defaultParams) {
                      for (const [k, v] of Object.entries(tpl.defaultParams)) {
                        defaults[k] = v.value;
                      }
                    }
                    const merged = { ...defaults, ...params };
                    onLoad({ ...tpl, create: () => tpl.create(merged) });
                  }}
                  className="w-full py-1.5 rounded-lg bg-cyan-500 text-white text-[10px] font-bold hover:bg-cyan-600 transition-colors"
                >
                  Load Template
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(CADLayout);
