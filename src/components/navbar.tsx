import Link from "next/link";
import React, { useState } from "react";
import { ImMagicWand } from "react-icons/im";
import { FaBars, FaTimes } from "react-icons/fa"; // Import hamburger icons
import Connect from "./thirdweb/ConnectButton";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="container mx-auto flex items-center justify-between py-2 px-4 md:px-0">
      <div className="flex items-center space-x-2 md:space-x-12 w-full md:pr-12">
        <div className="md:hidden flex items-center">
          <button onClick={toggleDropdown}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <Link href="/" className="flex space-x-1 md:space-x-2">
          <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center">
            <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
              <ImMagicWand className="text-primary-200" size={20} />
            </div>
          </div>
          <div>
            <h1 className="font-medium text-text-100 text-sm leading-3 mt-2">
              Amendment 0
            </h1>
            <h3 className="text-sm text-text-200">Equity for your data</h3>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-text-200 justify-end">
          <Link href="/">Home</Link>
          {/* <Link href="/qr">Send</Link> */}
          <Link href="/receive">Profile</Link>
          <Link href="/history">History</Link>
          <Link href="/qr">Scan</Link>

        </div>
      </div>

      <div className="w-48 hidden md:flex">
        <Connect />
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg rounded-lg z-50">
          <ul className="flex flex-col items-center gap-4 py-4 text-sm text-text-200">
            <Link href="/" onClick={toggleDropdown}>
              Home
            </Link>
            <Link href="/qr" onClick={toggleDropdown}>
              Send
            </Link>
            <Link href="/receive" onClick={toggleDropdown}>
              Receive
            </Link>
            <Link href="/history" onClick={toggleDropdown}>
              History
            </Link>
            <Connect />
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavBar;
