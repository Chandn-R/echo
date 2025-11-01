import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            className="rounded-lg h-12 w-12 brightness-75 hover:brightness-125"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-6 w-6" />
            ) : (
                <Moon className="h-6 w-6" />
            )}
        </button>
    );
}
