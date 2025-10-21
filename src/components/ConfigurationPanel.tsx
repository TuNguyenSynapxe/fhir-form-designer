import React, { useState, useEffect, useMemo } from 'react';
import type { ListViewerConfig, AuthConfig, ColumnConfig, Template, Workspace, FhirResource } from '../shared/types';
import { fhirColumnExtractor } from '../utils/fhirColumnExtractor';

interface ConfigurationPanelProps { config: ListViewerConfig | null; onConfigChange: (updatedConfig: Partial<ListViewerConfig>) => void; currentWorkspace: Workspace; templates: Template[]; }

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, onConfigChange, currentWorkspace, templates }) => {
  const [localConfig, setLocalConfig] = useState<Partial<ListViewerConfig>>(config || {});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [columnDrafts, setColumnDrafts] = useState<Record<string, ColumnConfig>>({});
  const [bulkTemplateId, setBulkTemplateId] = useState<string>('');
  const [showSuggestionsFor, setShowSuggestionsFor] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const sampleData: FhirResource | null = useMemo(() => {
    if (!localConfig.resourceType) return null;
    const tmpl = templates.find(t => t.workspaceId === currentWorkspace.id && t.resourceType === localConfig.resourceType && t.sampleData);
    return tmpl?.sampleData || null;
  }, [templates, currentWorkspace.id, localConfig.resourceType]);

  useEffect(() => { if (!isEditing) setLocalConfig(config || {}); }, [config, isEditing]);
  useEffect(() => { if (isEditing) setIsCollapsed(false); else if (config) setIsCollapsed(true); }, [isEditing, config]);

  const handleChange = (field: keyof ListViewerConfig, value: any) => setLocalConfig(prev => ({ ...prev, [field]: value }));
  const handleAuthChange = (field: keyof AuthConfig, value: any) => setLocalConfig(prev => ({ ...prev, authentication: { type: prev.authentication?.type || 'none', clientId: prev.authentication?.clientId, scope: prev.authentication?.scope, token: prev.authentication?.token, username: prev.authentication?.username, password: prev.authentication?.password, [field]: value } }));
  const handleDetailChange = (field: 'detailUrl'|'parameterName'|'parameterPath'|'templateId', value: any) => setLocalConfig(prev => ({ ...prev, detailConfig: { detailUrl: prev.detailConfig?.detailUrl || '', parameterName: prev.detailConfig?.parameterName || '', parameterPath: prev.detailConfig?.parameterPath || '', templateId: prev.detailConfig?.templateId, [field]: value } }));

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').substring(0,40) || 'col';
  const generateUniqueColumnId = (header: string, existing: ColumnConfig[]) => { const base=slugify(header||'column'); let candidate=base; let counter=1; const ids=new Set(existing.map(c=>c.id)); while(ids.has(candidate)) candidate=`${base}-${counter++}`; return candidate; };
  const addColumn = () => { const existing=localConfig.columns||[]; const newColumn: ColumnConfig={ id: generateUniqueColumnId('New Column', existing), header:'New Column', fhirPath:'', type:'text', sortable:true, filterable:true, width:'auto' }; setLocalConfig(prev=>({...prev, columns:[...existing,newColumn]})); setEditingColumnId(newColumn.id); setColumnDrafts(d=>({...d,[newColumn.id]:newColumn})); };
  const beginEditColumn = (column: ColumnConfig) => { if(!isEditing) return; setEditingColumnId(column.id); setColumnDrafts(d=>({...d,[column.id]:{...column}})); };
  const cancelEditColumn = () => setEditingColumnId(null);
  const updateDraftColumn = (columnId: string, field: keyof ColumnConfig, value: any) => setColumnDrafts(prev=>({...prev,[columnId]:{...prev[columnId],[field]:value}}));
  const saveColumn = (columnId: string) => { const draft=columnDrafts[columnId]; if(!draft) return; const errs: Record<string,string>={}; if(!draft.header.trim()) errs[`column_header_${columnId}`]='Header is required'; if(!draft.fhirPath.trim()) errs[`column_path_${columnId}`]='FHIR path is required'; if(Object.keys(errs).length){ setErrors(prev=>({...prev,...errs})); return;} setErrors(prev=>{const n={...prev}; delete n[`column_header_${columnId}`]; delete n[`column_path_${columnId}`]; return n;}); setLocalConfig(prev=>({...prev, columns:(prev.columns||[]).map(c=>c.id===columnId?draft:c)})); setEditingColumnId(null); setShowSuggestionsFor(null); };
  const removeColumn = (columnId: string) => { setLocalConfig(prev=>({...prev, columns:(prev.columns||[]).filter(c=>c.id!==columnId)})); setEditingColumnId(id=>id===columnId?null:id); setColumnDrafts(prev=>{const n={...prev}; delete n[columnId]; return n;}); setShowSuggestionsFor(prev=>prev===columnId?null:prev); };
  const moveColumn = (columnId: string, direction:'up'|'down') => { setLocalConfig(prev=>{ const cols=[...(prev.columns||[])]; const i=cols.findIndex(c=>c.id===columnId); if(i<0) return prev; const t=direction==='up'? i-1:i+1; if(t<0||t>=cols.length) return prev; [cols[i],cols[t]]=[cols[t],cols[i]]; return {...prev, columns:cols}; }); };
  const duplicateColumn = (column: ColumnConfig) => { const existing=localConfig.columns||[]; const copy: ColumnConfig={...column, id:generateUniqueColumnId(column.header, existing), header:`${column.header} Copy`}; setLocalConfig(prev=>({...prev, columns:[...(prev.columns||[]), copy]})); };
  const toggleColumnFlag = (columnId:string, field:'sortable'|'filterable') => { if(!isEditing) return; setLocalConfig(prev=>({...prev, columns:(prev.columns||[]).map(c=>c.id===columnId?{...c,[field]:!c[field]}:c)})); };
  const bulkAddFromTemplate = () => { if(!bulkTemplateId) return; const tmpl=templates.find(t=>t.id===bulkTemplateId && t.workspaceId===currentWorkspace.id); if(!tmpl) return; const existing=localConfig.columns||[]; const newCols: ColumnConfig[]=(tmpl.fields||[]).filter(f=>f.fhirPath).map(f=>({ id:generateUniqueColumnId(f.label||f.id, existing), header:f.label||f.id, fhirPath:f.fhirPath!, type: f.type==='date'? 'date': f.type==='checkbox'? 'boolean':'text', sortable:true, filterable:true, width:'auto'})); setLocalConfig(prev=>({...prev, columns:[...existing,...newCols]})); };
  const handleDragStart = (e:React.DragEvent, columnId:string) => { setDraggingColumnId(columnId); e.dataTransfer.effectAllowed='move'; };
  const handleDragOver = (e:React.DragEvent, columnId:string) => { e.preventDefault(); if(dragOverColumnId!==columnId) setDragOverColumnId(columnId); };
  const handleDrop = (e:React.DragEvent, columnId:string) => { e.preventDefault(); if(!draggingColumnId || draggingColumnId===columnId) return; setLocalConfig(prev=>{ const cols=[...(prev.columns||[])]; const from=cols.findIndex(c=>c.id===draggingColumnId); const to=cols.findIndex(c=>c.id===columnId); if(from<0||to<0) return prev; const [m]=cols.splice(from,1); cols.splice(to,0,m); return {...prev, columns:cols}; }); setDraggingColumnId(null); setDragOverColumnId(null); };
  const handleDragEnd = () => { setDraggingColumnId(null); setDragOverColumnId(null); };
  const autoSizeWidth = (columnId:string) => { const draft=columnDrafts[columnId] || (localConfig.columns||[]).find(c=>c.id===columnId); if(!draft||!sampleData) return; const v=fhirColumnExtractor.validateFhirPath(draft.fhirPath, sampleData); const val=v.sampleValue? String(v.sampleValue):''; let width: ColumnConfig['width']='auto'; if(val.length>30) width='large'; else if(val.length>15) width='medium'; else if(val.length>5) width='small'; updateDraftColumn(columnId,'width',width); };
  const getSuggestions = () => { if(!localConfig.resourceType) return [] as {path:string;label:string;type:ColumnConfig['type']}[]; return fhirColumnExtractor.getSuggestedPaths(localConfig.resourceType); };
  const validateConfig = () => { const newErrors: Record<string,string>={}; if(!localConfig.name?.trim()) newErrors.name='Name is required'; if(!localConfig.listingUrl?.trim()) newErrors.listingUrl='Listing URL is required'; if(!localConfig.detailConfig?.detailUrl?.trim()) newErrors.detailUrl='Detail URL is required'; if(!localConfig.detailConfig?.parameterName?.trim()) newErrors.parameterName='Parameter name is required'; if(!localConfig.detailConfig?.parameterPath?.trim()) newErrors.parameterPath='Parameter FHIR path is required'; (localConfig.columns||[]).forEach((col,i)=>{ if(!col.header?.trim()) newErrors[`column_${i}_header`]='Column header is required'; if(!col.fhirPath?.trim()) newErrors[`column_${i}_path`]='FHIR path is required'; }); setErrors(newErrors); return Object.keys(newErrors).length===0; };
  const saveConfig = () => { if(!validateConfig()) return; try{ const configToSave: ListViewerConfig={ ...(localConfig as ListViewerConfig), id: localConfig.id || `lv_${Date.now()}`, workspaceId: currentWorkspace.id, updatedAt: new Date().toISOString() }; const stored=localStorage.getItem('fhir-list-viewers'); const parsed= stored? JSON.parse(stored): { listViewers: [] }; const idx= parsed.listViewers.findIndex((lv:ListViewerConfig)=> lv.id===configToSave.id); if(idx>=0) parsed.listViewers[idx]=configToSave; else parsed.listViewers.push(configToSave); localStorage.setItem('fhir-list-viewers', JSON.stringify(parsed)); onConfigChange(configToSave); setIsEditing(false); setIsCollapsed(true); alert('Configuration saved successfully!'); } catch(e){ console.error('Error saving configuration', e); alert('Failed to save configuration'); } };

  const workspaceTemplates = templates.filter(t=>t.workspaceId===currentWorkspace.id);
  const templateResourceTypes = [...new Set(workspaceTemplates.map(t=>t.resourceType))];
  const commonResourceTypes = ['Patient','Observation','Encounter','Practitioner','Organization','Location'];
  const availableResourceTypes = [...new Set([...templateResourceTypes, ...commonResourceTypes])].sort();
  const availableTemplates = templates.filter(t=>t.workspaceId===currentWorkspace.id && (!localConfig.resourceType || t.resourceType===localConfig.resourceType));

  return (
    <div className="bg-white rounded-lg shadow max-h-[70vh] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button type="button" onClick={()=>setIsCollapsed(c=>!c)} className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label={isCollapsed? 'Expand configuration panel':'Collapse configuration panel'} title={isCollapsed? 'Expand':'Collapse'}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform" style={{ transform: isCollapsed? 'rotate(-90deg)':'rotate(0deg)' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
        </div>
        <div className="flex items-center space-x-2">
          {config && <button onClick={()=>setIsEditing(!isEditing)} className={`px-3 py-1 text-sm rounded-md transition-colors ${isEditing? 'bg-red-100 text-red-700 hover:bg-red-200':'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{isEditing? 'Cancel':'Edit'}</button>}
          {isEditing && <button onClick={saveConfig} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">Save</button>}
        </div>
      </div>
      {!isCollapsed && (
        <div className="p-6 overflow-y-auto flex-1">
          {!config && !isEditing ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">⚙️</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Configuration Selected</h4>
              <p className="text-gray-600 mb-4">Select a list viewer or create a new configuration</p>
              <button onClick={()=>setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Create New Configuration</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Configuration Name *</label>
                    <input type="text" value={localConfig.name || ''} onChange={e=>handleChange('name', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.name? 'border-red-500':''}`} placeholder="Patient Directory" />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={localConfig.description || ''} onChange={e=>handleChange('description', e.target.value)} disabled={!isEditing} rows={2} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="Browse and view patient records" />
                  </div>
                </div>
                {/* API Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">API Configuration</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Listing URL *</label>
                    <input type="url" value={localConfig.listingUrl || ''} onChange={e=>handleChange('listingUrl', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.listingUrl? 'border-red-500':''}`} placeholder="https://api.example.com/fhir/Patient" />
                    {errors.listingUrl && <p className="text-sm text-red-600 mt-1">{errors.listingUrl}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detail URL Template *</label>
                    <input type="text" value={localConfig.detailConfig?.detailUrl || ''} onChange={e=>handleDetailChange('detailUrl', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.detailUrl? 'border-red-500':''}`} placeholder="https://api.example.com/fhir/Patient/{id}" />
                    {errors.detailUrl && <p className="text-sm text-red-600 mt-1">{errors.detailUrl}</p>}
                    <p className="text-xs text-gray-500 mt-1">Use curly braces for parameter substitution (e.g., {`{id}`}).</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-4 space-y-3">
                    <h5 className="font-medium text-gray-800 mb-1">Authentication (Placeholder)</h5>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auth Type</label>
                      <select value={localConfig.authentication?.type || 'none'} onChange={e=>handleAuthChange('type', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`}>
                        <option value="none">None</option>
                        <option value="oauth2">OAuth 2.0</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="basic">Basic Auth</option>
                      </select>
                    </div>
                    {localConfig.authentication?.type === 'oauth2' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={localConfig.authentication?.clientId || ''} onChange={e=>handleAuthChange('clientId', e.target.value)} disabled={!isEditing} className={`px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="client id" />
                        <input type="text" value={localConfig.authentication?.scope || ''} onChange={e=>handleAuthChange('scope', e.target.value)} disabled={!isEditing} className={`px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="requested scopes" />
                      </div>
                    )}
                    {localConfig.authentication?.type === 'bearer' && (
                      <div>
                        <input type="text" value={localConfig.authentication?.token || ''} onChange={e=>handleAuthChange('token', e.target.value)} disabled={!isEditing} className={`w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="bearer token" />
                      </div>
                    )}
                    {localConfig.authentication?.type === 'basic' && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={localConfig.authentication?.username || ''} onChange={e=>handleAuthChange('username', e.target.value)} disabled={!isEditing} className={`px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="username" />
                        <input type="password" value={localConfig.authentication?.password || ''} onChange={e=>handleAuthChange('password', e.target.value)} disabled={!isEditing} className={`px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`} placeholder="password" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parameter Name *</label>
                      <input type="text" value={localConfig.detailConfig?.parameterName || ''} onChange={e=>handleDetailChange('parameterName', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.parameterName? 'border-red-500':''}`} placeholder="id" />
                      {errors.parameterName && <p className="text-sm text-red-600 mt-1">{errors.parameterName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parameter FHIR Path *</label>
                      <input type="text" value={localConfig.detailConfig?.parameterPath || ''} onChange={e=>handleDetailChange('parameterPath', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.parameterPath? 'border-red-500':''}`} placeholder="id" />
                      {errors.parameterPath && <p className="text-sm text-red-600 mt-1">{errors.parameterPath}</p>}
                    </div>
                  </div>
                </div>
                {/* Detail View Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Detail View Configuration</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                    <select value={localConfig.resourceType || ''} onChange={e=>handleChange('resourceType', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'} ${errors.resourceType? 'border-red-500':''}`}>{[<option key="" value="">Select resource type...</option>, ...availableResourceTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)]}</select>
                    {errors.resourceType && <p className="text-sm text-red-600 mt-1">{errors.resourceType}</p>}
                    <p className="text-xs text-gray-500 mt-1">{templateResourceTypes.length>0? `Resource types from workspace templates and common FHIR types (${templateResourceTypes.length} from templates)`:'Common FHIR resource types (create templates to add more options)'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template for Detail View</label>
                    <select value={localConfig.detailConfig?.templateId || ''} onChange={e=>handleDetailChange('templateId', e.target.value)} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing? 'bg-gray-50 text-gray-600':'border-gray-300'}`}>{[<option key="" value="">Select template...</option>, ...availableTemplates.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.resourceType})</option>)]}</select>
                    {availableTemplates.length===0 && (<p className="text-xs text-amber-600 mt-1">{localConfig.resourceType? `No ${localConfig.resourceType} templates in this workspace`:'No templates available. Specify a resource type.'}</p>)}
                    {availableTemplates.length>0 && (<p className="text-xs text-gray-500 mt-1">Showing templates for {localConfig.resourceType || 'all resource types'}</p>)}
                  </div>
                </div>
              </div>
              {/* Column Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between"><h4 className="font-medium text-gray-900">Column Configuration</h4></div>
                {(localConfig.columns||[]).length===0 ? (<div className="text-center py-4 text-gray-500">No columns configured</div>) : (
                  <div className="space-y-3">{(localConfig.columns||[]).map((column,index)=>{ const isColumnEditing=editingColumnId===column.id; const draft=isColumnEditing? columnDrafts[column.id]: column; const validation= sampleData && column.fhirPath? fhirColumnExtractor.validateFhirPath(column.fhirPath, sampleData): null; return (
                    <div key={column.id} className={`border border-gray-200 rounded-md p-3 relative ${dragOverColumnId===column.id && draggingColumnId!==column.id? 'ring-2 ring-blue-300':''} ${draggingColumnId===column.id? 'opacity-50':''}`} draggable={isEditing} onDragStart={e=>handleDragStart(e,column.id)} onDragOver={e=>handleDragOver(e,column.id)} onDrop={e=>handleDrop(e,column.id)} onDragEnd={handleDragEnd}>
                      {isEditing && !isColumnEditing && (<div className="absolute -left-2 top-2 flex flex-col items-center"><span className="cursor-move text-gray-400 text-xs select-none" title="Drag to reorder">⋮⋮</span></div>)}
                      {!isColumnEditing && (
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-800">{column.header || <span className="text-gray-400 italic">(no header)</span>}</p>
                            <p className="text-xs text-gray-600">FHIR Path: {column.fhirPath || <span className="text-gray-400 italic">(not set)</span>}</p>
                            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 mt-1">
                              <span>Type: <span className="font-medium text-gray-700">{column.type}</span></span>
                              <span>Width: <span className="font-medium text-gray-700">{column.width}</span></span>
                              {isEditing && (<><button type="button" onClick={()=>toggleColumnFlag(column.id,'sortable')} className={`px-1 py-0.5 rounded border text-xs ${column.sortable? 'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-400 border-gray-200'}`}>Srt</button><button type="button" onClick={()=>toggleColumnFlag(column.id,'filterable')} className={`px-1 py-0.5 rounded border text-xs ${column.filterable? 'bg-green-50 text-green-700 border-green-200':'bg-gray-50 text-gray-400 border-gray-200'}`}>Fil</button><div className="flex items-center space-x-1"><button onClick={()=>moveColumn(column.id,'up')} disabled={index===0} className="p-1 text-[10px] rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40" title="Move Up">↑</button><button onClick={()=>moveColumn(column.id,'down')} disabled={index===(localConfig.columns||[]).length-1} className="p-1 text-[10px] rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40" title="Move Down">↓</button></div></>)}
                              {validation && (<span className={`px-1 py-0.5 rounded text-xs ${validation.isValid? 'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>{validation.isValid? '✓':'⚠'}</span>)}
                            </div>
                          </div>
                          {isEditing && (<div className="flex flex-col items-end space-y-1"><button onClick={()=>beginEditColumn(column)} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button><button onClick={()=>removeColumn(column.id)} className="text-red-600 hover:text-red-800 text-xs">Remove</button><button onClick={()=>duplicateColumn(column)} className="text-gray-600 hover:text-gray-800 text-xs">Duplicate</button></div>)}
                        </div>
                      )}
                      {isColumnEditing && draft && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm text-gray-700">Editing Column {index+1}</span><div className="flex items-center space-x-2"><button onClick={()=>autoSizeWidth(column.id)} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-200 hover:bg-indigo-100" title="Auto size width">Auto Width</button><button onClick={()=>saveColumn(column.id)} className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Save</button><button onClick={cancelEditColumn} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button></div></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Header *</label><input type="text" value={draft.header} onChange={e=>updateDraftColumn(column.id,'header',e.target.value)} className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`column_header_${column.id}`]? 'border-red-500':'border-gray-300'}`} placeholder="Name" />{errors[`column_header_${column.id}`] && <p className="text-xs text-red-600 mt-1">{errors[`column_header_${column.id}`]}</p>}</div>
                            <div><label className="block text-xs font-medium text-gray-600 mb-1">FHIR Path *</label><div className="space-y-1"><input type="text" value={draft.fhirPath} onChange={e=>updateDraftColumn(column.id,'fhirPath',e.target.value)} onFocus={()=>setShowSuggestionsFor(column.id)} className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`column_path_${column.id}`]? 'border-red-500':'border-gray-300'}`} placeholder="name[0].family" />{errors[`column_path_${column.id}`] && <p className="text-xs text-red-600 mt-1">{errors[`column_path_${column.id}`]}</p>}{showSuggestionsFor===column.id && (<div className="border border-gray-200 rounded bg-white shadow-sm max-h-40 overflow-y-auto text-xs">{getSuggestions().map(s=>(<button key={s.path} type="button" onClick={()=>{updateDraftColumn(column.id,'fhirPath',s.path); updateDraftColumn(column.id,'type',s.type);}} className="w-full text-left px-2 py-1 hover:bg-blue-50">{s.label} <span className="text-gray-400">({s.path})</span></button>))}{getSuggestions().length===0 && (<div className="px-2 py-1 text-gray-400">No suggestions</div>)}</div>)}</div></div>
                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label><select value={draft.type} onChange={e=>updateDraftColumn(column.id,'type',e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"><option value="text">Text</option><option value="date">Date</option><option value="number">Number</option><option value="boolean">Boolean</option></select></div>
                            <div><label className="block text-xs font-medium text-gray-600 mb-1">Width</label><select value={draft.width} onChange={e=>updateDraftColumn(column.id,'width',e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"><option value="auto">Auto</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs">
                            <label className="flex items-center space-x-1"><input type="checkbox" checked={draft.sortable} onChange={e=>updateDraftColumn(column.id,'sortable',e.target.checked)} className="rounded border-gray-300" /><span className="text-gray-600">Sortable</span></label>
                            <label className="flex items-center space-x-1"><input type="checkbox" checked={draft.filterable} onChange={e=>updateDraftColumn(column.id,'filterable',e.target.checked)} className="rounded border-gray-300" /><span className="text-gray-600">Filterable</span></label>
                            {sampleData && draft.fhirPath && (<span className="text-gray-500">Preview: {(() => { const v=fhirColumnExtractor.validateFhirPath(draft.fhirPath, sampleData); if(!v.isValid) return '⚠'; if(v.sampleValue===null || v.sampleValue===undefined || v.sampleValue==='') return '(empty)'; const str=String(v.sampleValue); return str.length>40? str.slice(0,40)+'…': str; })()}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  ); })}</div>
                )}
                {isEditing && (
                  <div className="space-y-4 pt-2">
                    <div><button onClick={addColumn} className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">Add Column</button></div>
                    <div className="border border-dashed border-gray-300 rounded-md p-3 space-y-2">
                      <h5 className="text-xs font-medium text-gray-700">Bulk Add From Template</h5>
                      <div className="flex items-center space-x-2">
                        <select value={bulkTemplateId} onChange={e=>setBulkTemplateId(e.target.value)} className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="">Select template...</option>
                          {workspaceTemplates.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                        </select>
                        <button onClick={bulkAddFromTemplate} disabled={!bulkTemplateId} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded disabled:opacity-40 hover:bg-indigo-700">Add Columns</button>
                      </div>
                      {bulkTemplateId && (<p className="text-[10px] text-gray-500">Adds fields with FHIR paths as sortable/filterable text columns.</p>)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfigurationPanel;