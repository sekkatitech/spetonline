import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Design tokens ──
const E = {
  primary:             '#000000',
  primaryContainer:    '#131b2e',
  onPrimary:           '#ffffff',
  secondary:           '#515f74',
  secondaryContainer:  '#d5e3fd',
  onSecondaryContainer:'#57657b',
  surface:             '#f7f9fb',
  surfaceLow:          '#f2f4f6',
  surfaceContainer:    '#eceef0',
  surfaceWhite:        '#ffffff',
  onSurface:           '#191c1e',
  onSurfaceVariant:    '#45464d',
  outline:             '#76777d',
  outlineVariant:      '#c6c6cd',
  blue:                '#497cff',
  green:               '#2e7d32',
  greenBg:             '#e8f5e9',
  amber:               '#f57f17',
  amberBg:             '#fff8e1',
  red:                 '#c62828',
  redBg:               '#fce4e4',
}

// Apple tokens
const A = {
  white:   '#ffffff',
  off:     '#f5f5f7',
  grey:    '#6e6e73',
  dark:    '#1d1d1f',
  blue:    '#0071e3',
}
const APPLE_LOGO = '/enterprice-images/apple.com-logo.png'

// ── Types ──
interface Product {
  id: string; name: string; sku: string; brand: string; category: string
  price: number; stock: number; stockStatus: 'in_stock'|'low_stock'|'out_of_stock'
  image: string|null; source: 'esquire'|'syntech'|'enterprise'; description: string|null
}
interface AppleProduct {
  id: string; sku: string; name: string; category_main: string; category_sub: string
  rrp_inc_vat: number; price_display: number; status: string
  specs: Record<string,string>|null; thumbnail_url: string|null
  image_urls: string[]|null
}
interface CartItem { product: Product; qty: number }

const PAGE_SIZE = 24

// ── Apple category config ──
const APPLE_CATS = [
  { key:'Mac',        label:'Mac',         hero:'/enterprice-images/ARP100_Desktop Banner.png',              tagline:'Supercharged for what\'s next.' },
  { key:'iPhone',     label:'iPhone',      hero:'/enterprice-images/ARP059_iPhone 17.png',                   tagline:'Built for Apple Intelligence.' },
  { key:'iPad',       label:'iPad',        hero:'/enterprice-images/ARP068_iPad Pro M5 Chip.png',            tagline:'Loveable. Drawable. Magical.' },
  { key:'Watch',      label:'Apple Watch', hero:'/enterprice-images/ARP057_Q4_25 _ Apple Watch Series 11.png', tagline:'The ultimate device for a healthier life.' },
  { key:'AirPods',    label:'AirPods',     hero:null, tagline:'Wireless audio. Perfected.' },
  { key:'Accessories',label:'Accessories', hero:'/enterprice-images/ARP100_Mobile Banner.png', tagline:'Everything to do more.' },
  { key:'HomePod',    label:'HomePod',     hero:null, tagline:'Profound sound. Smart home control.' },
  { key:'Apple TV',   label:'Apple TV',    hero:null, tagline:'Your TV experience, elevated.' },
]

const COLOUR_MAP: Record<string,string> = {
  'Black':'#1d1d1f','Silver':'#e3e4e5','Midnight':'#2b2d30','Starlight':'#f2e8d9',
  'Space Grey':'#8e8e93','Blue':'#4a90d9','Pink':'#f2a7c3','Yellow':'#f5d547',
  'Green':'#3e7c57','Purple':'#7b5ea7','Red':'#c41230','White':'#f5f5f7',
  'Gold':'#c8a97e','Sky Blue':'#87ceeb','Natural Titanium':'#c4b9a8',
  'Black Titanium':'#3a3a3c','White Titanium':'#e5e5e7','Desert Titanium':'#d4b896',
}

// ── Icons ──
function DashIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function SearchIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function FilterIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> }
function CartIcon()   { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> }
function PlusIcon()   { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function MinusIcon()  { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function XIcon()      { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }
function LogoutIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }

const formatPrice = (p: number) => `R ${p.toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2})}`

function cleanAppleName(name: string): string {
  return name.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ')
}
function getAppleSubtitle(p: AppleProduct): string {
  const s = p.specs||{}
  return [s.chip,s.ram,s.storage].filter(Boolean).slice(0,2).join(' · ')
}

// ── Stock badge ──
function StockBadge({ status, qty }: { status: string; qty: number }) {
  if (status==='out_of_stock'||qty===0) return <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:9999,background:E.redBg,color:E.red}}>Out of stock</span>
  if (qty<=5||status==='low_stock') return <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:9999,background:E.amberBg,color:E.amber}}>Low stock ({qty})</span>
  return <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:9999,background:E.greenBg,color:E.green}}>In stock</span>
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string,{label:string;bg:string;color:string}> = {
    esquire:    {label:'Home & Entertainment',bg:E.surfaceContainer,color:E.onSurfaceVariant},
    syntech:    {label:'Gaming & Computing',bg:E.secondaryContainer,color:E.blue},
    enterprise: {label:'Enterprise Exclusive',bg:'#ede7f6',color:'#5e35b1'},
  }
  const s = map[source]??map.esquire
  return <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:4,background:s.bg,color:s.color}}>{s.label}</span>
}

