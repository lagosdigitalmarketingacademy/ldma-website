import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {traineeReels} from '../src/traineeReels.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('all 11 trainee Instagram links are canonical, unique and embedded from the correct host',()=>{
 assert.equal(traineeReels.length,11);
 assert.equal(new Set(traineeReels.map(x=>x.id)).size,11);
 for(const reel of traineeReels){
  assert.match(reel.id,/^[A-Za-z0-9_-]+$/);
  assert.equal(reel.url,'https://www.instagram.com/reel/'+reel.id+'/');
  assert.equal(reel.embedUrl,'https://www.instagram.com/reel/'+reel.id+'/embed/');
 }
});
test('homepage and Battleship both display trainee video gallery',()=>{
 assert.match(read('src/App.jsx'),/<Testimonials\/>/);
 assert.match(read('battleship/index.html'),/id="battleship-testimonials"/);
 assert.match(read('battleship/index.html'),/src="\/src\/battleship-testimonials.jsx"/);
});
test('embeds load only after a click and provide original Instagram fallback',()=>{
 const gallery=read('src/Testimonials.jsx');
 assert.match(gallery,/active===reel.id/);
 assert.match(gallery,/onClick=\{\(\)=>setActive\(reel.id\)\}/);
 assert.match(gallery,/src=\{reel.embedUrl\}/);
 assert.match(gallery,/href=\{reel.url\}/);
 assert.match(gallery,/target="_blank"/);
 assert.match(gallery,/loading="lazy"/);
});
test('Ask LDMA can link to trainee stories without inventing testimonials',()=>{
 assert.match(read('api/adviser.js'),/\/#trainee-stories/);
 assert.match(read('api/adviser.js'),/never invent trainee names/);
 assert.match(read('src/Store.jsx'),/Watch real trainee videos/);
});
