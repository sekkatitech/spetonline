import React, { useState, useRef } from 'react';
import { Upload, Database, Settings, BarChart3, Users, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportStatus('uploading');
      // Simulate file processing
      setTimeout(() => setImportStatus('processing'), 1500);
      setTimeout(() => setImportStatus('success'), 3500);
    }
  };

  return (
    <div className="pt-32 pb-24 container mx-auto px-4 md:px-6 flex-grow flex">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
           <div className="mb-8">
              <h2 className="text-xl font-display font-bold text-white mb-1">Store Admin</h2>
              <span className="text-sm text-accent-orange font-bold uppercase tracking-wider">spet-store-core</span>
           </div>

           <nav className="flex flex-col gap-2">
             <button 
               onClick={() => setActiveTab('import')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'import' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Database className={`w-5 h-5 ${activeTab === 'import' ? 'text-lago-400' : 'text-lago-500'}`} /> Product CSV Import
             </button>
             <button 
               onClick={() => setActiveTab('ai')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'ai' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Sparkles className={`w-5 h-5 ${activeTab === 'ai' ? 'text-lago-400' : 'text-lago-500'}`} /> AI Features
             </button>
             <button 
               onClick={() => setActiveTab('analytics')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <BarChart3 className={`w-5 h-5 ${activeTab === 'analytics' ? 'text-lago-400' : 'text-lago-500'}`} /> User Analytics
             </button>
             <button 
               onClick={() => setActiveTab('customers')}
               className={`flex items-center gap-3 p-3 rounded-xl font-semibold transition-colors ${activeTab === 'customers' ? 'bg-lago-800 text-white border border-lago-600' : 'text-lago-200 hover:bg-lago-900 hover:text-white'}`}
             >
               <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'text-lago-400' : 'text-lago-500'}`} /> Customers
             </button>
           </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {activeTab === 'import' && (
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">Product CSV Import System</h1>
              <p className="text-lago-200 mb-8 max-w-2xl">
                Upload your WooCommerce-formatted CSV to update the product catalog. This system will auto-create brands, categories, and tags.
              </p>

              <div className="bg-lago-900 border border-lago-800 rounded-2xl p-8 mb-8">
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImport}
                />
                
                {importStatus === 'idle' && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-lago-700 bg-[#0a141d] hover:border-lago-500 hover:bg-lago-800/50 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-lago-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-lago-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Click or drag CSV file to upload</h3>
                    <p className="text-lago-300">Supported columns: product_name, price, sku, brand, category, image_url</p>
                  </div>
                )}

                {importStatus === 'uploading' && (
                  <div className="border border-lago-800 bg-[#0a141d] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-lago-800 border-t-lago-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Uploading CSV...</h3>
                  </div>
                )}

                {importStatus === 'processing' && (
                  <div className="border border-lago-800 bg-[#0a141d] rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="flex gap-2 mb-6">
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-3 h-3 rounded-full bg-accent-cyan animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Mapping Columns & Processing Products...</h3>
                    <p className="text-lago-300 text-sm">Generating categories and brands taxomy.</p>
                  </div>
                )}

                {importStatus === 'success' && (
                  <div className="border border-green-900/50 bg-green-900/20 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Import Successful!</h3>
                    <p className="text-green-300/70 mb-6">Imported 124 products, created 4 new brands, and updated 12 categories.</p>
                    <button 
                      onClick={() => setImportStatus('idle')}
                      className="px-6 py-2 rounded-full bg-lago-800 text-white hover:bg-lago-700 transition-colors font-medium border border-lago-600"
                    >
                      Import Another File
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-white mb-4">Required CSV Structure</h2>
              <div className="overflow-x-auto bg-[#0a141d] border border-lago-800 rounded-xl">
                <table className="w-full text-left text-sm text-lago-200">
                  <thead className="bg-lago-900 border-b border-lago-800 text-lago-100 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">CSV Column</th>
                      <th className="px-6 py-4">Database Field</th>
                      <th className="px-6 py-4">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lago-800">
                    <tr><td className="px-6 py-4 font-mono text-lago-400">product_name</td><td className="px-6 py-4">post_title</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">description</td><td className="px-6 py-4">post_content</td><td className="px-6 py-4">No</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">price</td><td className="px-6 py-4">_price</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">sku</td><td className="px-6 py-4">_sku</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">brand</td><td className="px-6 py-4">taxonomy</td><td className="px-6 py-4">No</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">category</td><td className="px-6 py-4">product_cat</td><td className="px-6 py-4 text-white">Yes</td></tr>
                    <tr><td className="px-6 py-4 font-mono text-lago-400">image_url</td><td className="px-6 py-4">featured image</td><td className="px-6 py-4">No</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-4">AI Features Settings</h1>
              <p className="text-lago-200 mb-8 max-w-2xl">
                Manage the AI integrations for your store, powered by Gemini.
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-lago-900 border border-lago-800 rounded-2xl p-6 flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-accent-cyan" /> Shopping Assistant Chatbot
                     </h3>
                     <p className="text-lago-200 text-sm max-w-md">Enable the AI-powered chatbot to help customers find products, compare specs, and check order statuses.</p>
                   </div>
                   <div className="w-12 h-6 bg-lago-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(5,125,205,0.5)]">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                   </div>
                </div>

                <div className="bg-lago-900 border border-lago-800 rounded-2xl p-6 flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                       <Sparkles className="w-5 h-5 text-lago-500" /> Automated Product Descriptions
                     </h3>
                     <p className="text-lago-200 text-sm max-w-md">Automatically generate high-converting SEO descriptions during CSV product imports based on basic specs.</p>
                   </div>
                   <div className="w-12 h-6 bg-lago-800 border border-lago-600 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-lago-400 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'analytics' || activeTab === 'customers') && (
            <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-lago-800 rounded-2xl">
               <AlertCircle className="w-12 h-12 text-lago-500 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Module Not Configured</h3>
               <p className="text-lago-300 max-w-sm">This section requires active user data. Connect your WooCommerce instance to view metrics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
