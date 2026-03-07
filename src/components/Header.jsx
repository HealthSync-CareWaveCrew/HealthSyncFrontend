import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-4/95 backdrop-blur-md border-b border-primary-2/30 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-4">
        <Link
          to="/"
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <span className="text-5xl">⚕️</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              Health Sync
            </h1>
            <p className="text-primary-1 mt-1 text-xs md:text-base">
              Advanced Medical Imaging & Analysis System
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Header;
