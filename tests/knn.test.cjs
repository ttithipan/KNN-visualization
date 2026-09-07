const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const core=source.slice(source.indexOf('function distance'),source.indexOf('function stop'));
const context=vm.createContext({});vm.runInContext(core,context);
const {distance,rank,vote,validation}=context;
const data=[{id:1,x:0,y:0,label:'A'},{id:2,x:0,y:1,label:'A'},{id:3,x:10,y:10,label:'B'},{id:4,x:10,y:9,label:'B'}];
test('Euclidean distance follows 3-4-5 triangle',()=>assert.equal(distance({x:0,y:0},{x:3,y:4},'euclidean'),5));
test('Manhattan distance sums axis differences',()=>assert.equal(distance({x:3,y:4},{x:0,y:0},'manhattan'),7));
test('Rank resolves equal distances by stable ID without mutating data',()=>{const r=rank([...data].reverse(),{x:5,y:5},'euclidean');assert.equal(r[0].id,2);assert.equal(r[1].id,4);assert.equal(data[0].id,1)});
test('Majority voting chooses larger class',()=>assert.equal(vote([{label:'A',d:1},{label:'B',d:2},{label:'B',d:3}],'uniform').winner,'B'));
test('Tied vote chooses nearest neighbor',()=>assert.equal(vote([{label:'B',d:1},{label:'A',d:2}],'uniform').winner,'B'));
test('Distance weights can outweigh a majority',()=>assert.equal(vote([{label:'A',d:.1},{label:'B',d:2},{label:'B',d:3}],'distance').winner,'A'));
test('Exact matches ignore nonzero distance neighbors',()=>{const r=vote([{label:'B',d:0},{label:'A',d:.1}],'distance');assert.equal(r.winner,'B');assert.equal(r.totals.A,0);assert.equal(r.totals.B,1)});
test('Duplicate exact matches remain finite and deterministic',()=>{const r=vote([{label:'A',d:0},{label:'B',d:0}],'distance');assert.equal(r.winner,'A');assert.equal(r.totals.A,1)});
test('Empty vote has no winner',()=>assert.equal(vote([],'uniform').winner,null));
test('Validation excludes self: opposite pair has 100% error',()=>assert.equal(validation([data[0],data[2]],1,'euclidean','uniform'),1));
test('Separated neighborhoods have zero one-neighbor error',()=>assert.equal(validation(data,1,'euclidean','uniform'),0));
test('Validation caps k at available neighbors',()=>assert.equal(validation(data,99,'euclidean','uniform'),1));
test('Validation needs at least two examples',()=>{assert.equal(validation([],1,'euclidean','uniform'),null);assert.equal(validation([data[0]],1,'euclidean','uniform'),null)});
test('Both metrics and voting rules give expected end-to-end predictions',()=>{for(const metric of ['euclidean','manhattan'])for(const weight of ['uniform','distance']){assert.equal(vote(rank(data,{x:1,y:1},metric).slice(0,3),weight).winner,'A');assert.equal(vote(rank(data,{x:9,y:9},metric).slice(0,3),weight).winner,'B')}});

function tableHarness(phase=2,tablePage=0,used=0){
  const elements=Object.fromEntries(['neighbors','tableSummary','previousRows','nextRows'].map(id=>[id,{}]));
  const ranked=Array.from({length:9},(_,i)=>({id:i+1,label:i%2?'B':'A',d:i+.25}));
  const state=vm.createContext({phase,tablePage,used,ranked,colors:{A:'blue',B:'orange'},$:id=>elements[id]});
  const tableSource=source.slice(source.indexOf('function renderNeighborTable'),source.indexOf('function render(){'));
  vm.runInContext(tableSource+';renderNeighborTable();',state);
  return {elements,state};
}
test('Neighbor pagination limits rows and preserves absolute rank',()=>{
  const {elements}=tableHarness(2,1);
  assert.equal((elements.neighbors.innerHTML.match(/<tr /g)||[]).length,4);
  assert.match(elements.neighbors.innerHTML,/5 \/ #5/);
  assert.match(elements.neighbors.innerHTML,/8 \/ #8/);
  assert.equal(elements.tableSummary.textContent,'Showing 5–8 of 9 · nearest first');
  assert.equal(elements.previousRows.disabled,false);
  assert.equal(elements.nextRows.disabled,false);
});
test('Neighbor pagination disables unavailable navigation',()=>{
  assert.equal(tableHarness(2,0).elements.previousRows.disabled,true);
  const {elements}=tableHarness(2,2);
  assert.equal(elements.nextRows.disabled,true);
  assert.equal((elements.neighbors.innerHTML.match(/<tr /g)||[]).length,1);
  const ready=tableHarness(0).elements;
  assert.equal(ready.previousRows.disabled,true);
  assert.equal(ready.nextRows.disabled,true);
});
test('Neighbor table marks voted neighbors on later pages',()=>{
  const {elements}=tableHarness(3,1,5);
  assert.equal((elements.neighbors.innerHTML.match(/class="selected"/g)||[]).length,1);
  assert.match(elements.neighbors.innerHTML,/5 \/ #5/);
});
