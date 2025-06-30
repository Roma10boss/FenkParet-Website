"use strict";(()=>{var e={};e.id=80,e.ids=[80,660,888],e.modules={1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},8129:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>f,default:()=>u,getServerSideProps:()=>m,getStaticPaths:()=>g,getStaticProps:()=>d,reportWebVitals:()=>x,routeModule:()=>S,unstable_getServerProps:()=>P,unstable_getServerSideProps:()=>y,unstable_getStaticParams:()=>b,unstable_getStaticPaths:()=>w,unstable_getStaticProps:()=>h});var s=r(7093),l=r(5244),n=r(1323),i=r(5949),o=r(3414),c=r(6097),p=e([o]);o=(p.then?(await p)():p)[0];let u=(0,n.l)(c,"default"),d=(0,n.l)(c,"getStaticProps"),g=(0,n.l)(c,"getStaticPaths"),m=(0,n.l)(c,"getServerSideProps"),f=(0,n.l)(c,"config"),x=(0,n.l)(c,"reportWebVitals"),h=(0,n.l)(c,"unstable_getStaticProps"),w=(0,n.l)(c,"unstable_getStaticPaths"),b=(0,n.l)(c,"unstable_getStaticParams"),P=(0,n.l)(c,"unstable_getServerProps"),y=(0,n.l)(c,"unstable_getServerSideProps"),S=new s.PagesRouteModule({definition:{kind:l.x.PAGES,page:"/robots.txt",pathname:"/robots.txt",bundlePath:"",filename:""},components:{App:o.default,Document:i.default},userland:c});a()}catch(e){a(e)}})},5949:(e,t,r)=>{r.r(t),r.d(t,{default:()=>l});var a=r(997),s=r(6859);function l(){return(0,a.jsxs)(s.Html,{lang:"en",children:[(0,a.jsxs)(s.Head,{children:[a.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),a.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"true"}),a.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",rel:"stylesheet"}),a.jsx("link",{rel:"icon",href:"/favicon.ico"}),a.jsx("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/favicon-32x32.png"}),a.jsx("link",{rel:"icon",type:"image/png",sizes:"16x16",href:"/favicon-16x16.png"}),a.jsx("link",{rel:"apple-touch-icon",sizes:"180x180",href:"/apple-touch-icon.png"}),a.jsx("link",{rel:"manifest",href:"/site.webmanifest"}),a.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),a.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),a.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"default"}),a.jsx("meta",{name:"msapplication-TileColor",content:"#b8d2b3"})," "]}),(0,a.jsxs)("body",{children:[a.jsx("noscript",{children:(0,a.jsxs)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"#ffffff",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",fontFamily:"system-ui, sans-serif",padding:"2rem",textAlign:"center"},children:[a.jsx("h1",{style:{fontSize:"2rem",marginBottom:"1rem",color:"#1f2937"},children:"JavaScript Required"}),a.jsx("p",{style:{fontSize:"1.1rem",color:"#6b7280",maxWidth:"500px"},children:"This application requires JavaScript to be enabled in your browser. Please enable JavaScript and refresh the page to continue."})]})}),a.jsx(s.Main,{})," ",a.jsx(s.NextScript,{})," ",a.jsx(a.Fragment,{children:process.env.NEXT_PUBLIC_GA_ID&&(0,a.jsxs)(a.Fragment,{children:[a.jsx("script",{async:!0,src:`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}),a.jsx("script",{dangerouslySetInnerHTML:{__html:`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `}})]})})]})]})}},6097:(e,t,r)=>{r.r(t),r.d(t,{default:()=>l,getServerSideProps:()=>s});let a=()=>`User-agent: *
Allow: /

# Allow all crawlers access to public pages
Allow: /products
Allow: /products/*
Allow: /about
Allow: /contact
Allow: /nouveautes

# Disallow admin and private areas
Disallow: /admin
Disallow: /admin/*
Disallow: /user
Disallow: /user/*
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*
Disallow: /cart
Disallow: /checkout

# Disallow search pages with parameters
Disallow: /*?search=*
Disallow: /*?page=*
Disallow: /*?*&search=*

# Sitemap location
Sitemap: http://localhost:3000/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1

# Allow common search engines with higher frequency
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1
`;async function s({res:e}){let t=a();return e.setHeader("Content-Type","text/plain"),e.write(t),e.end(),{props:{}}}let l=()=>null},5244:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{e.exports=require("next/head")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},997:e=>{e.exports=require("react/jsx-runtime")},9816:e=>{e.exports=require("styled-jsx/style")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},6162:e=>{e.exports=require("stream")},1568:e=>{e.exports=require("zlib")},9752:e=>{e.exports=import("@tanstack/react-query")},6201:e=>{e.exports=import("react-hot-toast")},4612:e=>{e.exports=import("socket.io-client")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[567,322,859,414],()=>r(8129));module.exports=a})();