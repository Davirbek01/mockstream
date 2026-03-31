import os, subprocess
d = os.path.dirname(__file__)
log = os.path.join(d, 'batch_translate_log.txt')
out = os.path.join(d, '_status.txt')
lines = open(log, 'r', encoding='utf-8').readlines()
result = []
result.append(f"Log lines: {len(lines)}")
result.append(f"Last 3 lines:")
for l in lines[-3:]:
    result.append(f"  {l.rstrip()}")
saves = [l.strip() for l in lines if 'Saved' in l]
result.append(f"\nSaved files: {len(saves)}")
for s in saves[-5:]:
    result.append(f"  {s}")
r = subprocess.run(["powershell", "-c", "Get-Process python -EA SilentlyContinue | Select Id,CPU | ConvertTo-Json"], capture_output=True, text=True)
result.append(f"\nPython procs: {r.stdout.strip() or 'NONE'}")
open(out, 'w', encoding='utf-8').write('\n'.join(result))
