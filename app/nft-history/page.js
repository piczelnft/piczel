'use client';



export default function NftHistory() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">🚧</div>
          <h1 className="text-4xl font-bold text-white mb-4">Under Development</h1>
          <p className="text-gray-300 text-lg">This feature is currently being worked on.</p>
          <p className="text-gray-400 text-sm mt-2">Please check back later for NFT buy history functionality.</p>
        </div>
        
        <div className="mt-8">
          <a 
            href="/nft-buy" 
            className="btn-enhanced px-6 py-3 text-white hover-bounce inline-block"
          >
            ← Back to NFT Buy
          </a>
        </div>
      </div>
    </div>
  );
}
