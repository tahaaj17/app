import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const CoursesView = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    professor: '',
    module: '',
    group: ''
  });

  // Extract unique values for filters
  const [professors, setProfessors] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllCourses();
      setCourses(response.data);
      
      // Extract unique values for filters
      const uniqueProfessors = [...new Set(response.data.map(c => c.professor?.name).filter(Boolean))];
      const uniqueModules = [...new Set(response.data.map(c => c.module?.name).filter(Boolean))];
      const uniqueGroups = [...new Set(response.data.map(c => c.group?.name).filter(Boolean))];
      
      setProfessors(uniqueProfessors);
      setModules(uniqueModules);
      setGroups(uniqueGroups);
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.professor?.name?.toLowerCase().includes(searchLower) ||
        course.module?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Professor filter
    if (filters.professor) {
      filtered = filtered.filter(course => course.professor?.name === filters.professor);
    }

    // Module filter
    if (filters.module) {
      filtered = filtered.filter(course => course.module?.name === filters.module);
    }

    // Group filter
    if (filters.group) {
      filtered = filtered.filter(course => course.group?.name === filters.group);
    }

    setFilteredCourses(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      professor: '',
      module: '',
      group: ''
    });
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>All Courses</h1>
        <p>View all courses in the platform</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Filters</h3>
          <button onClick={resetFilters} className="btn btn-secondary btn-sm">
            Reset Filters
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title, description, professor..."
            />
          </div>

          <div className="filter-group">
            <label>Professor</label>
            <select
              name="professor"
              value={filters.professor}
              onChange={handleFilterChange}
            >
              <option value="">All Professors</option>
              {professors.map((prof, index) => (
                <option key={index} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Module</label>
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
            >
              <option value="">All Modules</option>
              {modules.map((mod, index) => (
                <option key={index} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Group</label>
            <select
              name="group"
              value={filters.group}
              onChange={handleFilterChange}
            >
              <option value="">All Groups</option>
              {groups.map((grp, index) => (
                <option key={index} value={grp}>
                  {grp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Courses ({filteredCourses.length})</h3>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Professor</th>
                <th>Module</th>
                <th>Group</th>
                <th>Description</th>
                <th>Files</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    {courses.length === 0 ? 'No courses found' : 'No courses match the filters'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.title}</strong>
                    </td>
                    <td>
                      {course.professor?.name || 'N/A'}
                      <br />
                      <small style={{ color: '#666' }}>{course.professor?.email}</small>
                    </td>
                    <td>
                      {course.module?.name || 'N/A'}
                      <br />
                      <small style={{ color: '#666' }}>{course.module?.code}</small>
                    </td>
                    <td>
                      {course.group?.name || 'N/A'}
                      <br />
                      <small style={{ color: '#666' }}>
                        {course.group?.filiere?.name}
                      </small>
                    </td>
                    <td>
                      {course.description ? (
                        <div style={{ maxWidth: '300px' }}>
                          {course.description.length > 100
                            ? `${course.description.substring(0, 100)}...`
                            : course.description}
                        </div>
                      ) : (
                        'No description'
                      )}
                    </td>
                    <td>
                      {course.files && course.files.length > 0 ? (
                        <div>
                          <span className="badge badge-info">
                            {course.files.length} file(s)
                          </span>
                          <div style={{ marginTop: '0.5rem' }}>
                            {course.files.map((file, index) => (
                              <div key={index} style={{ fontSize: '0.75rem', color: '#666' }}>
                                {file.originalName || file.filename}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-warning">No files</span>
                      )}
                    </td>
                    <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-3" style={{ marginTop: '2rem' }}>
        <div className="stats-card">
          <h3>{courses.length}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stats-card">
          <h3>{professors.length}</h3>
          <p>Active Professors</p>
        </div>
        <div className="stats-card">
          <h3>{modules.length}</h3>
          <p>Modules with Courses</p>
        </div>
      </div>
    </div>
  );
};

export default CoursesView;
