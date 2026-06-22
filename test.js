fetch('https://613cards.online')
  .then(r => r.text())
  .then(t => { 
    const match = t.match(/.{0,50}brand-icon.{0,50}/); 
    console.log(match ? match[0] : 'Not found'); 
  })
  .catch(console.error);
