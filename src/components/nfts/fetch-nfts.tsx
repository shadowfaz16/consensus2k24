import React, { useEffect, useState } from "react";
import { CovalentClient } from "@covalenthq/client-sdk";
import { BsThreeDots } from "react-icons/bs";


const FetchNfts = () => {
  const [nftData, setNftData] = useState<[]>([]);

  useEffect(() => {
    const fetchNftData = async () => {
      try {
        const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
        const resp = await client.NftService.getNftsForAddress(
          "eth-sepolia",
          "0x68a7D0971d886Cf5CdB4fDd63198B695293e5E51",
          { withUncached: true }
        );

        console.log("user NFTs: ", resp.data);
        setNftData(resp.data.items as any);
      } catch (error) {
        console.error("Error fetching NFT data:", error);
      }
    };

    fetchNftData();
  }, []);

  return (
    <div className="flex flex-col gap-6 my-2 bg-white p-7 rounded-lg shadow-lg w-full">
      <div>
        <h1 className="font-medium text-lg">On chain assets</h1>
        <p className="text-sm text-gray-500">
          Here are the current assets owned by your wallet
        </p>
      </div>
      {nftData ? (
        <div className="">
          {nftData.map(
            (
              item: {
                nft_data: {
                  external_data: {
                    image: string | undefined;
                    name: string | undefined;
                  };
                }[];
              },
              index
            ) => (
              <div key={index} className="nft-item flex gap-4">
                {item.nft_data.map((nft, nftIndex) => (
                  <div
                    key={nftIndex}
                    className="nft-detail flex flex-col gap-2 items-center"
                  >
                    <img
                      src={nft.external_data.image}
                      alt={nft.external_data.name}
                      width={120}
                      className="rounded-lg"
                    />
                    <p className="text-sm">{nft.external_data.name}</p>
                    {/* <h2>{item.contract_name}</h2> */}
                    <BsThreeDots className="text-gray-400" />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default FetchNfts;
