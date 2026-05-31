with open('src/pages/SubjectSelect.tsx', 'r') as f:
    lines = f.readlines()

effective_line_idx = -1
for i, line in enumerate(lines):
    if 'const effectiveSelected =' in line:
        effective_line_idx = i
        break

if effective_line_idx == -1:
    print("Could not find effectiveSelected declaration")
    exit(1)

# Extract the block
block_start = effective_line_idx
block_end = effective_line_idx + 3 # It was 4 lines in original file
effective_block = lines[block_start:block_end+1]

# Remove the block from original position
new_lines = lines[:block_start] + lines[block_end+1:]

# Find where to insert it: before the useEffect that uses it
insert_idx = -1
for i, line in enumerate(new_lines):
    if 'getAvailableYears(examType, effectiveSelected)' in line:
        # Find the start of the useEffect
        for j in range(i, 0, -1):
            if 'useEffect(() => {' in new_lines[j]:
                insert_idx = j
                break
        break

if insert_idx == -1:
    print("Could not find insertion point")
    exit(1)

new_lines = new_lines[:insert_idx] + effective_block + ['\n'] + new_lines[insert_idx:]

with open('src/pages/SubjectSelect.tsx', 'w') as f:
    f.writelines(new_lines)
