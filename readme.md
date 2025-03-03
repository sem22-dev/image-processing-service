
# Image Processing Service

## Description
This is an **Image Processing Service** built with **Node.js, Express, TypeScript, and Mongoose**. It allows users to **upload, transform, and retrieve images** using Cloudinary for storage. The service supports transformations such as resizing, cropping, rotating, watermarking, and applying filters.

---

## Features
- **User Authentication**
  - Register and Login users
  - JWT authentication for secure endpoints
- **Image Upload & Management**
  - Upload images to Cloudinary
  - Retrieve images
  - List all uploaded images by the user
- **Image Transformation**
  - Resize, Crop, Rotate, Flip, Mirror
  - Add Watermarks
  - Convert formats (JPEG, PNG, etc.)
  - Apply filters (Grayscale, Sepia, etc.)

---

## Tech Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT
- **File Storage**: Cloudinary

---

## Installation & Setup

### Prerequisites
- **Node.js** (v16 or later)
- **MongoDB** (local or cloud instance)
- **Cloudinary Account** (for image storage)

### Clone the repository
```sh
git clone https://github.com/your-repo/image-processing-service.git
cd image-processing-service
```

### Install dependencies
```sh
npm install
```

### Configure environment variables
Create a **.env** file in the root directory and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Run the server
```sh
npm run dev
```

The server will start on **http://localhost:5000**.

---

## API Endpoints

### Authentication
#### Register
```http
POST /register
```
**Request Body:**
```json
{
  "username": "user1",
  "password": "password123"
}
```
**Response:**
```json
{
  "user": { "id": "123", "username": "user1" },
  "token": "your_jwt_token"
}
```

#### Login
```http
POST /login
```
**Request Body:** Same as Register

**Response:** JWT Token

---

### Image Management
#### Upload an Image
```http
POST /images
```
**Request Body:** Multipart form-data with image file

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "metadata": { "width": 500, "height": 500 }
}
```

#### Apply Transformations
```http
POST /images/:id/transform
```
**Request Body:**
```json
{
  "transformations": {
    "resize": { "width": 300, "height": 300 },
    "crop": { "width": 100, "height": 100, "x": 10, "y": 10 },
    "rotate": 90,
    "filters": { "grayscale": true }
  }
}
```

#### Retrieve an Image
```http
GET /images/:id
```
**Response:** Image metadata and URL

#### List Images (Paginated)
```http
GET /images?page=1&limit=10
```


