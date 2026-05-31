import sys

with open('src/pages/SubjectSelect.tsx', 'r') as f:
    content = f.read()

# 1. Update useEffect to depend on effectiveSelected and call getAvailableYears with it
old_effect = """  useEffect(() => {
    setSelectedSubjects([]);
    setError("");
    setIsLoadingYears(true);
    setAvailableYears([]);

    getAvailableYears(examType)
      .then((years) => {
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
        setIsLoadingYears(false);
      })
      .catch((err) => {
        console.error("Failed to load years:", err);
        setError("Failed to load available years. Please restart the app.");
        setIsLoadingYears(false);
      });
  }, [examType]);"""

# Note: We need to be careful with dependency array.
# If we reset subjects on examType change, that should be separate or handled.
# The original code reset subjects on examType change.

new_effect = """  useEffect(() => {
    setSelectedSubjects([]);
    setError("");
  }, [examType]);

  useEffect(() => {
    setIsLoadingYears(true);
    getAvailableYears(examType, effectiveSelected)
      .then((years) => {
        setAvailableYears(years);
        if (years.length > 0) {
          if (!years.includes(selectedYear)) {
            setSelectedYear(years[0]);
          }
        }
        setIsLoadingYears(false);
      })
      .catch((err) => {
        console.error("Failed to load years:", err);
        setError("Failed to load available years. Please restart the app.");
        setIsLoadingYears(false);
      });
  }, [examType, effectiveSelected]);"""

content = content.replace(old_effect, new_effect)

# 2. Update button disable logic
old_button = """      <button
        onClick={handleStart}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
        style={{ background: "var(--accent-blue)", color: "white" }}
      >
        Begin Exam
        <ArrowRight size={16} />
      </button>"""

new_button = """      <button
        onClick={handleStart}
        disabled={availableYears.length === 0 || (examType === "JAMB" && effectiveSelected.length !== 4)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--accent-blue)", color: "white" }}
      >
        Begin Exam
        <ArrowRight size={16} />
      </button>"""

content = content.replace(old_button, new_button)

with open('src/pages/SubjectSelect.tsx', 'w') as f:
    f.write(content)