// ── Regular product card ──
function ProductCard({ product, onAddToQuote }: { product: Product; onAddToQuote: (p:Product)=>void }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const outOfStock = product.stock===0||product.stockStatus==='out_of_stock'
  const goToDetail = () => navigate(`/enterprise/products/${product.source}/${product.id}`)
  return (
    <div style={{background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column',transition:'box-shadow 0.2s, transform 0.2s',cursor:'pointer'}}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.09)';(e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow='none';(e.currentTarget as HTMLDivElement).style.transform=''}}
      onClick={goToDetail}>
      <div style={{width:'100%',aspectRatio:'4/3',background:E.surfaceLow,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
        {product.image&&!imgError?<img src={product.image} alt={product.name} onError={()=>setImgError(true)} style={{width:'100%',height:'100%',objectFit:'contain',padding:12}}/>:<img src={APPLE_LOGO} alt="Apple" style={{ width: '38%', height: '38%', objectFit: 'contain', opacity: 0.9 }} />}
        <div style={{position:'absolute',top:8,left:8}}><SourceBadge source={product.source}/></div>
      </div>
      <div style={{padding:'14px 16px',flex:1,display:'flex',flexDirection:'column',gap:6}}>
        <div style={{fontSize:11,color:E.outline}}>{product.brand} · {product.category}</div>
        <div style={{fontSize:13,fontWeight:600,color:E.onSurface,lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{product.name}</div>
        <div style={{fontSize:11,fontFamily:'monospace',color:E.outline}}>SKU: {product.sku}</div>
        <div style={{marginTop:'auto',paddingTop:10,display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:17,fontWeight:700,color:E.primary,fontVariantNumeric:'tabular-nums'}}>{formatPrice(product.price)}</div>
            <StockBadge status={product.stockStatus} qty={product.stock}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={e=>{e.stopPropagation();goToDetail()}} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:E.surfaceContainer,color:E.onSurfaceVariant,fontSize:12,fontWeight:500,padding:'7px 10px',borderRadius:6,border:`1px solid ${E.outlineVariant}`,cursor:'pointer',fontFamily:'inherit'}}>View Details</button>
            <button onClick={e=>{e.stopPropagation();if(!outOfStock)onAddToQuote(product)}} disabled={outOfStock} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,background:outOfStock?E.surfaceContainer:E.primary,color:outOfStock?E.outline:E.onPrimary,fontSize:12,fontWeight:600,padding:'7px 10px',borderRadius:6,border:'none',cursor:outOfStock?'not-allowed':'pointer',fontFamily:'inherit'}}>
              <DocIcon/>{outOfStock?'Unavailable':'+ Quote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Apple product card ──
function AppleCard({ product, onAdd }: { product: AppleProduct; onAdd: (p:AppleProduct)=>void }) {
  const [hov, setHov] = useState(false)
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()
  const CAT_ICONS: Record<string,string> = {Mac:'💻',iPhone:'📱',iPad:'⬜',Watch:'⌚',AirPods:'🎧','Apple TV':'📺',HomePod:'🔊',Accessories:'🔌','Watch Accessories':'⌚'}
  const goToDetail = () => navigate(`/enterprise/apple/${encodeURIComponent(product.id)}`)
  const hasImage = product.thumbnail_url && !imgError
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={goToDetail}
      style={{background:A.white,borderRadius:18,padding:'24px 20px 20px',display:'flex',flexDirection:'column',transition:'box-shadow 0.25s, transform 0.2s',boxShadow:hov?'0 8px 32px rgba(0,0,0,0.12)':'0 2px 8px rgba(0,0,0,0.06)',transform:hov?'translateY(-4px)':'none',cursor:'pointer'}}>
      {/* Image area */}
      <div style={{width:'100%',aspectRatio:'1/1',background:A.off,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,marginBottom:16,overflow:'hidden'}}>
          {hasImage
          ? <img src={product.thumbnail_url!} alt={cleanAppleName(product.name)} onError={()=>setImgError(true)} style={{width:'100%',height:'100%',objectFit:'contain',padding:12}}/>
          : <img src={APPLE_LOGO} alt="Apple" style={{width:'42%',height:'42%',objectFit:'contain',opacity:0.9}}/>}
      </div>
      {product.status==='while_stocks_last'&&<div style={{fontSize:10,fontWeight:600,color:'#ff3b30',marginBottom:4}}>While Stocks Last</div>}
      <div style={{fontSize:14,fontWeight:600,color:A.dark,lineHeight:1.3,marginBottom:4,letterSpacing:'-0.01em'}}>{cleanAppleName(product.name)}</div>
      {getAppleSubtitle(product)&&<div style={{fontSize:12,color:A.grey,marginBottom:4}}>{getAppleSubtitle(product)}</div>}
      <div style={{fontSize:10,color:A.grey,fontFamily:'monospace',marginBottom:12}}>{product.sku}</div>
      <div style={{fontSize:17,fontWeight:700,color:A.dark,letterSpacing:'-0.02em',marginBottom:16}}>
        {formatPrice(product.price_display)}<span style={{fontSize:11,fontWeight:400,color:A.grey,marginLeft:4}}>incl. VAT</span>
      </div>
      <button onClick={e=>{e.stopPropagation();onAdd(product)}} style={{width:'100%',padding:'9px 0',background:hov?A.blue:A.off,color:hov?A.white:A.blue,border:'none',borderRadius:980,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background 0.2s, color 0.2s'}}>
        {hov?'Add to Quote →':'Add to Quote'}
      </button>
    </div>
  )
}

// ── Apple section ──
function AppleSection({ cart, setCart, showToast }: {
  cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; showToast:(s:string)=>void
}) {
  const [activeCat, setActiveCat] = useState('Mac')
  const [products, setProducts] = useState<AppleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string,number>>({})
  const [search, setSearch] = useState('')
  const [colourFilter, setColourFilter] = useState('')
  const [storageFilter, setStorageFilter] = useState('')
  const [appleCart, setAppleCart] = useState<Array<{product:AppleProduct;qty:number}>>([])
  const [showAppleQuote, setShowAppleQuote] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    supabase.from('core_products').select('category_main').eq('is_active',true).eq('is_enterprise_only',true)
      .then(({data})=>{
        if(!data)return
        const c:Record<string,number>={}
        for(const p of data) c[p.category_main]=(c[p.category_main]||0)+1
        setCounts(c)
      })
  },[])

  useEffect(()=>{
    setLoading(true); setSearch(''); setColourFilter(''); setStorageFilter('')
    supabase.from('core_products').select('*').eq('category_main',activeCat).eq('is_active',true).eq('is_enterprise_only',true).order('price_display',{ascending:true})
      .then(({data})=>{ setProducts(data||[]); setLoading(false) })
  },[activeCat])

  const filtered = products.filter(p=>{
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!p.sku.toLowerCase().includes(search.toLowerCase()))return false
    if(colourFilter&&p.specs?.colour!==colourFilter)return false
    if(storageFilter&&p.specs?.storage!==storageFilter)return false
    return true
  })

  const colours = [...new Set(products.map(p=>p.specs?.colour).filter(Boolean))] as string[]
  const storages = [...new Set(products.map(p=>p.specs?.storage).filter(Boolean))] as string[]

  const addApple = (p:AppleProduct)=>{
    setAppleCart(prev=>prev.find(i=>i.product.id===p.id)?prev:[...prev,{product:p,qty:1}])
    showToast(`${cleanAppleName(p.name).slice(0,30)}… added to quote`)
    setShowAppleQuote(true)
  }

  const submitAppleQuote = async()=>{
    const {data:{session}}=await supabase.auth.getSession()
    if(!session){navigate('/enterprise/login');return}
    const {error}=await supabase.from('quote_requests').insert({
      user_id:session.user.id,source:'enterprise',status:'pending',
      items:appleCart.map(i=>({id:i.product.id,sku:i.product.sku,name:i.product.name,qty:i.qty,price:i.product.price_display})),
      final_amount:appleCart.reduce((s,i)=>s+i.product.price_display*i.qty,0),
      notes:'Apple products quote',
    })
    if(!error){setAppleCart([]);setShowAppleQuote(false);showToast('✓ Apple quote submitted! We respond within 24 hours.')}
  }

  const cat = APPLE_CATS.find(c=>c.key===activeCat)||APPLE_CATS[0]

  return (
    <div style={{background:A.off,minHeight:'100vh'}}>

      {/* Apple nav strip */}
      <div style={{background:'rgba(255,255,255,0.88)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',borderBottom:'1px solid #e8e8ed',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <img src="/enterprice-images/Apple Reseller Program Logo.png" alt="ARP" style={{height:26}} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
              <span style={{fontSize:12,color:A.grey}}>Enterprise Authorized Reseller</span>
            </div>
            <button onClick={()=>setShowAppleQuote(true)} style={{display:'flex',alignItems:'center',gap:6,background:appleCart.length>0?A.blue:'#e8e8ed',color:appleCart.length>0?A.white:A.grey,border:'none',borderRadius:980,padding:'7px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s'}}>
              Quote {appleCart.length>0&&<span style={{background:A.white,color:A.blue,borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{appleCart.length}</span>}
            </button>
          </div>
          {/* Category tabs */}
          <div style={{display:'flex',overflowX:'auto',scrollbarWidth:'none'}}>
            {APPLE_CATS.map(c=>(
              <button key={c.key} onClick={()=>setActiveCat(c.key)} style={{padding:'11px 14px',background:'none',border:'none',fontSize:13,fontWeight:activeCat===c.key?600:400,color:activeCat===c.key?A.dark:A.grey,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',borderBottom:activeCat===c.key?`2px solid ${A.dark}`:'2px solid transparent',transition:'color 0.15s, border-color 0.15s'}}>
                {c.label}{counts[c.key]>0&&<span style={{fontSize:10,color:A.grey,marginLeft:3}}>({counts[c.key]})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'36px 24px 80px'}}>

        {/* Hero image */}
        {cat.hero?(
          <div style={{borderRadius:20,overflow:'hidden',marginBottom:36,background:'#f5f5f7'}}>
            <img src={cat.hero} alt={cat.label} style={{width:'100%',display:'block',objectFit:'cover',maxHeight:400}} onError={e=>{(e.target as HTMLImageElement).parentElement!.style.display='none'}}/>
          </div>
        ):(
          <div style={{borderRadius:20,background:'linear-gradient(135deg,#f5f5f7,#e8e8ed)',padding:'56px 48px',marginBottom:36}}>
            <div style={{fontSize:12,fontWeight:600,color:A.blue,letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:10}}>Apple {cat.label}</div>
            <h2 style={{fontSize:'clamp(32px,4vw,56px)',fontWeight:700,color:A.dark,letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:10}}>{cat.label}</h2>
            <p style={{fontSize:17,color:A.grey}}>{cat.tagline}</p>
          </div>
        )}

        {/* Title + filter bar */}
        <div style={{marginBottom:24}}>
          <h2 style={{fontSize:'clamp(22px,3vw,34px)',fontWeight:700,color:A.dark,letterSpacing:'-0.02em',marginBottom:6}}>{cat.label}</h2>
          <p style={{fontSize:15,color:A.grey,marginBottom:20}}>{cat.tagline}</p>

          <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',padding:'14px 18px',background:A.white,borderRadius:12,border:'1px solid #e8e8ed'}}>
            {/* Search */}
            <div style={{position:'relative',flex:'1 1 180px'}}>
              <input type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:'100%',padding:'8px 14px 8px 32px',border:'1px solid #e8e8ed',borderRadius:980,fontSize:13,outline:'none',color:A.dark,background:A.off,fontFamily:'inherit',boxSizing:'border-box'}}/>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:A.grey,fontSize:12}}>🔍</span>
            </div>
            {/* Colour swatches */}
            {colours.slice(0,12).map(c=>(
              <button key={c} title={c} onClick={()=>setColourFilter(colourFilter===c?'':c)}
                style={{width:22,height:22,borderRadius:'50%',background:COLOUR_MAP[c]||'#999',border:colourFilter===c?`2px solid ${A.blue}`:'2px solid #e8e8ed',cursor:'pointer',outline:'none',boxShadow:colourFilter===c?`0 0 0 2px ${A.white},0 0 0 4px ${A.blue}`:'none',transition:'box-shadow 0.15s'}}/>
            ))}
            {colourFilter&&<button onClick={()=>setColourFilter('')} style={{fontSize:12,color:A.blue,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Clear colour</button>}
            {/* Storage chips */}
            {storages.map(s=>(
              <button key={s} onClick={()=>setStorageFilter(storageFilter===s?'':s)}
                style={{padding:'5px 12px',borderRadius:980,fontSize:12,fontWeight:500,border:`1px solid ${storageFilter===s?A.blue:'#e8e8ed'}`,background:storageFilter===s?A.blue:A.white,color:storageFilter===s?A.white:A.dark,cursor:'pointer',fontFamily:'inherit',transition:'all 0.15s'}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading?(
          <div style={{textAlign:'center',padding:'80px 0',color:A.grey}}>
            <div style={{fontSize:32,marginBottom:12}}>🍎</div>
            <div style={{fontSize:14}}>Loading {cat.label}…</div>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:'center',padding:'80px 0',color:A.grey}}>
            <div style={{fontSize:32,marginBottom:12}}>🔍</div>
            <div style={{fontSize:16,fontWeight:600,color:A.dark,marginBottom:8}}>No products found</div>
            <div style={{fontSize:14}}>Try adjusting your filters</div>
          </div>
        ):(
          <>
            <div style={{fontSize:13,color:A.grey,marginBottom:16}}>{filtered.length} product{filtered.length!==1?'s':''}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:16}}>
              {filtered.map(p=><AppleCard key={p.id} product={p} onAdd={addApple}/>)}
            </div>
          </>
        )}
      </div>

      {/* Apple quote sidebar */}
      {showAppleQuote&&(
        <>
          <div onClick={()=>setShowAppleQuote(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:200}}/>
          <div style={{position:'fixed',top:0,right:0,bottom:0,width:360,background:A.white,boxShadow:'-4px 0 32px rgba(0,0,0,0.12)',zIndex:201,display:'flex',flexDirection:'column',fontFamily:"-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"}}>
            <div style={{padding:'20px 20px 14px',borderBottom:'1px solid #e8e8ed',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:600,color:A.dark}}>Apple Quote Request</div>
              <button onClick={()=>setShowAppleQuote(false)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:A.grey}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'14px 20px'}}>
              {appleCart.length===0?(
                <div style={{textAlign:'center',padding:'48px 0',color:A.grey,fontSize:14}}>No products added yet</div>
              ):appleCart.map(({product:p})=>(
                <div key={p.id} style={{display:'flex',gap:10,paddingBottom:14,marginBottom:14,borderBottom:'1px solid #e8e8ed'}}>
                  <div style={{width:48,height:48,background:A.off,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>
                    {p.category_main==='Mac'?'💻':p.category_main==='iPhone'?'📱':p.category_main==='iPad'?'⬜':p.category_main==='Watch'?'⌚':'📦'}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:A.dark,marginBottom:2,lineHeight:1.3}}>{cleanAppleName(p.name)}</div>
                    <div style={{fontSize:10,color:A.grey,marginBottom:4,fontFamily:'monospace'}}>{p.sku}</div>
                    <div style={{fontSize:14,fontWeight:600,color:A.dark}}>{formatPrice(p.price_display)}</div>
                  </div>
                  <button onClick={()=>setAppleCart(prev=>prev.filter(i=>i.product.id!==p.id))} style={{background:'none',border:'none',color:A.grey,cursor:'pointer',fontSize:14,alignSelf:'flex-start'}}>✕</button>
                </div>
              ))}
            </div>
            <div style={{padding:'14px 20px 28px',borderTop:'1px solid #e8e8ed'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                <span style={{fontSize:13,color:A.grey}}>Estimated total</span>
                <span style={{fontSize:17,fontWeight:700,color:A.dark}}>{formatPrice(appleCart.reduce((s,i)=>s+i.product.price_display*i.qty,0))}</span>
              </div>
              <p style={{fontSize:11,color:A.grey,marginBottom:14,lineHeight:1.5}}>Final pricing subject to formal quote. All prices include VAT. Apple MAP policy applies.</p>
              <button onClick={submitAppleQuote} disabled={appleCart.length===0}
                style={{width:'100%',padding:'13px 0',borderRadius:980,background:appleCart.length>0?A.blue:'#e8e8ed',color:appleCart.length>0?A.white:A.grey,border:'none',fontSize:14,fontWeight:600,cursor:appleCart.length>0?'pointer':'not-allowed',fontFamily:'inherit'}}>
                Submit Quote Request
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Quote cart ──
function QuoteCart({ items, onRemove, onQtyChange, onSubmit, onClear }: {
  items:CartItem[]; onRemove:(id:string)=>void; onQtyChange:(id:string,qty:number)=>void; onSubmit:()=>void; onClear:()=>void
}) {
  const total = items.reduce((sum,i)=>sum+i.product.price*i.qty,0)
  if(items.length===0) return (
    <div style={{background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:12,padding:'24px 20px',textAlign:'center'}}>
      <div style={{fontSize:28,marginBottom:8,opacity:0.3}}>📋</div>
      <div style={{fontSize:13,color:E.onSurfaceVariant}}>Your quote is empty</div>
      <div style={{fontSize:12,color:E.outline,marginTop:4}}>Add products to build a quote</div>
    </div>
  )
  return (
    <div style={{background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${E.outlineVariant}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:13,fontWeight:600,color:E.primary,display:'flex',alignItems:'center',gap:6}}>
          <CartIcon/> Quote Builder
          <span style={{background:E.primary,color:E.onPrimary,fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:9999}}>{items.length}</span>
        </div>
        <button onClick={onClear} style={{fontSize:11,color:E.outline,background:'none',border:'none',cursor:'pointer'}}>Clear all</button>
      </div>
      <div style={{maxHeight:320,overflowY:'auto',padding:'8px 0'}}>
        {items.map(item=>(
          <div key={item.product.id} style={{padding:'10px 16px',borderBottom:`1px solid ${E.outlineVariant}`,display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:40,height:40,minWidth:40,background:E.surfaceLow,borderRadius:6,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {item.product.image?<img src={item.product.image} alt="" style={{width:'100%',height:'100%',objectFit:'contain',padding:4}}/>:<span style={{fontSize:16,opacity:0.3}}>📦</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:E.onSurface,lineHeight:1.3,marginBottom:6}}>{item.product.name.length>45?item.product.name.slice(0,45)+'…':item.product.name}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:0,border:`1px solid ${E.outlineVariant}`,borderRadius:6,overflow:'hidden'}}>
                  <button onClick={()=>onQtyChange(item.product.id,Math.max(1,item.qty-1))} style={{width:24,height:24,background:E.surfaceLow,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:E.onSurface}}><MinusIcon/></button>
                  <span style={{width:28,textAlign:'center',fontSize:12,fontWeight:600,color:E.onSurface}}>{item.qty}</span>
                  <button onClick={()=>onQtyChange(item.product.id,item.qty+1)} style={{width:24,height:24,background:E.surfaceLow,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:E.onSurface}}><PlusIcon/></button>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:E.primary,fontVariantNumeric:'tabular-nums'}}>{formatPrice(item.product.price*item.qty)}</div>
              </div>
            </div>
            <button onClick={()=>onRemove(item.product.id)} style={{background:'none',border:'none',cursor:'pointer',color:E.outline,padding:2,marginTop:2}}><XIcon/></button>
          </div>
        ))}
      </div>
      <div style={{padding:'14px 16px',borderTop:`1px solid ${E.outlineVariant}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontSize:12,color:E.onSurfaceVariant}}>Subtotal ({items.reduce((s,i)=>s+i.qty,0)} items)</span>
          <span style={{fontSize:16,fontWeight:700,color:E.primary,fontVariantNumeric:'tabular-nums'}}>{formatPrice(total)}</span>
        </div>
        <div style={{fontSize:11,color:E.outline,marginBottom:12,lineHeight:1.5}}>Excl. VAT and delivery. Prices valid for 15 business days.</div>
        <button onClick={onSubmit} style={{width:'100%',background:E.primary,color:E.onPrimary,fontSize:13,fontWeight:600,padding:'11px 16px',borderRadius:8,border:'none',cursor:'pointer',fontFamily:'inherit'}}>Submit Quote Request →</button>
      </div>
    </div>
  )
}

// ── Main page ──
export default function EnterpriseProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(0)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [source, setSource]           = useState<'all'|'esquire'|'syntech'|'enterprise'|'apple'>('all')
  const [stockFilter, setStockFilter] = useState<'all'|'in_stock'>('all')
  const [sortBy, setSortBy]           = useState<'popular'|'price_asc'|'price_desc'|'name'>('popular')
  const [cart, setCart]               = useState<CartItem[]>([])
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [toast, setToast]             = useState('')
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()

  const showToast = (msg:string)=>{ setToast(msg); setTimeout(()=>setToast(''),2500) }

  const loadProducts = useCallback(async(reset=true)=>{
    if(reset){setLoading(true);setPage(0)} else setLoadingMore(true)
    const currentPage = reset?0:page
    const from = currentPage*PAGE_SIZE, to = from+PAGE_SIZE-1
    try {
      const allRows:Product[] = []
      let totalCount = 0

      if(source==='all'||source==='esquire'){
        let q = supabase.from('products').select('id,ProductName,ProductCode,Brand,Category,Price,AvailableQty,image',{count:'exact'}).eq('is_active',true)
        if(search) q=q.ilike('ProductName',`%${search}%`)
        if(stockFilter==='in_stock') q=q.gt('AvailableQty',0)
        if(sortBy==='price_asc') q=q.order('Price',{ascending:true})
        else if(sortBy==='price_desc') q=q.order('Price',{ascending:false})
        else if(sortBy==='name') q=q.order('ProductName',{ascending:true})
        else q=q.order('AvailableQty',{ascending:false})
        if(source==='esquire') q=q.range(from,to); else q=q.range(0,99)
        const {data,count}=await q
        if(data){
          allRows.push(...data.map((p:any)=>({id:p.id,name:p.ProductName,sku:p.ProductCode,brand:p.Brand??'—',category:p.Category??'—',price:Number(p.Price),stock:p.AvailableQty??0,stockStatus:(p.AvailableQty??0)===0?'out_of_stock':(p.AvailableQty??0)<=5?'low_stock':'in_stock',image:p.image,source:'esquire' as const,description:null})))
          totalCount+=count??0
        }
      }

      if(source==='all'||source==='syntech'){
        let q = supabase.from('syntech_products').select('id,name,sku,brand,category,price_display,stock_qty,stock_status,thumbnail_url,short_description',{count:'exact'}).eq('is_active',true)
        if(search) q=q.ilike('name',`%${search}%`)
        if(stockFilter==='in_stock') q=q.gt('stock_qty',0)
        if(sortBy==='price_asc') q=q.order('price_display',{ascending:true})
        else if(sortBy==='price_desc') q=q.order('price_display',{ascending:false})
        else if(sortBy==='name') q=q.order('name',{ascending:true})
        else q=q.order('stock_qty',{ascending:false})
        if(source==='syntech') q=q.range(from,to); else q=q.range(0,99)
        const {data,count}=await q
        if(data){
          allRows.push(...data.map((p:any)=>({id:p.id,name:p.name,sku:p.sku,brand:p.brand??'—',category:p.category??'—',price:Number(p.price_display),stock:p.stock_qty??0,stockStatus:(p.stock_status as any)??'out_of_stock',image:p.thumbnail_url,source:'syntech' as const,description:p.short_description})))
          totalCount+=count??0
        }
      }

      if(source==='all'){
        if(sortBy==='price_asc') allRows.sort((a,b)=>a.price-b.price)
        if(sortBy==='price_desc') allRows.sort((a,b)=>b.price-a.price)
        if(sortBy==='name') allRows.sort((a,b)=>a.name.localeCompare(b.name))
      }

      if(reset){setProducts(allRows);setTotal(totalCount)} else setProducts(prev=>[...prev,...allRows])
      setPage(currentPage+1)
    } catch(err){console.error(err)} finally{setLoading(false);setLoadingMore(false)}
  },[search,source,stockFilter,sortBy,page])

  useEffect(()=>{ if(source!=='apple') loadProducts(true) },[search,source,stockFilter,sortBy])

  const handleSearchInput=(val:string)=>{
    setSearchInput(val); clearTimeout(searchTimeout.current)
    searchTimeout.current=setTimeout(()=>setSearch(val),400)
  }

  const addToQuote=(product:Product)=>{
    setCart(prev=>{
      const ex=prev.find(i=>i.product.id===product.id)
      if(ex) return prev.map(i=>i.product.id===product.id?{...i,qty:i.qty+1}:i)
      return [...prev,{product,qty:1}]
    })
    showToast(`${product.name.slice(0,30)}… added to quote`)
  }

  const submitQuote=async()=>{
    if(cart.length===0)return; setSubmitting(true)
    try{
      const {data:{session}}=await supabase.auth.getSession()
      if(!session){navigate('/enterprise/login');return}
      const {data:member}=await supabase.from('enterprise_account_members').select('account_id').eq('profile_id',session.user.id).single()
      const subtotal=cart.reduce((s,i)=>s+i.product.price*i.qty,0)
      const {data:quote,error:qErr}=await supabase.from('quote_requests').insert({user_id:session.user.id,enterprise_account_id:member?.account_id??null,source:'enterprise',org_name:'Enterprise Quote',status:'pending',items:cart.map(i=>({id:i.product.id,name:i.product.name,qty:i.qty,price:i.product.price})),final_amount:subtotal}).select('id').single()
      if(qErr)throw qErr
      if(quote){
        await supabase.from('enterprise_quote_items').insert(cart.map(i=>({quote_id:quote.id,product_id:i.product.id,product_source:i.product.source,product_name:i.product.name,sku:i.product.sku,brand:i.product.brand,quantity:i.qty,unit_price:i.product.price})))
      }
      setCart([]); setQuoteSuccess(true); setTimeout(()=>setQuoteSuccess(false),5000); showToast('✓ Quote submitted successfully!')
    }catch(err:any){showToast(`Error: ${err.message}`)} finally{setSubmitting(false)}
  }

  const hasMore = products.length<total&&source!=='all'

  // If Apple tab selected — render Apple section fullscreen
  if(source==='apple') return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      {/* Sidebar */}
      <aside style={{width:220,minWidth:220,background:E.surfaceWhite,borderRight:`1px solid ${E.outlineVariant}`,display:'flex',flexDirection:'column',justifyContent:'space-between',height:'100vh',position:'sticky',top:0}}>
        <div>
          <div style={{padding:'20px 20px 16px',borderBottom:`1px solid ${E.outlineVariant}`}}>
            <a href="/enterprise" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontSize:17,fontWeight:800,color:E.primary,letterSpacing:'-0.03em'}}>SPET</span>
              <span style={{fontSize:12,fontWeight:300,color:E.secondary}}>Enterprise</span>
            </a>
          </div>
          <nav style={{padding:'12px 10px'}}>
            {[
              {icon:<DashIcon/>,label:'Dashboard',path:'/enterprise/dashboard',active:false},
              {icon:<BoxIcon/>,label:'Products',path:'/enterprise/products',active:true},
              {icon:<DocIcon/>,label:'Quotations',path:'/enterprise/quotes',active:false},
              {icon:<TruckIcon/>,label:'Orders',path:'/enterprise/orders',active:false},
              {icon:<ListIcon/>,label:'Procurement Lists',path:'/enterprise/lists',active:false},
            ].map(item=>(
              <button key={item.label} onClick={()=>navigate(item.path)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:item.active?E.surfaceLow:'none',color:item.active?E.primary:E.onSurfaceVariant,fontSize:13,fontWeight:item.active?600:400,cursor:'pointer',textAlign:'left',fontFamily:'inherit',marginBottom:2}}>
                <span style={{color:item.active?E.primary:E.outline}}>{item.icon}</span>{item.label}
              </button>
            ))}
            {/* Back to all */}
            <button onClick={()=>setSource('all')} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:E.outline,fontSize:12,cursor:'pointer',textAlign:'left',fontFamily:'inherit',marginTop:8}}>
              ← Back to all products
            </button>
          </nav>
        </div>
        <div style={{padding:'12px 10px',borderTop:`1px solid ${E.outlineVariant}`}}>
          <button onClick={async()=>{await supabase.auth.signOut();navigate('/enterprise')}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:E.red,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
            <LogoutIcon/> Sign Out
          </button>
        </div>
      </aside>
      <div style={{flex:1,overflow:'auto'}}>
        <AppleSection cart={cart} setCart={setCart} showToast={showToast}/>
      </div>
      {toast&&<div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:E.primaryContainer,color:'#fff',padding:'12px 20px',borderRadius:10,fontSize:13,fontWeight:500,boxShadow:'0 8px 24px rgba(0,0,0,0.2)',zIndex:999,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )

  // Regular catalog view
  return (
    <div style={{fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, sans-serif",background:E.surface,color:E.onSurface,WebkitFontSmoothing:'antialiased',display:'flex',minHeight:'100vh'}}>
      {/* Sidebar */}
      <aside style={{width:220,minWidth:220,background:E.surfaceWhite,borderRight:`1px solid ${E.outlineVariant}`,display:'flex',flexDirection:'column',justifyContent:'space-between',height:'100vh',position:'sticky',top:0}}>
        <div>
          <div style={{padding:'20px 20px 16px',borderBottom:`1px solid ${E.outlineVariant}`}}>
            <a href="/enterprise" style={{display:'flex',alignItems:'baseline',gap:5,textDecoration:'none'}}>
              <span style={{fontSize:17,fontWeight:800,color:E.primary,letterSpacing:'-0.03em'}}>SPET</span>
              <span style={{fontSize:12,fontWeight:300,color:E.secondary}}>Enterprise</span>
            </a>
          </div>
          <nav style={{padding:'12px 10px'}}>
            {[
              {icon:<DashIcon/>,label:'Dashboard',path:'/enterprise/dashboard',active:false},
              {icon:<BoxIcon/>,label:'Products',path:'/enterprise/products',active:true},
              {icon:<DocIcon/>,label:'Quotations',path:'/enterprise/quotes',active:false},
              {icon:<TruckIcon/>,label:'Orders',path:'/enterprise/orders',active:false},
              {icon:<ListIcon/>,label:'Procurement Lists',path:'/enterprise/lists',active:false},
            ].map(item=>(
              <button key={item.label} onClick={()=>navigate(item.path)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:item.active?E.surfaceLow:'none',color:item.active?E.primary:E.onSurfaceVariant,fontSize:13,fontWeight:item.active?600:400,cursor:'pointer',textAlign:'left',fontFamily:'inherit',marginBottom:2}}>
                <span style={{color:item.active?E.primary:E.outline}}>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{padding:'12px 10px',borderTop:`1px solid ${E.outlineVariant}`}}>
          <button onClick={async()=>{await supabase.auth.signOut();navigate('/enterprise')}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 12px',borderRadius:8,border:'none',background:'none',color:E.red,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
            <LogoutIcon/> Sign Out
          </button>
        </div>
      </aside>

      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        {/* Top bar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',height:64,borderBottom:`1px solid ${E.outlineVariant}`,background:E.surfaceWhite,position:'sticky',top:0,zIndex:10}}>
          <div>
            <h1 style={{fontSize:18,fontWeight:700,color:E.primary,letterSpacing:'-0.02em'}}>Enterprise Catalog</h1>
            <p style={{fontSize:12,color:E.onSurfaceVariant,marginTop:1}}>{total.toLocaleString()} products across all ranges</p>
          </div>
          {cart.length>0&&<div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:E.onSurfaceVariant}}><CartIcon/><span><strong style={{color:E.primary}}>{cart.length}</strong> items · {formatPrice(cart.reduce((s,i)=>s+i.product.price*i.qty,0))}</span></div>}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:0,flex:1}}>
          <div style={{padding:'24px 28px',minWidth:0}}>
            {/* Filter bar */}
            <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{position:'relative',flex:1,minWidth:200}}>
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:E.outline}}><SearchIcon/></span>
                <input type="text" placeholder="Search products, brands, SKUs…" value={searchInput} onChange={e=>handleSearchInput(e.target.value)}
                  style={{width:'100%',paddingLeft:36,paddingRight:14,paddingTop:9,paddingBottom:9,fontSize:13,color:E.onSurface,background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:8,outline:'none',fontFamily:'inherit'}}/>
              </div>

              {/* Source tabs — now includes Apple */}
              <div style={{display:'flex',gap:4,background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:8,padding:4,flexWrap:'wrap'}}>
                {([
                  {key:'all',label:'All'},
                  {key:'esquire',label:'Home & Ent.'},
                  {key:'syntech',label:'Gaming & Computing'},
                  {key:'enterprise',label:'Enterprise'},
                  {key:'apple',label:' Apple'},
                ] as const).map(s=>(
                  <button key={s.key} onClick={()=>s.key==='apple'?navigate('/enterprise/apple'):setSource(s.key)} style={{padding:'5px 12px',borderRadius:6,border:'none',background:source===s.key?(s.key==='apple'?'#1d1d1f':E.primary):'none',color:source===s.key?E.onPrimary:E.onSurfaceVariant,fontSize:12,fontWeight:source===s.key?600:400,cursor:'pointer',fontFamily:'inherit'}}>
                    {s.label}
                  </button>
                ))}
              </div>

              <button onClick={()=>setStockFilter(prev=>prev==='all'?'in_stock':'all')}
                style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px solid ${stockFilter==='in_stock'?E.primary:E.outlineVariant}`,background:stockFilter==='in_stock'?E.primary:E.surfaceWhite,color:stockFilter==='in_stock'?E.onPrimary:E.onSurfaceVariant,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
                <FilterIcon/> In stock only
              </button>

              <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)}
                style={{padding:'8px 12px',borderRadius:8,border:`1px solid ${E.outlineVariant}`,background:E.surfaceWhite,fontSize:12,color:E.onSurface,cursor:'pointer',fontFamily:'inherit',outline:'none'}}>
                <option value="popular">Sort: Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>

            {quoteSuccess&&<div style={{background:E.greenBg,border:`1px solid ${E.green}`,borderRadius:10,padding:'14px 18px',display:'flex',alignItems:'center',gap:12,marginBottom:20,fontSize:13,color:E.green,fontWeight:500}}>✓ Your quote has been submitted! Our team will review and respond within 24 hours.</div>}

            {loading?(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
                {Array.from({length:12}).map((_,i)=>(
                  <div key={i} style={{background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:12,overflow:'hidden',animation:'pulse 1.5s ease-in-out infinite'}}>
                    <div style={{width:'100%',aspectRatio:'4/3',background:E.surfaceContainer}}/>
                    <div style={{padding:16}}>
                      <div style={{height:10,background:E.surfaceContainer,borderRadius:4,marginBottom:8,width:'60%'}}/>
                      <div style={{height:14,background:E.surfaceContainer,borderRadius:4,marginBottom:6}}/>
                      <div style={{height:14,background:E.surfaceContainer,borderRadius:4,width:'80%'}}/>
                    </div>
                  </div>
                ))}
              </div>
            ):products.length===0?(
              <div style={{textAlign:'center',padding:'64px 24px',color:E.onSurfaceVariant}}>
                <div style={{fontSize:40,marginBottom:12,opacity:0.2}}>🔍</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>No products found</div>
                <div style={{fontSize:13}}>Try a different search or filter</div>
              </div>
            ):(
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
                  {products.map(p=><ProductCard key={p.id} product={p} onAddToQuote={addToQuote}/>)}
                </div>
                {hasMore&&<div style={{textAlign:'center',marginTop:32}}>
                  <button onClick={()=>loadProducts(false)} disabled={loadingMore} style={{background:E.surfaceWhite,border:`1px solid ${E.outlineVariant}`,borderRadius:8,padding:'11px 28px',fontSize:13,fontWeight:600,color:E.onSurface,cursor:'pointer',fontFamily:'inherit'}}>
                    {loadingMore?'Loading…':`Load more (${total-products.length} remaining)`}
                  </button>
                </div>}
              </>
            )}
          </div>

          {/* Quote cart */}
          <div style={{padding:'24px 20px 24px 0',borderLeft:`1px solid ${E.outlineVariant}`,background:E.surfaceLow,display:'flex',flexDirection:'column',gap:16,position:'sticky',top:64,height:'calc(100vh - 64px)',overflowY:'auto'}}>
            <div style={{padding:'0 4px'}}>
              <QuoteCart items={cart} onRemove={id=>setCart(prev=>prev.filter(i=>i.product.id!==id))} onQtyChange={(id,qty)=>setCart(prev=>prev.map(i=>i.product.id===id?{...i,qty}:i))} onSubmit={submitQuote} onClear={()=>setCart([])}/>
              {submitting&&<div style={{textAlign:'center',fontSize:12,color:E.onSurfaceVariant,marginTop:10}}>Submitting your quote…</div>}
            </div>
          </div>
        </div>
      </div>

      {toast&&<div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:E.primaryContainer,color:'#fff',padding:'12px 20px',borderRadius:10,fontSize:13,fontWeight:500,boxShadow:'0 8px 24px rgba(0,0,0,0.2)',zIndex:999,whiteSpace:'nowrap'}}>{toast}</div>}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  )
}
