import express from "express";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv';
import fs from 'fs';
import pinataSDK from '@pinata/sdk';

dotenv.config();
const pinata = new pinataSDK({ pinataJWTKey: process.env.NFT_STORAGE_API_KEY });

const port = 3000;
const index = express();

index.use(express.json());
index.use(express.urlencoded({ extended: true }));
index.use(fileUpload());

index.get('/', (req, res) => {
    res.send('IRUNGA BHAI!');
});

index.post('/upload', async (req, res) => {
    console.log("File upload initiated...");
    if (!req.files || !req.files.img1) {
        return res.status(400).send('No file was uploaded');
    }

    const file = req.files.img1;
    const tempPath = `./temp/${file.name}`;

    // Ensure the temp directory exists
    if (!fs.existsSync('./temp')) {
        fs.mkdirSync('./temp');
    }

    try {
        // Save the uploaded file temporarily
        await file.mv(tempPath);
        console.log("File saved to temp path:", tempPath);

        // Create a readable stream from the file
        const stream = fs.createReadStream(tempPath);
        console.log("Stream created from temp file");

        // Pin to IPFS with metadata
        const result = await pinata.pinFileToIPFS(stream, {
            pinataMetadata: {
                name: file.name,
            },
        });
        console.log("Upload result:", result);

        // Clean up the temp file
        fs.unlinkSync(tempPath);

        // Return the IPFS CID of the uploaded file
        res.json({ message: "File uploaded to IPFS", cid: result.IpfsHash });
    } catch (error) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); // Clean up if upload fails
        console.error("Error uploading to Pinata:", error);
        res.status(500).send("Failed to upload file to IPFS");
    }
});

index.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




// import express from "express";
// import fileUpload from "express-fileupload";
// import { NFTStorage, File } from "nft.storage";

// // Initialize Express app
// const app = express();
// const port = 3000;

// // Initialize NFT.Storage client with your API key
// const client = new NFTStorage({
//     token: 'YOUR_NFT_STORAGE_API_KEY'  // Replace with your NFT.Storage API key
// });

// // Middleware to parse incoming requests
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());  // Middleware for handling file uploads

// // Root endpoint for testing
// app.get('/', (req, res) => {
//     res.send('Hello bala!')
// })

// // Post endpoint to handle file upload and store in NFT.Storage
// app.post('/upload', async (req, res) => {
//     console.log("Received Files:", req.files);  // Log the received files

//     // Check if file is uploaded
//     if (!req.files || !req.files.img1) {  // Check for 'img1' key in the request
//         return res.status(400).send("No files were uploaded.");
//     }

//     const uploadedFile = req.files.img1;  // Access the uploaded file via the 'img1' key
//     console.log("Uploaded File:", uploadedFile);  // Log file details

//     try {
//         // Convert the uploaded file into a format that can be used by NFT.Storage
//         const file = new File([uploadedFile.data], uploadedFile.name, { type: uploadedFile.mimetype });

//         // Upload the file to NFT.Storage and get the metadata (including IPFS URL)
//         const metadata = await client.store({
//             image: file
//         });

//         // Extract and send the IPFS URL
//         const ipfsUrl = `https://ipfs.io/ipfs/${metadata.url.split("ipfs://")[1]}`;
//         res.json({ ipfsUrl });

//     } catch (error) {
//         console.error("Error uploading file:", error);
//         res.status(500).send("Error uploading file to NFT.Storage.");
//     }
// });

// // Start the server
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });



