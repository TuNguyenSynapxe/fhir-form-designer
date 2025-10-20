interface ThemeSectionProps {
  theme: string;
  setTheme: (value: string) => void;
}

const ThemeSection = ({ theme, setTheme }: ThemeSectionProps) => {
  const themes = [
    { key: 'light', label: '☀️ Light', description: 'Clean and bright interface' },
    { key: 'dark', label: '🌙 Dark', description: 'Easy on the eyes for low-light environments' },
    { key: 'high-contrast', label: '🔆 High Contrast', description: 'Enhanced visibility and accessibility' }
  ];

  return (
    <div className="section theme-section-compact">
      <h3>🎨 Theme</h3>
      
      <div className="theme-buttons-compact">
        {themes.map((themeOption) => (
          <button
            key={themeOption.key}
            className={`theme-btn ${theme === themeOption.key ? 'active' : 'secondary'}`}
            onClick={() => setTheme(themeOption.key)}
            title={themeOption.description}
          >
            {themeOption.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSection;