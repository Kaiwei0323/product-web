import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    console.log('=== SIMPLE EXPORT START ===');
    
    const body = await req.json();
    console.log('Request body:', { 
      productsCount: body.products?.length,
      companyName: body.companyName 
    });
    
    const { products, companyName } = body;
    
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Products data is required' }, { status: 400 });
    }

    console.log('Creating PDF...');
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    console.log('Page created');
    
    // Title with better styling
    page.drawText('Product Comparison Report', {
      x: 50,
      y: 750,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    
    // Date
    const date = new Date().toLocaleDateString();
    page.drawText(`Generated: ${date}`, {
      x: 50,
      y: 720,
      size: 12,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Separator line
    page.drawLine({
      start: { x: 50, y: 680 },
      end: { x: 545, y: 680 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    console.log('Headers added');
    
    // Product headers with better styling - match compare section format
    let y = 650;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Product header background
      page.drawRectangle({
        x: 50,
        y: y - 5,
        width: 495,
        height: 25,
        color: rgb(0.1, 0.3, 0.6)
      });
      
      page.drawText(`${i + 1}. ${product.name}`, {
        x: 60,
        y: y + 5,
        size: 14,
        font: boldFont,
        color: rgb(1, 1, 1)
      });
      y -= 35; // More space between product headers
    }
    
    console.log('Product headers added');
    
    // Specifications - Match the exact format and order from compare section
    const specFields = [
      'category', 'platform', 'processor', 'ai_accelerator', 'tops', 'memory', 
      'storage', 'os', 'wireless', 'bluetooth', 'ethernet', 'hdmi', 'power', 
      'cooling_fan', 'operating_temperature', 'mechanical_dimension', 'weight', 
      'di_do', 'display', 'audio', 'camera', 'battery', 'certification', 'tag'
    ];
    
    // Field name mappings to match the compare section
    const fieldMappings: { [key: string]: string } = {
      'os': 'OS',
      'hdmi': 'HDMI',
      'di_do': 'DI/DO',
      'I_O': 'I/O',
      'ai_accelerator': 'AI Accelerator',
      'operating_temperature': 'Operating Temperature',
      'mechanical_dimension': 'Mechanical Dimension',
      'cooling_fan': 'Cooling & Fan'
    };
    
    y = 550;
    page.drawText('Product Specifications Comparison:', {
      x: 50,
      y: y,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.3, 0.6)
    });
    y -= 50; // More space before table
    
    // Draw table headers with background
    const headerY = y;
    const headerHeight = 25;
    
    // Header background
    page.drawRectangle({
      x: 50,
      y: headerY - 5,
      width: 495,
      height: headerHeight,
      color: rgb(0.1, 0.3, 0.6)
    });
    
    page.drawText('Specification', {
      x: 60,
      y: headerY + 5,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    
    // Calculate column widths based on number of products - evenly distributed
    const tableX = 50;
    const tableWidth = 495; // total table width
    const specColumnWidth = 180; // fixed width for specification column
    const productCount = products.length;
    const productColumnWidth = (tableWidth - specColumnWidth) / productCount;
    
    // Draw product headers
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const x = tableX + specColumnWidth + (i * productColumnWidth);
      // Truncate product name to fit column
      let productName = product.name || `Product ${i + 1}`;
      const maxNameLength = Math.floor(productColumnWidth / 7);
      if (productName.length > maxNameLength) {
        productName = productName.substring(0, maxNameLength - 3) + '...';
      }
      page.drawText(productName, {
        x: x + 5,
        y: headerY + 5,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1)
      });
    }
    y -= 40; // More space after table header
    
    // Draw specification rows
    let currentPage = page;
    for (let i = 0; i < specFields.length; i++) {
      const field = specFields[i];
      
      // Check if we need a new page
      if (y < 120) { // Higher threshold for page breaks
        // Add new page
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        y = 750;
        
        // Redraw headers on new page with background
        currentPage.drawRectangle({
          x: tableX,
          y: y - 5,
          width: tableWidth,
          height: 25,
          color: rgb(0.1, 0.3, 0.6)
        });
        
        currentPage.drawText('Specification', {
          x: tableX + 10,
          y: y + 5,
          size: 12,
          font: boldFont,
          color: rgb(1, 1, 1)
        });
        
        for (let j = 0; j < products.length; j++) {
          const x = tableX + specColumnWidth + (j * productColumnWidth);
          let productName = products[j].name || `Product ${j + 1}`;
          const maxNameLength = Math.floor(productColumnWidth / 7);
          if (productName.length > maxNameLength) {
            productName = productName.substring(0, maxNameLength - 3) + '...';
          }
          currentPage.drawText(productName, {
            x: x + 5,
            y: y + 5,
            size: 12,
            font: boldFont,
            color: rgb(1, 1, 1)
          });
        }
        y -= 50; // More space after headers on new page
      }
      
      // Field name with proper formatting to match compare section
      let fieldName = fieldMappings[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Alternating row background
      const rowIndex = Math.floor((y - headerY + 30) / 20);
      if (rowIndex % 2 === 0) {
        currentPage.drawRectangle({
          x: tableX,
          y: y - 5,
          width: tableWidth,
          height: 20,
          color: rgb(0.98, 0.98, 0.98)
        });
      }
      
      currentPage.drawText(fieldName, {
        x: tableX + 10,
        y: y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Product values in columns
      for (let j = 0; j < products.length; j++) {
        const product = products[j];
        const value = product[field];
        let displayValue = 'N/A';
        
        if (value !== undefined && value !== null) {
          // Convert to string and handle different types
          const stringValue = String(value);
          // Adjust truncation based on column width
          const maxLength = Math.floor(productColumnWidth / 5);
          displayValue = stringValue.length > maxLength ? stringValue.substring(0, maxLength - 3) + '...' : stringValue;
        }
        
        const x = tableX + specColumnWidth + (j * productColumnWidth);
        
        currentPage.drawText(displayValue, {
          x: x + 5,
          y: y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2)
        });
      }
      
      y -= 30; // More space between specification rows for better readability
    }
    
    console.log('Specifications added');
    
    // Add watermarks to all pages (same as download spec functionality)
    const pages = pdfDoc.getPages();
    const currentDate = new Date().toLocaleDateString();
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      // Define watermark configuration (same as watermark API)
      const watermarkConfig = {
        // Header section
        header: {
          text: companyName,
          fontSize: 18,
          y: height - 40,
          opacity: 0.4,
          color: rgb(0.4, 0.4, 0.4)
        },
        
        // Footer section
        footer: {
          text: `Downloaded by ${companyName} | ${currentDate}`,
          fontSize: 12,
          y: 30,
          opacity: 0.4,
          color: rgb(0.4, 0.4, 0.4)
        },
        
        // Corner watermarks
        corners: {
          fontSize: 14,
          opacity: 0.3,
          color: rgb(0.5, 0.5, 0.5),
          margin: 25
        },
        
        // Center watermark
        center: {
          text: `${companyName}`,
          fontSize: 36,
          opacity: 0.2,
          color: rgb(0.6, 0.6, 0.6)
        },
        
        // Page number
        pageNumber: {
          fontSize: 10,
          opacity: 0.5,
          color: rgb(0.3, 0.3, 0.3),
          margin: 15
        }
      };
      
      // Add header watermark (centered)
      const headerTextWidth = font.widthOfTextAtSize(watermarkConfig.header.text, watermarkConfig.header.fontSize);
      page.drawText(watermarkConfig.header.text, {
        x: (width - headerTextWidth) / 2,
        y: watermarkConfig.header.y,
        size: watermarkConfig.header.fontSize,
        font,
        color: watermarkConfig.header.color,
        opacity: watermarkConfig.header.opacity
      });
      
      // Add footer watermark (centered)
      const footerTextWidth = font.widthOfTextAtSize(watermarkConfig.footer.text, watermarkConfig.footer.fontSize);
      page.drawText(watermarkConfig.footer.text, {
        x: (width - footerTextWidth) / 2,
        y: watermarkConfig.footer.y,
        size: watermarkConfig.footer.fontSize,
        font,
        color: watermarkConfig.footer.color,
        opacity: watermarkConfig.footer.opacity
      });
      
      // Add corner watermarks (organized)
      const cornerText = companyName;
      const cornerTextWidth = font.widthOfTextAtSize(cornerText, watermarkConfig.corners.fontSize);
      
      // Top-left corner
      page.drawText(cornerText, {
        x: watermarkConfig.corners.margin,
        y: height - watermarkConfig.corners.margin - 10,
        size: watermarkConfig.corners.fontSize,
        font,
        color: watermarkConfig.corners.color,
        opacity: watermarkConfig.corners.opacity
      });
      
      // Top-right corner
      page.drawText(cornerText, {
        x: width - cornerTextWidth - watermarkConfig.corners.margin,
        y: height - watermarkConfig.corners.margin - 10,
        size: watermarkConfig.corners.fontSize,
        font,
        color: watermarkConfig.corners.color,
        opacity: watermarkConfig.corners.opacity
      });
      
      // Bottom-left corner
      page.drawText(cornerText, {
        x: watermarkConfig.corners.margin,
        y: watermarkConfig.corners.margin + 10,
        size: watermarkConfig.corners.fontSize,
        font,
        color: watermarkConfig.corners.color,
        opacity: watermarkConfig.corners.opacity
      });
      
      // Bottom-right corner
      page.drawText(cornerText, {
        x: width - cornerTextWidth - watermarkConfig.corners.margin,
        y: watermarkConfig.corners.margin + 10,
        size: watermarkConfig.corners.fontSize,
        font,
        color: watermarkConfig.corners.color,
        opacity: watermarkConfig.corners.opacity
      });
      
      // Add center watermark (subtle background)
      const centerTextWidth = font.widthOfTextAtSize(watermarkConfig.center.text, watermarkConfig.center.fontSize);
      const centerTextHeight = font.heightAtSize(watermarkConfig.center.fontSize);
      
      page.drawText(watermarkConfig.center.text, {
        x: (width - centerTextWidth) / 2,
        y: (height - centerTextHeight) / 2,
        size: watermarkConfig.center.fontSize,
        font,
        color: watermarkConfig.center.color,
        opacity: watermarkConfig.center.opacity
      });
      
      // Add page number (bottom-right, small)
      const pageText = `${i + 1}`;
      const pageTextWidth = font.widthOfTextAtSize(pageText, watermarkConfig.pageNumber.fontSize);
      
      page.drawText(pageText, {
        x: width - pageTextWidth - watermarkConfig.pageNumber.margin,
        y: watermarkConfig.pageNumber.margin,
        size: watermarkConfig.pageNumber.fontSize,
        font,
        color: watermarkConfig.pageNumber.color,
        opacity: watermarkConfig.pageNumber.opacity
      });
      
      // Add subtle diagonal watermark pattern (very light)
      const patternSpacing = 300;
      const patternFontSize = 24;
      const patternText = companyName;
      
      for (let row = 0; row <= Math.ceil(height / patternSpacing); row++) {
        for (let col = 0; col <= Math.ceil(width / patternSpacing); col++) {
          const x = col * patternSpacing;
          const y = height - (row * patternSpacing);
          
          // Only add if within page bounds
          if (x < width && y > 0) {
            page.drawText(patternText, {
              x,
              y,
              size: patternFontSize,
              font,
              color: rgb(0.95, 0.95, 0.95), // Very light gray
              opacity: 0.08 // Very subtle
            });
          }
        }
      }
    }
    
    console.log('Watermarks added');
    console.log('Saving PDF...');
    
    const pdfBytes = await pdfDoc.save();
    console.log('PDF saved, size:', pdfBytes.byteLength);
    console.log('=== SIMPLE EXPORT SUCCESS ===');
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="comparison_${companyName}_${date}.pdf"`,
      },
    });

  } catch (error) {
    console.error('=== SIMPLE EXPORT ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: `Simple export failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 