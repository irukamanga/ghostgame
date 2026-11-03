(function(root){
  const ROWS=6,MAX_BARS=20,ROUNDS=5;
  const key=b=>`${b.row}:${b.gap}`;
  function canAdd(bars,row,gap){return Number.isInteger(row)&&Number.isInteger(gap)&&row>=0&&row<ROWS&&gap>=0&&gap<7&&!bars.some(b=>b.row===row&&Math.abs(b.gap-gap)<=1)}
  function trace(bars,start){let end=start;const used=[],steps=[];for(let row=0;row<ROWS;row++){const b=bars.find(b=>b.row===row&&(b.gap===end||b.gap===end-1));if(b){const from=end;end+=b.gap===end?1:-1;used.push(key(b));steps.push({row,from,to:end})}}return{start,end,used,steps}}
  function outcome(score,cross,ripper,count,found){cross+=count;ripper=ripper||cross>=5;const afflicted=ripper;let delta=0;if(found){delta=ripper?-2:1;score=Math.max(0,score+delta);if(ripper){cross=0;ripper=false}}return{score,cross,ripper,delta,afflicted}}
  function allowance(used,round){return Math.max(0,MAX_BARS-used-(ROUNDS-round))}
  function winner(score,round){return round<ROUNDS?null:score.p===score.c?'draw':score.p>score.c?'p':'c'}
  const api={ROWS,MAX_BARS,ROUNDS,key,canAdd,trace,outcome,allowance,winner};
  if(typeof module!=='undefined')module.exports=api;else root.AmidaRules=api;
})(globalThis);
