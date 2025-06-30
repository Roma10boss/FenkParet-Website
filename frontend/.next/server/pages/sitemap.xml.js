"use strict";(()=>{var e={};e.id=164,e.ids=[164,888,660],e.modules={1323:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},2159:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>f,default:()=>u,getServerSideProps:()=>m,getStaticPaths:()=>g,getStaticProps:()=>d,reportWebVitals:()=>h,routeModule:()=>j,unstable_getServerProps:()=>P,unstable_getServerSideProps:()=>b,unstable_getStaticParams:()=>S,unstable_getStaticPaths:()=>y,unstable_getStaticProps:()=>x});var i=r(7093),o=r(5244),n=r(1323),s=r(5949),l=r(3414),c=r(5328),p=e([l,c]);[l,c]=p.then?(await p)():p;let u=(0,n.l)(c,"default"),d=(0,n.l)(c,"getStaticProps"),g=(0,n.l)(c,"getStaticPaths"),m=(0,n.l)(c,"getServerSideProps"),f=(0,n.l)(c,"config"),h=(0,n.l)(c,"reportWebVitals"),x=(0,n.l)(c,"unstable_getStaticProps"),y=(0,n.l)(c,"unstable_getStaticPaths"),S=(0,n.l)(c,"unstable_getStaticParams"),P=(0,n.l)(c,"unstable_getServerProps"),b=(0,n.l)(c,"unstable_getServerSideProps"),j=new i.PagesRouteModule({definition:{kind:o.x.PAGES,page:"/sitemap.xml",pathname:"/sitemap.xml",bundlePath:"",filename:""},components:{App:l.default,Document:s.default},userland:c});a()}catch(e){a(e)}})},5949:(e,t,r)=>{r.r(t),r.d(t,{default:()=>o});var a=r(997),i=r(6859);function o(){return(0,a.jsxs)(i.Html,{lang:"en",children:[(0,a.jsxs)(i.Head,{children:[a.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),a.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"true"}),a.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",rel:"stylesheet"}),a.jsx("link",{rel:"icon",href:"/favicon.ico"}),a.jsx("link",{rel:"icon",type:"image/png",sizes:"32x32",href:"/favicon-32x32.png"}),a.jsx("link",{rel:"icon",type:"image/png",sizes:"16x16",href:"/favicon-16x16.png"}),a.jsx("link",{rel:"apple-touch-icon",sizes:"180x180",href:"/apple-touch-icon.png"}),a.jsx("link",{rel:"manifest",href:"/site.webmanifest"}),a.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),a.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),a.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"default"}),a.jsx("meta",{name:"msapplication-TileColor",content:"#b8d2b3"})," "]}),(0,a.jsxs)("body",{children:[a.jsx("noscript",{children:(0,a.jsxs)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"#ffffff",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",fontFamily:"system-ui, sans-serif",padding:"2rem",textAlign:"center"},children:[a.jsx("h1",{style:{fontSize:"2rem",marginBottom:"1rem",color:"#1f2937"},children:"JavaScript Required"}),a.jsx("p",{style:{fontSize:"1.1rem",color:"#6b7280",maxWidth:"500px"},children:"This application requires JavaScript to be enabled in your browser. Please enable JavaScript and refresh the page to continue."})]})}),a.jsx(i.Main,{})," ",a.jsx(i.NextScript,{})," ",a.jsx(a.Fragment,{children:process.env.NEXT_PUBLIC_GA_ID&&(0,a.jsxs)(a.Fragment,{children:[a.jsx("script",{async:!0,src:`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}),a.jsx("script",{dangerouslySetInnerHTML:{__html:`
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `}})]})})]})]})}},5328:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{default:()=>l,getServerSideProps:()=>n});var i=r(9648),o=e([i]);i=(o.then?(await o)():o)[0];let s=(e,t,r)=>{let a="http://localhost:3000";return`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static pages -->
      <url>
        <loc>${a}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${a}/products</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${a}/about</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>
      <url>
        <loc>${a}/contact</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>
      <url>
        <loc>${a}/nouveautes</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      
      <!-- Categories -->
      ${r.map(e=>`
            <url>
              <loc>${a}/products/category/${e.slug}</loc>
              <lastmod>${new Date(e.updatedAt||e.createdAt).toISOString().split("T")[0]}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
            </url>
          `).join("")}
      
      <!-- Products -->
      ${t.map(e=>`
            <url>
              <loc>${a}/products/${e._id}</loc>
              <lastmod>${new Date(e.updatedAt||e.createdAt).toISOString().split("T")[0]}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `).join("")}
    </urlset>
  `};async function n({res:e}){try{let t="https://fenkparet-backend.onrender.com",[r,a]=await Promise.all([i.default.get(`${t}/api/products?status=active&limit=1000`),i.default.get(`${t}/api/products/categories?isActive=true`)]),o=r.data.products||[],n=a.data.categories||[],l=s([],o,n);return e.setHeader("Content-Type","text/xml"),e.write(l),e.end(),{props:{}}}catch(r){console.error("Error generating sitemap:",r);let t=s([],[],[]);return e.setHeader("Content-Type","text/xml"),e.write(t),e.end(),{props:{}}}}let l=()=>null;a()}catch(e){a(e)}})},5244:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},968:e=>{e.exports=require("next/head")},6689:e=>{e.exports=require("react")},6405:e=>{e.exports=require("react-dom")},997:e=>{e.exports=require("react/jsx-runtime")},9816:e=>{e.exports=require("styled-jsx/style")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},6162:e=>{e.exports=require("stream")},1568:e=>{e.exports=require("zlib")},9752:e=>{e.exports=import("@tanstack/react-query")},9648:e=>{e.exports=import("axios")},6201:e=>{e.exports=import("react-hot-toast")},4612:e=>{e.exports=import("socket.io-client")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[567,322,859,414],()=>r(2159));module.exports=a})();