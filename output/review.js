(function(){
  const page=document.body.dataset.page||'home';
  const boxes=[...document.querySelectorAll('[data-check]')];
  const bar=document.querySelector('[data-progress-bar]');
  const text=document.querySelector('[data-progress-text]');
  function update(){const done=boxes.filter(x=>x.checked).length;const total=boxes.length;if(bar)bar.style.width=(total?done/total*100:0)+'%';if(text)text.textContent=done+' / '+total+' completed';}
  boxes.forEach((box,i)=>{const key='idat7215-'+page+'-check-'+i;box.checked=localStorage.getItem(key)==='1';box.addEventListener('change',()=>{localStorage.setItem(key,box.checked?'1':'0');update()})});update();
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
