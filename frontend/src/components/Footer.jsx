const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t border-slate-200 bg-white'>
        <div className='app-container py-6 text-center text-sm text-slate-500'>
          <p>Ethan E-Commerce &copy; {currentYear}</p>
        </div>
    </footer>
  );
};

export default Footer;
