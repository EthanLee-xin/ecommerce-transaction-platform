const FormContainer = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="ui-card p-6 sm:p-8">{children}</div>
    </div>
  );
};

export default FormContainer;
