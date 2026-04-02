import { useState, useRef, useReducer, useEffect } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { font-family: 'Plus Jakarta Sans', sans-serif; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }
`;

// ─── MOCK PRODUCTS ────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Blue Dress",      price: 1299, sizes: ["S","M","L"],       stock: 12, category: "dress",    emoji: "👗", color: "#3b82f6" },
  { id: 2, name: "Red Saree",       price: 999,  sizes: ["Free Size"],        stock: 7,  category: "saree",    emoji: "🥻", color: "#ef4444" },
  { id: 3, name: "White Shirt",     price: 799,  sizes: ["S","M","L","XL"],   stock: 20, category: "shirt",    emoji: "👔", color: "#6b7280" },
  { id: 4, name: "Floral Kurti",    price: 849,  sizes: ["S","M","L"],        stock: 0,  category: "kurti",    emoji: "👘", color: "#ec4899" },
  { id: 5, name: "Black Lehenga",   price: 2499, sizes: ["S","M","L"],        stock: 5,  category: "lehenga",  emoji: "👗", color: "#1f2937" },
  { id: 6, name: "Yellow Dupatta",  price: 449,  sizes: ["Free Size"],        stock: 15, category: "dupatta",  emoji: "🧣", color: "#eab308" },
];

// ─── MOCK CONVERSATIONS ───────────────────────────────────────────────────────
const INITIAL_CONVERSATIONS = [
  {
    id: "c1", name: "Priya Sharma", source: "Instagram", avatar: "PS", unread: 0, online: false,
    lastMsg: "Thank you! 😊", lastTime: "09:20 AM",
    messages: [
      { id: 1, role: "user",  text: "Hi! Do you have blue dress in M size?", time: "09:10 AM", source: "Instagram" },
      { id: 2, role: "ai",    text: "Here's what I found:", productDetail: PRODUCTS[0], time: "09:10 AM", autoReplied: true },
      { id: 3, role: "user",  text: "I want size M", time: "09:15 AM", source: "Instagram" },
      { id: 4, role: "ai",    text: "Order placed successfully!", orderConfirm: { product: "Blue Dress", size: "M" }, time: "09:15 AM", autoReplied: true },
      { id: 5, role: "user",  text: "Thank you! 😊", time: "09:20 AM", source: "Instagram" },
    ]
  },
  {
    id: "c2", name: "Anjali Verma", source: "WhatsApp", avatar: "AV", unread: 2, online: true,
    lastMsg: "What about COD?", lastTime: "10:40 AM",
    messages: [
      { id: 1, role: "user",  text: "Show me sarees", time: "10:30 AM", source: "WhatsApp" },
      { id: 2, role: "ai",    text: "Here are our saree options:", products: [PRODUCTS[1]], time: "10:30 AM", autoReplied: true },
      { id: 3, role: "user",  text: "Red saree price?", time: "10:35 AM", source: "WhatsApp" },
      { id: 4, role: "ai",    text: "Here's what I found:", productDetail: PRODUCTS[1], time: "10:35 AM", autoReplied: true },
      { id: 5, role: "user",  text: "What about COD?", time: "10:40 AM", source: "WhatsApp" },
    ]
  },
  {
    id: "c3", name: "Sneha Gupta", source: "WhatsApp", avatar: "SG", unread: 1, online: true,
    lastMsg: "Is white shirt available in XL?", lastTime: "11:10 AM",
    messages: [
      { id: 1, role: "user",  text: "Is white shirt available in XL?", time: "11:10 AM", source: "WhatsApp" },
    ]
  },
  {
    id: "c4", name: "Meera Patel", source: "Instagram", avatar: "MP", unread: 0, online: false,
    lastMsg: "Order confirmed ✅", lastTime: "11:50 AM",
    messages: [
      { id: 1, role: "user",  text: "Show me under ₹1000", time: "11:40 AM", source: "Instagram" },
      { id: 2, role: "ai",    text: "Found 3 items under ₹1000:", products: [PRODUCTS[1], PRODUCTS[2], PRODUCTS[5]], time: "11:40 AM", autoReplied: true },
      { id: 3, role: "user",  text: "Order red saree", time: "11:45 AM", source: "Instagram" },
      { id: 4, role: "ai",    text: "Order placed!", orderConfirm: { product: "Red Saree", size: "Free Size" }, time: "11:45 AM", autoReplied: true },
      { id: 5, role: "ai",    text: "Order confirmed ✅", time: "11:50 AM", autoReplied: true },
    ]
  },
  {
    id: "c5", name: "Divya Nair", source: "WhatsApp", avatar: "DN", unread: 3, online: true,
    lastMsg: "Do you have lehenga in red?", lastTime: "12:25 PM",
    messages: [
      { id: 1, role: "user",  text: "Do you have lehenga in red?", time: "12:25 PM", source: "WhatsApp" },
    ]
  },
  {
    id: "c6", name: "Ritika Joshi", source: "Instagram", avatar: "RJ", unread: 0, online: false,
    lastMsg: "Thanks, will order soon!", lastTime: "01:15 PM",
    messages: [
      { id: 1, role: "user",  text: "Price of black lehenga?", time: "01:10 PM", source: "Instagram" },
      { id: 2, role: "ai",    text: "Here's what I found:", productDetail: PRODUCTS[4], time: "01:10 AM", autoReplied: true },
      { id: 3, role: "user",  text: "Thanks, will order soon!", time: "01:15 PM", source: "Instagram" },
    ]
  },
];

// ─── MOCK ORDERS ──────────────────────────────────────────────────────────────
const INITIAL_ORDERS = [
  { id: 1001, customer: "Priya Sharma",  product: "Blue Dress",     size: "M",         qty: 1, status: "Shipped",   source: "Instagram", time: "09:15 AM", price: 1299 },
  { id: 1002, customer: "Anjali Verma",  product: "Red Saree",      size: "Free Size",  qty: 2, status: "Confirmed", source: "WhatsApp",  time: "10:32 AM", price: 1998 },
  { id: 1003, customer: "Sneha Gupta",   product: "White Shirt",    size: "L",          qty: 1, status: "Pending",   source: "WhatsApp",  time: "11:05 AM", price: 799  },
  { id: 1004, customer: "Meera Patel",   product: "Black Lehenga",  size: "S",          qty: 1, status: "Confirmed", source: "Instagram", time: "11:48 AM", price: 2499 },
  { id: 1005, customer: "Divya Nair",    product: "Yellow Dupatta", size: "Free Size",  qty: 3, status: "Pending",   source: "WhatsApp",  time: "12:20 PM", price: 1347 },
  { id: 1006, customer: "Ritika Joshi",  product: "Blue Dress",     size: "S",          qty: 1, status: "Pending",   source: "Instagram", time: "01:10 PM", price: 1299 },
  { id: 1007, customer: "Pooja Singh",   product: "Red Saree",      size: "Free Size",  qty: 1, status: "Shipped",   source: "WhatsApp",  time: "02:45 PM", price: 999  },
];

// ─── AI ENGINE ────────────────────────────────────────────────────────────────
function processMessage(text, lastProduct) {
  const lower = text.toLowerCase();
  const underMatch = lower.match(/under\s*[₹rs\s]*(\d+)/);
  if (underMatch) {
    const budget = parseInt(underMatch[1]);
    const filtered = PRODUCTS.filter(p => p.price <= budget && p.stock > 0);
    return { type: "product_list", products: filtered.slice(0, 3), text: `Found ${filtered.length} items under ₹${budget}:` };
  }
  const cats = ["saree","dress","shirt","kurti","lehenga","dupatta"];
  for (const cat of cats) {
    if (lower.includes(cat)) {
      const filtered = PRODUCTS.filter(p => p.category === cat);
      if (filtered.length) return { type: "product_list", products: filtered, text: `Here are our ${cat} options:` };
    }
  }
  const sizeMatch = lower.match(/size\s*([smlx]+l?)/i);
  const orderWords = ["order","want","buy","take","book"];
  if (orderWords.some(w => lower.includes(w)) || sizeMatch) {
    const size = sizeMatch ? sizeMatch[1].toUpperCase() : null;
    if (lastProduct) return { type: "create_order", product: lastProduct, size: size || lastProduct.sizes[0] };
    return { type: "text", text: "Which product would you like to order? Please mention the name." };
  }
  const priceWords = ["price","cost","how much","rate","kitna"];
  if (priceWords.some(w => lower.includes(w))) {
    for (const p of PRODUCTS) {
      if (lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().split(" ").some(w => lower.includes(w))) {
        if (p.stock === 0) return { type: "product_detail", product: p, outOfStock: true };
        return { type: "product_detail", product: p };
      }
    }
    return { type: "text", text: "Which product are you asking about?" };
  }
  if (lower.includes("available") || lower.includes("stock")) {
    for (const p of PRODUCTS) {
      if (lower.includes(p.name.toLowerCase()) || p.name.toLowerCase().split(" ").some(w => lower.includes(w))) {
        if (p.stock === 0) return { type: "product_detail", product: p, outOfStock: true };
        return { type: "product_detail", product: p };
      }
    }
  }
  for (const p of PRODUCTS) {
    if (lower.includes(p.name.toLowerCase())) {
      if (p.stock === 0) return { type: "product_detail", product: p, outOfStock: true };
      return { type: "product_detail", product: p };
    }
  }
  if (lower.match(/^(hi|hello|hey|hlo|namaste)/)) {
    return { type: "text", text: "Namaste! 🙏 Welcome! Ask me about prices, sizes, or place an order!" };
  }
  if (lower.includes("cod") || lower.includes("cash on delivery")) {
    return { type: "text", text: "Yes! We offer Cash on Delivery (COD) on all orders above ₹499 🎉" };
  }
  if (lower.includes("return") || lower.includes("exchange")) {
    return { type: "text", text: "We have a 7-day easy return & exchange policy. Message us with your order ID! 📦" };
  }
  if (lower.includes("delivery") || lower.includes("shipping")) {
    return { type: "text", text: "We deliver within 3-5 business days. Free shipping on orders above ₹999! 🚚" };
  }
  return { type: "text", text: "I can help with:\n• Prices & availability\n• Budget filter ('under ₹1000')\n• Categories (saree, dress, shirt…)\n• Placing orders\n• COD, returns & shipping" };
}

// ─── REDUCERS ─────────────────────────────────────────────────────────────────
function ordersReducer(state, action) {
  switch (action.type) {
    case "ADD": return [action.order, ...state];
    case "STATUS": return state.map(o => o.id === action.id ? { ...o, status: action.status } : o);
    default: return state;
  }
}
function convsReducer(state, action) {
  switch (action.type) {
    case "SELECT": return state.map(c => ({ ...c, unread: c.id === action.id ? 0 : c.unread }));
    case "ADD_MSG": return state.map(c => c.id === action.id
      ? { ...c, messages: [...c.messages, action.msg], lastMsg: action.msg.text || (action.msg.orderConfirm ? "Order created ✅" : "…"), lastTime: action.msg.time }
      : c);
    default: return state;
  }
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
const I = {
  Chat:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Orders:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  Products:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14v14m0-14L4 7v10l8 4"/></svg>,
  Analytics: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  Send:      () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Bell:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Bot:       () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M12 15h.01M16 15h.01"/></svg>,
  Search:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  WA:        () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.508 5.815L.057 23.17a.75.75 0 00.926.929l5.487-1.474A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.915 0-3.717-.518-5.256-1.418l-.376-.225-3.898 1.048 1.012-3.796-.247-.392A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
  IG:        () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  Zap:       () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Clock:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const srcStyle = (s) => s === "WhatsApp" ? "bg-emerald-100 text-emerald-700" : "bg-pink-100 text-pink-700";
const srcIcon  = (s) => s === "WhatsApp" ? <I.WA /> : <I.IG />;

const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-600",
];

const Avatar = ({ initials, size = "md" }) => {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  const grad = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = {
    Pending:   "bg-amber-100 text-amber-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Shipped:   "bg-emerald-100 text-emerald-700",
  };
  const dot = { Pending: "bg-amber-400", Confirmed: "bg-blue-400", Shipped: "bg-emerald-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
};

// ─── CHAT PRODUCT CARD ────────────────────────────────────────────────────────
const ChatProductCard = ({ product, onOrder }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow min-w-[230px]">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: product.color + "22" }}>{product.emoji}</div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-slate-800 text-sm truncate">{product.name}</p>
      <p className="text-emerald-600 font-bold text-sm">₹{product.price.toLocaleString()}</p>
      {product.stock === 0
        ? <p className="text-red-500 text-xs font-medium">Out of stock</p>
        : <p className="text-slate-400 text-xs">{product.sizes.join(" · ")}</p>}
    </div>
    {product.stock > 0 && (
      <button onClick={() => onOrder(product)} className="px-2.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0">
        Order
      </button>
    )}
  </div>
);

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onOrder }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"} items-end mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 mb-1">
          <I.Bot />
        </div>
      )}
      <div className={`max-w-[76%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        {isUser && msg.source && (
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${srcStyle(msg.source)}`}>
            {srcIcon(msg.source)} From {msg.source}
          </span>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isUser ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"}`}>
          {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
          {msg.productDetail && (
            <div className="mt-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{msg.productDetail.emoji}</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Detected Product</p>
                  <p className="font-bold text-slate-800 text-sm">{msg.productDetail.name}</p>
                  {msg.outOfStock
                    ? <p className="text-red-500 font-semibold text-xs">Currently out of stock 😔</p>
                    : <p className="text-emerald-600 font-bold">₹{msg.productDetail.price.toLocaleString()} <span className="text-slate-400 font-normal text-xs">(from catalog)</span></p>}
                </div>
              </div>
              {!msg.outOfStock && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.productDetail.sizes.map(s => <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded">{s}</span>)}
                  <span className="text-xs text-slate-400 ml-1 self-center">{msg.productDetail.stock} in stock</span>
                </div>
              )}
            </div>
          )}
          {msg.orderConfirm && (
            <div className="mt-1.5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-bold text-emerald-700 text-xs">Order Created!</p>
                <p className="text-slate-600 text-xs">{msg.orderConfirm.product} · Size {msg.orderConfirm.size}</p>
              </div>
            </div>
          )}
          {msg.products && (
            <div className="mt-2 flex flex-col gap-2">
              {msg.products.map(p => <ChatProductCard key={p.id} product={p} onOrder={onOrder} />)}
            </div>
          )}
        </div>
        {!isUser && msg.autoReplied && (
          <p className="text-[10px] text-slate-400 ml-1 flex items-center gap-1">
            <I.Zap /><span className="text-indigo-500 font-semibold">Auto-replied in 2s ⚡</span>
          </p>
        )}
        <p className="text-[10px] text-slate-400 px-1">{msg.time}</p>
      </div>
    </div>
  );
};

const TypingBubble = () => (
  <div className="flex gap-2 items-end mb-3">
    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"><I.Bot /></div>
    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
      {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />)}
      <span className="text-xs text-slate-400 ml-1.5 flex items-center gap-1"><I.Clock /> AI is typing…</span>
    </div>
  </div>
);

