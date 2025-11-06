'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TeamLevelsPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelsData, setLevelsData] = useState([]);
  const [statistics, setStatistics] = useState({
    totalLevels: 10,
    totalMembers: 0,
    activeLevels: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelDetails, setLevelDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
    if (!Number.isFinite(num)) return '-';
    return `$${num.toFixed(2)}`;
  };

  const getLevelIndex = (levelNo) => {
    if (!levelNo) return null;
    // Expect formats like "1st Level", "Level 1", or just number
    const match = String(levelNo).match(/(\d+)/);
    if (!match) return null;
    const idx = parseInt(match[1], 10);
    return Number.isFinite(idx) ? idx : null;
  };

  const getPerPersonRate = (levelNo) => {
    const idx = getLevelIndex(levelNo);
    if (!idx) return 0;
    switch (idx) {
      case 1: return 10;
      case 2: return 3;
      case 3: return 2;
      case 4: return 1;
      case 5: return 1;
      case 6: return 1;
      case 7: return 0.5;
      case 8: return 0.5;
      case 9: return 0.5;
      case 10: return 0.5;
      default: return 0;
    }
  };

  const computeLevelTotalAmount = (level) => {
    const perPerson = getPerPersonRate(level?.levelNo);
    const members = Number(level?.totalMembers) || 0;
    return perPerson * members;
  };

  const getLevelAmount = (level) => {
    const candidateKeys = [
      'amount',
      'totalAmount',
      'earnings',
      'earning',
      'income',
      'commission',
      'levelAmount'
    ];
    for (const key of candidateKeys) {
      const value = level?.[key];
      if (typeof value === 'number' && !Number.isNaN(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const cleaned = value.replace(/[^0-9.-]/g, '');
        const parsed = parseFloat(cleaned);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return null;
  };

  // Fetch team levels data
  const fetchLevelsData = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/team/levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team levels');
      }

      const data = await response.json();
      setLevelsData(data.levels || []);
      setStatistics(prev => data.statistics || prev);
    } catch (err) {
      console.error('Error fetching team levels:', err);
      setError(err.message);
      // Fallback to empty array if API fails
      setLevelsData([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  // Fetch specific level details
  const fetchLevelDetails = useCallback(async (levelNumber) => {
    if (!isAuthenticated || !token) return;
    
    try {
      setLoadingDetails(true);
      
      const response = await fetch(`/api/team/levels?level=${levelNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch level details');
      }

      const data = await response.json();
      setLevelDetails(data.levelDetails || null);
    } catch (err) {
      console.error('Error fetching level details:', err);
      setLevelDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, [isAuthenticated, token]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchLevelsData();
  }, [fetchLevelsData]);

  const handleLevelAction = (level) => {
    setSelectedLevel(level);
    setLevelDetails(null); // Clear previous details
    if (level.totalMembers > 0) {
      fetchLevelDetails(level.levelNumber);
    }
  };

  // Loading state
  if (loading && levelsData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading team levels...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && levelsData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
        <div className="text-white text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={fetchLevelsData}
            className="btn-enhanced px-4 py-2 text-white hover-bounce"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">Level Table</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Check your Genealogy</p>
          <div className="mt-4">
            <button 
              onClick={fetchLevelsData}
              className="btn-enhanced px-4 py-2 text-white hover-bounce text-sm flex items-center space-x-2 mx-auto"
              disabled={loading}
            >
              <span className={`text-sm ${loading ? 'animate-spin' : ''}`}>
                {loading ? '⟳' : '↻'}
              </span>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Level Details</h2>
          
          {/* Level Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr style={{background: 'linear-gradient(to right, rgba(29, 68, 67, 0.8), rgba(29, 68, 67, 0.8))', borderBottom: '1px solid var(--default-border)'}}>
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Level No</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Members</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {levelsData.map((level, index) => (
                  <tr key={level.id} className="transition-colors duration-200 hover:bg-opacity-20" style={{
                    borderBottom: '1px solid var(--default-border)',
                    backgroundColor: 'rgba(29, 68, 67, 0.1)'
                  }}>
                    <td className="px-6 py-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>{index + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{level.levelNo}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>{level.totalMembers}</td>
                    <td className="px-6 py-4 font-medium" style={{color: 'var(--secondary-color)'}}>
                      {formatCurrency(computeLevelTotalAmount(level))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Level Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--primary-rgb), 0.2), rgba(var(--secondary-rgb), 0.1))',
              border: '1px solid rgba(var(--primary-rgb), 0.3)'
            }}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{color: 'var(--primary-color)'}}>{statistics.totalLevels}</div>
                <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Levels</div>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--success-rgb), 0.2), rgba(var(--success-rgb), 0.1))',
              border: '1px solid rgba(var(--success-rgb), 0.3)'
            }}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{color: 'rgb(var(--success-rgb))'}}>{statistics.totalMembers}</div>
                <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Members</div>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--info-rgb), 0.2), rgba(var(--info-rgb), 0.1))',
              border: '1px solid rgba(var(--info-rgb), 0.3)'
            }}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{color: 'rgb(var(--info-rgb))'}}>{statistics.activeLevels}</div>
                <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Active Levels</div>
              </div>
            </div>
          </div>

          {/* Selected Level Info */}
          {selectedLevel && (
            <div className="mt-8 rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
              border: '1px solid var(--default-border)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedLevel.levelNo} Details</h3>
                <button 
                  onClick={() => setSelectedLevel(null)}
                  className="transition-colors" style={{color: 'rgba(255, 255, 255, 0.6)'}} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg p-4 transition-all duration-200" style={{
                    background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                    border: '1px solid var(--default-border)'
                  }}>
                    <div className="text-sm mb-1" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Level Number</div>
                    <div className="text-lg font-semibold text-white">{selectedLevel.levelNo}</div>
                  </div>
                  <div className="rounded-lg p-4 transition-all duration-200" style={{
                    background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                    border: '1px solid var(--default-border)'
                  }}>
                    <div className="text-sm mb-1" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Members</div>
                    <div className="text-lg font-semibold" style={{color: 'var(--secondary-color)'}}>{selectedLevel.totalMembers}</div>
                  </div>
                </div>
                
                <div className="rounded-lg p-4 transition-all duration-200" style={{
                  background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                  border: '1px solid var(--default-border)'
                }}>
                  <div className="text-sm mb-2" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Level Information</div>
                  <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                    This level shows all members who joined through your network at the {selectedLevel.levelNo.toLowerCase()}. 
                    {selectedLevel.totalMembers > 0 
                      ? ` Currently, there are ${selectedLevel.totalMembers} members in this level.`
                      : ' Currently, there are no members in this level.'
                    }
                  </div>
                </div>

                {/* Level Members List */}
                {levelDetails && levelDetails.members && levelDetails.members.length > 0 && (
                  <div className="rounded-lg p-4 transition-all duration-200 mt-4" style={{
                    background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                    border: '1px solid var(--default-border)'
                  }}>
                    <div className="text-sm mb-3" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
                      Members in {selectedLevel.levelNo} ({levelDetails.totalCount} total)
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {levelDetails.members.map((member, index) => (
                        <div key={member.id} className="flex justify-between items-center p-2 rounded" style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{
                              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                              color: 'white'
                            }}>
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{member.name}</div>
                              <div className="text-xs" style={{color: 'rgba(255, 255, 255, 0.6)'}}>{member.memberId}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium" style={{color: 'var(--secondary-color)'}}>{member.package}</div>
                            <div className="text-xs" style={{
                              color: member.status === 'Active' ? 'rgb(var(--success-rgb))' : 'rgb(var(--danger-rgb))'
                            }}>
                              {member.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading state for level details */}
                {selectedLevel.totalMembers > 0 && loadingDetails && (
                  <div className="rounded-lg p-4 transition-all duration-200 mt-4" style={{
                    background: 'linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))',
                    border: '1px solid var(--default-border)'
                  }}>
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      <span className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Loading level details...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default TeamLevelsPage;
