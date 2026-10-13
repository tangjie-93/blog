import type { CommentSettings } from '../../../src/types/blog.ts'

/** 构建隔离评论文档；转义脚本输入以保护包含特殊字符的标题和路径。 */
export function createCommentDocument(scriptUrl: string, storageUrl: string, path: string, title: string, settings: CommentSettings): string {
    const config = JSON.stringify({ ...settings, path, title, scriptUrl, storageUrl }).replace(/</g, '\\u003c')
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:12px;font:14px/1.6 system-ui,sans-serif;color:#3c3c43;background:#fff;overflow-wrap:anywhere}button,input,textarea{font:inherit}a{color:#3451b2}#message{color:#666}</style></head>
<body><p id="message" role="status">正在加载评论…</p><p><span class="leancloud-visitors"><strong>阅读量：</strong><span class="leancloud-visitors-count">—</span></span></p><div id="comments"></div>
<script>
const config=${config};
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