// ─── CHAT WINDOW ──────────────────────────────────────────────────────────────
const ChatWindow = ({ conv, onSend, onOrderCreate }) => {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastProduct, setLastProduct] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conv?.messages, typing]);
  useEffect(() => { setInput(""); setTyping(false); setLastProduct(null); }, [conv?.id]);

  if (!conv) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
      <div className="text-5xl mb-3">💬</div>
      <p className="font-semibold text-slate-600">Select a conversation</p>
      <p className="text-sm mt-1">Choose a customer from the inbox</p>
    </div>
  );

  const handleOrderProduct = (product) => {
    const order = { id: Date.now(), customer: conv.name, product: product.name, size: product.sizes[0], qty: 1, status: "Pending", source: conv.source, time: now(), price: product.price };
    onOrderCreate(order);
    const aiMsg = { id: Date.now(), role: "ai", autoReplied: true, text: `Order placed for ${conv.name}!`, orderConfirm: { product: product.name, size: product.sizes[0] }, time: now() };
    onSend(conv.id, aiMsg);
    setLastProduct(product);
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: input, source: conv.source, time: now() };
    onSend(conv.id, userMsg);
    const q = input;
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const result = processMessage(q, lastProduct);
      let aiMsg = { id: Date.now() + 1, role: "ai", autoReplied: true, time: now() };
      if (result.type === "text") {
        aiMsg.text = result.text;
      } else if (result.type === "product_detail") {
        aiMsg.text = "Here's what I found:";
        aiMsg.productDetail = result.product;
        aiMsg.outOfStock = result.outOfStock;
        if (!result.outOfStock) setLastProduct(result.product);
      } else if (result.type === "product_list") {
        aiMsg.text = result.text;
        aiMsg.products = result.products;
        if (result.products.length) setLastProduct(result.products[0]);
      } else if (result.type === "create_order") {
        const order = { id: Date.now(), customer: conv.name, product: result.product.name, size: result.size, qty: 1, status: "Pending", source: conv.source, time: now(), price: result.product.price };
        onOrderCreate(order);
        aiMsg.text = "Order placed successfully!";
        aiMsg.orderConfirm = { product: result.product.name, size: result.size };
      }
      onSend(conv.id, aiMsg);
    }, 1700);
  };

  const SUGGESTIONS = ["Price of Blue Dress", "Show under ₹1000", "Show sarees", "I want size M", "Do you have COD?"];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <Avatar initials={conv.avatar} size="md" />
          {conv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800 text-sm">{conv.name}</p>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${srcStyle(conv.source)}`}>{srcIcon(conv.source)} {conv.source}</span>
          </div>
          <p className={`text-xs font-medium flex items-center gap-1 ${conv.online ? "text-emerald-500" : "text-slate-400"}`}>
            {conv.online ? <><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"/>Online now</> : "Last seen recently"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5">
          <I.Zap /><span className="text-xs font-bold text-indigo-600">AI Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ background: "linear-gradient(180deg,#f8faff 0%,#f1f5f9 100%)" }}>
        {conv.messages.map(m => <MessageBubble key={m.id} msg={m} onOrder={handleOrderProduct} />)}
        {typing && <TypingBubble />}
        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-4 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto flex-shrink-0">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setInput(s)}
            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full whitespace-nowrap hover:bg-indigo-100 border border-indigo-100 flex-shrink-0 transition-colors">{s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white flex gap-2 flex-shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all" />
        <button onClick={send} className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm flex-shrink-0">
          <I.Send />
        </button>
      </div>
    </div>
  );
};

