var q=Object.defineProperty;var B=(t,e,n)=>e in t?q(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var f=(t,e,n)=>(B(t,typeof e!="symbol"?e+"":e,n),n);function M(){}const lt=t=>t;function R(t,e){for(const n in e)t[n]=e[n];return t}function ot(t){return!!t&&(typeof t=="object"||typeof t=="function")&&typeof t.then=="function"}function O(t){return t()}function ut(){return Object.create(null)}function F(t){t.forEach(O)}function G(t){return typeof t=="function"}function at(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}let m;function ft(t,e){return t===e?!0:(m||(m=document.createElement("a")),m.href=e,t===m.href)}function _t(t){return Object.keys(t).length===0}function I(t,...e){if(t==null){for(const i of e)i(void 0);return M}const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function dt(t,e,n){t.$$.on_destroy.push(I(e,n))}function ht(t,e,n,i){if(t){const s=S(t,e,n,i);return t[0](s)}}function S(t,e,n,i){return t[1]&&i?R(n.ctx.slice(),t[1](i(e))):n.ctx}function mt(t,e,n,i){if(t[2]&&i){const s=t[2](i(n));if(e.dirty===void 0)return s;if(typeof s=="object"){const l=[],r=Math.max(e.dirty.length,s.length);for(let o=0;o<r;o+=1)l[o]=e.dirty[o]|s[o];return l}return e.dirty|s}return e.dirty}function pt(t,e,n,i,s,l){if(s){const r=S(e,n,i,l);t.p(r,s)}}function yt(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function bt(t){return t??""}function gt(t,e,n){return t.set(n),e}function xt(t){return t&&G(t.destroy)?t.destroy:M}function Et(t){const e=typeof t=="string"&&t.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return e?[parseFloat(e[1]),e[2]||"px"]:[t,"px"]}let y=!1;function Nt(){y=!0}function Tt(){y=!1}function z(t,e,n,i){for(;t<e;){const s=t+(e-t>>1);n(s)<=i?t=s+1:e=s}return t}function U(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let u=0;u<e.length;u++){const a=e[u];a.claim_order!==void 0&&c.push(a)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let s=0;for(let c=0;c<e.length;c++){const u=e[c].claim_order,a=(s>0&&e[n[s]].claim_order<=u?s+1:z(1,s,P=>e[n[P]].claim_order,u))-1;i[c]=n[a]+1;const v=a+1;n[v]=c,s=Math.max(v,s)}const l=[],r=[];let o=e.length-1;for(let c=n[s]+1;c!=0;c=i[c-1]){for(l.push(e[c-1]);o>=c;o--)r.push(e[o]);o--}for(;o>=0;o--)r.push(e[o]);l.reverse(),r.sort((c,u)=>c.claim_order-u.claim_order);for(let c=0,u=0;c<r.length;c++){for(;u<l.length&&r[c].claim_order>=l[u].claim_order;)u++;const a=u<l.length?l[u]:null;t.insertBefore(r[c],a)}}function W(t,e){t.appendChild(e)}function J(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function wt(t){const e=T("style");return e.textContent="/* empty */",K(J(t),e),e.sheet}function K(t,e){return W(t.head||t,e),e.sheet}function Q(t,e){if(y){for(U(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function V(t,e,n){t.insertBefore(e,n||null)}function X(t,e,n){y&&!n?Q(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function E(t){t.parentNode&&t.parentNode.removeChild(t)}function At(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function T(t){return document.createElement(t)}function Y(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function w(t){return document.createTextNode(t)}function vt(){return w(" ")}function kt(){return w("")}function Ht(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Lt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Mt(t){return t.dataset.svelteH}function St(t){return t===""?null:+t}function jt(t){return Array.from(t.childNodes)}function j(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function C(t,e,n,i,s=!1){j(t);const l=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s||(t.claim_info.last_index=r),o}}for(let r=t.claim_info.last_index-1;r>=0;r--){const o=t[r];if(e(o)){const c=n(o);return c===void 0?t.splice(r,1):t[r]=c,s?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=r,o}}return i()})();return l.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,l}function Z(t,e,n,i){return C(t,s=>s.nodeName===e,s=>{const l=[];for(let r=0;r<s.attributes.length;r++){const o=s.attributes[r];n[o.name]||l.push(o.name)}l.forEach(r=>s.removeAttribute(r))},()=>i(e))}function Ct(t,e,n){return Z(t,e,n,T)}function $(t,e){return C(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>w(e),!0)}function Dt(t){return $(t," ")}function k(t,e,n){for(let i=n;i<t.length;i+=1){const s=t[i];if(s.nodeType===8&&s.textContent.trim()===e)return i}return-1}function Pt(t,e){const n=k(t,"HTML_TAG_START",0),i=k(t,"HTML_TAG_END",n+1);if(n===-1||i===-1)return new b(e);j(t);const s=t.splice(n,i-n+1);E(s[0]),E(s[s.length-1]);const l=s.slice(1,s.length-1);if(l.length===0)return new b(e);for(const r of l)r.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new b(e,l)}function qt(t,e){e=""+e,t.data!==e&&(t.data=e)}function Bt(t,e){t.value=e??""}function Rt(t,e,n,i){n==null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}function Ot(t,e,n){for(let i=0;i<t.options.length;i+=1){const s=t.options[i];if(s.__value===e){s.selected=!0;return}}(!n||e!==void 0)&&(t.selectedIndex=-1)}function Ft(t){const e=t.querySelector(":checked");return e&&e.__value}function Gt(t,e,n){t.classList.toggle(e,!!n)}function tt(t,e,{bubbles:n=!1,cancelable:i=!1}={}){return new CustomEvent(t,{detail:e,bubbles:n,cancelable:i})}function It(t,e){const n=[];let i=0;for(const s of e.childNodes)if(s.nodeType===8){const l=s.textContent.trim();l===`HEAD_${t}_END`?(i-=1,n.push(s)):l===`HEAD_${t}_START`&&(i+=1,n.push(s))}else i>0&&n.push(s);return n}class et{constructor(e=!1){f(this,"is_svg",!1);f(this,"e");f(this,"n");f(this,"t");f(this,"a");this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,n,i=null){this.e||(this.is_svg?this.e=Y(n.nodeName):this.e=T(n.nodeType===11?"TEMPLATE":n.nodeName),this.t=n.tagName!=="TEMPLATE"?n:n.content,this.c(e)),this.i(i)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.nodeName==="TEMPLATE"?this.e.content.childNodes:this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)V(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(E)}}class b extends et{constructor(n=!1,i){super(n);f(this,"l");this.e=this.n=null,this.l=i}c(n){this.l?this.n=this.l:super.c(n)}i(n){for(let i=0;i<this.n.length;i+=1)X(this.t,this.n[i],n)}}function zt(t,e){return new t(e)}let p;function g(t){p=t}function A(){if(!p)throw new Error("Function called outside component initialization");return p}function Ut(t){A().$$.on_mount.push(t)}function Wt(t){A().$$.after_update.push(t)}function Jt(){const t=A();return(e,n,{cancelable:i=!1}={})=>{const s=t.$$.callbacks[e];if(s){const l=tt(e,n,{cancelable:i});return s.slice().forEach(r=>{r.call(t,l)}),!l.defaultPrevented}return!0}}function Kt(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach(i=>i.call(this,e))}const h=[],H=[];let d=[];const L=[],D=Promise.resolve();let N=!1;function nt(){N||(N=!0,D.then(st))}function Qt(){return nt(),D}function it(t){d.push(t)}const x=new Set;let _=0;function st(){if(_!==0)return;const t=p;do{try{for(;_<h.length;){const e=h[_];_++,g(e),rt(e.$$)}}catch(e){throw h.length=0,_=0,e}for(g(null),h.length=0,_=0;H.length;)H.pop()();for(let e=0;e<d.length;e+=1){const n=d[e];x.has(n)||(x.add(n),n())}d.length=0}while(h.length);for(;L.length;)L.pop()();N=!1,x.clear(),g(t)}function rt(t){if(t.fragment!==null){t.update(),F(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(it)}}function Vt(t){const e=[],n=[];d.forEach(i=>t.indexOf(i)===-1?e.push(i):n.push(i)),n.forEach(i=>i()),d=e}export{It as $,lt as A,ot as B,A as C,g as D,st as E,F,Et as G,Mt as H,Gt as I,bt as J,Bt as K,Ht as L,xt as M,it as N,At as O,St as P,ft as Q,G as R,I as S,gt as T,R as U,Jt as V,b as W,Pt as X,Kt as Y,Ft as Z,Ot as _,vt as a,J as a0,wt as a1,tt as a2,ut as a3,_t as a4,Vt as a5,p as a6,O as a7,h as a8,nt as a9,Nt as aa,Tt as ab,Wt as b,Dt as c,E as d,kt as e,T as f,Ct as g,jt as h,X as i,Lt as j,Rt as k,w as l,$ as m,qt as n,Ut as o,H as p,zt as q,Q as r,at as s,Qt as t,M as u,dt as v,ht as w,pt as x,yt as y,mt as z};
