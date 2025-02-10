const Footer = () => {
  return (
    <div className="mt-auto flex items-center justify-center space-x-2 p-6 pt-0 text-center dark:text-white-dark">
      <img className="inline w-8" src="/assets/images/logo.png" alt="logo" />
      <span>© {new Date().getFullYear()} CIE-DCTD.</span>
    </div>
  );
};

export default Footer;
