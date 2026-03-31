"""Get detailed errors for broken articles."""
import os, subprocess

ARTICLES_DIR = "questions Articles"
broken = [80, 82, 107, 115, 118, 138, 139, 143, 176]

for i in broken:
    num = str(i).zfill(2) if i <= 9 else str(i).zfill(2) if i <= 99 else str(i)
    path = os.path.join(ARTICLES_DIR, f"article-{num}.js").replace("\\", "/")
    
    result = subprocess.run(
        ['node', '-e', f'global.window = {{}}; require("./{path}");'],
        capture_output=True, text=True, timeout=10
    )
    
    if result.returncode != 0:
        # Get the actual error line
        stderr_lines = result.stderr.strip().split('\n')
        for line in stderr_lines:
            if 'SyntaxError' in line or 'Error' in line or 'Unexpected' in line:
                print(f"Article {num}: {line.strip()}")
                break
        else:
            # Print last few lines
            print(f"Article {num}: {stderr_lines[-2] if len(stderr_lines) >= 2 else stderr_lines[-1]}")
