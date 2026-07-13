module.exports=[23862,e=>e.a(async(t,r)=>{try{let t=await e.y("pg-587764f78a6c7a9c");e.n(t),r()}catch(e){r(e)}},!0),93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},43793,e=>e.a(async(t,r)=>{try{var a=e.i(23862),n=t([a]);[a]=n.then?(await n)():n;let s=globalThis.pgPool??new a.Pool({host:process.env.PGHOST,port:Number(process.env.PGPORT??5432),database:process.env.PGDATABASE,user:process.env.PGUSER,password:process.env.PGPASSWORD,ssl:{rejectUnauthorized:!1},max:10,idleTimeoutMillis:3e4,connectionTimeoutMillis:5e3});e.s(["default",0,s]),r()}catch(e){r(e)}},!1),23249,e=>e.a(async(t,r)=>{try{var a=e.i(89171),n=e.i(43793),s=t([n]);async function i(e){let{searchParams:t}=new URL(e.url),r=t.get("email")?.toLowerCase().trim();if(!r)return new Response('<html><body style="background:#0B0F1A;color:#F0EDE8;font-family:sans-serif;text-align:center;padding:50px;">E-posta adresi belirtilmedi.</body></html>',{headers:{"Content-Type":"text/html; charset=utf-8"}});try{await n.default.query("UPDATE users SET marketing_consent = FALSE WHERE email = $1",[r]);let e=`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abonelikten Ayrıl — birlikteydik.com</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0F1A;
      color: #F0EDE8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .container {
      max-width: 480px;
      width: 100%;
      box-sizing: border-box;
      padding: 40px 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-family: Georgia, serif;
      font-weight: 300;
      font-size: 26px;
      color: #C9A84C;
      margin-bottom: 20px;
    }
    p {
      color: rgba(240, 237, 232, 0.6);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background: #C9A84C;
      color: #0B0F1A;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Aboneliğiniz İptal Edildi</h1>
    <p>
      E-posta adresiniz (<strong>${r}</strong>) b\xfclten ve duyuru listemizden başarıyla \xe7ıkarılmıştır.<br>
      Artık bizden pazarlama veya bilgilendirme mailleri almayacaksınız.
    </p>
    <a href="https://birlikteydik.com" class="btn">Ana Sayfaya D\xf6n</a>
  </div>
</body>
</html>
    `;return new Response(e,{headers:{"Content-Type":"text/html; charset=utf-8"}})}catch(e){return console.error("Unsubscribe error:",e),new Response("Bir sunucu hatası oluştu.",{status:500})}}async function o(e){try{let t="",r=e.headers.get("content-type")||"";r.includes("application/json")?t=(await e.json()).email:r.includes("application/x-www-form-urlencoded")&&(t=(await e.formData()).get("email"));let s=t?.toLowerCase().trim();if(!s)return a.NextResponse.json({error:"Email is required."},{status:400});return await n.default.query("UPDATE users SET marketing_consent = FALSE WHERE email = $1",[s]),a.NextResponse.json({success:!0,message:"Unsubscribed successfully."})}catch(e){return console.error("POST unsubscribe error:",e),a.NextResponse.json({error:e.message},{status:500})}}[n]=s.then?(await s)():s,e.s(["GET",0,i,"POST",0,o]),r()}catch(e){r(e)}},!1),66436,e=>e.a(async(t,r)=>{try{var a=e.i(47909),n=e.i(74017),s=e.i(96250),i=e.i(59756),o=e.i(61916),l=e.i(74677),d=e.i(69741),u=e.i(16795),c=e.i(87718),p=e.i(95169),h=e.i(47587),x=e.i(66012),m=e.i(70101),g=e.i(26937),b=e.i(10372),y=e.i(93695);e.i(52474);var f=e.i(220),v=e.i(23249),R=t([v]);[v]=R.then?(await R)():R;let E=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/unsubscribe/route",pathname:"/api/unsubscribe",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/unsubscribe/route.ts",nextConfigOutput:"",userland:v,...{}}),{workAsyncStorage:A,workUnitAsyncStorage:C,serverHooks:T}=E;async function w(e,t,r){r.requestMeta&&(0,i.setRequestMeta)(e,r.requestMeta),E.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let a="/api/unsubscribe/route";a=a.replace(/\/index$/,"")||"/";let s=await E.prepare(e,t,{srcPage:a,multiZoneDraftMode:!1});if(!s)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:v,deploymentId:R,params:w,nextConfig:A,parsedUrl:C,isDraftMode:T,prerenderManifest:P,routerServerContext:k,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,resolvedPathname:q,clientReferenceManifest:O,serverActionsManifest:U}=s,j=(0,d.normalizeAppPath)(a),_=!!(P.dynamicRoutes[j]||P.routes[q]),D=async()=>((null==k?void 0:k.render404)?await k.render404(e,t,C,!1):t.end("This page could not be found"),null);if(_&&!T){let e=!!P.routes[q],t=P.dynamicRoutes[j];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await D();throw new y.NoFallbackError}}let H=null;!_||E.isDev||T||(H=q,H="/index"===H?"/":H);let M=!0===E.isDev||!_,F=_&&!M;U&&O&&(0,l.setManifestsSingleton)({page:a,clientReferenceManifest:O,serverActionsManifest:U});let I=e.method||"GET",z=(0,o.getTracer)(),B=z.getActiveScopeSpan(),$=!!(null==k?void 0:k.isWrappedByNextServer),G=!!(0,i.getRequestMeta)(e,"minimalMode"),L=(0,i.getRequestMeta)(e,"incrementalCache")||await E.getIncrementalCache(e,A,P,G);null==L||L.resetRequestCache(),globalThis.__incrementalCache=L;let K={params:w,previewProps:P.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:M,incrementalCache:L,cacheLifeProfiles:A.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,a,n)=>E.onRequestError(e,t,a,n,k)},sharedContext:{buildId:v,deploymentId:R}},W=new u.NodeNextRequest(e),V=new u.NodeNextResponse(t),X=c.NextRequestAdapter.fromNodeNextRequest(W,(0,c.signalFromNodeResponse)(t));try{let s,i=async e=>E.handle(X,K).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=z.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${I} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),s&&s!==e&&(s.setAttribute("http.route",n),s.updateName(t))}else e.updateName(`${I} ${a}`)}),l=async s=>{var o,l;let d=async({previousCacheEntry:n})=>{try{if(!G&&S&&N&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let a=await i(s);e.fetchMetrics=K.renderOpts.fetchMetrics;let o=K.renderOpts.pendingWaitUntil;o&&r.waitUntil&&(r.waitUntil(o),o=void 0);let l=K.renderOpts.collectedTags;if(!_)return await (0,x.sendResponse)(W,V,a,K.renderOpts.pendingWaitUntil),null;{let e=await a.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(a.headers);l&&(t[b.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==K.renderOpts.collectedRevalidate&&!(K.renderOpts.collectedRevalidate>=b.INFINITE_CACHE)&&K.renderOpts.collectedRevalidate,n=void 0===K.renderOpts.collectedExpire||K.renderOpts.collectedExpire>=b.INFINITE_CACHE?void 0:K.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:a.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==n?void 0:n.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:a,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:S})},!1,k),t}},u=await E.handleResponse({req:e,nextConfig:A,cacheKey:H,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:P,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:N,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:G});if(!_)return null;if((null==u||null==(o=u.value)?void 0:o.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});G||t.setHeader("x-nextjs-cache",S?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,m.fromNodeOutgoingHttpHeaders)(u.value.headers);return G&&_||c.delete(b.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,g.getCacheControlHeader)(u.cacheControl)),await (0,x.sendResponse)(W,V,new Response(u.value.body,{headers:c,status:u.value.status||200})),null};$&&B?await l(B):(s=z.getActiveScopeSpan(),await z.withPropagatedContext(e.headers,()=>z.trace(p.BaseServerSpan.handleRequest,{spanName:`${I} ${a}`,kind:o.SpanKind.SERVER,attributes:{"http.method":I,"http.target":e.url}},l),void 0,!$))}catch(t){if(t instanceof y.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:j,routeType:"route",revalidateReason:(0,h.getRevalidateReason)({isStaticGeneration:F,isOnDemandRevalidate:S})},!1,k),_)throw t;return await (0,x.sendResponse)(W,V,new Response(null,{status:500})),null}}e.s(["handler",0,w,"patchFetch",0,function(){return(0,s.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:C})},"routeModule",0,E,"serverHooks",0,T,"workAsyncStorage",0,A,"workUnitAsyncStorage",0,C]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__0_gy_9_._.js.map