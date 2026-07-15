const fs=require('fs');
const items=JSON.parse(fs.readFileSync('docs/data/부산_축제공연행사.json','utf8')).items||[];
const out=[];
for(const it of items){
  const start=it.eventstartdate||it.date; const end=it.eventenddate||start;
  if(!start) continue;
  const sY=+start.slice(0,4), sM=+start.slice(4,6)-1, sD=+start.slice(6,8);
  const eY=+end.slice(0,4), eM=+end.slice(4,6)-1, eD=+end.slice(6,8);
  let cur=new Date(sY,sM,sD), last=new Date(eY,eM,eD);
  while(cur<=last){
    const y=cur.getFullYear(); const m=String(cur.getMonth()+1).padStart(2,'0'); const d=String(cur.getDate()).padStart(2,'0');
    out.push({id: it.contentid+'_'+y+m+d, title: it.title, date: `${y}-${m}-${d}`, place: it.eventplace});
    cur.setDate(cur.getDate()+1);
  }
}
console.log('items', items.length, 'expanded events', out.length);
console.log(out.slice(0,10));
