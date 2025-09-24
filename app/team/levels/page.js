'use client';

import { useState } from 'react';

const TeamLevelsPage = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  // Sample level data
  const levelsData = [
    { id: 1, levelNo: '1st Level', totalMembers: 0 },
    { id: 2, levelNo: '2nd Level', totalMembers: 0 },
    { id: 3, levelNo: '3rd Level', totalMembers: 0 },
    { id: 4, levelNo: '4th Level', totalMembers: 0 },
    { id: 5, levelNo: '5th Level', totalMembers: 0 },
    { id: 6, levelNo: '6th Level', totalMembers: 0 },
    { id: 7, levelNo: '7th Level', totalMembers: 0 },
    { id: 8, levelNo: '8th Level', totalMembers: 0 },
    { id: 9, levelNo: '9th Level', totalMembers: 0 },
    { id: 10, levelNo: '10th Level', totalMembers: 0 }
  ];

  const handleLevelAction = (level) => {
    setSelectedLevel(level);
    console.log(`Viewing details for ${level.levelNo}`);
    // Add your level details logic here
  };

  return (
    <div className="min-h-screen flex p-8" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">Level Table</h1>
          <p className="text-lg animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>Check your Genealogy</p>
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
                  <th className="px-6 py-4 text-white font-semibold">Action</th>
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleLevelAction(level)}
                        className="btn-enhanced px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
                      >
                        View Details
                      </button>
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
                <div className="text-2xl font-bold mb-2" style={{color: 'var(--primary-color)'}}>10</div>
                <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Levels</div>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--success-rgb), 0.2), rgba(var(--success-rgb), 0.1))',
              border: '1px solid rgba(var(--success-rgb), 0.3)'
            }}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{color: 'rgb(var(--success-rgb))'}}>0</div>
                <div className="text-sm" style={{color: 'rgba(255, 255, 255, 0.8)'}}>Total Members</div>
              </div>
            </div>
            
            <div className="rounded-xl p-6 transition-all duration-200" style={{
              background: 'linear-gradient(to right, rgba(var(--info-rgb), 0.2), rgba(var(--info-rgb), 0.1))',
              border: '1px solid rgba(var(--info-rgb), 0.3)'
            }}>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{color: 'rgb(var(--info-rgb))'}}>0</div>
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
                    Currently, there are no members in this level.
                  </div>
                </div>
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
