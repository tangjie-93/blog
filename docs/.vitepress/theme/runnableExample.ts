const outputScript = `<script>
(() => {
    const lines = [];
    let output;
    function format(value) {
        if (typeof value === 'string') return value;
        if (value instanceof Error) return String(value);
        try { return JSON.stringify(value) ?? String(value); }
        catch { return String(value); }
    }
    function write(level, values) {
        lines.push((level === 'log' ? '' : '[' + level + '] ') + values.map(format).join(' '));
        if (lines.length > 200) lines.shift();
        if (output) {
            output.hidden = false;
            output.textContent = lines.join('\\n');
        }
    }
    ['log', 'info', 'warn', 'error'].forEach(level => {
        const original = console[level].bind(console);
        console[level] = (...values) => { original(...values); write(level, values); };
    });
    window.addEventListener('error', event => write('error', [event.message]));
    window.addEventListener('unhandledrejection', event => write('error', [String(event.reason)]));
    window.addEventListener('DOMContentLoaded', () => {
        output = document.createElement('pre');
        output.setAttribute('aria-label', '运行输出');
        output.setAttribute('role', 'log');
        output.style.cssText = 'padding:16px;white-space:pre-wrap;overflow-wrap:anywhere;background:#111827;color:#e5e7eb;font:14px/1.7 monospace;border-radius:8px;';
        output.hidden = lines.length === 0;
        output.textContent = lines.join('\\n');
        document.body.appendChild(output);
    });
})();
</script>`

/** 为完整 HTML 示例加入日志及异常展示，源码仍由隔离的 iframe 执行。 */
export function createExampleDocument(source: string): string {
    return source.replace(/<head(?:\s[^>]*)?>/i, (head) => head + outputScript)
}
