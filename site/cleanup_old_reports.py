"""
Weekly Supabase Storage cleanup — deletes report ZIP/HTML files older than 7 days.
Stats in the results table are NOT affected (scores, levels, exam types stay).
Only the downloadable report files are removed.

Usage: python cleanup_old_reports.py
Schedule with Windows Task Scheduler to run weekly.
"""

import requests
import json
from datetime import datetime, timedelta, timezone

# ---- CONFIG ----
SUPABASE_URL = 'https://zknyukkbtbcqgvkgjktb.supabase.co'
SUPABASE_KEY = 'sb_publishable_SRLvRtRHU52FliLxA6gYaQ_I-v5LCk2'
BUCKET = 'reports'
DAYS_TO_KEEP = 7  # Delete files older than this
# ----------------

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

cutoff = datetime.now(timezone.utc) - timedelta(days=DAYS_TO_KEEP)
cutoff_iso = cutoff.isoformat()

print(f"🗑️  Cleaning reports older than {DAYS_TO_KEEP} days (before {cutoff.strftime('%Y-%m-%d %H:%M')} UTC)")

# 1. Get all results with report_path, ordered by creation date
url = f"{SUPABASE_URL}/rest/v1/results?select=id,report_path,created_at&created_at=lt.{cutoff_iso}&order=created_at.asc"
resp = requests.get(url, headers=HEADERS)
if resp.status_code != 200:
    print(f"❌ Failed to fetch results: {resp.status_code} {resp.text}")
    exit(1)

old_results = resp.json()
if not old_results:
    print("✅ No old reports to clean up.")
    exit(0)

print(f"📋 Found {len(old_results)} results older than {DAYS_TO_KEEP} days")

# 2. Collect file paths to delete (batch by folders)
paths_to_delete = []
for r in old_results:
    if r.get('report_path'):
        paths_to_delete.append(r['report_path'])

if not paths_to_delete:
    print("✅ No report files to delete.")
    exit(0)

print(f"🗂️  Deleting {len(paths_to_delete)} files from Storage...")

# 3. Delete files from Storage in batches of 100
deleted = 0
failed = 0
batch_size = 100

for i in range(0, len(paths_to_delete), batch_size):
    batch = paths_to_delete[i:i + batch_size]
    del_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}"
    del_resp = requests.delete(del_url, headers=HEADERS, json={"prefixes": batch})
    
    if del_resp.status_code in (200, 204):
        deleted += len(batch)
        print(f"  ✅ Deleted batch {i // batch_size + 1}: {len(batch)} files")
    else:
        failed += len(batch)
        print(f"  ⚠️ Batch {i // batch_size + 1} failed: {del_resp.status_code} {del_resp.text[:200]}")

# 4. Clear report_path in database (so dashboard doesn't show broken "View" links)
print("📝 Clearing report_path for deleted files...")
clear_url = f"{SUPABASE_URL}/rest/v1/results?created_at=lt.{cutoff_iso}&report_path=neq."
clear_resp = requests.patch(clear_url, headers={
    **HEADERS,
    'Prefer': 'return=minimal'
}, json={"report_path": ""})

if clear_resp.status_code in (200, 204):
    print("  ✅ Report paths cleared in database")
else:
    print(f"  ⚠️ Failed to clear paths: {clear_resp.status_code}")

print(f"\n🏁 Done! Deleted: {deleted} files, Failed: {failed}")
print(f"📊 Stats and scores are untouched — only report files were removed.")
