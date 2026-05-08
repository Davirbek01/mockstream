#!/usr/bin/env node
// Run-once: generate the 16 voice-preview WAVs (8 voices × 2 models).
//
// Usage:
//   ADMIN_PASSCODE=... node supabase/scripts/generate-voice-previews.mjs
//
// Idempotent: server-side HEADs the GCS public URL when filename_override
// is set and skips already-generated files. Re-run safe.

const FN_URL  = 'https://zknyukkbtbcqgvkgjktb.supabase.co/functions/v1/admin-mocks';
const ANON    = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2';
const SAMPLE  = "Welcome to your speaking exam. Let's begin with the first question.";
const VOICES  = ['Kore','Charon','Aoede','Orus','Achird','Vindemiatrix','Leda','Puck'];
const MODELS  = ['budget','premium'];

const passcode = process.env.ADMIN_PASSCODE;
if (!passcode) {
  console.error('Set ADMIN_PASSCODE env var (super-admin passcode).');
  process.exit(1);
}

let ok = 0, skipped = 0, failed = 0;
for (const model of MODELS) {
  for (const voice of VOICES) {
    const filename = `${model}-${voice}.wav`;
    process.stdout.write(`  ${filename.padEnd(36)} `);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'apikey':        ANON,
          'Authorization': `Bearer ${ANON}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          action:            'generate_speaking_audio',
          adminPasscode:     passcode,
          skill:             'voice-preview',
          mock_number:       0,
          question_number:   0,
          text:              SAMPLE,
          voice,
          model,
          filename_override: filename
        })
      });
      const j = await res.json();
      if (!res.ok || j.error) {
        console.log(`✗ ${j.error || res.status}`);
        failed++;
      } else if (j.skipped) {
        console.log(`↺ skipped (already exists)`);
        skipped++;
      } else {
        console.log(`✓ ${(j.sizeBytes/1024).toFixed(0)} KB · ${j.durationSec}s`);
        ok++;
      }
    } catch (e) {
      console.log(`✗ ${e.message}`);
      failed++;
    }
  }
}
console.log(`\nDone: ${ok} generated · ${skipped} skipped · ${failed} failed.`);
process.exit(failed ? 1 : 0);
