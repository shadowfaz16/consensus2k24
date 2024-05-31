import React from "react";
import Image from "next/image";
import { ImMagicWand } from "react-icons/im";
import Link from "next/link";
import hero from "@/assets/static/herro.webp"

const Hero = () => {
  return (
    <>
      <div className="container flex flex-col md:flex-row items-center justify-between px-0 py-4 md:pb-20 md:pt-24 min-h-[80dvh] md:min-h-[82dvh] max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* <div className="flex items-center space-x-4 rounded bg-gray-100 p-1 md:w-3/5 shadow">
            <div className="rounded bg-white px-3">
              <span className="text-xs text-text-100">WHAT&apos;S NEW</span>
            </div>
            <p className="text-text-200">
              Transactional freedom
            </p>
          </div> */}
          <h1 className="text-4xl md:text-6xl font-medium text-text-100 md:w-2/3">
            Bring your on chain assets off chain
          </h1>
          <p className="text-lg text-text-100">
            Amendment 0 is a platform that empowers private transactional freedom.
            <span className="mt-2 block font-semibold">
              Bring your assets off-chain while maintaining provinance
            </span>
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
            <Link href='https://github.com/apps/slickci/installations/select_target' target="_blank" className="rounded-lg bg-primary flex items-center justify-center p-3 gap-2 hover:bg-bg-300">
                  <ImMagicWand className="inline" size={16} color="white" />
                <p className="rounded-md text-xs text-secondary">
                  Get Started Now
                </p>
              </Link>
              {/* <p className="rounded-md p-3 text-sm text-primary-100">
                Read the docs
              </p> */}
            </div>
            <p className="text-xs text-text-200">
              Help us empower transactional freedom
            </p>
          </div>
        </div>
        <div>
          <Image
            src={hero}
            alt="github-actions"
            width={500}
            height={500}
            className="rounded-lg"
          />
        </div>
      </div>
      {/* <div className="container mx-auto flex flex-col items-center justify-center gap-8">
        <h5 className="text-text-200 text-sm">
          SLICKCI IS SOON TO BE USED BY COMPANIES WORLDWIDE
        </h5>
        <div className="flex items-center gap-24">
          <Image
            src={weset}
            alt="github-actions"
            width={100}
            height={100}
          />
          <Image
            src={mygeotokens}
            alt="github-actions"
            width={125}
            height={125}
          />
          <Image
            src={pxm as string}
            alt="github-actions"
            width={75}
            height={75}
          />
          <Image
            src={veme as string}
            alt="github-actions"
            width={100}
            height={100}
          />
          <Image
            src={gang}
            alt="github-actions"
            width={100}
            height={100}
          />
        </div>
      </div> */}
    </>
  );
};

export default Hero;
