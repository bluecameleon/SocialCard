import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "./wagmi";

const ADDR = (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) || "0x0000000000000000000000000000000000000000";
const ABI = [
  { name: "setCard", type: "function", stateMutability: "nonpayable", inputs: [{ name: "displayName", type: "string" }, { name: "twitter", type: "string" }, { name: "discord", type: "string" }, { name: "telegram", type: "string" }, { name: "website", type: "string" }, { name: "bio", type: "string" }], outputs: [] },
  { name: "getCard", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "tuple", components: [{ name: "displayName", type: "string" }, { name: "twitter", type: "string" }, { name: "discord", type: "string" }, { name: "telegram", type: "string" }, { name: "website", type: "string" }, { name: "bio", type: "string" }, { name: "createdAt", type: "uint256" }, { name: "updatedAt", type: "uint256" }] }] },
  { name: "lookupTwitter", type: "function", stateMutability: "view", inputs: [{ name: "handle", type: "string" }], outputs: [{ type: "address" }] },
  { name: "totalCards", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

const AC = "#10b981";

export default function App() {
  const { isConnected, address } = useAccount();
  const [form, setForm] = useState({ displayName: "", twitter: "", discord: "", telegram: "", website: "", bio: "" });
  const [lookupAddr, setLookupAddr] = useState("");
  const [done, setDone] = useState(false);

  const { data: myCard, refetch } = useReadContract({ address: ADDR, abi: ABI, functionName: "getCard", args: [address!], query: { enabled: !!address } });
  const { data: total } = useReadContract({ address: ADDR, abi: ABI, functionName: "totalCards" });
  const { data: lookupCard } = useReadContract({ address: ADDR, abi: ABI, functionName: "getCard", args: [lookupAddr as `0x${string}`], query: { enabled: lookupAddr.length === 42 } });

  const { data: hash, isPending, writeContract, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  if (isSuccess && !done) { setDone(true); refetch(); setTimeout(() => setDone(false), 3000); }
  const isLoading = isPending || isConfirming;

  const card = myCard as any;
  const hasCard = card?.displayName?.length > 0;
  if (hasCard && !done && !form.displayName) {
    setForm({ displayName: card.displayName, twitter: card.twitter, discord: card.discord, telegram: card.telegram, website: card.website, bio: card.bio });
  }

  const lc = lookupCard as any;

  const CardDisplay = ({ c, addr }: { c: any; addr?: string }) => (
    <div className="rounded-2xl p-5 border" style={{ background: `${AC}10`, borderColor: `${AC}30` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: `${AC}20`, color: AC }}>
          {c.displayName?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-white font-bold">{c.displayName}</p>
          {addr && <p className="text-slate-500 text-xs font-mono">{addr.slice(0,6)}...{addr.slice(-4)}</p>}
        </div>
      </div>
      {c.bio && <p className="text-slate-300 text-sm mb-3">{c.bio}</p>}
      <div className="flex flex-wrap gap-2">
        {c.twitter && <a href={`https://twitter.com/${c.twitter}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs hover:text-white transition-all"><span>𝕏</span> @{c.twitter}</a>}
        {c.discord && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs"><span>💬</span> {c.discord}</span>}
        {c.telegram && <a href={`https://t.me/${c.telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs hover:text-white transition-all"><span>✈️</span> @{c.telegram}</a>}
        {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 text-xs hover:text-white transition-all"><span>🌐</span> website</a>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b14]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: `${AC}12` }} />
      </div>
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 z-50 bg-[#080b14]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <span className="font-bold text-white text-lg">Social<span style={{ color: AC }}>Card</span></span>
          <span className="hidden sm:block text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700">Arc Testnet</span>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="avatar" />
      </header>

      <main className="relative z-10 max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-4xl font-black text-white mb-3">Your On-chain <span style={{ color: AC }}>Social Card</span></h1>
          <p className="text-slate-400 text-sm">Link your Twitter, Discord, and Telegram to your wallet. Verifiable identity on Arc.</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full border border-slate-700">
            <span className="text-slate-400 text-sm">{total?.toString() ?? "0"} cards created</span>
          </div>
        </div>

        {isConnected && hasCard && <div className="mb-5"><CardDisplay c={card} addr={address} /></div>}

        {!isConnected ? (
          <div className="text-center py-8 text-slate-500">Connect wallet to create your card</div>
        ) : (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 mb-5">
            <h2 className="font-bold text-white mb-4">{hasCard ? "Update Your Card" : "Create Your Card"}</h2>
            <div className="space-y-3 mb-4">
              {[
                { key: "displayName", placeholder: "Display Name *", icon: "👤" },
                { key: "bio", placeholder: "Bio (optional)", icon: "📝" },
                { key: "twitter", placeholder: "Twitter handle (without @)", icon: "𝕏" },
                { key: "discord", placeholder: "Discord username", icon: "💬" },
                { key: "telegram", placeholder: "Telegram handle (without @)", icon: "✈️" },
                { key: "website", placeholder: "Website URL", icon: "🌐" },
              ].map(f => (
                <div key={f.key} className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5">
                  <span className="text-sm w-5 shrink-0">{f.icon}</span>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500" />
                </div>
              ))}
            </div>
            {done ? (
              <div className="py-3 text-center rounded-xl font-bold text-sm" style={{ background: `${AC}20`, color: AC }}>✅ Card saved!</div>
            ) : (
              <button onClick={() => writeContract({ address: ADDR, abi: ABI, functionName: "setCard", args: [form.displayName, form.twitter, form.discord, form.telegram, form.website, form.bio] })}
                disabled={isLoading || !form.displayName}
                className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all" style={{ background: AC }}>
                {isLoading ? (isPending ? "Confirm..." : "Saving...") : "🔗 Save Card"}
              </button>
            )}
            {error && <p className="mt-2 text-red-400 text-xs text-center">{error.message?.includes("User rejected") ? "Cancelled" : error.message?.slice(0, 80)}</p>}
          </div>
        )}

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-3">Look Up Any Card</h2>
          <input value={lookupAddr} onChange={e => setLookupAddr(e.target.value)} placeholder="0x... wallet address" className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none font-mono mb-3" />
          {lc?.displayName?.length > 0 && <CardDisplay c={lc} addr={lookupAddr} />}
          {lc?.displayName?.length === 0 && lookupAddr.length === 42 && <p className="text-slate-500 text-sm">No card found for this address</p>}
        </div>

        <footer className="mt-10 text-center text-xs text-slate-600">
          <p>SocialCard · <a href={`https://testnet.arcscan.app/address/${ADDR}`} target="_blank" rel="noreferrer" className="hover:text-slate-400">{ADDR.slice(0,6)}...{ADDR.slice(-4)}</a> · Chain {arcTestnet.id}</p>
        </footer>
      </main>
    </div>
  );
}
