import React, { useState, useEffect } from 'react';
import professorService from '../../services/professorService';

const MyModules = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    filterModules();
  }, [searchTerm, selectedFiliere, modules]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await professorService.getMyModules();
      setModules(response.data);
      setFilteredModules(response.data);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.response?.data?.error || 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = [...modules];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(module => 
        module.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by filiere
    if (selectedFiliere) {
      filtered = filtered.filter(module => module.filiere_name === selectedFiliere);
    }

    setFilteredModules(filtered);
  };

  const getUniqueFilieres = () => {
    const filieres = modules.map(m => m.filiere_name).filter(Boolean);
    return [...new Set(filieres)];
  };

  // Group modules by module_id to show unique modules with their groups
  const groupModulesByModule = () => {
    const grouped = {};
    filteredModules.forEach(module => {
      const key = module.module_id;
      if (!grouped[key]) {
        grouped[key] = {
          module_id: module.module_id,
          module_name: module.module_name,
          module_code: module.module_code,
          filiere_name: module.filiere_name,
          groups: []
        };
      }
      grouped[key].groups.push({
        group_id: module.group_id,
        group_name: module.group_name
      });
    });
    return Object.values(grouped);
  };

  if (loading) {
    return <div className="loading">Loading modules...</div>;
  }

  const groupedModules = groupModulesByModule();

  return (
    <div>
      <div className="page-header">
        <h1>My Modules</h1>
        <p>Modules and groups assigned to you</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by module name, code, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Filiere</label>
              <select
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
              >
                <option value="">All Filieres</option>
                {getUniqueFilieres().map((filiere, index) => (
                  <option key={index} value={filiere}>
                    {filiere}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      {groupedModules.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              {modules.length === 0 
                ? 'No modules assigned yet. Please contact the administrator.'
                : 'No modules match your search criteria.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {groupedModules.map((module) => (
            <div key={module.module_id} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{module.module_name}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
                    Code: {module.module_code}
                  </p>
                </div>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#667eea' }}>Filiere:</strong>
                  <p style={{ margin: '0.25rem 0 0 0' }}>{module.filiere_name}</p>
                </div>
                
                <div>
                  <strong style={{ color: '#667eea' }}>Assigned Groups:</strong>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginTop: '0.5rem' 
                  }}>
                    {module.groups.map((group, index) => (
                      <span 
                        key={index}
                        className="badge badge-info"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        {group.group_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  marginTop: '1.5rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #eee' 
                }}>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = '/professor/upload'}
                    style={{ width: '100%' }}
                  >
                    Upload Course for this Module
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>
                {groupedModules.length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Total Modules</p>
            </div>
            <div>
              <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
                {filteredModules.length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Module-Group Assignments</p>
            </div>
            <div>
              <h3 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>
                {getUniqueFilieres().length}
              </h3>
              <p style={{ color: '#666', fontSize: '0.875rem' }}>Filieres</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyModules;
