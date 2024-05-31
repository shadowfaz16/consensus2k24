import React, { useEffect, useState } from "react";
import { CovalentClient } from "@covalenthq/client-sdk";
import { IoIosSend } from "react-icons/io";
import SendNFT from "./send-nfts";
import { useActiveAccount } from "thirdweb/react";
import BurnNft from "./burn-nft";
import useStore from "@/store/store";

const FetchNfts = () => {
  const wallet = useActiveAccount();
  const userWallet = wallet?.address;

  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);
  console.log("User Walletttt: ", userWallet);
  const [nftData, setNftData] = useState<[]>([]);
  const [isSendNFTModalOpen, setIsSendNFTModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<{
    contract_address: string;
    token_id: number;
    image_url: string;
  } | null>(null);

  const openSendNFTModal = (
    contract_address: string,
    token_id: bigint,
    image_url: string
  ) => {
    setSelectedNFT({ contract_address, token_id: Number(token_id), image_url });
    setIsSendNFTModalOpen(true);
  };
  console.log("Selected NFT: ", selectedNFT);
  console.log("TOKEN ID: ", selectedNFT?.token_id);

  const closeSendNFTModal = () => {
    setIsSendNFTModalOpen(false);
    setSelectedNFT(null);
  };

  // 0x68a7D0971d886Cf5CdB4fDd63198B695293e5E51
  // 0xa75F930B9f42f9e5629838fa72b8A96Ee877A6Ed

  const fetchNftData = async () => {
    try {
      const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
      const resp = await client.NftService.getNftsForAddress(
        "rsk-mainnet",
        generatedUserWallet as string,
        { withUncached: true }
      );

      setNftData(resp.data.items as any);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  };
  useEffect(() => {
    if (userWallet) {
      fetchNftData();
    }
  }, [userWallet]);

  const handleTransactionSuccess = () => {
    fetchNftData();
  };

  return (
    <div className="flex flex-col gap-6 my-2 bg-white p-7 rounded-lg shadow-lg w-full">
      <div>
        <h1 className="font-medium text-lg">Off chain assets</h1>
        <p className="text-sm text-gray-500">
          Here are the assets you've burned and stored in your private network
        </p>
      </div>
      {nftData ? (
        <div className="">
          {nftData.map(
            (
              item: {
                contract_address: string;
                nft_data: {
                  token_id: bigint;
                  external_data: {
                    image: string | undefined;
                    name: string | undefined;
                  };
                }[];
              },
              index
            ) => (
              <div key={index} className="nft-item flex gap-2">
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
                    <div className="flex flex-col items-center">
                      <p className="text-sm">{nft.external_data.name}</p>
                      <IoIosSend
                        size={22}
                        className="text-gray-600 cursor-pointer"
                        onClick={() =>
                          openSendNFTModal(
                            item.contract_address,
                            nft.token_id,
                            nft.external_data.image as string
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {isSendNFTModalOpen ? (
        <div
          className="
          fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-20
          " 
        >
          <SendNFT
            isOpen={isSendNFTModalOpen}
            onClose={closeSendNFTModal}
            contract_address={selectedNFT?.contract_address as string}
            token_id={Number(selectedNFT?.token_id) as number}
            image_url={selectedNFT?.image_url as string}
            onTransactionSuccess={handleTransactionSuccess} // Pass the handler function
          />
        </div>
      ) : null}
    </div>
  );
};

export default FetchNfts;
