import { hebrew } from '../../i18n/hebrew';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onClear: () => void;
}

export function Header({ onClear }: HeaderProps) {
  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg mb-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{hebrew.appTitle}</h1>
          </div>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <button
              onClick={() => window.print()}
              className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              הדפס
            </button>
            <button
              onClick={onClear}
              className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              נקה הכל
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}



