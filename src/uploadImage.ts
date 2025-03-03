import { Request, Response } from "express";
import cloudinary from "./config/cloudinary";
import fs from "fs/promises";
import Image from "./mongodb/Image";

// Extend the Request interface to include `user`
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

const uploadImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required' 
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ 
        status: 'error', 
        message: 'No file uploaded' 
      });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `user_${req.user.id}`,
    });

    //delete the image file as soon as it is uploaded to cloudinary
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.warn('Failed to delete temporary file:', unlinkError);
    }

    const image = await Image.create({
      userId: req.user.id,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: image.id,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Upload failed', 
      details: error.message 
    });
  }
};

export default uploadImage;
