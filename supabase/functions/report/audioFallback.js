// AUDIO_FALLBACK — one line of defence for every report that plays audio.
//
// Speaking and full-mock reports point their <audio> at the reports bucket.
// Retention deletes those objects after a week, so a report opened later would
// go silent. This capture-phase error handler retries any failed player from
// the permanent GCS archive (the nightly copy of the same path).
//
// Injected by BOTH `report` (the View Report link) and `report-locked` (the
// encrypted Telegram file, where it must live INSIDE the ciphertext because the
// locker replaces the whole document on unlock).
export const AUDIO_FALLBACK =
  `<script>(function(){` +
  `var A='https://storage.googleapis.com/mockstream-report-archive/';` +
  `var P='/storage/v1/object/public/reports/';` +
  `function swap(el){var s=el.currentSrc||el.src||'';if(s.indexOf(P)<0||el.dataset.archRetry)return;` +
  `el.dataset.archRetry='1';el.src=A+s.split(P)[1];` +
  `var so=el.querySelector&&el.querySelector('source');if(so){so.src=el.src}` +
  `if(el.load)el.load()}` +
  `document.addEventListener('error',function(e){var t=e.target;if(!t||!t.tagName)return;` +
  `if(t.tagName==='AUDIO')swap(t);` +
  `else if(t.tagName==='SOURCE'&&t.parentElement&&t.parentElement.tagName==='AUDIO')swap(t.parentElement)},true);` +
  // A speaking report holds a player per answer TWICE (examiner + AI view). A
  // phone will not keep sixteen media elements alive: the ones that asked to
  // preload took the decoders and then refused to play. Ask for nothing up
  // front, load on the tap that starts playback, and never leave two playing.
  `function idle(){var l=document.querySelectorAll('audio');for(var i=0;i<l.length;i++){` +
  `if(l[i].preload!=='none'){l[i].preload='none'}}}` +
  `if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',idle);else idle();` +
  `document.addEventListener('play',function(e){var t=e.target;if(!t||t.tagName!=='AUDIO')return;` +
  `var l=document.querySelectorAll('audio');for(var i=0;i<l.length;i++){` +
  `if(l[i]!==t&&!l[i].paused){try{l[i].pause()}catch(_){}}}},true);` +
  `document.addEventListener('click',function(e){var t=e.target;` +
  `if(t&&t.tagName==='AUDIO'&&t.readyState===0&&t.load){try{t.load()}catch(_){}}},true)` +
  `})();</script>`;

/** Append the retry script to a finished report document. */
export function withAudioFallback(html) {
  if (!html || html.includes('archRetry')) return html;
  return html.includes('</body>') ? html.replace('</body>', AUDIO_FALLBACK + '</body>') : html + AUDIO_FALLBACK;
}
