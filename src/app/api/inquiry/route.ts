import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Inquiry from '../../models/Inquiry';
import Product from '../../models/Product';

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
    const inquiries = await Inquiry.find().populate('items.productId', 'name sku chip platform');
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