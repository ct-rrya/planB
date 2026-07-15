import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-accent-100 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-6xl font-bold text-primary mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-primary mb-3">Page Not Found</h2>
        <p className="text-base text-secondary-700 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-all shadow-soft hover:shadow-elevated"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
