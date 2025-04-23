const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} TubeSummarize. Not affiliated with YouTube.</p>
      </div>
    </footer>
  );
};

export default Footer;
