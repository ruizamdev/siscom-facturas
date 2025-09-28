const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  className = "",
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && (
        <Button onClick={action} variant="primary" size="lg">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
