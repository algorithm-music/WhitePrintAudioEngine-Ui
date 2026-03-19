'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([
    { id: '1', name: 'Production Key', key: 'wpae_live_xxxxxxxxxxxxxxxxxxxx', created: '2026-03-01', lastUsed: '2026-03-15' },
    { id: '2', name: 'Development Key', key: 'wpae_test_xxxxxxxxxxxxxxxxxxxx', created: '2026-03-10', lastUsed: 'Never' },
  ]);
  
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = () => {
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: `New Key ${keys.length + 1}`,
      key: `sk_live_${Math.random().toString(36).substr(2, 32)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
    };
    setKeys([newKey, ...keys]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
            <Key className="w-6 h-6 text-indigo-400" />
            API_KEYS
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-1">Manage your secret keys for the REST API.</p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          GENERATE NEW KEY
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Secret Key</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium">Last Used</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors">
                <td className="p-4 text-sm font-bold text-zinc-200">{k.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-zinc-900 rounded text-xs font-mono text-zinc-300 border border-zinc-800">
                      {showKey === k.id ? k.key : 'sk_...************************'}
                    </code>
                    <button 
                      onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showKey === k.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-xs font-mono text-zinc-500">{k.created}</td>
                <td className="p-4 text-xs font-mono text-zinc-500">{k.lastUsed}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleCopy(k.key, k.id)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors relative"
                    title="Copy to clipboard"
                  >
                    {copied === k.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
        <p className="text-xs text-indigo-300 font-mono">
          <strong>Security Notice:</strong> Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
        </p>
      </div>
    </div>
  );
}
