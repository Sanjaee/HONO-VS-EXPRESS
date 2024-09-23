# Image Upload API with Cloudinary and Prisma

This repository contains two implementations of an image upload API that stores image metadata in a **Prisma** database and uploads images to **Cloudinary**. The first implementation uses **Express.js**, and the second uses **Hono**.

## Features

- Upload image files to Cloudinary.
- Save image metadata (name, URL) to a Prisma database.
- Support for both direct image file uploads and manual image URL submissions.

## Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [Prisma CLI](https://www.prisma.io/docs/getting-started)
- [Cloudinary Account](https://cloudinary.com/)

Additionally, create a `.env` file in the root directory of the project and include the following:

```bash
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=your_port



npm install

npx prisma migrate dev --name init


Usage
1. Express.js API

npm run dev

API Endpoints
Upload Image to Cloudinary

POST http://localhost:3000/upload

Body (Form-Data):

name: string
image: image file (jpg, jpeg, png)

Usage
1. Hono.js API

http://localhost:3001

API Endpoints
Upload Image to Cloudinary

POST http://localhost:3001/upload

Body (Form-Data):

name: string
image: image file (jpg, jpeg, png)



