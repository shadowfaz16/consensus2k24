import React, { useEffect } from "react";
import { Network } from "@/network"; // Adjust the path to your actual Network instance
import { CID } from "multiformats";

interface ImageUploaderProps {
    imageUrl: string;
    onCidReceived: (cid: CID) => void; // Callback to receive the CID
}

// Initialize the Network instance
const network = new Network();

const ImageUploader = ({ imageUrl, onCidReceived }: ImageUploaderProps) => {
  useEffect(() => {
    const fetchImageAndUpload = async () => {
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
        await network.init(); // Ensure network is initialized
        const cid = await network.addFile(uint8Array);

        // Call the callback function with the CID
        onCidReceived(cid);

        // Log the output
        console.log("File added with CID:", cid);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    };

    fetchImageAndUpload();
  }, [imageUrl, onCidReceived]);

  return null; // No need to render anything in this component
};

export default ImageUploader;
