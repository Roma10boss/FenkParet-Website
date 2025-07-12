"use strict";(()=>{var e={};e.id=80,e.ids=[80,660,888],e.modules={8129:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>x,default:()=>u,getServerSideProps:()=>m,getStaticPaths:()=>g,getStaticProps:()=>d,reportWebVitals:()=>h,routeModule:()=>j,unstable_getServerProps:()=>y,unstable_getServerSideProps:()=>S,unstable_getStaticParams:()=>b,unstable_getStaticPaths:()=>w,unstable_getStaticProps:()=>f});var s=a(7093),l=a(5244),i=a(1323),o=a(5949),n=a(3414),p=a(6097),c=e([n]);n=(c.then?(await c)():c)[0];let u=(0,i.l)(p,"default"),d=(0,i.l)(p,"getStaticProps"),g=(0,i.l)(p,"getStaticPaths"),m=(0,i.l)(p,"getServerSideProps"),x=(0,i.l)(p,"config"),h=(0,i.l)(p,"reportWebVitals"),f=(0,i.l)(p,"unstable_getStaticProps"),w=(0,i.l)(p,"unstable_getStaticPaths"),b=(0,i.l)(p,"unstable_getStaticParams"),y=(0,i.l)(p,"unstable_getServerProps"),S=(0,i.l)(p,"unstable_getServerSideProps"),j=new s.PagesRouteModule({definition:{kind:l.x.PAGES,page:"/robots.txt",pathname:"/robots.txt",bundlePath:"",filename:""},components:{App:n.default,Document:o.default},userland:p});r()}catch(e){r(e)}})},5949:(e,t,a)=>{a.r(t),a.d(t,{default:()=>l});var r=a(997),s=a(6859);function l(){return(0,r.jsxs)(s.Html,{lang:"en",children:[(0,r.jsxs)(s.Head,{children:[r.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),r.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"true"}),r.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",rel:"stylesheet"}),r.jsx("link",{rel:"icon",href:"/favicon.ico"}),r.jsx("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/favicon-32x32.png"}),r.jsx("link",{rel:"icon",type:"image/png",sizes:"16x16",href:"/favicon-16x16.png"}),r.jsx("link",{rel:"apple-touch-icon",sizes:"180x180",href:"/apple-touch-icon.png"}),r.jsx("link",{rel:"manifest",href:"/site.webmanifest"}),r.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),r.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),r.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"default"}),r.jsx("meta",{name:"msapplication-TileColor",content:"#b8d2b3"})," "]}),(0,r.jsxs)("body",{children:[r.jsx("noscript",{children:(0,r.jsxs)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"#ffffff",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",fontFamily:"system-ui, sans-serif",padding:"2rem",textAlign:"center"},children:[r.jsx("h1",{style:{fontSize:"2rem",marginBottom:"1rem",color:"#1f2937"},children:"JavaScript Required"}),r.jsx("p",{style:{fontSize:"1.1rem",color:"#6b7280",maxWidth:"500px"},children:"This application requires JavaScript to be enabled in your browser. Please enable JavaScript and refresh the page to continue."})]})}),r.jsx(s.Main,{})," ",r.jsx(s.NextScript,{})," ",r.jsx(r.Fragment,{children:process.env.NEXT_PUBLIC_GA_ID&&(0,r.jsxs)(r.Fragment,{children:[r.jsx("script",{async:!0,src:`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}),r.jsx("script",{dangerouslySetInnerHTML:{__html:`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `}})]})})]})]})}},6097:(e,t,a)=>{a.r(t),a.d(t,{default:()=>l,getServerSideProps:()=>s});let r=()=>`User-agent: *
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
Sitemap: https://fenparet-website.web.app/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1

# Allow common search engines with higher frequency
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1
`;async function s({res:e}){let t=r();return e.setHeader("Content-Type","text/plain"),e.write(t),e.end(),{props:{}}}let l=()=>null},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{e.exports=require("next/head")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},997:e=>{e.exports=require("react/jsx-runtime")},9816:e=>{e.exports=require("styled-jsx/style")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},6162:e=>{e.exports=require("stream")},1568:e=>{e.exports=require("zlib")},9752:e=>{e.exports=import("@tanstack/react-query")},6201:e=>{e.exports=import("react-hot-toast")},4612:e=>{e.exports=import("socket.io-client")}};var t=require("../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[216,414],()=>a(8129));module.exports=r})();