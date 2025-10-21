import React, { useState, useCallback } from 'react';
import type { ListViewerConfig, Workspace } from '../shared/types';

interface CreateListViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: ListViewerConfig) => Promise<void>;
  currentWorkspace: Workspace | null;
}

// Minimal required fields for initial creation
// Then user can further configure in detail view
const CreateListViewerModal: React.FC<CreateListViewerModalProps> = ({ isOpen, onClose, onCreate, currentWorkspace }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('Patient');
  const [listingUrl, setListingUrl] = useState('');
  const [detailUrl, setDetailUrl] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setResourceType('Patient');
    setListingUrl('');
    setDetailUrl('');
    setTemplateId('');
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) {
      setError('Please select a workspace first.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!resourceType.trim()) {
      setError('Resource Type is required.');
      return;
    }
    if (!listingUrl.trim()) {
      setError('Listing URL is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const now = new Date().toISOString();
    const newConfig: ListViewerConfig = {
      id: `lv-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      workspaceId: currentWorkspace.id,
      listingUrl: listingUrl.trim(),
      resourceType: resourceType.trim(),
      authentication: { type: 'none' },
      columns: [], // start empty; user will configure later
      detailConfig: detailUrl.trim() && templateId.trim() ? {
        detailUrl: detailUrl.trim(),
        parameterName: 'id',
        parameterPath: 'id',
        templateId: templateId.trim()
      } : undefined,
      createdAt: now,
      updatedAt: now
    };

    try {
      await onCreate(newConfig);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list viewer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={() => { reset(); onClose(); }}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New List Viewer</h2>
        {currentWorkspace && (
          <div className="mb-4 text-sm text-gray-600">Workspace: {currentWorkspace.icon} {currentWorkspace.name}</div>
        )}
        {!currentWorkspace && (
          <div className="mb-4 text-sm text-red-600">Select or create a workspace before creating a list viewer.</div>
        )}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Patient Directory"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this list viewer"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
              <select
                value={resourceType}
                onChange={e => setResourceType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Patient</option>
                <option>Practitioner</option>
                <option>Organization</option>
                <option>Observation</option>
                <option>Condition</option>
                <option>Medication</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing URL *</label>
              <input
                type="text"
                value={listingUrl}
                onChange={e => setListingUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://fhir.example.com/Patient"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detail URL (optional)</label>
              <input
                type="text"
                value={detailUrl}
                onChange={e => setDetailUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://fhir.example.com/Patient/{{id}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template ID (optional)</label>
              <input
                type="text"
                value={templateId}
                onChange={e => setTemplateId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Existing template ID"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentWorkspace}
              className={`px-5 py-2 rounded-md text-white font-medium transition-colors ${!currentWorkspace ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} ${isSubmitting ? 'opacity-75' : ''}`}
            >
              {isSubmitting ? 'Creating...' : 'Create List Viewer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListViewerModal;
