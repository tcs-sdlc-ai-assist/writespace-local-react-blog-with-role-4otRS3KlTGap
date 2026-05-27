import PropTypes from 'prop-types';

/**
 * Reusable stat card component for the admin dashboard.
 * Displays a label, value, and optional icon with configurable color scheme.
 * @param {object} props
 * @param {string} props.title - The label/title for the stat
 * @param {string|number} props.value - The stat value to display
 * @param {string} [props.icon] - Optional emoji or icon string
 * @param {string} [props.color] - Tailwind color scheme prefix (e.g., 'violet', 'indigo', 'emerald', 'rose')
 * @returns {JSX.Element}
 */
function StatCard({ title, value, icon, color }) {
  const colorMap = {
    violet: {
      bg: 'bg-violet-100',
      text: 'text-violet-700',
      iconBg: 'bg-violet-500',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-500',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-500',
    },
    rose: {
      bg: 'bg-rose-100',
      text: 'text-rose-700',
      iconBg: 'bg-rose-500',
    },
    amber: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      iconBg: 'bg-amber-500',
    },
    sky: {
      bg: 'bg-sky-100',
      text: 'text-sky-700',
      iconBg: 'bg-sky-500',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`${scheme.bg} rounded-lg p-6 shadow-sm transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${scheme.text}`}>{value}</p>
        </div>
        {icon && (
          <span
            className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${scheme.iconBg} text-white text-xl`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  color: PropTypes.oneOf(['violet', 'indigo', 'emerald', 'rose', 'amber', 'sky']),
};

StatCard.defaultProps = {
  icon: undefined,
  color: 'indigo',
};

export default StatCard;