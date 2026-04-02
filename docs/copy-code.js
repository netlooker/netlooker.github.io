document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';

    btn.addEventListener('click', () => {
      const code = pre.querySelector('code');
      navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(() => {
        btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
        btn.classList.add('copy-btn-ok');
        setTimeout(() => {
          btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
          btn.classList.remove('copy-btn-ok');
        }, 2000);
      });
    });

    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
});
