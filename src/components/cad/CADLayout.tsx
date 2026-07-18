import React, { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';
import { CADState, CADObject3D, CADOperationType, INITIAL_CAD_STATE } from '../../types/cad';
import { createBoxParameters, createCylinderParameters, createSphereParameters, setParameterValue } from '../../services/cadParametrics';
import { exportCADModel } from '../../services/cadExporter';
import CADViewport, { CADViewportHandle } from './CADViewport';
import CADToolbar from './CADToolbar';
import ModelTree from './ModelTree';
import PropertiesPanel from './PropertiesPanel';
import OperationsPanel from './OperationsPanel';
import SketchMode from './SketchMode';
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
  const [rightTab, setRightTab] = useState<'properties' | 'operations'>('properties');
  const [history, setHistory] = useState<CADObject3D[][]>([]);
  const [redoStack, setRedoStack] = useState<CADObject3D[][]>([]);
  const viewportRef = useRef<CADViewportHandle>(null);

  const updateState = useCallback((updates: Partial<CADState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-20), state.objects]);
    setRedoStack([]);
  }, [state.objects]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setRedoStack(r => [state.objects, ...r]);
    setState(s => ({ ...s, objects: prev, selectedObjectIds: [] }));
  }, [history, state.objects]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(r => r.slice(1));
    setHistory(h => [...h, state.objects]);
    setState(s => ({ ...s, objects: next, selectedObjectIds: [] }));
  }, [redoStack, state.objects]);

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
    setState(s => ({
      ...s,
      objects: s.objects.map(o => {
        if (o.id !== objectId) return o;
        return { ...o, position: { ...o.position, [axis]: value } };
      }),
    }));
  }, []);

  const changeRotation = useCallback((objectId: string, axis: 'x' | 'y' | 'z', value: number) => {
    setState(s => ({
      ...s,
      objects: s.objects.map(o => {
        if (o.id !== objectId) return o;
        return { ...o, rotation: { ...o.rotation, [axis]: value } };
      }),
    }));
  }, []);

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

  const handleOperation = useCallback((type: CADOperationType, params: Record<string, number>) => {
    if (state.selectedObjectIds.length === 0) return;
    pushHistory();
    setState(s => ({
      ...s,
      activeOperation: type,
    }));
  }, [state.selectedObjectIds.length, pushHistory]);

  const handleExport = useCallback(async (options: { format: 'stl' | 'stl_binary' | 'obj' | 'gltf' | 'glb' | '3mf'; unit: 'mm' | 'cm' | 'inch'; includeColors: boolean }) => {
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
              <div className="p-3 space-y-2 overflow-y-auto h-full">
                <h4 className="font-bold text-slate-600 text-[11px] uppercase tracking-wide">Quick Start Templates</h4>
                {CAD_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="w-full flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all text-left group"
                  >
                    <span className="text-xl">{tpl.icon}</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 group-hover:text-cyan-600">{tpl.name}</div>
                      <div className="text-[10px] text-slate-400">{tpl.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-cyan-400 bg-slate-300 transition-colors z-50 hidden lg:flex items-center justify-center opacity-40 hover:opacity-100"
          />
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
            <CADViewport
              ref={viewportRef}
              state={state}
              onStateChange={updateState}
              onObjectSelect={selectObject}
            />
          )}
        </div>

        <div
          className="border-l border-slate-200 bg-white shrink-0 overflow-hidden"
          style={{ width: rightPanelWidth }}
        >
          <div className="flex border-b border-slate-200">
            {(['properties', 'operations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  rightTab === tab
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="h-[calc(100%-32px)] overflow-hidden">
            {rightTab === 'properties' ? (
              <PropertiesPanel
                selectedObject={selectedObject}
                materialId={state.materialId}
                onParameterChange={changeParameter}
                onMaterialChange={changeMaterial}
                onPositionChange={changePosition}
                onRotationChange={changeRotation}
              />
            ) : (
              <OperationsPanel
                state={state}
                onOperation={handleOperation}
                onStateChange={updateState}
              />
            )}
          </div>
          <div
            className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-cyan-400 bg-slate-300 transition-colors z-50 hidden lg:flex items-center justify-center opacity-40 hover:opacity-100"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CADLayout);
