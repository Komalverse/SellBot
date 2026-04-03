import { useState, useRef, useReducer, useEffect, useCallback } from "react";

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', sans-serif; background: #F8FAFC; color: #0F172A; -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
select { appearance: none; -webkit-appearance: none; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }
input  { font-family: inherit; border: none; outline: none; background: none; }

@keyframes fadeUp  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
@keyframes dot-bounce { 0%,80%,100% { transform:translateY(0); opacity:0.35; } 40% { transform:translateY(-5px); opacity:1; } }
@keyframes pulse-dot  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
@keyframes toast-in   { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
@keyframes toast-out  { from { opacity:1; transform:translateX(0); }   to { opacity:0; transform:translateX(20px); } }
@keyframes order-flash { 0% { background:#EEF2FF; } 50% { background:#C7D2FE; } 100% { background:transparent; } }
@keyframes urgency-blink { 0%,100% { opacity:1; } 50% { opacity:0.65; } }

.msg-anim    { animation: fadeUp 0.16s ease both; }
.page-anim   { animation: fadeIn 0.18s ease both; }
.toast-enter { animation: toast-in  0.22s ease both; }
.toast-exit  { animation: toast-out 0.22s ease both; }
.order-flash { animation: order-flash 1.4s ease 0.1s both; }
.urgency     { animation: urgency-blink 1.8s ease infinite; }
`;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:"#F8FAFC", surface:"#FFFFFF",
  primary:"#6366F1", primaryH:"#4F46E5",
  accent:"#059669",
  textP:"#0F172A", textS:"#64748B", border:"#E2E8F0",
  sidebar:"#111827", sidebarEl:"#1F2937",
  pending:  { bg:"#FFFBEB", text:"#B45309", border:"#FDE68A", dot:"#F59E0B" },
  confirmed:{ bg:"#EFF6FF", text:"#1D4ED8", border:"#BFDBFE", dot:"#2563EB" },
  shipped:  { bg:"#F0FDF4", text:"#15803D", border:"#BBF7D0", dot:"#16A34A" },
  cancelled:{ bg:"#FEF2F2", text:"#B91C1C", border:"#FECACA", dot:"#DC2626" },
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id:1, name:"Blue Anarkali Dress", price:1299, sizes:["S","M","L"],     stock:12, category:"dress",   emoji:"👗", tag:"Bestseller" },
  { id:2, name:"Banarasi Red Saree",  price:999,  sizes:["Free Size"],      stock:7,  category:"saree",   emoji:"🥻", tag:"New Arrival" },
  { id:3, name:"Cotton White Shirt",  price:799,  sizes:["S","M","L","XL"], stock:20, category:"shirt",   emoji:"👔", tag:"" },
  { id:4, name:"Floral Kurti",        price:849,  sizes:["S","M","L"],      stock:0,  category:"kurti",   emoji:"👘", tag:"Out of Stock" },
  { id:5, name:"Black Lehenga Set",   price:2499, sizes:["S","M","L"],      stock:5,  category:"lehenga", emoji:"👗", tag:"Premium" },
  { id:6, name:"Yellow Silk Dupatta", price:449,  sizes:["Free Size"],      stock:15, category:"dupatta", emoji:"🧣", tag:"" },
];

const INIT_CONVS = [
  { id:"c1", name:"Priya Sharma", source:"Instagram", avatar:"PS", unread:0, online:false, priority:false, lastMsg:"Thank you! 😊", lastTime:"9:20 AM",
    messages:[
      { id:1, role:"user", text:"Hi! Do you have blue dress in M size?", time:"9:10 AM", source:"Instagram" },
      { id:2, role:"bot",  text:"Found it in your catalog:", productDetail:PRODUCTS[0], detect:"Blue Anarkali Dress · dress category", matchMs:380, time:"9:10 AM" },
      { id:3, role:"user", text:"I want size M", time:"9:15 AM", source:"Instagram" },
      { id:4, role:"bot",  text:"Order placed!", orderConfirm:{ product:"Blue Anarkali Dress", size:"M", orderId:1001 }, detect:"Intent: order · Size M detected", matchMs:210, time:"9:15 AM" },
      { id:5, role:"user", text:"Thank you! 😊", time:"9:20 AM", source:"Instagram" },
    ]},
  { id:"c2", name:"Anjali Verma", source:"WhatsApp", avatar:"AV", unread:2, online:true, priority:true, lastMsg:"What about COD?", lastTime:"10:40 AM",
    messages:[
      { id:1, role:"user", text:"Show me sarees", time:"10:30 AM", source:"WhatsApp" },
      { id:2, role:"bot",  text:"Our saree collection:", products:[PRODUCTS[1]], detect:"Category: saree", matchMs:290, time:"10:30 AM" },
      { id:3, role:"user", text:"Red saree ka price?", time:"10:35 AM", source:"WhatsApp" },
      { id:4, role:"bot",  text:"Here's the detail:", productDetail:PRODUCTS[1], detect:"Banarasi Red Saree · price query", matchMs:340, time:"10:35 AM" },
      { id:5, role:"user", text:"What about COD?", time:"10:40 AM", source:"WhatsApp" },
    ]},
  { id:"c3", name:"Sneha Gupta", source:"WhatsApp", avatar:"SG", unread:1, online:true, priority:true, lastMsg:"Is white shirt available in XL?", lastTime:"11:10 AM",
    messages:[ { id:1, role:"user", text:"Is white shirt available in XL?", time:"11:10 AM", source:"WhatsApp" } ]},
  { id:"c4", name:"Meera Patel", source:"Instagram", avatar:"MP", unread:0, online:false, priority:false, lastMsg:"Order confirmed ✅", lastTime:"11:50 AM",
    messages:[
      { id:1, role:"user", text:"Show me under ₹1000", time:"11:40 AM", source:"Instagram" },
      { id:2, role:"bot",  text:"Budget picks for you:", products:[PRODUCTS[1],PRODUCTS[2],PRODUCTS[5]], detect:"Budget filter: ≤ ₹1000 · 3 matches", bestSeller:"Banarasi Red Saree · Top seller under ₹1000", matchMs:180, time:"11:40 AM" },
      { id:3, role:"user", text:"Order red saree", time:"11:45 AM", source:"Instagram" },
      { id:4, role:"bot",  text:"Done! Order placed.", orderConfirm:{ product:"Banarasi Red Saree", size:"Free Size", orderId:1002 }, detect:"Intent: order · Banarasi Red Saree matched", matchMs:260, time:"11:45 AM" },
      { id:5, role:"user", text:"Order confirmed ✅", time:"11:50 AM", source:"Instagram" },
    ]},
  { id:"c5", name:"Divya Nair", source:"WhatsApp", avatar:"DN", unread:3, online:true, priority:true, lastMsg:"Do you have lehenga in red?", lastTime:"12:25 PM",
    messages:[ { id:1, role:"user", text:"Do you have lehenga in red?", time:"12:25 PM", source:"WhatsApp" } ]},
  { id:"c6", name:"Ritika Joshi", source:"Instagram", avatar:"RJ", unread:0, online:false, priority:false, lastMsg:"Thanks, will order soon!", lastTime:"1:15 PM",
    messages:[
      { id:1, role:"user", text:"Price of black lehenga?", time:"1:10 PM", source:"Instagram" },
      { id:2, role:"bot",  text:"Here's the detail:", productDetail:PRODUCTS[4], detect:"Black Lehenga Set · price query", matchMs:310, time:"1:10 PM" },
      { id:3, role:"user", text:"Thanks, will order soon!", time:"1:15 PM", source:"Instagram" },
    ]},
];

const INIT_ORDERS = [
  { id:1001, customer:"Priya Sharma",  product:"Blue Anarkali Dress", size:"M",         qty:1, status:"Shipped",   source:"Instagram", time:"9:15 AM",  price:1299, highlight:false },
  { id:1002, customer:"Anjali Verma",  product:"Banarasi Red Saree",  size:"Free Size",  qty:2, status:"Confirmed", source:"WhatsApp",  time:"10:32 AM", price:1998, highlight:false },
  { id:1003, customer:"Sneha Gupta",   product:"Cotton White Shirt",  size:"L",          qty:1, status:"Pending",   source:"WhatsApp",  time:"11:05 AM", price:799,  highlight:false },
  { id:1004, customer:"Meera Patel",   product:"Black Lehenga Set",   size:"S",          qty:1, status:"Confirmed", source:"Instagram", time:"11:48 AM", price:2499, highlight:false },
  { id:1005, customer:"Divya Nair",    product:"Yellow Silk Dupatta", size:"Free Size",  qty:3, status:"Pending",   source:"WhatsApp",  time:"12:20 PM", price:1347, highlight:false },
  { id:1006, customer:"Ritika Joshi",  product:"Blue Anarkali Dress", size:"S",          qty:1, status:"Pending",   source:"Instagram", time:"1:10 PM",  price:1299, highlight:false },
  { id:1007, customer:"Pooja Singh",   product:"Banarasi Red Saree",  size:"Free Size",  qty:1, status:"Shipped",   source:"WhatsApp",  time:"2:45 PM",  price:999,  highlight:false },
];

// ─── ENGINE ───────────────────────────────────────────────────────────────────
function processMessage(text, lastProduct) {
  const lower = text.toLowerCase();
  const budgetMatch = lower.match(/under\s*[₹rs\s]*(\d+)/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1]);
    const filtered = PRODUCTS.filter(p=>p.price<=budget&&p.stock>0);
    const best = filtered.find(p=>p.tag==="Bestseller")||filtered[0];
    if (!filtered.length) return { type:"text", text:"No items found in this budget. Try ₹1000 or above?", detect:`Budget filter: ₹${budget} · no matches`, matchMs:120 };
    return { type:"product_list", products:filtered.slice(0,3), text:`${filtered.length} item${filtered.length>1?"s":""} under ₹${budget}:`, detect:`Budget filter: ≤ ₹${budget} · ${filtered.length} matches`, bestSeller:best?`${best.name} · Best seller in this range`:null, matchMs:190 };
  }
  const cats = ["saree","dress","shirt","kurti","lehenga","dupatta"];
  for (const cat of cats) {
    if (lower.includes(cat)) {
      const found = PRODUCTS.filter(p=>p.category===cat);
      if (found.length) return { type:"product_list", products:found, text:`Our ${cat} collection:`, detect:`Category: ${cat} · ${found.length} products`, matchMs:175 };
    }
  }
  const sizeMatch = lower.match(/size\s*([smlx]+l?)/i);
  const orderWords = ["i want","i'll take","order this","buy this","book this","lena hai","chahiye","order kar"];
  if (orderWords.some(w=>lower.includes(w))||sizeMatch) {
    const size = sizeMatch ? sizeMatch[1].toUpperCase() : null;
    if (lastProduct) return { type:"create_order", product:lastProduct, size:size||lastProduct.sizes[0], detect:`Intent: order · Size: ${size||lastProduct.sizes[0]} detected`, matchMs:165 };
    return { type:"text", text:"Which product would you like to order? Please share the name.", detect:"Intent: order · product unclear", matchMs:140 };
  }
  const priceWords = ["price","cost","how much","rate","kitna","daam","kitne ka"];
  if (priceWords.some(w=>lower.includes(w))) {
    for (const p of PRODUCTS) {
      if (lower.includes(p.name.toLowerCase())||p.name.toLowerCase().split(" ").some(w=>w.length>3&&lower.includes(w))) {
        return { type:"product_detail", product:p, outOfStock:p.stock===0, detect:`${p.name} · price query`, matchMs:220 };
      }
    }
    return { type:"text", text:"Which product's price would you like to know?", detect:"Price intent · product unclear", matchMs:130 };
  }
  if (lower.includes("available")||lower.includes("stock")) {
    for (const p of PRODUCTS) {
      if (lower.includes(p.name.toLowerCase())||p.name.toLowerCase().split(" ").some(w=>w.length>3&&lower.includes(w))) {
        return { type:"product_detail", product:p, outOfStock:p.stock===0, detect:`${p.name} · availability check`, matchMs:190 };
      }
    }
  }
  for (const p of PRODUCTS) {
    if (lower.includes(p.name.toLowerCase())) {
      return { type:"product_detail", product:p, outOfStock:p.stock===0, detect:`${p.name} matched from catalog`, matchMs:170 };
    }
  }
  if (lower.match(/^(hi|hello|hey|namaste|hii)/)) {
    return { type:"text", text:"Hello! Welcome to Rang Boutique.\n\nYou can ask about:\n• Product prices & availability\n• Filter by budget — e.g. 'under ₹1000'\n• Browse by category: saree, dress, kurti…\n• Place an order", detect:"Greeting detected", matchMs:90 };
  }
  if (lower.includes("cod")||lower.includes("cash on delivery")) return { type:"text", text:"Yes! COD available on all orders above ₹499.\nPay at the time of delivery.", detect:"Policy: COD query", matchMs:100 };
  if (lower.includes("return")||lower.includes("exchange")) return { type:"text", text:"7-day easy return & exchange policy.\nShare your order ID and we'll handle the rest.", detect:"Policy: return/exchange", matchMs:110 };
  if (lower.includes("delivery")||lower.includes("shipping")) return { type:"text", text:"Delivery in 3–5 working days.\nFree shipping on orders above ₹999.", detect:"Policy: delivery/shipping", matchMs:95 };
  return { type:"text", text:"I can help you with:\n• Price & availability\n• Filter by budget\n• Categories: saree, dress, kurti…\n• Place an order\n• COD, returns & delivery info", detect:"General query", matchMs:120 };
}

// ─── REDUCERS ─────────────────────────────────────────────────────────────────
function ordersReducer(state, action) {
  switch (action.type) {
    case "ADD":         return [{ ...action.order, highlight:true }, ...state];
    case "STATUS":      return state.map(o=>o.id===action.id?{...o,status:action.status}:o);
    case "UNHIGHLIGHT": return state.map(o=>o.id===action.id?{...o,highlight:false}:o);
    default: return state;
  }
}
function convsReducer(state, action) {
  switch (action.type) {
    case "SELECT":  return state.map(c=>({...c,unread:c.id===action.id?0:c.unread}));
    case "ADD_MSG": return state.map(c=>c.id===action.id?{...c,messages:[...c.messages,action.msg],lastMsg:action.msg.text||(action.msg.orderConfirm?"Order placed ✅":action.msg.products?"Products shared":"…"),lastTime:action.msg.time}:c);
    default: return state;
  }
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Ic = {
  Inbox:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Orders:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>,
  Products:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14v14M4 7v10l8 4"/></svg>,
  Reports: ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  Send:    ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
  Bell:    ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Search:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  WA:      ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.508 5.815L.057 23.17a.75.75 0 0 0 .926.929l5.487-1.474A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.915 0-3.717-.518-5.256-1.418l-.376-.225-3.898 1.048 1.012-3.796-.247-.392A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
  IG:      ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  Check:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevD:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Arrow:   ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  Seller:  ()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Zap:     ()=><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Alert:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Eye:     ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const nowStr = () => new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
const AVATAR_BG = ["#6366F1","#0891B2","#059669","#D97706","#DC2626","#7C3AED","#DB2777","#0284C7"];
const Avatar = ({ initials, size="md" }) => {
  const d = size==="sm"?{w:28,h:28,fs:10}:size==="lg"?{w:40,h:40,fs:14}:{w:36,h:36,fs:12};
  const bg = AVATAR_BG[initials.charCodeAt(0)%AVATAR_BG.length];
  return <div style={{width:d.w,height:d.h,borderRadius:"50%",background:bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:d.fs}}>{initials}</div>;
};
const SourceBadge = ({ source }) => {
  const wa = source==="WhatsApp";
  return <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:4,background:wa?"#DCFCE7":"#FCE7F3",color:wa?"#15803D":"#BE185D"}}>{wa?<Ic.WA/>:<Ic.IG/>}{wa?"WhatsApp":"Instagram"}</span>;
};
const StatusPill = ({ status }) => {
  const s = C[status.toLowerCase()]||C.pending;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:6,background:s.bg,color:s.text,border:`1px solid ${s.border}`}}><span style={{width:6,height:6,borderRadius:"50%",background:s.dot,display:"inline-block"}}/>{status}</span>;
};

// ─── AI TRACE ROW ─────────────────────────────────────────────────────────────
const AITrace = ({ detect, matchMs }) => (
  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
    <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:"#EEF2FF",color:"#4338CA",border:"1px solid #C7D2FE",letterSpacing:"0.01em"}}>
      <Ic.Zap/> Matched from catalog
    </span>
    {detect && <span style={{fontSize:9,color:"#94A3B8",fontFamily:"'DM Mono',monospace"}}>{detect}</span>}
    {matchMs && <span style={{fontSize:9,color:"#94A3B8"}}>· {((matchMs+1200)/1000).toFixed(1)}s</span>}
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ data, onDone, onViewOrders }) => {
  const [exit, setExit] = useState(false);
  useEffect(()=>{
    const t1 = setTimeout(()=>setExit(true), 3800);
    const t2 = setTimeout(onDone, 4200);
    return ()=>{ clearTimeout(t1); clearTimeout(t2); };
  },[]);
  return (
    <div className={exit?"toast-exit":"toast-enter"} style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:"#111827",color:"#fff",borderRadius:12,padding:"13px 15px",display:"flex",alignItems:"center",gap:11,boxShadow:"0 8px 40px rgba(0,0,0,0.22)",fontSize:13,fontWeight:500,minWidth:280,maxWidth:340}}>
      <span style={{width:24,height:24,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.Check/></span>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontWeight:600,fontSize:13}}>{data.title}</p>
        {data.sub && <p style={{fontSize:11,color:"#94A3B8",marginTop:1}}>{data.sub}</p>}
      </div>
      {data.cta && (
        <button onClick={()=>{ onViewOrders(); onDone(); }} style={{fontSize:11,fontWeight:700,padding:"5px 9px",borderRadius:6,background:"rgba(255,255,255,0.12)",color:"#fff",flexShrink:0,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap",border:"1px solid rgba(255,255,255,0.15)"}}>
          View in Orders <Ic.Arrow/>
        </button>
      )}
    </div>
  );
};

// ─── CHAT PRODUCT CARD ────────────────────────────────────────────────────────
const ChatProductCard = ({ product, onOrder }) => (
  <div style={{borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",minWidth:230,maxWidth:290}}>
    <div style={{width:42,height:42,borderRadius:8,background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${C.border}`,flexShrink:0}}>{product.emoji}</div>
    <div style={{flex:1,minWidth:0}}>
      <p style={{fontSize:12,fontWeight:600,color:C.textP,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{product.name}</p>
      <p style={{fontSize:14,fontWeight:700,color:C.accent,marginTop:1}}>₹{product.price.toLocaleString("en-IN")}</p>
      {product.stock===0 ? <p style={{fontSize:10,color:"#DC2626",marginTop:1}}>Out of stock</p> : <p style={{fontSize:10,color:C.textS,marginTop:1}}>{product.sizes.join(" · ")} · {product.stock} left</p>}
    </div>
    {product.stock>0 && (
      <button onClick={()=>onOrder(product)} style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,background:C.primary,color:"#fff",flexShrink:0,transition:"background 0.12s"}}
        onMouseOver={e=>e.currentTarget.style.background=C.primaryH}
        onMouseOut={e=>e.currentTarget.style.background=C.primary}>Order</button>
    )}
  </div>
);

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onOrder, customerName, customerAvatar, onViewOrder }) => {
  const isUser = msg.role==="user";
  return (
    <div className="msg-anim" style={{display:"flex",flexDirection:isUser?"row":"row-reverse",gap:8,marginBottom:12,alignItems:"flex-end"}}>
      {isUser
        ? <Avatar initials={customerAvatar||"C"} size="sm"/>
        : <div style={{width:28,height:28,borderRadius:"50%",background:C.primary,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🛍️</div>
      }
      <div style={{maxWidth:"70%",display:"flex",flexDirection:"column",alignItems:isUser?"flex-start":"flex-end",gap:2}}>
        {isUser && <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><SourceBadge source={msg.source}/><span style={{fontSize:10,color:C.textS}}>{customerName}</span></div>}
        {!isUser && msg.detect && <AITrace detect={msg.detect} matchMs={msg.matchMs}/>}
        {!isUser && !msg.detect && <span style={{fontSize:10,color:C.textS,marginBottom:2}}>Suggested reply · {msg.time}</span>}

        <div style={{borderRadius:isUser?"2px 14px 14px 14px":"14px 2px 14px 14px",padding:"10px 13px",fontSize:13,lineHeight:1.55,background:isUser?C.surface:C.primary,color:isUser?C.textP:"#fff",border:isUser?`1px solid ${C.border}`:"none",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          {msg.text && <p style={{whiteSpace:"pre-wrap"}}>{msg.text}</p>}

          {/* ⭐ Best seller nudge — killer differentiation */}
          {msg.bestSeller && (
            <div style={{marginTop:8,padding:"6px 10px",borderRadius:6,background:"rgba(255,255,255,0.13)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13}}>⭐</span>
              <span style={{fontSize:11,fontWeight:600,color:"#FDE68A"}}>{msg.bestSeller}</span>
            </div>
          )}

          {/* Product detail */}
          {msg.productDetail && (
            <div style={{marginTop:msg.text?8:0,borderRadius:8,padding:"10px 12px",background:isUser?"#F8FAFC":"rgba(255,255,255,0.11)",border:isUser?`1px solid ${C.border}`:"1px solid rgba(255,255,255,0.18)"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:24,marginTop:2}}>{msg.productDetail.emoji}</span>
                <div>
                  <p style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",color:isUser?C.textS:"rgba(255,255,255,0.5)",marginBottom:3}}>From Catalog</p>
                  <p style={{fontWeight:600,fontSize:13,color:isUser?C.textP:"#fff"}}>{msg.productDetail.name}</p>
                  {msg.outOfStock
                    ? <p style={{fontSize:11,color:"#FCA5A5",marginTop:2}}>Out of stock</p>
                    : <p style={{fontSize:15,fontWeight:700,marginTop:2,color:isUser?C.accent:"#6EE7B7"}}>₹{msg.productDetail.price.toLocaleString("en-IN")}</p>}
                  {!msg.outOfStock && <p style={{fontSize:10,marginTop:1,color:isUser?C.textS:"rgba(255,255,255,0.55)"}}>{msg.productDetail.sizes.join(", ")} · {msg.productDetail.stock} in stock</p>}
                </div>
              </div>
              {!msg.outOfStock && (
                <div style={{display:"flex",gap:5,marginTop:8,flexWrap:"wrap"}}>
                  <button onClick={()=>onOrder(msg.productDetail)} style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,background:isUser?C.primary:"#fff",color:isUser?"#fff":C.primary}}>Confirm Order</button>
                  <button style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,background:"transparent",color:isUser?C.textS:"rgba(255,255,255,0.65)",border:isUser?`1px solid ${C.border}`:"1px solid rgba(255,255,255,0.2)"}}>Send Price</button>
                  <button style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,background:"transparent",color:isUser?C.textS:"rgba(255,255,255,0.65)",border:isUser?`1px solid ${C.border}`:"1px solid rgba(255,255,255,0.2)"}}>Change Size</button>
                </div>
              )}
            </div>
          )}

          {/* Order confirm with → View in Orders */}
          {msg.orderConfirm && (
            <div style={{marginTop:msg.text?8:0,borderRadius:8,padding:"10px 12px",background:"rgba(5,150,105,0.13)",border:"1px solid rgba(5,150,105,0.27)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{width:22,height:22,borderRadius:"50%",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic.Check/></span>
                <div>
                  <p style={{fontSize:12,fontWeight:700,color:isUser?C.textP:"#fff"}}>Order Created</p>
                  <p style={{fontSize:11,color:isUser?C.textS:"rgba(255,255,255,0.65)",marginTop:1}}>{msg.orderConfirm.product} · Size {msg.orderConfirm.size}</p>
                </div>
              </div>
              <button onClick={()=>onViewOrder(msg.orderConfirm.orderId)} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,width:"100%",justifyContent:"center",background:isUser?"#059669":"rgba(255,255,255,0.17)",color:"#fff",border:"none"}}>
                <Ic.Eye/> View in Orders <Ic.Arrow/>
              </button>
            </div>
          )}

          {/* Product list */}
          {msg.products && (
            <div style={{marginTop:msg.text?8:0,display:"flex",flexDirection:"column",gap:6}}>
              {msg.products.map(p=><ChatProductCard key={p.id} product={p} onOrder={onOrder}/>)}
            </div>
          )}
        </div>

        {/* Timestamp / speed */}
        {!isUser && (
          <span style={{fontSize:9,color:"#94A3B8",display:"flex",alignItems:"center",gap:3,marginTop:1}}>
            {msg.matchMs ? <><Ic.Zap/> Auto-replied in {((msg.matchMs+1200)/1000).toFixed(1)}s</> : msg.time}
          </span>
        )}
        {isUser && <p style={{fontSize:10,color:C.textS,paddingLeft:2}}>{msg.time}</p>}
      </div>
    </div>
  );
};

