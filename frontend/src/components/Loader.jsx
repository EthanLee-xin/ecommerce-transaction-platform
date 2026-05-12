const Loader = () => {
  return (
    <div className='flex justify-center py-8'>
      <div
        className='h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950'
        role='status'
        aria-label='Loading'
      />
    </div>
  );
};

export default Loader;
