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

    // Search through all children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const result = findMemberById(child, id);
        if (result) return result;
      }
    }

    return null;
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
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 shadow-lg border-3 border-white transition-all duration-300 ${
              isHovered ? "scale-110 shadow-xl" : ""
            } ${isClicked ? "ring-4 ring-opacity-50" : ""}`}
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
              ringColor: isClicked ? "var(--primary-color)" : "transparent",
            }}
          >
            {node.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div
            className={`text-center px-3 py-2 md:px-4 md:py-2 rounded-lg shadow-md min-w-32 md:min-w-40 transition-all duration-300 ${
              isHovered ? "scale-105 shadow-lg" : ""
            }`}
            style={{
              background:
                "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
              border: "1px solid var(--default-border)",
            }}
          >
            <div className="font-semibold text-white text-xs md:text-sm mb-1">
              {node.name}
            </div>
            <div
              className="text-xs mb-1"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              {node.id}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: "var(--primary-color)" }}
            >
              {node.package}
            </div>
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: "rgba(255, 255, 255, 0.6)" }}
            >
              <span>Direct: {node.directs}</span>
              <span>Total: {node.totalCount}</span>
            </div>
            <div
              className="text-xs font-medium mt-1"
              style={{ color: "rgb(var(--success-rgb))" }}
            >
              {node.business}
            </div>
          </div>
        </div>

        {/* Display all direct children horizontally */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center mt-8">
            {/* Vertical line from parent to children level */}
            <div
              className="w-0.5 h-8"
              style={{
                background:
                  "linear-gradient(to bottom, var(--primary-color), var(--secondary-color))",
              }}
            ></div>

            {/* Children container with horizontal layout */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 relative">
              {/* Horizontal connector line for multiple children */}
              {node.children.length > 1 && (
                <div
                  className="absolute -top-4 left-0 right-0 h-0.5"
                  style={{
                    background:
                      "linear-gradient(to right, var(--primary-color), var(--secondary-color))",
                    top: "-16px",
                  }}
                ></div>
              )}

              {node.children.map((child, index) => (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center"
                >
                  {/* Vertical line to each child */}
                  <div
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8"
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--primary-color), var(--secondary-color))",
                    }}
                  ></div>
                  <TreeNode node={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          "linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)",
        fontFamily: "var(--default-font-family)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 gradient-text-enhanced animate-fadeInUp">
            Genealogy
          </h1>
          <p
            className="text-lg animate-fadeInUp"
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              animationDelay: "0.2s",
            }}
          >
            Check your Genealogy
          </p>
        </div>

        <div
          className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp mb-12"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-2xl font-semibold text-white mb-4">
            Search Members
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Enter Member ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 px-4 py-3 text-white rounded-lg text-base focus:outline-none transition-colors placeholder-gray-400"
              style={{
                backgroundColor: "rgba(29, 68, 67, 0.8)",
                border: "1px solid var(--default-border)",
                focusRingColor: "var(--primary-color)",
              }}
            />
            <button
              onClick={handleSearch}
              className="btn-enhanced px-6 py-3 text-white rounded-lg text-base font-medium transition-all duration-300 cursor-pointer"
            >
              Search
            </button>
          </div>

          {selectedMember && (
            <div
              className="rounded-xl p-6 transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                border: "1px solid var(--default-border)",
              }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Found Member:
              </h3>
              <div className="flex items-center gap-4">
                <div
                  className="w-15 h-15 rounded-full flex items-center justify-center shadow-lg border-3 border-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                  }}
                >
                  {selectedMember.profile ? (
                    <img
                      src={selectedMember.profile}
                      alt={selectedMember.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                      }}
                    >
                      {selectedMember.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
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

        <div
          className="card-enhanced rounded-2xl p-8 shadow-lg animate-fadeInUp"
          style={{ animationDelay: "0.6s" }}
        >
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
            <div
              className="mb-8 rounded-xl p-6 transition-all duration-200"
              style={{
                background:
                  "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                border: "1px solid var(--default-border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Member Details
                </h3>
                <button
                  onClick={() => setClickedNode(null)}
                  className="transition-colors"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                  onMouseEnter={(e) => (e.target.style.color = "white")}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "rgba(255, 255, 255, 0.6)")
                  }
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-3 border-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                      }}
                    >
                      {clickedNode.profile ? (
                        <img
                          src={clickedNode.profile}
                          alt={clickedNode.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--primary-color), var(--secondary-color))",
                          }}
                        >
                          {clickedNode.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        {clickedNode.name}
                      </div>
                      <div className="text-gray-300">{clickedNode.id}</div>
                      <div
                        className="font-medium"
                        style={{ color: "var(--primary-color)" }}
                      >
                        {clickedNode.package}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span
                        className="font-medium"
                        style={{ color: "rgb(var(--success-rgb))" }}
                      >
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
                    <div
                      className="rounded-lg p-3 text-center transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                        border: "1px solid var(--default-border)",
                      }}
                    >
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: "var(--primary-color)" }}
                      >
                        {clickedNode.directs}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Direct Referrals
                      </div>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                        border: "1px solid var(--default-border)",
                      }}
                    >
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: "var(--secondary-color)" }}
                      >
                        {clickedNode.totalCount}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(255, 255, 255, 0.8)" }}
                      >
                        Total Team
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-lg p-3 text-center transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(var(--body-bg-rgb), 0.2), rgba(var(--primary-rgb), 0.1))",
                      border: "1px solid var(--default-border)",
                    }}
                  >
                    <div
                      className="text-xl font-bold mb-1"
                      style={{ color: "rgb(var(--success-rgb))" }}
                    >
                      {clickedNode.business}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255, 255, 255, 0.8)" }}
                    >
                      Total Business
                    </div>
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