// ─── TYPING ───────────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div style={{display:"flex",flexDirection:"row-reverse",gap:8,marginBottom:10,alignItems:"flex-end"}}>
    <div style={{width:28,height:28,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🛍️</div>
    <div style={{borderRadius:"14px 2px 14px 14px",padding:"12px 16px",background:C.primary,display:"flex",alignItems:"center",gap:5}}>
      {[0,150,300].map(d=><span key={d} style={{width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.7)",display:"inline-block",animation:"dot-bounce 1.2s infinite",animationDelay:`${d}ms`}}/>)}
    </div>
  </div>
);

// ─── CHAT WINDOW ──────────────────────────────────────────────────────────────
const ChatWindow = ({ conv, onSend, onOrderCreate, showToast, onViewOrders }) => {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [conv?.messages, typing]);
  useEffect(()=>{ setInput(""); setTyping(false); setLastProduct(null); }, [conv?.id]);

  if (!conv) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.bg,gap:8}}>
      <div style={{fontSize:40}}>💬</div>
      <p style={{color:C.textP,fontWeight:600,fontSize:14}}>Select a conversation</p>
      <p style={{color:C.textS,fontSize:12}}>Choose a customer from the left panel</p>
    </div>
  );

  const doOrder = (product, sizeOverride) => {
    const size = sizeOverride||product.sizes[0];
    const orderId = Date.now();
    const order = { id:orderId, customer:conv.name, product:product.name, size, qty:1, status:"Pending", source:conv.source, time:nowStr(), price:product.price };
    onOrderCreate(order);
    onSend(conv.id, { id:orderId+1, role:"bot", text:"Order placed!", orderConfirm:{ product:product.name, size, orderId }, detect:`Intent: order · ${product.name} · Size ${size}`, matchMs:195, time:nowStr() });
    setLastProduct(product);
    showToast({ title:"Order created", sub:`${product.name} · ${conv.name}`, cta:true, orderId });
  };

  const send = () => {
    if (!input.trim()) return;
    onSend(conv.id, { id:Date.now(), role:"user", text:input, source:conv.source, time:nowStr() });
    const q = input; setInput(""); setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const r = processMessage(q, lastProduct);
      let m = { id:Date.now()+1, role:"bot", time:nowStr(), detect:r.detect, matchMs:r.matchMs };
      if (r.type==="text") { m.text=r.text; }
      else if (r.type==="product_detail") { m.text="Here's what I found:"; m.productDetail=r.product; m.outOfStock=r.outOfStock; if(!r.outOfStock) setLastProduct(r.product); }
      else if (r.type==="product_list")   { m.text=r.text; m.products=r.products; m.bestSeller=r.bestSeller||null; if(r.products.length) setLastProduct(r.products[0]); }
      else if (r.type==="create_order")   {
        const oid = Date.now();
        onOrderCreate({ id:oid, customer:conv.name, product:r.product.name, size:r.size, qty:1, status:"Pending", source:conv.source, time:nowStr(), price:r.product.price });
        m.text="Order placed!"; m.orderConfirm={ product:r.product.name, size:r.size, orderId:oid };
        showToast({ title:"Order created", sub:`${r.product.name} · ${conv.name}`, cta:true, orderId:oid });
      }
      onSend(conv.id, m);
    }, 1300);
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Header */}
      <div style={{padding:"11px 18px",background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div style={{position:"relative",flexShrink:0}}>
          <Avatar initials={conv.avatar} size="md"/>
          {conv.online && <span style={{position:"absolute",bottom:1,right:1,width:9,height:9,borderRadius:"50%",background:"#16A34A",border:"2px solid #fff",animation:"pulse-dot 2s ease infinite"}}/>}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <p style={{fontWeight:600,fontSize:14,color:C.textP}}>{conv.name}</p>
            {conv.priority && <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA"}}>High priority</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
            <span style={{fontSize:11,color:conv.online?"#16A34A":C.textS}}>{conv.online?"Online":"Last seen recently"}</span>
            <SourceBadge source={conv.source}/>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <QBtn label="Send Price"/>
          <QBtn label="Confirm Order" primary/>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 20px",background:"#F8FAFC",backgroundImage:`radial-gradient(circle at 1px 1px, #E2E8F0 1px, transparent 0)`,backgroundSize:"24px 24px"}}>
        {conv.messages.map(m=><MessageBubble key={m.id} msg={m} onOrder={doOrder} customerName={conv.name} customerAvatar={conv.avatar} onViewOrder={onViewOrders}/>)}
        {typing && <TypingIndicator/>}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"11px 14px",background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",gap:9,alignItems:"center",flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..."
          style={{flex:1,background:"#F8FAFC",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 14px",fontSize:13,color:C.textP,transition:"border-color 0.15s"}}
          onFocus={e=>e.target.style.borderColor=C.primary}
          onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={send} style={{width:38,height:38,borderRadius:10,background:C.primary,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background 0.12s"}}
          onMouseOver={e=>e.currentTarget.style.background=C.primaryH}
          onMouseOut={e=>e.currentTarget.style.background=C.primary}>
          <Ic.Send/>
        </button>
      </div>
    </div>
  );
};

const QBtn = ({ label, primary }) => (
  <button style={{fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:6,background:primary?C.primary:"transparent",color:primary?"#fff":C.textS,border:primary?"none":`1px solid ${C.border}`,transition:"all 0.12s"}}
    onMouseOver={e=>{ e.currentTarget.style.background=primary?C.primaryH:"#F1F5F9"; }}
    onMouseOut={e=>{ e.currentTarget.style.background=primary?C.primary:"transparent"; }}>
    {label}
  </button>
);

// ─── INBOX SIDEBAR ────────────────────────────────────────────────────────────
const InboxSidebar = ({ convs, selectedId, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = convs.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = convs.reduce((a,c)=>a+c.unread,0);
  const priority = filtered.filter(c=>c.priority);
  const rest = filtered.filter(c=>!c.priority);

  const Row = ({ c }) => (
    <button onClick={()=>onSelect(c.id)} style={{width:"100%",textAlign:"left",padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10,background:selectedId===c.id?"#EEF2FF":C.surface,borderBottom:"1px solid #F1F5F9",borderLeft:selectedId===c.id?`3px solid ${C.primary}`:"3px solid transparent",transition:"background 0.1s"}}>
      <div style={{position:"relative",flexShrink:0,marginTop:2}}>
        <Avatar initials={c.avatar} size="md"/>
        {c.online && <span style={{position:"absolute",bottom:1,right:1,width:9,height:9,borderRadius:"50%",background:"#16A34A",border:"2px solid #fff"}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{fontSize:13,fontWeight:c.unread>0?700:500,color:C.textP,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</p>
          <span style={{fontSize:10,color:C.textS,flexShrink:0,marginLeft:4}}>{c.lastTime}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:2}}>
          <p style={{fontSize:11,color:C.textS,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,paddingRight:5}}>{c.lastMsg}</p>
          <div style={{display:"flex",gap:3,flexShrink:0,alignItems:"center"}}>
            <SourceBadge source={c.source}/>
            {c.unread>0 && <span style={{width:17,height:17,borderRadius:"50%",background:c.priority?"#DC2626":C.primary,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{c.unread}</span>}
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div style={{width:268,flexShrink:0,borderRight:`1px solid ${C.border}`,background:C.surface,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"13px 14px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <p style={{fontWeight:700,fontSize:14,color:C.textP}}>Inbox</p>
          {totalUnread>0 && <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:C.primary,color:"#fff"}}>{totalUnread} new</span>}
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.textS}}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
            style={{width:"100%",paddingLeft:28,paddingRight:10,paddingTop:7,paddingBottom:7,fontSize:12,borderRadius:7,border:`1px solid ${C.border}`,background:"#F8FAFC",color:C.textP}}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {priority.length>0 && (
          <>
            <div style={{padding:"6px 14px",background:"#FFF1F2",borderBottom:"1px solid #FEE2E2",display:"flex",alignItems:"center",gap:5}}>
              <span style={{color:"#DC2626"}}><Ic.Alert/></span>
              <p style={{fontSize:10,fontWeight:700,color:"#DC2626",textTransform:"uppercase",letterSpacing:"0.06em"}}>{priority.reduce((a,c)=>a+c.unread,0)} awaiting reply</p>
            </div>
            {priority.map(c=><Row key={c.id} c={c}/>)}
          </>
        )}
        {rest.length>0 && (
          <>
            {priority.length>0 && <div style={{padding:"5px 14px",background:"#F8FAFC",borderBottom:`1px solid ${C.border}`}}><p style={{fontSize:10,fontWeight:700,color:C.textS,textTransform:"uppercase",letterSpacing:"0.06em"}}>Recent</p></div>}
            {rest.map(c=><Row key={c.id} c={c}/>)}
          </>
        )}
      </div>
    </div>
  );
};

// ─── ORDERS PAGE ──────────────────────────────────────────────────────────────
const OrdersPage = ({ orders, dispatch, highlightId }) => {
  const [filter, setFilter] = useState("All");
  const revenue = orders.reduce((a,o)=>a+(o.price||0),0);
  const visible = filter==="All"?orders:orders.filter(o=>o.status===filter);
  const rowRefs = useRef({});

  useEffect(()=>{
    if (highlightId) setTimeout(()=>rowRefs.current[highlightId]?.scrollIntoView({behavior:"smooth",block:"center"}), 80);
  },[highlightId]);

  const stats = [
    { label:"Today's Revenue", value:`₹${revenue.toLocaleString("en-IN")}`, sub:"↑ 12% vs yesterday", color:C.accent },
    { label:"Total Orders",    value:orders.length,                           sub:"All time",           color:C.textP },
    { label:"Pending",         value:orders.filter(o=>o.status==="Pending").length,  sub:"Need action", color:"#B45309" },
    { label:"Shipped",         value:orders.filter(o=>o.status==="Shipped").length,  sub:"On the way",  color:"#15803D" },
  ];

  return (
    <div className="page-anim" style={{padding:22,height:"100%",overflowY:"auto",background:C.bg}}>
      <div style={{marginBottom:18}}>
        <h2 style={{fontWeight:700,fontSize:17,color:C.textP}}>Orders</h2>
        <p style={{fontSize:12,color:C.textS,marginTop:2}}>Manage and track all incoming orders</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {stats.map((s,i)=>(
          <div key={i} style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <p style={{fontSize:11,fontWeight:600,color:C.textS,marginBottom:5}}>{s.label}</p>
            <p style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</p>
            <p style={{fontSize:11,color:C.textS,marginTop:3}}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <h3 style={{fontWeight:600,fontSize:14,color:C.textP}}>Order List</h3>
        <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden",background:C.surface}}>
          {["All","Pending","Confirmed","Shipped"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"5px 12px",fontSize:12,fontWeight:500,background:filter===s?C.primary:C.surface,color:filter===s?"#fff":C.textS,borderRight:`1px solid ${C.border}`,transition:"all 0.1s"}}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`,background:"#F8FAFC"}}>
              {["Order","Customer","Product","Size","Qty","Amount","Channel","Status","Action"].map(h=>(
                <th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:10,fontWeight:700,color:C.textS,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(o=>(
              <tr key={o.id} ref={el=>rowRefs.current[o.id]=el} className={o.highlight?"order-flash":""} style={{borderBottom:"1px solid #F8FAFC",transition:"background 0.1s"}}
                onMouseOver={e=>{ if(!o.highlight)e.currentTarget.style.background="#F8FAFC"; }}
                onMouseOut={e=>{ if(!o.highlight)e.currentTarget.style.background="transparent"; }}>
                <td style={{padding:"10px 13px",fontSize:11,color:C.textS,fontFamily:"'DM Mono',monospace"}}>#{String(o.id).slice(-4)}</td>
                <td style={{padding:"10px 13px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Avatar initials={o.customer.split(" ").map(w=>w[0]).join("")} size="sm"/>
                    <span style={{fontSize:13,fontWeight:500,color:C.textP}}>{o.customer}</span>
                  </div>
                </td>
                <td style={{padding:"10px 13px",fontSize:13,color:C.textP,maxWidth:140}}><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{o.product}</span></td>
                <td style={{padding:"10px 13px"}}><span style={{fontSize:11,fontWeight:600,padding:"2px 7px",borderRadius:4,background:"#F1F5F9",color:C.textS}}>{o.size}</span></td>
                <td style={{padding:"10px 13px",fontSize:13,color:C.textS}}>{o.qty}</td>
                <td style={{padding:"10px 13px",fontSize:13,fontWeight:700,color:C.accent}}>₹{(o.price||0).toLocaleString("en-IN")}</td>
                <td style={{padding:"10px 13px"}}><SourceBadge source={o.source}/></td>
                <td style={{padding:"10px 13px"}}><StatusPill status={o.status}/></td>
                <td style={{padding:"10px 13px"}}>
                  <div style={{position:"relative",display:"inline-block"}}>
                    <select value={o.status} onChange={e=>dispatch({type:"STATUS",id:o.id,status:e.target.value})}
                      style={{fontSize:11,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 22px 4px 8px",color:C.textP,background:C.surface,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                      {["Pending","Confirmed","Shipped","Cancelled"].map(s=><option key={s}>{s}</option>)}
                    </select>
                    <span style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:C.textS}}><Ic.ChevD/></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length===0 && (
          <div style={{padding:"48px 0",textAlign:"center",color:C.textS}}>
            <p style={{fontSize:32,marginBottom:8}}>📭</p>
            <p style={{fontSize:14,fontWeight:500}}>No {filter} orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.category.includes(search.toLowerCase()));
  return (
    <div className="page-anim" style={{padding:22,height:"100%",overflowY:"auto",background:C.bg}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <h2 style={{fontWeight:700,fontSize:17,color:C.textP}}>Products</h2>
          <p style={{fontSize:12,color:C.textS,marginTop:2}}>{PRODUCTS.filter(p=>p.stock>0).length} available · {PRODUCTS.filter(p=>p.stock===0).length} out of stock</p>
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:C.textS}}><Ic.Search/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..."
            style={{paddingLeft:28,paddingRight:12,paddingTop:7,paddingBottom:7,fontSize:12,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,color:C.textP,width:200}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {filtered.map(p=>(
          <div key={p.id} style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s,transform 0.15s"}}
            onMouseOver={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseOut={e=>{ e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; }}>
            <div style={{height:96,background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,position:"relative",borderBottom:`1px solid ${C.border}`}}>
              {p.emoji}
              {p.tag && <span style={{position:"absolute",top:9,right:9,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,
                background:p.tag==="Out of Stock"?"#FEF2F2":p.tag==="Bestseller"?"#FFFBEB":p.tag==="New Arrival"?"#EFF6FF":p.tag==="Premium"?"#F5F3FF":"#F1F5F9",
                color:p.tag==="Out of Stock"?"#B91C1C":p.tag==="Bestseller"?"#B45309":p.tag==="New Arrival"?"#1D4ED8":p.tag==="Premium"?"#6D28D9":"#64748B"}}>{p.tag}</span>}
              {p.stock>0&&p.stock<=5 && <span style={{position:"absolute",bottom:6,left:9,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"#FEF2F2",color:"#B91C1C"}}>Low stock</span>}
            </div>
            <div style={{padding:13}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                <p style={{fontWeight:600,fontSize:13,color:C.textP,lineHeight:1.3}}>{p.name}</p>
                <span style={{fontSize:10,color:C.textS,background:"#F1F5F9",padding:"2px 6px",borderRadius:4,marginLeft:5,flexShrink:0,textTransform:"capitalize"}}>{p.category}</span>
              </div>
              <p style={{fontSize:18,fontWeight:700,color:C.accent,marginBottom:7}}>₹{p.price.toLocaleString("en-IN")}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:9}}>
                {p.sizes.map(s=><span key={s} style={{fontSize:10,padding:"2px 7px",borderRadius:4,border:`1px solid ${C.border}`,color:C.textS,fontWeight:500}}>{s}</span>)}
              </div>
              {p.stock===0
                ? <span style={{fontSize:11,fontWeight:600,color:"#DC2626"}}>Out of stock</span>
                : <span style={{fontSize:11,color:C.textS}}>{p.stock} units in stock</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
const ReportsPage = ({ orders }) => {
  const revenue = orders.reduce((a,o)=>a+(o.price||0),0);
  const wa = orders.filter(o=>o.source==="WhatsApp").length;
  const ig = orders.filter(o=>o.source==="Instagram").length;
  const convRate = Math.round((orders.length/(orders.length+14))*100);
  const productSales = PRODUCTS.map(p=>({...p,sold:orders.filter(o=>o.product===p.name).length})).sort((a,b)=>b.sold-a.sold);
  const barMax = Math.max(...productSales.map(p=>p.sold),1);
  const kpis = [
    { label:"Total Revenue",     value:`₹${revenue.toLocaleString("en-IN")}`, sub:"All orders",         color:C.accent  },
    { label:"Messages Handled",  value:"47",                                   sub:"Today automatically", color:"#0891B2" },
    { label:"Avg Response Time", value:"1.8s",                                 sub:"vs ~8 min manually",  color:"#D97706" },
    { label:"Conversion Rate",   value:`${convRate}%`,                         sub:"Chat → Order",        color:C.primary },
  ];
  return (
    <div className="page-anim" style={{padding:22,height:"100%",overflowY:"auto",background:C.bg}}>
      <div style={{marginBottom:18}}>
        <h2 style={{fontWeight:700,fontSize:17,color:C.textP}}>Reports</h2>
        <p style={{fontSize:12,color:C.textS,marginTop:2}}>Today's business overview</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {kpis.map((k,i)=>(
          <div key={i} style={{background:C.surface,borderRadius:10,padding:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <p style={{fontSize:11,color:C.textS,fontWeight:600,marginBottom:5}}>{k.label}</p>
            <p style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</p>
            <p style={{fontSize:11,color:C.textS,marginTop:3}}>{k.sub}</p>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 3fr",gap:14,marginBottom:14}}>
        <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontWeight:600,fontSize:13,color:C.textP,marginBottom:14}}>Orders by Channel</h3>
          {[{label:"WhatsApp",count:wa,color:"#16A34A",bg:"#DCFCE7",Icon:Ic.WA},{label:"Instagram",count:ig,color:"#DB2777",bg:"#FCE7F3",Icon:Ic.IG}].map(ch=>(
            <div key={ch.label} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <span style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:500,color:C.textP}}><span style={{padding:3,borderRadius:4,background:ch.bg,display:"inline-flex"}}><ch.Icon/></span>{ch.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.textP}}>{ch.count} ({Math.round(ch.count/(orders.length||1)*100)}%)</span>
              </div>
              <div style={{height:5,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:ch.color,width:`${(ch.count/(orders.length||1))*100}%`,transition:"width 0.5s"}}/>
              </div>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
            {[{val:"47",lbl:"Auto-handled"},{val:"3.2h",lbl:"Time saved"}].map((s,i)=>(
              <div key={i} style={{background:"#F8FAFC",borderRadius:7,padding:11,textAlign:"center",border:`1px solid ${C.border}`}}>
                <p style={{fontSize:17,fontWeight:700,color:C.textP}}>{s.val}</p>
                <p style={{fontSize:10,color:C.textS,marginTop:2}}>{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <h3 style={{fontWeight:600,fontSize:13,color:C.textP,marginBottom:14}}>Product Performance</h3>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {productSales.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:9}}>
                <span style={{fontSize:18,width:24,textAlign:"center",flexShrink:0}}>{p.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:500,color:C.textP}}>{p.name}</span>
                    <span style={{fontSize:11,color:C.textS}}>{p.sold} sold · ₹{(p.sold*p.price).toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{height:5,background:"#F1F5F9",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:99,background:p.sold>0?C.primary:"#E2E8F0",width:`${(p.sold/barMax)*100}%`,transition:"width 0.6s"}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{borderRadius:10,padding:18,display:"flex",alignItems:"center",gap:14,background:`linear-gradient(135deg,${C.primary} 0%,#4338CA 100%)`,boxShadow:`0 4px 20px rgba(99,102,241,0.22)`}}>
        <div style={{fontSize:28}}>⚡</div>
        <div>
          <p style={{color:"#fff",fontWeight:700,fontSize:14}}>3.2 hours saved today</p>
          <p style={{color:"rgba(255,255,255,0.72)",fontSize:12,marginTop:2}}>47 queries handled automatically — so you can focus on growing your business</p>
        </div>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <p style={{color:"#fff",fontWeight:700,fontSize:20}}>₹0</p>
          <p style={{color:"rgba(255,255,255,0.7)",fontSize:11,marginTop:1}}>Missed orders</p>
        </div>
      </div>
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, pendingOrders, unreadMsgs }) => {
  const nav = [
    { id:"inbox",    label:"Inbox",    Icon:Ic.Inbox,    badge:unreadMsgs,    urgent:true  },
    { id:"orders",   label:"Orders",   Icon:Ic.Orders,   badge:pendingOrders, urgent:false },
    { id:"products", label:"Products", Icon:Ic.Products, badge:0             },
    { id:"reports",  label:"Reports",  Icon:Ic.Reports,  badge:0             },
  ];
  return (
    <aside style={{width:202,flexShrink:0,display:"flex",flexDirection:"column",background:C.sidebar,borderRight:"1px solid #1F2937"}}>
      <div style={{padding:"16px 14px",borderBottom:"1px solid #1F2937"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:C.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>🛍️</div>
          <div>
            <p style={{color:"#F1F5F9",fontWeight:700,fontSize:15,letterSpacing:"-0.02em",lineHeight:1}}>ShopScribe</p>
            <p style={{color:"#4B5563",fontSize:10,marginTop:3,fontWeight:500}}>Seller Dashboard</p>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"10px 8px"}}>
        {nav.map(({id,label,Icon,badge,urgent})=>(
          <button key={id} onClick={()=>setActive(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 11px",borderRadius:7,marginBottom:1,background:active===id?C.sidebarEl:"transparent",color:active===id?"#F1F5F9":"#6B7280",transition:"all 0.12s",fontSize:13,fontWeight:active===id?600:400}}
            onMouseOver={e=>{ if(active!==id){ e.currentTarget.style.background=C.sidebarEl; e.currentTarget.style.color="#F1F5F9"; } }}
            onMouseOut={e=>{ if(active!==id){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#6B7280"; } }}>
            <Icon/>
            <span style={{flex:1,textAlign:"left"}}>{label}</span>
            {badge>0 && <span style={{fontSize:9,fontWeight:700,width:17,height:17,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:urgent?"#DC2626":C.primary,color:"#fff",flexShrink:0}}>{badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{padding:"10px 8px",borderTop:"1px solid #1F2937"}}>
        <p style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#374151",padding:"0 8px",marginBottom:7}}>Connected</p>
        {[{label:"WhatsApp",color:"#16A34A",Icon:Ic.WA},{label:"Instagram",color:"#DB2777",Icon:Ic.IG}].map(ch=>(
          <div key={ch.label} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:6,marginBottom:3,background:C.sidebarEl}}>
            <ch.Icon/><span style={{fontSize:11,fontWeight:600,color:ch.color,flex:1}}>{ch.label}</span>
            <span style={{width:6,height:6,borderRadius:"50%",background:ch.color,animation:"pulse-dot 2s ease infinite"}}/>
          </div>
        ))}
      </div>
      <div style={{padding:"11px 14px",borderTop:"1px solid #1F2937",display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:C.sidebarEl,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#6B7280"}}><Ic.Seller/></div>
        <div style={{minWidth:0}}>
          <p style={{fontSize:12,fontWeight:600,color:"#D1D5DB",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Rang Boutique</p>
          <p style={{fontSize:10,color:"#4B5563",marginTop:1}}>Seller · Pro Plan</p>
        </div>
      </div>
    </aside>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("inbox");
  const [orders, dispatchOrders] = useReducer(ordersReducer, INIT_ORDERS);
  const [convs, dispatchConvs]   = useReducer(convsReducer, INIT_CONVS);
  const [selectedConvId, setSelectedConvId] = useState("c1");
  const [toast, setToast] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  const selectedConv  = convs.find(c=>c.id===selectedConvId);
  const pendingOrders = orders.filter(o=>o.status==="Pending").length;
  const unreadMsgs    = convs.reduce((a,c)=>a+c.unread,0);

  const showToastMsg = useCallback((data)=>{ setToast(null); setTimeout(()=>setToast(data),10); },[]);

  const handleViewOrders = useCallback((orderId)=>{
    setActive("orders");
    setHighlightOrderId(orderId);
    setTimeout(()=>{ dispatchOrders({type:"UNHIGHLIGHT",id:orderId}); setHighlightOrderId(null); }, 2200);
  },[]);

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:C.bg}}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active={active} setActive={setActive} pendingOrders={pendingOrders} unreadMsgs={unreadMsgs}/>

      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Topbar */}
        <div style={{height:46,background:C.surface,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 18px",gap:12,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:12}}>
            <span style={{color:C.textS}}>ShopScribe</span>
            <span style={{color:C.border,margin:"0 4px"}}>/</span>
            <span style={{color:C.textP,fontWeight:600,textTransform:"capitalize"}}>{active==="inbox"?"Inbox":active==="reports"?"Reports":active.charAt(0).toUpperCase()+active.slice(1)}</span>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:9}}>
            {/* Urgency indicator in topbar */}
            {unreadMsgs>0 && active!=="inbox" && (
              <button onClick={()=>setActive("inbox")} className="urgency" style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:99,background:"#FEF2F2",color:"#B91C1C",border:"1px solid #FECACA",cursor:"pointer"}}>
                <Ic.Alert/> {unreadMsgs} unread — view now
              </button>
            )}
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:99,background:"#F0FDF4",color:"#15803D",border:"1px solid #BBF7D0"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#16A34A",flexShrink:0,animation:"pulse-dot 2s ease infinite"}}/>
              All systems live
            </div>
            <button onClick={()=>setShowNotifs(v=>!v)} style={{position:"relative",width:33,height:33,borderRadius:7,background:showNotifs?"#EEF2FF":C.bg,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.textS,transition:"all 0.1s"}}>
              <Ic.Bell/>
              {unreadMsgs>0 && <span style={{position:"absolute",top:-3,right:-3,width:15,height:15,borderRadius:"50%",background:"#DC2626",color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadMsgs}</span>}
            </button>
          </div>
        </div>

        {/* Notif panel */}
        {showNotifs && (
          <>
            <div onClick={()=>setShowNotifs(false)} style={{position:"fixed",inset:0,zIndex:40}}/>
            <div style={{position:"fixed",top:54,right:14,zIndex:50,width:276,background:C.surface,borderRadius:11,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.10)",overflow:"hidden"}}>
              <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <p style={{fontWeight:600,fontSize:13,color:C.textP}}>Notifications</p>
                <button onClick={()=>setShowNotifs(false)} style={{color:C.textS,fontSize:18,lineHeight:1}}>×</button>
              </div>
              {convs.filter(c=>c.unread>0).length===0
                ? <div style={{padding:"28px 14px",textAlign:"center"}}><p style={{fontSize:26,marginBottom:5}}>✅</p><p style={{fontSize:13,fontWeight:500,color:C.textP}}>All caught up!</p></div>
                : convs.filter(c=>c.unread>0).map(c=>(
                  <div key={c.id} style={{padding:"9px 14px",borderBottom:"1px solid #F8FAFC",display:"flex",gap:9,alignItems:"flex-start",cursor:"pointer"}}
                    onClick={()=>{ setActive("inbox"); setSelectedConvId(c.id); dispatchConvs({type:"SELECT",id:c.id}); setShowNotifs(false); }}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c.priority?"#DC2626":C.primary,flexShrink:0,marginTop:4}}/>
                    <div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <p style={{fontSize:12,fontWeight:600,color:C.textP}}>{c.name}</p>
                        {c.priority && <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:99,background:"#FEF2F2",color:"#DC2626"}}>urgent</span>}
                      </div>
                      <p style={{fontSize:11,color:C.textS,marginTop:1}}>{c.lastMsg}</p>
                      <p style={{fontSize:10,color:C.textS,marginTop:2}}>{c.lastTime} · {c.source}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        )}

        <div style={{flex:1,overflow:"hidden"}}>
          {active==="inbox" && (
            <div style={{display:"flex",height:"100%"}}>
              <InboxSidebar convs={convs} selectedId={selectedConvId} onSelect={id=>{ setSelectedConvId(id); dispatchConvs({type:"SELECT",id}); }}/>
              <ChatWindow conv={selectedConv} onSend={(id,msg)=>dispatchConvs({type:"ADD_MSG",id,msg})} onOrderCreate={o=>dispatchOrders({type:"ADD",order:o})} showToast={showToastMsg} onViewOrders={handleViewOrders}/>
            </div>
          )}
          {active==="orders"   && <OrdersPage orders={orders} dispatch={dispatchOrders} highlightId={highlightOrderId}/>}
          {active==="products" && <ProductsPage/>}
          {active==="reports"  && <ReportsPage orders={orders}/>}
        </div>
      </main>

      {toast && <Toast data={toast} onDone={()=>setToast(null)} onViewOrders={()=>handleViewOrders(toast.orderId)}/>}
    </div>
  );
}