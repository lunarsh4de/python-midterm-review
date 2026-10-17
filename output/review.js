(function(){
  const signature=document.createElement('footer');
  signature.className='site-signature';
  signature.setAttribute('aria-label','作者与个人链接 / Author links');
  signature.innerHTML='<div class="site-signature-inner"><span>Created by <strong>Lunarsh4de</strong></span><nav class="site-signature-links" aria-label="Personal links"><a href="https://lunarsh4de.github.io/" target="_blank" rel="noopener noreferrer">个人网站 / Website</a><a href="https://github.com/lunarsh4de" target="_blank" rel="noopener noreferrer">GitHub</a></nav></div>';
  document.body.appendChild(signature);
  const page=document.body.dataset.page||'home';
  const boxes=[...document.querySelectorAll('[data-check]')];
  const bar=document.querySelector('[data-progress-bar]');
  const text=document.querySelector('[data-progress-text]');
  let storage=null;
  try{storage=window.localStorage}catch(error){storage=null}
  function update(){const done=boxes.filter(x=>x.checked).length;const total=boxes.length;if(bar)bar.style.width=(total?done/total*100:0)+'%';if(text)text.textContent=done+' / '+total+' completed';}
  boxes.forEach((box,i)=>{const key='idat7215-'+page+'-check-'+i;if(storage)box.checked=storage.getItem(key)==='1';box.addEventListener('change',()=>{if(storage)storage.setItem(key,box.checked?'1':'0');update()})});update();
  const prompts=[
    'Define a list and a tuple in one sentence.',
    'Explain what axis=0 means in a NumPy array.',
    'Compare BFS and DFS.',
    'Describe forward chaining.',
    'Explain why a test set is used.',
    'Describe the K-means loop.',
    'Define support and confidence.'
  ];let n=-1;const prompt=document.querySelector('[data-flash-text]');const button=document.querySelector('[data-flash-button]');if(prompt&&button)button.addEventListener('click',()=>{n=(n+1)%prompts.length;prompt.textContent=prompts[n]});
})();
