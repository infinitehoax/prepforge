import sys

with open('src/db/queries.ts', 'r') as f:
    content = f.read()

start_marker = 'export async function getAvailableYears('
end_marker = '  return rows.map((r) => r.year);\n}'

start_index = content.find(start_marker)
end_index = content.find(end_marker, start_index) + len(end_marker)

if start_index == -1 or end_index == -1:
    print("Could not find getAvailableYears function")
    sys.exit(1)

new_func = """export async function getAvailableYears(
  examType: ExamType,
  subjectIds: SubjectId[] = []
): Promise<number[]> {
  const database = await getDb();

  if (subjectIds.length === 0) {
    const query = "SELECT DISTINCT year FROM questions WHERE exam_type = ? ORDER BY year DESC";
    const rows = await database.select<{ year: number }[]>(query, [examType]);
    return rows.map((r) => r.year);
  }

  const placeholders = subjectIds.map(() => "?").join(", ");
  const query = `
    SELECT year
    FROM questions
    WHERE exam_type = ? AND subject_id IN (${placeholders})
    GROUP BY year
    HAVING COUNT(DISTINCT subject_id) = ?
    ORDER BY year DESC
  `;
  const params = [examType, ...subjectIds, subjectIds.length];

  const rows = await database.select<{ year: number }[]>(query, params);
  return rows.map((r) => r.year);
}"""

new_content = content[:start_index] + new_func + content[end_index:]

with open('src/db/queries.ts', 'w') as f:
    f.write(new_content)
