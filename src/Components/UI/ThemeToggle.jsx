import { useTheme } from "@/utils/ThemeProvider";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4 z-50 rounded-lg border px-3 py-2
                 bg-background text-foreground shadow"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
};

export default ThemeToggle;
