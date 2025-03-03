
import express, { Request, Response } from "express"
import dotenv from "dotenv";
import { connectDB } from "./mongodb/connectDB";
import User from "./mongodb/User";
import bcrypt from "bcrypt"
import jwt, { JwtPayload } from "jsonwebtoken"
import multer from "multer"
import path from "path"
import uploadImage from "./uploadImage";
import Image from "./mongodb/Image";
import transformer from "./transformer";

dotenv.config();
const app = express();
connectDB();

app.use(express.json());

const jwt_secret_key = process.env.JWT_SECRET_KEY;

if(!jwt_secret_key){
    console.log("need secret key to sign jwt token");
    process.exit(1);
}

// multer to store images temporarily
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  

app.post('/register', async (req: Request, res: Response): Promise<void> => {
   try {
    const {username , password } = req.body;

    const existingUser = await User.findOne({username});
    
    const hashedPassword = await bcrypt.hash(password, 10);

    if(existingUser) {
        res.status(400).json({message: "username already exists"});
        return;
    }

    const newUser = new User({username, password: hashedPassword});

    await newUser.save();

    const tokenData = {
        time: Date(),
        username: username,
        id: newUser._id
    }

    const token = jwt.sign(tokenData, jwt_secret_key, {expiresIn: "2h"});

    console.log(`${username} registered sucessfully`)
    res.status(200).json({message: "User registered sucessfuly", newUser, token})
   } catch (error) {
        console.error("Error occured while registering user", error)
   }
})

async function verifyToken(req: Request, res: Response, next: Function): Promise<any>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({message: "No token provided"})
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, jwt_secret_key as string);
        (req as any).user = decoded;

        next();

    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });

    }
}

app.post('/login', async (req, res): Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});

        if (!user) {
           res.status(400).json({message: "user not found"});
           return;
        }

        const isPasswordValid = await bcrypt.compare(password, (user as any).password);
        if(!isPasswordValid){
             res.status(401).json({message: "invalid password"});
             return;
        }

        const tokenData = {
            time: Date(),
            username: username,
            id: user._id
        }

        const token = jwt.sign(tokenData, jwt_secret_key as string, {expiresIn: "2h"});

        res.status(200).json({message: "Login successful", token});
    } catch (error) {
         res.status(500).json({message: "Internal server error"})
    }
})

//protected routes

app.post('/images', verifyToken, upload.single('image'), uploadImage)

app.get('/images/:id', verifyToken, async (req, res: Response): Promise<any> => {
    try {
        const  { id } = req.params;

    const image = await Image.findOne({_id: id})

    if (!image) {
        return res.status(404).json({ message: "Image not found" });
    }

    
    res.status(200).json({message: "image found", url: image.url})
    } catch (error) {
        res.status(500).json({message: "Internal error occured ", error})
    }
})

app.get('/images', verifyToken, async (req: Request, res: Response): Promise<any> => {
    try {
        const page = parseInt((req as any).query.page) || 1;
        const limit = parseInt((req as any).query.limit) || 10; 

        if (page < 1 || limit < 1){
            return res.status(400).json({message: "page and limit must be positive"})
        }

        const startIndex = (page - 1) * limit;

        const images = await Image.find({userId: (req as any).user.id}).skip(startIndex).limit(limit).sort({createdAt: -1});

        const totalImages = await Image.countDocuments({userId: (req as any).user.id});
        
        // Prepare response
    const response = {
        status: 'success',
        data: images,
        pagination: {
          currentPage: page,
          totalItems: totalImages,
          limit: limit,
        }
      };

      res.status(200).json({message: "sucessful fetching images", response})

    } catch (error) {
        res.status(500).json({error: "internal server error"});       
    }
})

// Modify this line
app.post('/images/:id/transform', transformer);


app.get('/', verifyToken, (req: Request, res: Response): void => {
    res.status(200).json({message: "this is a protected route", tokens: (req as any).user})
})

app.listen(8000, () => {
    console.log("app is listenting onn port 8000")
})