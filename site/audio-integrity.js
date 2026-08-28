// ============================================================================
// audio-integrity — a recorded answer must be a file the transcriber can open.
// ----------------------------------------------------------------------------
// What went wrong (2026-08-27). Four answers from one iPhone reached Groq as
// "could not process file - is it a valid media file?". The files were not
// empty — 320 KB to 1.37 MB, sitting in storage to this day. They simply did
// not START at their container header: each carried ~3-4 KB of the PREVIOUS
// question's final chunk in front of it, so the file began mid-cluster.
//
// Why: `mediaRecorder.stop()` hands over its last chunk asynchronously, and
// the pages kept ONE shared `audioChunks` array. When that late chunk arrived
// after the next question had already reset the array, it landed at the head
// of the next answer. Once it starts it cascades — Q5, Q6, Q7 and Q8 were all
// broken for that student, Q1-Q4 were clean.
//
// The damage was silent: the retry loop burned three calls per answer, the
// transcript became "[Error]", and the scorer is told to read that as silence.
// The student's certificate said 26/75 · Below B1 with his real answers intact
// in the bucket. Two other students the same day lost every answer and got no
// report at all. On iPhones this was 29% of all speaking transcriptions
// (140 of 482) against 0.2% on Android.
//
// The cause is fixed where it starts — every recording now owns its chunk
// array, so a late chunk cannot reach the next question. This file is the net
// underneath that, and it does two things before an answer is saved:
//
//   1. If the blob starts with a known container header, keep it as it is.
//   2. If the header is merely LATE, drop what sits in front of it and keep
//      the answer. Checked against the four broken files: trimmed at the
//      header, all four parse and play.
//   3. If there is no header at all, say so — the caller then tells the
//      student their answer was not saved, which is what the empty-blob path
//      has always done. Better a warning during the exam than a 0 afterwards.
//
// Loaded by: Speaking Mocks.html, IELTS Speaking Mocks.html, full-mock.html,
// ielts-full-mock.html. Every page that CALLS AudioIntegrity must also load
// it — see the lesson in reference_shared_helper_across_pages.
// ============================================================================

(function () {
  'use strict';

  // A stray prefix is one timeslice chunk — 3 to 6 KB at the 48 kbps the
  // pages record at. Searching far past that risks matching audio data that
  // happens to look like a header, so the window stays deliberately small.
  var SCAN_BYTES = 65536;

  function at(u8, i, a, b, c, d) {
    return u8[i] === a && u8[i + 1] === b && u8[i + 2] === c && u8[i + 3] === d;
  }

  // Byte offset where a real container starts, or -1.
  function containerStart(u8) {
    for (var i = 0; i + 8 <= u8.length; i++) {
      if (at(u8, i, 0x1a, 0x45, 0xdf, 0xa3)) return i;          // webm / matroska EBML
      if (at(u8, i, 0x4f, 0x67, 0x67, 0x53)) return i;          // ogg  "OggS"
      if (at(u8, i, 0x52, 0x49, 0x46, 0x46)) return i;          // wav  "RIFF"
      if (at(u8, i, 0x66, 0x74, 0x79, 0x70)) return i >= 4 ? i - 4 : -1; // mp4 "ftyp" (iOS)
    }
    return -1;
  }

  function head(blob) {
    var slice = blob.slice(0, Math.min(SCAN_BYTES, blob.size));
    if (slice.arrayBuffer) return slice.arrayBuffer();
    return new Promise(function (resolve, reject) {          // older Safari
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
      r.readAsArrayBuffer(slice);
    });
  }

  // → { ok, repaired, blob, offset }
  //   ok=false  the caller must NOT save this: treat it as a device failure.
  //   repaired  a junk prefix was trimmed; `blob` is the playable remainder.
  function check(blob) {
    if (!blob || !blob.size) {
      return Promise.resolve({ ok: false, repaired: false, blob: blob, offset: -1 });
    }
    return head(blob).then(function (buf) {
      var off = containerStart(new Uint8Array(buf));
      if (off === 0) return { ok: true, repaired: false, blob: blob, offset: 0 };
      if (off > 0) {
        return {
          ok: true,
          repaired: true,
          offset: off,
          blob: blob.slice(off, blob.size, blob.type || 'audio/webm'),
        };
      }
      return { ok: false, repaired: false, blob: blob, offset: -1 };
    }).catch(function (e) {
      // Never fail an exam over the check itself — if the bytes cannot be
      // read here, save the answer and let the transcriber decide.
      console.warn('[AudioIntegrity] could not inspect the recording:', e);
      return { ok: true, repaired: false, blob: blob, offset: 0 };
    });
  }

  window.AudioIntegrity = { check: check, SCAN_BYTES: SCAN_BYTES };
})();
