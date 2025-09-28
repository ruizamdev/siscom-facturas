const StepIndicator = ({ steps, currentStep }) => {
  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${
                index <= currentStepIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }
            `}
            >
              {step.number}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                index <= currentStepIndex ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 ${
                  index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
