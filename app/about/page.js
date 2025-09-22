"use client";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            About PICZEL
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          {/* Company Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                PICZEL is a <strong className="text-cyan-400">Meme NFT platform and investment company</strong>. 
                Our aim is to elevate memes from simple entertainment to valuable{" "}
                <strong className="text-purple-400">digital assets</strong> that also provide{" "}
                <strong className="text-green-400">profit-making opportunities</strong>. 
                Members can receive profits from the company while creators and collectors around the world 
                can create, collect, and trade memes in an open marketplace.
              </p>
            </div>
          </div>

          {/* Vision & Mission Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Vision & Mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  Our Vision
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Our vision at PICZEL is to make memes one of the world&apos;s largest{" "}
                  <strong className="text-cyan-400">digital cultural and investment assets</strong>.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-3">🚀</span>
                  Our Mission
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Our mission is to provide members with secure, transparent, blockchain-based{" "}
                  <strong className="text-purple-400">profit-sharing opportunities</strong>, 
                  ensure community-driven growth, and maximise the value of memes as a digital asset.
                </p>
              </div>
            </div>
          </div>

          {/* What is Meme NFT Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              What is a Meme NFT?
            </h2>
            <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <p className="text-gray-300 leading-relaxed text-lg">
                A Meme NFT is a digital asset that transforms memes into unique, verifiable items on the blockchain. 
                Each meme carries its own value, ownership, and tradeability. This is not merely entertainment; 
                it is also a <strong className="text-green-400">profit-earning opportunity</strong>. 
                Collecting, trading, and showcasing these NFTs allows participants to engage with the future 
                of digital culture in a meaningful way.
              </p>
            </div>
          </div>

          {/* Community & Membership Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Community & Membership
            </h2>
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  The Heart of PICZEL
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                The PICZEL community is the cornerstone of the company&apos;s success. Members gain exclusive access to 
                NFT drops, company profits, and referral rewards. As members bring in new participants, the 
                community expands, increasing overall profit opportunities.
              </p>
              <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
                <p className="text-white font-medium text-center">
                  By joining the PICZEL community, members can{" "}
                  <strong className="text-green-400">invest in Meme NFTs</strong>,{" "}
                  <strong className="text-cyan-400">grow with the community</strong>, and{" "}
                  <strong className="text-purple-400">share in the profits</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-3">Create</h3>
              <p className="text-gray-300 text-sm">
                Transform your memes into valuable digital assets on the blockchain
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-white mb-3">Collect</h3>
              <p className="text-gray-300 text-sm">
                Discover and own unique meme NFTs from creators worldwide
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold text-white mb-3">Trade</h3>
              <p className="text-gray-300 text-sm">
                Buy and sell meme NFTs in our open marketplace for profit
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-slate-700/50 to-purple-700/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">
              Why Choose PICZEL?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Profit Opportunities</h4>
                  <p className="text-gray-300 text-sm">
                    Earn profits from company investments and NFT trading
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Blockchain Security</h4>
                  <p className="text-gray-300 text-sm">
                    All NFTs are secured and verified on the blockchain
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Global Marketplace</h4>
                  <p className="text-gray-300 text-sm">
                    Connect with creators and collectors worldwide
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Digital Culture</h4>
                  <p className="text-gray-300 text-sm">
                    Be part of the future of digital entertainment and art
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-purple-500/20">
          <p className="text-gray-400 text-sm">
            © 2024 Haldar AI & IT. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by PICZEL - Meme NFT Platform
          </p>
        </div>
      </div>
    </div>
  );
}
