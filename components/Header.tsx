import NavLinks from './NavLinks';
import WalletButton from './WalletButton';
import MobileMenu from './MobileMenu';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-brand-dark/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
  {/* Logo and Brand */}
                        <div className="flex items-center gap-3">
                            {/* Logo Icon */}
                                <Image src={"/logo.svg"} width={44} height={44} alt='logo' className='relative w-11 h-11' />

                            {/* Brand Name */}
                                <span className="text-white text-base sm:text-xl font-bold tracking-tight">RemitWise</span>

                        </div>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:block">
            <NavLinks />
          </div>

          {/* Right: Wallet Button & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            <WalletButton />
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
