import type { CommentSettings } from '../../../src/types/blog.ts'

/** 构建隔离评论文档；转义脚本输入以保护包含特殊字符的标题和路径。 */
export function createCommentDocument(scriptUrl: string, storageUrl: string, path: string, title: string, settings: CommentSettings): string {
    const config = JSON.stringify({ ...settings, path, title, scriptUrl, storageUrl }).replace(/</g, '\\u003c')
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root { --panel:#fff; --text:#152b32; --muted:#597179; --border:#d5e2e3; --soft:#eef3f3; --brand:#087d70; --on-brand:#fff; }
:root[data-theme="dark"] { color-scheme:dark; --panel:#101b25; --text:#f1f5f9; --muted:#adbdcc; --border:#344657; --soft:#0d151e; --brand:#58e5cb; --on-brand:#08241f; }
body { display:flow-root; margin:0; padding:24px; font:14px/1.6 system-ui,sans-serif; color:var(--text); background:var(--panel); overflow-wrap:anywhere; }
button,input,textarea { font:inherit; }
a { color:var(--brand); }
#message,.comment-visitors { color:var(--muted); }
.comment-visitors { margin:0 0 16px; font-size:12px; }
.comment-visitors strong { font-weight:400; }
#comments {
    font-size:14px;
    & .vempty:not(:has(pre)), & .vpower { display:none!important; }
    & .vwrap { padding:16px; margin-bottom:24px; border:1px solid var(--border); border-radius:10px; background:var(--panel); }
    & .vheader { display:flex; gap:12px; }
    & .vheader .vinput { flex:1; min-width:0; width:0; padding:10px 12px; border:1px solid var(--border); border-radius:6px; background:var(--soft); font-size:14px; }
    & .vinput, & .veditor, & p, & pre code, & .status-bar { color:var(--text); }
    & .vinput::placeholder { color:var(--muted); }
    & .vinput:focus { outline:2px solid var(--brand); outline-offset:1px; border-color:var(--brand); }
    & .veditor { min-height:120px; padding:12px; font-size:14px; line-height:1.8; }
    & .vwrap .vedit { padding-top:12px; }
    & .vrow { padding:8px 0 0; }
    & .vbtn { padding:8px 18px; border:1px solid var(--border); border-radius:6px; color:var(--text); background:var(--soft); }
    & .vsubmit { color:var(--on-brand); background:var(--brand); border-color:var(--brand); }
    & .vbtn:hover { opacity:.85; color:var(--text); border-color:var(--brand); }
    & .vsubmit:hover { color:var(--on-brand); }
    & a:focus-visible, & button:focus-visible { outline:2px solid var(--brand); outline-offset:2px; }
    & .vicon { fill:var(--muted); }
    & .vcount { padding:0 0 12px; border-bottom:1px solid var(--border); font-size:16px; }
    & .vcards .vcard { padding-top:20px; }
    & .vcards .vcard .vimg { width:36px; height:36px; border-color:var(--border); }
    & .vcards .vcard .vh { border-bottom:1px solid var(--border); padding-bottom:16px; }
    & .vcards .vcard .vhead .vnick { font-size:14px; font-weight:600; color:var(--text); }
    & .vcards .vcard .vh .vtime, & .vsys { color:var(--muted); }
    & .vsys { background:var(--soft); }
    & .vcards .vcard .vh .vmeta .vat, & a:hover { color:var(--brand); }
    & .vcards .vcard .vcontent { padding-top:4px; margin-bottom:12px; font-size:14px; line-height:1.8; word-break:normal; }
    & .vcards .vcard .vquote { border-left:2px solid var(--border); padding-left:12px; }
    & .vcards .vcard .vcontent.expand::before { background:linear-gradient(transparent,var(--panel)); }
    & .vcards .vcard .vcontent.expand::after { background:var(--panel); color:var(--muted); }
}
@media (max-width:600px) {
    body { padding:16px; }
    #comments {
        & .vwrap { padding:12px; }
        & .vheader { flex-direction:column; gap:8px; }
        & .vheader .vinput { flex:auto; width:100%; }
        & .vsys { display:none; }
    }
}
</style></head>
<body><p id="message" role="status">正在加载评论…</p><p class="comment-visitors"><span class="leancloud-visitors"><strong>阅读量：</strong><span class="leancloud-visitors-count">—</span></span></p><div id="comments"></div>
<script>
const config=${config};
const resizeObserver=new ResizeObserver(()=>{
    // 读取内容自然高度并加上 iframe 边框，避免视口高度阻止评论区收缩。
    frameElement.style.height=Math.ceil(document.body.getBoundingClientRect().height)+2+'px';
});
resizeObserver.observe(document.body);
addEventListener('pagehide',()=>resizeObserver.disconnect(),{once:true});
const visitor=document.querySelector('.leancloud-visitors');
visitor.id=config.path;
visitor.dataset.flagTitle=config.title;
const script=document.createElement('script');
script.src=config.scriptUrl;
script.onerror=()=>{document.getElementById('message').textContent='评论暂时无法加载，请刷新页面重试。'};
script.onload=()=>{
    try {
        new Valine({el:document.getElementById('comments'),appId:config.appId,appKey:config.appKey,path:config.path,visitor:true,avatar:'mm',placeholder:'留下你的想法…',lang:'zh-CN',recordIP:false});
        document.getElementById('message').remove();
    } catch(error) { document.getElementById('message').textContent='评论暂时无法加载，请刷新页面重试。'; }
};
const storageScript=document.createElement('script');
storageScript.src=config.storageUrl;
storageScript.onerror=script.onerror;
storageScript.onload=()=>document.head.appendChild(script);
document.head.appendChild(storageScript);
</script></body></html>`
}
