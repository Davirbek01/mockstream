file_path = r"c:\Users\HOME\Desktop\Mock Stream\site\IELTS Speaking Mocks.html"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []

# Indices based on 1-based line numbers from view_file:
# Start skipping at Line 2943 (index 2942)
# Stop skipping at Line 3144 (index 3143)
start_skip_index = 2942
end_skip_index = 3143

for i, line in enumerate(lines):
    if i == start_skip_index:
        new_lines.append('          <option value="" disabled selected style="background:white;color:#667eea;font-weight:700;">Choose Mock\n')
        new_lines.append('          </option>\n')
        new_lines.append('          <option value="questions IELTS S/ielts-speaking-mock-1.js" style="background:white;color:#10b981;font-weight:600;">✓ Mock 01\n')
        new_lines.append('          </option>\n')
    
    if start_skip_index <= i <= end_skip_index:
        continue
        
    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Modification complete.")
