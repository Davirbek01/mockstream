"""
Update landing.html to add 'levels' property to all flashcard topics
that have level files generated.
Run this AFTER generate_all_flashcard_levels.py completes.
"""
import re, os

def main():
    with open('landing.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the flashcardTopics block
    match = re.search(r'(const flashcardTopics = \[)(.*?)(\];)', content, re.DOTALL)
    if not match:
        print("ERROR: Could not find flashcardTopics in landing.html")
        return

    prefix = match.group(1)
    block = match.group(2)
    suffix = match.group(3)

    updated_lines = []
    updated_count = 0
    skipped_count = 0

    for line in block.split('\n'):
        m = re.search(r"file: '([^']+)'", line)
        if not m:
            updated_lines.append(line)
            continue

        file_name = m.group(1)
        slug = file_name.replace('01.js', '')

        # Check if all 3 level files exist
        has_levels = all(
            os.path.exists(f'flashcards/{slug}-{lev}.js')
            for lev in ['intermediate', 'upper-intermediate', 'advanced']
        )

        if has_levels and 'levels:' not in line:
            # Add levels property before the closing }
            levels_str = (
                f"levels: {{ intermediate: '{slug}-intermediate', "
                f"'upper-intermediate': '{slug}-upper-intermediate', "
                f"advanced: '{slug}-advanced' }}"
            )
            # Insert before the closing }, or },
            line = re.sub(
                r"(\s*)\}(\s*,?\s*)$",
                rf", {levels_str} \1}}\2",
                line
            )
            updated_count += 1
            print(f"  + {slug}")
        elif has_levels and 'levels:' in line:
            skipped_count += 1
        else:
            pass  # No level files yet

        updated_lines.append(line)

    new_block = '\n'.join(updated_lines)
    new_content = content[:match.start()] + prefix + new_block + suffix + content[match.end():]

    with open('landing.html', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"\nDone! Updated {updated_count} topics, {skipped_count} already had levels.")


if __name__ == "__main__":
    main()
