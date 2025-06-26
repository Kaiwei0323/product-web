import Product from "../../models/Product";
import mongoose from "mongoose";
import { withRateLimit } from "../../models/RateLimiter";  // adjust path accordingly

// Original handlers
async function createProduct(req) {
  const body = await req.json();
  console.log('Create product request body:', body);
  console.log('Cooling & Fan in request:', body.cooling_fan);
  
  await mongoose.connect(process.env.MONGO_URL);
  const createdProduct = await Product.create(body);
  console.log('Created product result:', createdProduct);
  
  return Response.json(createdProduct);
}

async function getProducts(req) {
  await mongoose.connect(process.env.MONGO_URL);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const product = await Product.findById(id);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }
    return Response.json(product);
  }
  const products = await Product.find();
  return Response.json(products);
}

async function deleteProduct(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    await Product.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to delete product" }), {
      status: 500,
    });
  }
}

async function updateProduct(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  console.log('=== UPDATE PRODUCT DEBUG START ===');
  console.log('Product ID:', id);

  if (!id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
    });
  }

  try {
    const body = await req.json();
    console.log('1. Raw request body:', JSON.stringify(body, null, 2));
    console.log('2. Cooling & Fan in request:', body.cooling_fan);
    console.log('3. Type of cooling_fan:', typeof body.cooling_fan);
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log('4. MongoDB connected');

    // Get the current product to see what's in the database
    const currentProduct = await Product.findById(id);
    console.log('5. Current product in database:', JSON.stringify(currentProduct?.toObject(), null, 2));
    console.log('6. Current cooling_fan value:', currentProduct?.cooling_fan);

    // Ensure cooling_fan field is explicitly included
    const updateData = {
      ...body,
      cooling_fan: body.cooling_fan || '' // Ensure it's always included, even if empty
    };
    
    console.log('7. Final update data:', JSON.stringify(updateData, null, 2));
    console.log('8. Update data keys:', Object.keys(updateData));
    console.log('9. cooling_fan in updateData:', updateData.cooling_fan);
    console.log('10. Type of cooling_fan in updateData:', typeof updateData.cooling_fan);

    // Try updating directly first
    console.log('11. About to perform database update...');
    let updatedProduct = await Product.findOneAndUpdate(
      { _id: id }, 
      { $set: updateData }, // Use $set to force all fields to be updated
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('12. Database update completed');
    console.log('13. Updated product result:', JSON.stringify(updatedProduct?.toObject(), null, 2));
    console.log('14. Updated product cooling_fan:', updatedProduct?.cooling_fan);
    console.log('15. Updated product keys:', updatedProduct ? Object.keys(updatedProduct.toObject()) : 'No product found');

    // If cooling_fan is still missing, try alternative approach
    if (!updatedProduct?.cooling_fan && updateData.cooling_fan) {
      console.log('15a. Cooling_fan missing, trying alternative approach...');
      
      // Try using save() method with explicit field setting
      const productToUpdate = await Product.findById(id);
      if (productToUpdate) {
        productToUpdate.cooling_fan = updateData.cooling_fan;
        console.log('15b. Setting cooling_fan on product:', productToUpdate.cooling_fan);
        updatedProduct = await productToUpdate.save();
        console.log('15c. Alternative update result:', JSON.stringify(updatedProduct?.toObject(), null, 2));
        console.log('15d. Alternative cooling_fan:', updatedProduct?.cooling_fan);
      }
      
      // If still missing, try direct MongoDB update
      if (!updatedProduct?.cooling_fan) {
        console.log('15e. Still missing, trying direct MongoDB update...');
        const directUpdate = await Product.updateOne(
          { _id: id },
          { $set: { cooling_fan: updateData.cooling_fan } }
        );
        console.log('15f. Direct update result:', directUpdate);
        
        // Fetch the updated product
        updatedProduct = await Product.findById(id);
        console.log('15g. After direct update - cooling_fan:', updatedProduct?.cooling_fan);
      }
    }

    // Double-check by fetching the product again
    console.log('16. Double-checking by fetching product again...');
    const doubleCheckProduct = await Product.findById(id);
    console.log('17. Double-check product:', JSON.stringify(doubleCheckProduct?.toObject(), null, 2));
    console.log('18. Double-check cooling_fan:', doubleCheckProduct?.cooling_fan);

    if (!updatedProduct) {
      console.log('19. ERROR: Product not found after update');
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    console.log('=== UPDATE PRODUCT DEBUG END ===');
    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (err) {
    console.error('=== UPDATE PRODUCT ERROR ===');
    console.error('Error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    return new Response(JSON.stringify({ error: "Failed to update product" }), {
      status: 500,
    });
  }
}

// Wrap handlers with rate limiter
export const POST = withRateLimit(createProduct, { limit: 100, windowMs: 1000 });
export const GET = withRateLimit(getProducts, { limit: 100, windowMs: 1000 });
export const DELETE = withRateLimit(deleteProduct, { limit: 100, windowMs: 1000 });
export const PUT = withRateLimit(updateProduct, { limit: 100, windowMs: 1000 });
