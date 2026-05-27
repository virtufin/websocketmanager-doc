var mermaidScript = document.createElement('script');
mermaidScript.src = 'https://unpkg.com/mermaid@10.4.0/dist/mermaid.min.js';
mermaidScript.onload = function() {
    mermaid.initialize({ securityLevel: 'loose', startOnLoad: true });
    mermaid.run();
};
document.head.appendChild(mermaidScript);