// ─── INBOX SIDEBAR ────────────────────────────────────────────────────────────
const InboxSidebar = ({ convs, selectedId, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = convs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const totalUnread = convs.reduce((a, c) => a + c.unread, 0);

  return (
    <div className="w-68 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col" style={{ width: "272px" }}>
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-bold text-slate-800 text-sm">Customer Inbox</p>
          {totalUnread > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{totalUnread} new</span>}
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-2.5 text-slate-400"><I.Search /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-slate-50" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {filtered.map(c => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors ${selectedId === c.id ? "bg-indigo-50 border-r-2 border-indigo-500" : ""}`}>
            <div className="relative flex-shrink-0 mt-0.5">
              <Avatar initials={c.avatar} size="md" />
              {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${c.unread > 0 ? "font-bold text-slate-800" : "font-medium text-slate-700"}`}>{c.name}</p>
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{c.lastTime}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-slate-500 truncate flex-1 pr-1">{c.lastMsg}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${srcStyle(c.source)}`}>{c.source === "WhatsApp" ? "WA" : "IG"}</span>
                  {c.unread > 0 && <span className="w-4 h-4 bg-indigo-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{c.unread}</span>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── ORDERS PAGE ──────────────────────────────────────────────────────────────
const OrdersPage = ({ orders, dispatch }) => {
  const [filter, setFilter] = useState("All");
  const revenue = orders.reduce((a, o) => a + (o.price || 0), 0);
  const statuses = ["All","Pending","Confirmed","Shipped"];
  const visible = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label:"Total Orders",   value: orders.length,                               icon:"📦", color:"bg-indigo-50 text-indigo-700 border-indigo-100" },
          { label:"Revenue Today",  value:`₹${revenue.toLocaleString()}`,               icon:"💰", color:"bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label:"Pending",        value: orders.filter(o=>o.status==="Pending").length, icon:"⏳", color:"bg-amber-50 text-amber-700 border-amber-100" },
          { label:"Shipped",        value: orders.filter(o=>o.status==="Shipped").length, icon:"🚚", color:"bg-blue-50 text-blue-700 border-blue-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border ${s.color} shadow-sm`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Order Management</h2>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold bg-white">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 transition-colors ${filter===s?"bg-indigo-600 text-white":"text-slate-600 hover:bg-slate-50"}`}>{s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["#","Customer","Product","Size","Qty","Revenue","Source","Status","Action"].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {visible.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">#{String(orders.indexOf(o)+1).padStart(3,"0")}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar initials={o.customer.split(" ").map(w=>w[0]).join("")} size="sm" />
                    <span className="text-sm font-semibold text-slate-700">{o.customer}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{o.product}</td>
                <td className="px-4 py-3.5"><span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">{o.size}</span></td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{o.qty}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">₹{(o.price||0).toLocaleString()}</td>
                <td className="px-4 py-3.5">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${srcStyle(o.source)}`}>
                    {srcIcon(o.source)} {o.source}
                  </span>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3.5">
                  <select value={o.status} onChange={e => dispatch({ type:"STATUS", id:o.id, status:e.target.value })}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white cursor-pointer">
                    {["Pending","Confirmed","Shipped"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-semibold">No {filter} orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.includes(search.toLowerCase())
  );
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Product Catalog</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="text-emerald-600 font-semibold">{PRODUCTS.filter(p=>p.stock>0).length} in stock</span>
            {" · "}
            <span className="text-red-500 font-semibold">{PRODUCTS.filter(p=>p.stock===0).length} out of stock</span>
          </p>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-2.5 text-slate-400"><I.Search /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="pl-7 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white w-52" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="h-32 flex items-center justify-center relative" style={{ background:`linear-gradient(135deg,${p.color}18,${p.color}35)` }}>
              <span className="text-6xl">{p.emoji}</span>
              <span className={`absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full ${p.stock===0?"bg-red-100 text-red-600":"bg-emerald-100 text-emerald-600"}`}>
                {p.stock===0?"OUT OF STOCK":`${p.stock} in stock`}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-bold text-slate-800">{p.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">{p.category}</span>
              </div>
              <p className="text-2xl font-extrabold text-indigo-600 mb-3">₹{p.price.toLocaleString()}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.sizes.map(s => <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
const AnalyticsPage = ({ orders }) => {
  const revenue = orders.reduce((a, o) => a + (o.price || 0), 0);
  const waOrders = orders.filter(o => o.source === "WhatsApp").length;
  const igOrders = orders.filter(o => o.source === "Instagram").length;
  const conversionRate = Math.round((orders.length / (orders.length + 12)) * 100);
  const productSales = PRODUCTS.map(p => ({
    ...p, sold: orders.filter(o => o.product === p.name).length
  })).sort((a,b) => b.sold - a.sold);
  const barMax = Math.max(...productSales.map(p => p.sold), 1);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Analytics Overview</h2>
        <p className="text-sm text-slate-500 mt-0.5">Today's AI performance & sales snapshot</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Total Revenue",   value:`₹${revenue.toLocaleString()}`, sub:"Today's earnings",        icon:"💰", grad:"from-emerald-500 to-teal-600"   },
          { label:"AI Auto-Replies", value:"47",                            sub:"Messages handled by AI",  icon:"⚡", grad:"from-indigo-500 to-purple-600"  },
          { label:"Avg Response",    value:"2.1s",                          sub:"vs ~8 min manual",        icon:"⏱️", grad:"from-rose-500 to-pink-600"      },
          { label:"Conversion Rate", value:`${conversionRate}%`,            sub:"Chat → Order",            icon:"📈", grad:"from-amber-500 to-orange-500"   },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.grad} rounded-2xl p-4 text-white shadow-lg`}>
            <p className="text-2xl mb-2">{k.icon}</p>
            <p className="text-2xl font-extrabold">{k.value}</p>
            <p className="text-xs font-bold opacity-90 mt-0.5">{k.label}</p>
            <p className="text-[10px] opacity-60 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Source Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4">Orders by Channel</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700"><I.WA />WhatsApp</span>
                <span className="font-bold text-slate-700">{waOrders} orders</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width:`${(waOrders/(orders.length||1))*100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-pink-700"><I.IG />Instagram</span>
                <span className="font-bold text-slate-700">{igOrders} orders</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 rounded-full" style={{ width:`${(igOrders/(orders.length||1))*100}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-slate-800">47</p>
              <p className="text-[10px] text-slate-500 font-semibold">Auto-handled</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-slate-800">98%</p>
              <p className="text-[10px] text-slate-500 font-semibold">AI Accuracy</p>
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4">Time Saved by AI Today</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e0e7ff" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                  strokeDasharray="78 22" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-extrabold text-indigo-600">78%</p>
                <p className="text-[10px] text-slate-500 font-semibold">time saved</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-indigo-700">3.2 hrs</p>
              <p className="text-[10px] text-indigo-500 font-semibold">Saved today</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-extrabold text-emerald-700">₹0</p>
              <p className="text-[10px] text-emerald-500 font-semibold">Missed orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sales Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-4">Product Sales Breakdown</h3>
        <div className="space-y-3">
          {productSales.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-xl w-7 text-center flex-shrink-0">{p.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <span className="text-slate-500">{p.sold} sold · ₹{(p.sold * p.price).toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width:`${barMax > 0 ? (p.sold/barMax)*100 : 0}%`, background: p.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
const NotifPanel = ({ convs, onClose }) => {
  const needsReply = convs.filter(c => c.unread > 0);
  return (
    <div className="absolute top-12 right-4 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="font-bold text-slate-800 text-sm">Notifications</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
      </div>
      {needsReply.length === 0 ? (
        <div className="px-4 py-8 text-center text-slate-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm font-semibold">All caught up!</p>
          <p className="text-xs mt-1">No pending messages</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
          {needsReply.map(c => (
            <div key={c.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-500 truncate">{c.lastMsg}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.lastTime} · {c.source}</p>
              </div>
              <span className="text-[10px] bg-red-100 text-red-600 font-black px-1.5 py-0.5 rounded-full">{c.unread}</span>
            </div>
          ))}
        </div>
      )}
      {needsReply.length > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-amber-50">
          <p className="text-xs text-amber-700 font-semibold">⚠️ {needsReply.length} customer{needsReply.length > 1 ? "s" : ""} need{needsReply.length === 1 ? "s" : ""} a reply!</p>
        </div>
      )}
    </div>
  );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, pendingOrders, unreadMsgs }) => {
  const nav = [
    { id:"chat",      label:"Inbox",     Icon: I.Chat,      badge: unreadMsgs   },
    { id:"orders",    label:"Orders",    Icon: I.Orders,    badge: pendingOrders },
    { id:"products",  label:"Products",  Icon: I.Products,  badge: 0            },
    { id:"analytics", label:"Analytics", Icon: I.Analytics, badge: 0            },
  ];
  return (
    <aside className="w-52 flex-shrink-0 bg-slate-900 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">S</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm">SellBot AI</p>
            <p className="text-slate-500 text-[10px] font-medium">Social Commerce</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ id, label, Icon, badge }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active===id?"bg-indigo-600 text-white shadow-md":"text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <Icon />{label}
            {badge > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">{badge}</span>}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4 space-y-2">
        <div className="bg-slate-800 rounded-xl px-3 py-2.5">
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1.5">Connected Channels</p>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <I.WA /><span>WhatsApp</span><span className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-semibold">
            <I.IG /><span>Instagram</span><span className="ml-auto w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="bg-indigo-900/50 rounded-xl px-3 py-2 border border-indigo-700/30">
          <p className="text-indigo-300 text-[10px] font-bold flex items-center gap-1"><I.Zap /> AI handled 47 msgs today</p>
        </div>
      </div>
    </aside>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("chat");
  const [orders, dispatchOrders] = useReducer(ordersReducer, INITIAL_ORDERS);
  const [convs, dispatchConvs] = useReducer(convsReducer, INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState("c1");
  const [showNotifs, setShowNotifs] = useState(false);

  const selectedConv = convs.find(c => c.id === selectedConvId);
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const unreadMsgs = convs.reduce((a,c) => a + c.unread, 0);

  const handleSelectConv = (id) => {
    setSelectedConvId(id);
    dispatchConvs({ type: "SELECT", id });
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      <style>{FONT}</style>
      <Sidebar active={active} setActive={setActive} pendingOrders={pendingOrders} unreadMsgs={unreadMsgs} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-12 bg-white border-b border-slate-100 flex items-center px-5 gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>SellBot</span><span>/</span>
            <span className="text-slate-700 font-bold capitalize">{active === "chat" ? "Inbox" : active}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-700">AI saving ~3h/day</span>
            </div>
            <button onClick={() => setShowNotifs(v => !v)}
              className="relative w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <I.Bell />
              {unreadMsgs > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadMsgs}</span>}
            </button>
          </div>
        </div>

        {/* Pages */}
        <div className="flex-1 overflow-hidden">
          {active === "chat" && (
            <div className="flex h-full">
              <InboxSidebar convs={convs} selectedId={selectedConvId} onSelect={handleSelectConv} />
              <ChatWindow
                conv={selectedConv}
                onSend={(convId, msg) => dispatchConvs({ type: "ADD_MSG", id: convId, msg })}
                onOrderCreate={(order) => dispatchOrders({ type: "ADD", order })}
              />
            </div>
          )}
          {active === "orders"    && <OrdersPage orders={orders} dispatch={dispatchOrders} />}
          {active === "products"  && <ProductsPage />}
          {active === "analytics" && <AnalyticsPage orders={orders} />}
        </div>
      </main>

      {/* Notification Overlay */}
      {showNotifs && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
          <div className="fixed top-12 right-4 z-50">
            <NotifPanel convs={convs} onClose={() => setShowNotifs(false)} />
          </div>
        </>
      )}
    </div>
  );
}