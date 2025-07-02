# Family Image Feature

## Overview
The family image feature allows you to display different images for product families on the main product page versus individual SKU images on the product detail pages.

## How It Works

### Product Page (Family View)
- Shows family-level images using the `familyImgUrl` field
- If `familyImgUrl` is not provided, falls back to the first product's `imgUrl`
- If neither is available, shows a placeholder image

### Product Detail Page (SKU View)
- Shows individual SKU images using the `imgUrl` field for each product
- Each SKU can have its own unique image

## Implementation Details

### Database Schema
- Added `familyImgUrl` field to the Product model
- This field is optional and can be left empty

### Components Updated
1. **Product Model** (`src/app/models/Product.js`)
   - Added `familyImgUrl` field

2. **AllProduct Component** (`src/app/components/layout/AllProduct.js`)
   - Updated to use `familyImgUrl` when available
   - Falls back to `imgUrl` if `familyImgUrl` is not provided

3. **Create Product Page** (`src/app/createproduct/page.tsx`)
   - Added form field for `familyImgUrl`
   - Added preview functionality for family images

4. **Product Detail Page** (`src/app/productDetail/family/[familyName]/page.tsx`)
   - Updated interface to include `familyImgUrl` field

### Migration
- Created migration script at `/api/product/migrate`
- Run this once to add the `familyImgUrl` field to existing products

## Usage

### For New Products
1. Go to the Create Product page
2. Fill in the "Product Image" field with the individual SKU image
3. Fill in the "Family Image" field with the family-level image (optional)
4. If family image is not provided, the product image will be used for the family

### For Existing Products
1. Run the migration script: `POST /api/product/migrate`
2. Edit existing products to add family images as needed

### Example Use Cases
- **Family Image**: A generic product family photo showing the overall design
- **SKU Images**: Specific photos showing different configurations, colors, or variants

## Benefits
- Better visual organization of products
- Clear distinction between family overview and individual SKU details
- Maintains backward compatibility with existing products
- Flexible implementation that doesn't break existing functionality 