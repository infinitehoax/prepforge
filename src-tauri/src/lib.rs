use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
            CREATE TABLE IF NOT EXISTS subjects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_type TEXT NOT NULL CHECK(exam_type IN ('JAMB', 'WAEC')),
                subject_id TEXT NOT NULL,
                year INTEGER NOT NULL,
                question_number INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer TEXT NOT NULL CHECK(correct_answer IN ('A', 'B', 'C', 'D')),
                explanation TEXT NOT NULL DEFAULT '',
                topic TEXT,
                FOREIGN KEY (subject_id) REFERENCES subjects(id)
            );

            CREATE TABLE IF NOT EXISTS exam_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_type TEXT NOT NULL,
                subjects TEXT NOT NULL,
                mode TEXT NOT NULL CHECK(mode IN ('study', 'mock')),
                year INTEGER NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                percentage REAL NOT NULL,
                time_taken_seconds INTEGER NOT NULL,
                completed_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS exam_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                result_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                selected_option TEXT CHECK(selected_option IN ('A', 'B', 'C', 'D', NULL)),
                is_correct INTEGER NOT NULL DEFAULT 0,
                time_spent_seconds INTEGER NOT NULL DEFAULT 0,
                FOREIGN KEY (result_id) REFERENCES exam_results(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id)
            );

            CREATE INDEX IF NOT EXISTS idx_questions_exam_subject ON questions(exam_type, subject_id);
            CREATE INDEX IF NOT EXISTS idx_questions_year ON questions(year);
            CREATE INDEX IF NOT EXISTS idx_results_exam_type ON exam_results(exam_type);
            CREATE INDEX IF NOT EXISTS idx_results_completed ON exam_results(completed_at);
        ",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
            .add_migrations("sqlite:prepforge.db", migrations)
            .build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
