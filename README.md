# Inventec Website

A secure, full-stack web application for managing and showcasing Inventec hardware products. Built using **Next.js 15.3.2**, integrated with **MongoDB**, **NextAuth**, and robust authentication with **Bcrypt**.

---

## Tech Stack

- **Framework**: Next.js `v15.3.2`
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Password Security**: Bcrypt
- **Frontend**: React (built-in with Next.js)

---

## MongoDB Schema

### `User` Collection
| Field     | Type   | Description                |
|-----------|--------|----------------------------|
| `email`   | String | User email address         |
| `password`| String | Hashed password (bcrypt)   |
| `role`    | String | Role: `"user"` (default), `"admin"` |

### `Product` Collection
| Field               | Type     | Description                           |
|---------------------|----------|---------------------------------------|
| `productName`       | String   | Name of the product                   |
| `imageUrl`          | String   | URL to the product image              |
| `chip`              | String   | Chipset used                          |
| `supportOS`         | [String] | List of supported operating systems   |
| `tops`              | Number   | Performance value in TOPS             |
| `category`          | String   | Product category                      |
| `platform`          | String   | Hardware platform                     |
| `specDownloadUrl`   | String   | URL for spec/firmware download        |
| `productDetailPage` | String   | URL to a detailed product page        |

---

## API Endpoints

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | `/api/register`    | Register new users       |
| POST   | `/api/login`       | User login               |
| POST   | `/api/product`    | Create a new product     |
| PUT    | `/api/product/:id`| Edit product by ID       |
| GET    | `/api/product`    | Fetch all products       |
| DELETE | `/api/product/:id`| Delete product by ID     |

---

## Application Architecture
User → Rate Limiter → APIs → Server → MongoDB

---

## Getting Started
### Build locally
1️. Install dependencies
```
npm install
```
2. Start the development server
```
npm run build
npm start
```
App will be available at http://localhost:3000

### Build with docker
```
docker build -t my-app .
docker run -p 3000:3000 my-app
```

---

## Notes
* Ensure your MongoDB URI and environment variables are correctly configured in a .env file.
* User roles determine access to product creation/edit/delete features.
