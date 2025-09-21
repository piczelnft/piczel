"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const GenealogyPage = () => {
  const { token } = useAuth();
  const [searchId, setSearchId] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [clickedNode, setClickedNode] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTree = async (memberId) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (memberId) params.set("memberId", memberId);
      params.set("depth", "3");
      const res = await fetch(`/api/genealogy/tree?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tree");
      setTreeData(data.tree);
    } catch (e) {
      setError(e.message);
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load current user's tree by default
    fetchTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    await fetchTree(searchId.trim());
  };

  const findMemberById = (node, id) => {
    if (!node) return null;
    if (node.id === id) return node;
    const leftResult = findMemberById(node.left, id);
    if (leftResult) return leftResult;
    return findMemberById(node.right, id);
  };

  const TreeNode = ({ node, level = 0 }) => {
    if (!node) return null;

    const isHovered = hoveredNode?.id === node.id;
    const isClicked = clickedNode?.id === node.id;

    return (
      <div className="flex flex-col items-center relative">
        <div
          className="flex flex-col items-center relative z-10 cursor-pointer group"
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => setClickedNode(isClicked ? null : node)}
        >
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-2 shadow-lg border-3 border-white transition-all duration-300 ${
              isHovered ? "scale-110 shadow-xl" : ""
            } ${isClicked ? "ring-4 ring-purple-400 ring-opacity-50" : ""}`}
          >
            <img
              src={node.profile}
              alt={node.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div
            className={`text-center bg-gradient-to-br from-slate-700/80 to-purple-700/80 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md min-w-32 md:min-w-40 border border-purple-500/30 transition-all duration-300 ${
              isHovered ? "scale-105 shadow-lg" : ""
            }`}
          >
            <div className="font-semibold text-white text-xs md:text-sm mb-1">
              {node.name}
            </div>
            <div className="text-xs text-gray-300 font-medium mb-1">
              {node.id}
            </div>
            <div className="text-xs text-cyan-400 font-medium">
              {node.package}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>L: {node.leftCount}</span>
              <span>R: {node.rightCount}</span>
            </div>
            <div className="text-xs text-green-400 font-medium mt-1">
              {node.business}
            </div>
          </div>
        </div>

        {(node.left || node.right) && (
          <div className="flex gap-8 md:gap-16 mt-8 relative">
            {/* Vertical line from parent to children level */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-purple-500"></div>

            {/* Horizontal connector line */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"></div>

            {node.left && (
              <div className="relative flex flex-col items-center">
                {/* Vertical line to left child */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-purple-500"></div>
                <TreeNode node={node.left} level={level + 1} />
              </div>
            )}
            {node.right && (
              <div className="relative flex flex-col items-center">
                {/* Vertical line to right child */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-cyan-400 to-purple-500"></div>
                <TreeNode node={node.right} level={level + 1} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Genealogy</h1>
          <p className="text-lg text-gray-300">Check your Genealogy</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 mb-12">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Search Members
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter Member ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700/50 text-white border border-purple-500/30 rounded-lg text-base focus:outline-none focus:border-purple-400 transition-colors placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-base font-medium hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 cursor-pointer"
            >
              Search
            </button>
          </div>

          {selectedMember && (
            <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-xl font-semibold text-white mb-4">
                Found Member:
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-15 h-15 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg border-3 border-white">
                  <img
                    src={selectedMember.profile}
                    alt={selectedMember.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {selectedMember.name}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">
                    {selectedMember.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">
            Team Genealogy Tree
          </h2>
          {error && (
            <div className="mb-4 text-red-400 text-center">{error}</div>
          )}
          {loading && (
            <div className="mb-8 flex justify-center text-white">
              Loading tree...
            </div>
          )}

          {/* Detailed Node Information Panel */}
          {clickedNode && (
            <div className="mb-8 bg-gradient-to-br from-slate-700/80 to-purple-700/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Member Details
                </h3>
                <button
                  onClick={() => setClickedNode(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg border-3 border-white">
                      <img
                        src={clickedNode.profile}
                        alt={clickedNode.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {clickedNode.name}
                      </div>
                      <div className="text-gray-300">{clickedNode.id}</div>
                      <div className="text-cyan-400 font-medium">
                        {clickedNode.package}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className="text-green-400 font-medium">
                        {clickedNode.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Join Date:</span>
                      <span className="text-white font-medium">
                        {clickedNode.joinDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sponsor ID:</span>
                      <span className="text-white font-medium">
                        {clickedNode.sponsorId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-cyan-400">
                        {clickedNode.directs}
                      </div>
                      <div className="text-xs text-gray-300">Directs</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {clickedNode.leftCount + clickedNode.rightCount}
                      </div>
                      <div className="text-xs text-gray-300">Total Team</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {clickedNode.leftCount}
                      </div>
                      <div className="text-xs text-gray-300">Left Count</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-orange-400">
                        {clickedNode.rightCount}
                      </div>
                      <div className="text-xs text-gray-300">Right Count</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-600/50 to-purple-600/50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-400">
                      {clickedNode.business}
                    </div>
                    <div className="text-xs text-gray-300">Total Business</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {treeData && (
            <div className="flex justify-center overflow-x-auto py-8">
              <TreeNode node={treeData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenealogyPage;
