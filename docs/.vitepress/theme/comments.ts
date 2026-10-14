import type { CommentSettings } from '../../../src/types/blog.ts'

/** 构建隔离评论文档；转义脚本输入以保护包含特殊字符的标题和路径。 */
export function createCommentDocument(scriptUrl: string, styleUrl: string, path: string, title: string, settings: CommentSettings): string {
    const config = JSON.stringify({ ...settings, path, title, scriptUrl, styleUrl }).replace(/</g, '\\u003c')
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root { --panel:#fff; --text:#152b32; --muted:#597179; --border:#d5e2e3; --soft:#eef3f3; --brand:#087d70; }
:root[data-theme="dark"] { color-scheme:dark; --panel:#101b25; --text:#f1f5f9; --muted:#adbdcc; --border:#344657; --soft:#0d151e; --brand:#58e5cb; }
body { display:flow-root; margin:0; padding:24px; font:14px/1.6 system-ui,sans-serif; color:var(--text); background:var(--panel); overflow-wrap:anywhere; }
#comments { --waline-color:var(--text); --waline-bg-color:var(--panel); --waline-bg-color-light:var(--soft); --waline-bg-color-hover:var(--soft); --waline-border-color:var(--border); --waline-theme-color:var(--brand); --waline-active-color:var(--brand); --waline-info-color:var(--muted); --waline-disable-bg-color:var(--soft); --waline-disable-color:var(--muted); }
#message,.comment-visitors { color:var(--muted); }
.comment-visitors { margin:0 0 16px; font-size:12px; }
.comment-date { display:inline-block; margin-inline-start:8px; color:var(--muted); font-size:12px; }
.comment-author { margin-inline-start:8px; color:var(--brand); font-size:12px; }
@media (max-width:600px) { body { padding:16px; } }
</style></head>
<body><p id="message" role="status">正在加载评论…</p><p class="comment-visitors">阅读量：<span class="waline-pageview-count">—</span></p><div id="comments"></div>
<script>
const config=${config};
document.title=config.title;
let instance;
// Waline 没有完整时间渲染选项；只在隔离文档中读取已有响应，不额外请求评论。
const metadata=new Map();
const originalFetch=window.fetch;
function renderMetadata(){
    document.querySelectorAll('.wl-card-item').forEach(card=>{
        const item=metadata.get(card.id);
        const head=card.querySelector('.wl-head');
        if(!item||!head)return;
        let date=head.querySelector('.comment-date');
        if(!date){date=document.createElement('time');date.className='comment-date';head.querySelector('.wl-time')?.after(date);}
        if(date.dateTime!==item.iso){date.dateTime=item.iso;date.textContent=item.text;date.title='发布时间（北京时间 UTC+8）';}
        let badge=head.querySelector('.comment-author');
        if(item.admin&&!badge){badge=document.createElement('span');badge.className='comment-author';badge.textContent='博主';head.querySelector('.wl-nick')?.after(badge);}
        if(!item.admin)badge?.remove();
    });
}
function collectMetadata(value){
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(collectMetadata);return;}
    if(value.objectId!=null&&typeof value.time==='number'&&Number.isFinite(value.time)){
        const date=new Date(value.time);
        if(Number.isFinite(date.getTime()))metadata.set(String(value.objectId),{iso:date.toISOString(),text:date.toLocaleString('sv-SE',{timeZone:'Asia/Shanghai',hour12:false}),admin:value.type==='administrator'});
    }
    collectMetadata(value.data);collectMetadata(value.children);
}
window.fetch=async(...args)=>{
    const response=await originalFetch.apply(window,args);
    const url=new URL(response.url);
    const server=new URL(config.serverURL);
    if(response.ok&&url.origin===server.origin&&url.pathname===server.pathname.replace(/[/]$/,'')+'/api/comment'){
        response.clone().json().then(data=>{collectMetadata(data);renderMetadata();}).catch(()=>{});
    }
    return response;
};
const metadataObserver=new MutationObserver(renderMetadata);
metadataObserver.observe(document.getElementById('comments'),{childList:true,subtree:true});
const resizeObserver=new ResizeObserver(()=>{
    // 读取内容自然高度并加上 iframe 边框，避免视口高度阻止评论区收缩。
    frameElement.style.height=Math.ceil(document.body.getBoundingClientRect().height)+2+'px';
});
resizeObserver.observe(document.body);
addEventListener('pagehide',()=>{resizeObserver.disconnect();metadataObserver.disconnect();window.fetch=originalFetch;instance?.destroy();},{once:true});
document.querySelector('.waline-pageview-count').dataset.path=config.path;
const script=document.createElement('script');
script.src=config.scriptUrl;
script.onerror=()=>{document.getElementById('message').textContent='评论暂时无法加载，请刷新页面重试。'};
script.onload=()=>{
    try {
        instance=Waline.init({el:'#comments',serverURL:config.serverURL,path:config.path,pageview:true,lang:'zh-CN',dark:'html[data-theme="dark"]',meta:['nick','mail'],requiredMeta:[],login:'disable',locale:{placeholder:'留下你的想法…'},emoji:false,search:false,imageUploader:false});
        document.getElementById('message').remove();
    } catch(error) { document.getElementById('message').textContent='评论暂时无法加载，请刷新页面重试。'; }
};
const style=document.createElement('link');
style.rel='stylesheet';
style.href=config.styleUrl;
style.onerror=script.onerror;
style.onload=()=>document.head.appendChild(script);
document.head.appendChild(style);
</script></body></html>`
}
