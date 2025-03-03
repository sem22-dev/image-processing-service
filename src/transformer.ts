import { Request, Response } from "express";
import Image from "./mongodb/Image";
import sharp from "sharp";
import cloudinary from "./config/cloudinary";


export default async function transformer(req: Request, res: Response): Promise<any> {
    try {
        const { id } = req.params;
        const { transformations } = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "id is missing or incorrect" });
        }
        
        const image = await Image.findById({ _id: id });
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }
    
        // Download the image
        const imageUrl = image.url;
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        const imageBuffer = await response.arrayBuffer();
        
        // Start with Sharp instance
        let sharpInstance = sharp(Buffer.from(imageBuffer));
        
        // Apply transformations based on request
        if (transformations?.resize) {
            sharpInstance = sharpInstance.resize({
                width: transformations.resize.width,
                height: transformations.resize.height
            });
        }
        
        if (transformations?.crop) {
            sharpInstance = sharpInstance.extract({
                width: transformations.crop.width,
                height: transformations.crop.height,
                left: transformations.crop.x,
                top: transformations.crop.y
            });
        }
        
        if (transformations?.rotate) {
            sharpInstance = sharpInstance.rotate(transformations.rotate);
        }
        
        if (transformations?.filters) {
            if (transformations.filters.grayscale) {
                sharpInstance = sharpInstance.grayscale();
            }
            // For sepia, since there's no built-in filter, we can use tint()
            if (transformations.filters.sepia) {
                sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
            }
        }
        
        // Get format if specified, or use original format
        const outputFormat = transformations?.format || 'jpeg';
        sharpInstance = sharpInstance.toFormat(outputFormat);
        
        // Get the transformed image as a buffer
        const transformedImageBuffer = await sharpInstance.toBuffer({ resolveWithObject: true });
        
        // Get metadata from the result
        const metadata = transformedImageBuffer.info;
        
        // Upload to Cloudinary
        const uploadPromise = new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `user_${image.userId || "transformations"}`,
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            
            uploadStream.end(transformedImageBuffer.data);
        });

        const uploadResult = await uploadPromise;
        
        // Return the transformed image details
        res.status(200).json({
            message: "Image transformed successfully",
            transformedImage: {
                url: uploadResult.secure_url,
                metadata: {
                    format: metadata.format,
                    width: metadata.width,
                    height: metadata.height,
                    size: transformedImageBuffer.data.length,
                    cloudinary_id: uploadResult.public_id
                }
            }
        });
    
    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).json({ message: "Error transforming image", error: error.message });
    }
}