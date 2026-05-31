import sys

with open('src/db/queries.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if 'async function seedInitialData(database: Database): Promise<void> {' in line:
        new_lines.append(line)
        new_lines.append('  await database.execute("PRAGMA foreign_keys = ON");\n')
        new_lines.append('\n')
        new_lines.append('  // Seed subjects first\n')
        new_lines.append('  const subjectsCount = await database.select<{ count: number }[]>(\n')
        new_lines.append('    "SELECT COUNT(*) as count FROM subjects"\n')
        new_lines.append('  );\n')
        new_lines.append('  if (subjectsCount[0].count === 0) {\n')
        new_lines.append('    for (const s of SUBJECTS) {\n')
        new_lines.append('      await database.execute(\n')
        new_lines.append('        "INSERT INTO subjects (id, name, icon, color) VALUES (?, ?, ?, ?)",\n')
        new_lines.append('        [s.id, s.name, s.icon, s.color]\n')
        new_lines.append('      );\n')
        new_lines.append('    }\n')
        new_lines.append('  }\n')
        new_lines.append('\n')
        continue

    if 'const existing = await database.select<{ count: number }[]>(' in line:
        skip = True
        continue
    if skip and 'if (existing[0].count > 0) return;' in line:
        new_lines.append('  const questionsCount = await database.select<{ count: number }[]>(\n')
        new_lines.append('    "SELECT COUNT(*) as count FROM questions"\n')
        new_lines.append('  );\n')
        new_lines.append('  if (questionsCount[0].count > 0) return;\n')
        skip = False
        continue

    if not skip:
        new_lines.append(line)

with open('src/db/queries.ts', 'w') as f:
    f.writelines(new_lines)
