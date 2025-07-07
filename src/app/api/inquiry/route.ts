import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import Inquiry from '../../models/Inquiry';
import Product from '../../models/Product';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const body = await req.json();
    const { company, contact, items, submitter } = body;
    if (!company || !contact || !Array.isArray(items) || items.length === 0 || !submitter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Validate product IDs
    for (const item of items) {
      if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId) || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: 'Invalid product or quantity' }, { status: 400 });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
    }
    const inquiry = await Inquiry.create({ company, contact, items, submitter });
    
    // Send email notification
    try {
      // Get product details for the email
      const populatedItems = await Promise.all(
        items.map(async (item: any) => {
          const product = await Product.findById(item.productId);
          return {
            ...item,
            productName: product?.name || 'Unknown Product',
            productSku: product?.sku || 'Unknown SKU'
          };
        })
      );

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Product Inquiry</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .product-item { background-color: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .label { font-weight: bold; color: #555; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; color: #2c3e50;">New Product Inquiry Received</h1>
            </div>
            
            <div class="section">
              <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Inquiry Details</h2>
              <p><span class="label">Company:</span> ${company}</p>
              <p><span class="label">Contact:</span> ${contact}</p>
              <p><span class="label">Submitted by:</span> ${submitter}</p>
              <p><span class="label">Date:</span> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="section">
              <h2 style="color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Requested Products</h2>
              ${populatedItems.map((item: any) => `
                <div class="product-item">
                  <p><span class="label">Product:</span> ${item.productName}</p>
                  <p><span class="label">SKU:</span> ${item.productSku}</p>
                  <p><span class="label">Quantity:</span> ${item.quantity}</p>
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              <p>This inquiry was submitted through the Inventec website. Please review and respond to this inquiry as soon as possible.</p>
              <p>Thank you,<br>Inventec Website System</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'kaiwei0323@gmail.com',
        subject: `New Product Inquiry - ${company}`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the inquiry submission if email fails
    }
    
    return NextResponse.json({ success: true, inquiry });
  } catch (err: any) {
    console.error('Inquiry API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit inquiry' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const inquiries = await Inquiry.find().populate('items.productId', 'name sku chip platform').sort({ createdAt: -1 });
    return NextResponse.json(inquiries);
  } catch (err: any) {
    console.error('Inquiry API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    if (!id || (action !== 'fulfill' && action !== 'process')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    let newStatus = '';
    if (action === 'fulfill') newStatus = 'complete';
    if (action === 'process') newStatus = 'processing';
    let updateFields: any = { status: newStatus };
    if (action === 'fulfill') updateFields.completedAt = new Date();
    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, inquiry });
  } catch (err: any) {
    console.error('Inquiry PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update inquiry status' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }
    const deleted = await Inquiry.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Inquiry DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete inquiry' }, { status: 500 });
  }
} 