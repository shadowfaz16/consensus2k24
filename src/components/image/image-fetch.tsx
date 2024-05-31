import React, { useEffect, useRef, memo } from "react";
import { CID } from "multiformats";
import { getNetworkInstance } from "@/hooks/networkManager";

interface ImageUploaderProps {
  imageUrl: string;
  onCidReceived: (cid: CID) => void; // Callback to receive the CID
}

const ImageUploader = ({ imageUrl, onCidReceived }: ImageUploaderProps) => {
  const network = getNetworkInstance();
  const isFetchingRef = useRef(false); // To track if the fetchImageAndUpload function is already running
  const currentImageUrlRef = useRef<string | null>(null); // To track the current image URL

  useEffect(() => {
    const fetchImageAndUpload = async () => {
      if (!network || isFetchingRef.current || currentImageUrlRef.current === imageUrl) {
        return;
      }

      isFetchingRef.current = true;
      currentImageUrlRef.current = imageUrl; // Set the current image URL

      try {
        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        console.log("Image fetched successfully", response);

        // Convert the response to an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        console.log("ArrayBuffer:", arrayBuffer);

        // Convert the ArrayBuffer to a Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log("Uint8Array:", uint8Array);

        // Use the addFile function from the network instance
        const cid = await network.addFile(uint8Array);

        // Call the callback function with the CID
        onCidReceived(cid);

        // Log the output
        console.log("File added with CID:", cid);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        isFetchingRef.current = false; // Reset the ref
      }
    };

    fetchImageAndUpload();
  }, [imageUrl, onCidReceived, network]);

  return null; // No need to render anything in this component
};

export default memo(ImageUploader); // Memoize the component
