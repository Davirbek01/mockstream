"""Quick: dump all CRITICAL and ERROR issues."""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
# Run health check inline
exec(open(os.path.join(os.path.dirname(__file__), 'health_check_tests.py'), 'r', encoding='utf-8').read())
for i in issues:
    if i['sev'] in ('CRITICAL', 'ERROR'):
        print(f"  {i['sev']:8s} [{i['file']}] Q{i['q']}: {i['msg']}")
