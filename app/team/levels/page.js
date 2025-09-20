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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Level Table</h1>
          <p className="text-lg text-gray-300">Check your Genealogy</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Level Details</h2>
          
          {/* Level Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700/50 to-purple-700/50 border-b border-purple-500/30">
                  <th className="px-6 py-4 text-white font-semibold">S.No</th>
                  <th className="px-6 py-4 text-white font-semibold">Level No</th>
                  <th className="px-6 py-4 text-white font-semibold">Total Members</th>
                  <th className="px-6 py-4 text-white font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {levelsData.map((level, index) => (
                  <tr key={level.id} className="border-b border-purple-500/20 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">{index + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{level.levelNo}</td>
                    <td className="px-6 py-4 text-purple-400 font-medium">{level.totalMembers}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleLevelAction(level)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
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
            <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-2">10</div>
                <div className="text-gray-300 text-sm">Total Levels</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-700/50 to-green-700/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">Total Members</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-700/50 to-blue-700/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">0</div>
                <div className="text-gray-300 text-sm">Active Levels</div>
              </div>
            </div>
          </div>

          {/* Selected Level Info */}
          {selectedLevel && (
            <div className="mt-8 bg-gradient-to-br from-slate-700/80 to-purple-700/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedLevel.levelNo} Details</h3>
                <button 
                  onClick={() => setSelectedLevel(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-4">
                    <div className="text-sm text-gray-300 mb-1">Level Number</div>
                    <div className="text-lg font-semibold text-white">{selectedLevel.levelNo}</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-4">
                    <div className="text-sm text-gray-300 mb-1">Total Members</div>
                    <div className="text-lg font-semibold text-purple-400">{selectedLevel.totalMembers}</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Level Information</div>
                  <div className="text-gray-300 text-sm">
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
  );
};

export default TeamLevelsPage;
