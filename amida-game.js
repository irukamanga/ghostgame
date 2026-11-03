(()=>{
'use strict';
const R=AmidaRules,$=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
let s;
const x=c=>50+c*100,y=r=>110+r*60;
function slots(owner){const gaps=owner==='p'?[0,1,2,3]:[4,5,6];return gaps.flatMap(gap=>Array.from({length:6},(_,row)=>({row,gap}))).filter(b=>R.canAdd(s.bars,b.row,b.gap))}
function el(tag,attrs,text){const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;$('wall').append(n);return n}
function action(n,fn){n.setAttribute('tabindex','0');n.setAttribute('role','button');n.addEventListener('click',fn);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})}
function draw(){
 document.body.dataset.phase=s.phase;$('round').textContent=`${s.round} / 5`;
 for(const side of ['p','c']){ $(side+'Score').textContent=s.score[side];$(side+'Used').textContent=s.used[side];$(side+'Remain').textContent=20-s.used[side] }
 for(let i=1;i<=3;i++)$('ph'+i).classList.toggle('on',s.phase===i);
 $('undo').hidden=s.phase!==1;$('undo').disabled=!s.added.length;
 $('mainBtn').hidden=s.phase===2;$('mainBtn').disabled=s.phase===1&&!s.added.length;
 $('mainBtn').textContent=s.over?'もう一度遊ぶ':s.phase===1?'仕掛けを完了':'次のターンへ';
 $('wall').replaceChildren();
 for(let c=0;c<8;c++){el('line',{x1:x(c),y1:55,x2:x(c),y2:480,stroke:'#42372a','stroke-width':2});el('text',{x:x(c),y:32,'text-anchor':'middle',fill:'#42372a'},String(c%4+1))}
 for(let r=0;r<6;r++)el('text',{x:12,y:y(r)+5,fill:'#8b7960','font-size':12},String(r+1));
 for(const b of s.bars){if(s.phase<3&&b.owner==='c')continue;el('line',{x1:x(b.gap),y1:y(b.row),x2:x(b.gap+1),y2:y(b.row),stroke:'#8b2f25','stroke-width':4})}
 if(s.phase<3){el('rect',{x:442,y:70,width:326,height:390,fill:'#c8bca5'});for(let i=-350;i<350;i+=24)el('line',{x1:Math.max(442,442+i),y1:70+Math.max(0,-i),x2:Math.min(768,442+i+390),y2:70+Math.min(390,326-i),stroke:'#b4a58b','stroke-width':7});el('text',{x:605,y:265,'text-anchor':'middle',fill:'#635747','font-size':16},'経路は伏せられている')}
 if(s.phase===1){for(const b of slots('p')){const n=el('rect',{x:x(b.gap)+8,y:y(b.row)-18,width:84,height:36,class:b.gap===3?'slot seam-slot':'slot','aria-label':`${b.row+1}段目 ${b.gap+1}番目の位置に横棒を置く`});action(n,()=>add(b))}}
 if(s.phase===1&&!slots('p').length){for(const b of s.bars.filter(b=>b.owner==='p')){const n=el('rect',{x:x(b.gap)+8,y:y(b.row)-18,width:84,height:36,class:b.gap===3?'slot seam-slot':'slot','aria-label':`${b.row+1}段目の横棒を置き直す`});action(n,()=>replaceBar(b))}}
 {for(const t of (s.phase>=2?s.treasure:[s.treasure[0]]))el('text',{x:x(t),y:515,'text-anchor':'middle',fill:'#8b2f25','font-size':25},'◆');$('treasureInfo').textContent=s.phase>=2?`宝：あなた側 ${s.treasure[0]+1}番 ／ 海賊側 ${s.treasure[1]-3}番`:`宝：あなた側 ${s.treasure[0]+1}番（海賊側は駒を置くときに公開）`;}
 if(s.phase===2)for(let c=4;c<8;c++){const n=el('circle',{cx:x(c),cy:55,r:20,fill:'#8b2f25',class:'entry','aria-label':`入口${c-3}へ駒を置く`});action(n,()=>resolve(c));el('text',{x:x(c),y:61,'text-anchor':'middle',fill:'#fff','pointer-events':'none'},String(c-3))}
 if(s.phase===3)for(const [i,t] of s.traces.entries()){let d=`M ${x(t.start)} 55`;for(const step of t.steps)d+=` V ${y(step.row)} H ${x(step.to)}`;d+=' V 480';el('path',{d,fill:'none',stroke:i===0?'#b27713':'#38717c','stroke-width':i===0?6:3});el('circle',{cx:x(t.end),cy:480,r:8,fill:i===0?'#b27713':'#38717c'});}
}
function add(b){if(s.phase!==1||!R.canAdd(s.bars,b.row,b.gap))return;if(!R.allowance(s.used.p,s.round)){$('editStatus').textContent='残りターンに必要な横棒を確保しています。';return}const bar={...b,owner:'p'};s.bars.push(bar);s.added.push(bar);s.used.p++;$('editStatus').textContent='横棒を置きました。';draw()}
function replaceBar(b){if(s.phase!==1||slots('p').length||!R.allowance(s.used.p,s.round))return;const replacement={...b};s.bars=s.bars.filter(v=>v!==b);s.bars.push(replacement);s.added.push({replacement,original:b});s.used.p++;$('editStatus').textContent='1本消費して横棒を置き直しました。';draw()}
function begin(){s.phase=1;s.added=[];s.traces=null;s.treasure=[Math.floor(Math.random()*4),4+Math.floor(Math.random()*4)];$('result').hidden=true;$('result').classList.add('hidden');$('editStatus').textContent='';$('heading').textContent='横棒を仕掛ける';$('lead').textContent='毎ターン最低1本。置きたい位置を選んでください。';const before=s.used.c;let n=Math.min(R.allowance(s.used.c,s.round),1+Math.floor(Math.random()*3));while(n-->0){const choices=slots('c');if(!choices.length)break;const b=choices[Math.floor(Math.random()*choices.length)];s.bars.push({...b,owner:'c'});s.used.c++}if(s.used.c===before&&R.allowance(s.used.c,s.round)>0)s.used.c++;draw();if(!slots('p').length)$('editStatus').textContent='空きがないため、自分の横棒を選んで1本置き直してください。'}
function reset(){s={round:1,phase:1,bars:[],added:[],used:{p:0,c:0},score:{p:0,c:0},cross:{p:0,c:0},ripper:{p:false,c:false},over:false};begin()}
function choose(){if(!s.added.length)return;s.phase=2;s.cpuStart=Math.random()<.6?s.treasure[0]:Math.floor(Math.random()*4);$('heading').textContent='入口へ駒を置く';$('lead').textContent='宝の位置を確認し、海賊側の入口を選んでください。';$('editStatus').textContent='海賊は入口を選択済み。';draw()}
function resolve(start){if(s.phase!==2||s.over)return;s.traces=[R.trace(s.bars,start),R.trace(s.bars,s.cpuStart)];const messages=[];for(const [i,owner] of ['p','c'].entries()){const t=s.traces[i],r=R.outcome(s.score[owner],s.cross[owner],s.ripper[owner],t.used.length,s.treasure.includes(t.end));s.score[owner]=r.score;s.cross[owner]=r.cross;s.ripper[owner]=r.ripper;messages.push(`${owner==='p'?'あなた':'海賊'}：今回の横棒通過 ${t.used.length}本。${r.delta===1?'宝を獲得。＋1点。':r.delta===-2?'リッパー状態で宝に到達。2点没収（下限0点）。':r.afflicted?'リッパー状態。宝には届かなかった。':'宝には届かなかった。'}`)}s.phase=3;const winner=R.winner(s.score,s.round);s.over=winner!==null;$('heading').textContent=s.over?(winner==='draw'?'引き分け':winner==='p'?'勝利':'敗北'):'開帳';$('lead').textContent=s.over?'5ターン終了。合計点で決着。':'あなたの道は金色、海賊の道は青色です。';$('result').textContent=messages.join(' ／ ');$('result').hidden=false;$('result').classList.remove('hidden');$('editStatus').textContent='';draw()}
$('undo').onclick=()=>{if(s.phase!==1)return;const b=s.added.pop();if(!b)return;s.bars=s.bars.filter(x=>x!==(b.replacement||b));if(b.original)s.bars.push(b.original);s.used.p--;draw()};
$('mainBtn').onclick=()=>{if(s.over)return reset();if(s.phase===1)return choose();if(s.phase===3){const used=new Set(s.traces.flatMap(t=>t.used));s.bars=s.bars.filter(b=>!used.has(R.key(b)));s.round++;begin()}};
$('restart').onclick=()=>{if(confirm('最初から遊びますか？'))reset()};
reset();
})();
