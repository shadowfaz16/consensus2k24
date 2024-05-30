import Link from "next/link";
import React from "react";
import { ImMagicWand } from "react-icons/im";
import Connect from "./thirdweb/ConnectButton";

const NavBar = () => {
  return (
    <div className="container mx-auto flex w-full items-center justify-between py-2">
      <div className="flex items-center space-x-12 justify-between w-full pr-12">
        <Link href="/" className="flex space-x-2">
          <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center">
            <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
              <ImMagicWand className="text-primary-200" size={20} />
            </div>
          </div>
          <div>
            <h1 className="font-medium text-text-100 text-sm">Wonderland</h1>
            <h3 className="text-sm text-text-200">Equity for your data</h3>
          </div>
        </Link>

        <ul className="flex items-center gap-8 text-sm text-text-200">
          <Link href="/">Home</Link>
          <Link href="/qr">Send</Link>
          <Link href="/receive">Recevie</Link>
          <Link href="/history">History</Link>
          {/* <li>Services</li>
          <li>Contact</li> */}
        </ul>
      </div>
      <div className="w-48">
        <Connect />
      </div>
    </div>
  );
};

export default NavBar;
