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
    
    // Specifications - Include all product schema fields in proper order
    const specFields = [
      'name', 'sku', 'pn', 'family', 'category', 'platform', 'processor', 
      'ai_accelerator', 'tops', 'memory', 'storage', 'os', 'wireless', 
      'bluetooth', 'I_O', 'button', 'ethernet', 'hdmi', 'power', 'cooling_fan', 
      'expansion_slots', 'operating_temperature', 'mechanical_dimension', 'weight', 
      'di_do', 'display', 'audio', 'camera', 'battery', 'certification', 'tag', 'status'
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
      'cooling_fan': 'Cooling & Fan',
      'expansion_slots': 'Expansion Slots',
      'pn': 'Part Number',
      'sku': 'SKU'
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
    
    // Calculate column widths based on number of products - evenly distributed
    const tableX = 30; // Reduced left margin to use more space
    const tableWidth = 535; // Increased total table width
    const specColumnWidth = 200; // Increased width for specification column
    const productCount = products.length;
    const productColumnWidth = (tableWidth - specColumnWidth) / productCount;
    
    // Header background
    page.drawRectangle({
      x: tableX,
      y: headerY - 5,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.1, 0.3, 0.6)
    });
    
    page.drawText('Specification', {
      x: tableX + 10,
      y: headerY + 5,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1)
    });
    
    // Draw product headers
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const x = tableX + specColumnWidth + (i * productColumnWidth);
      // Allow longer product names with better truncation
      let productName = product.name || `Product ${i + 1}`;
      const maxNameLength = Math.floor(productColumnWidth / 6); // Increased from 7 to 6 for more characters
      if (productName.length > maxNameLength) {
        productName = productName.substring(0, maxNameLength - 3) + '...';
      }
      page.drawText(productName, {
        x: x + 5,
        y: headerY + 5,
        size: 11, // Slightly smaller font to fit more text
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
          size: 11,
          font: boldFont,
          color: rgb(1, 1, 1)
        });
        
        for (let j = 0; j < products.length; j++) {
          const x = tableX + specColumnWidth + (j * productColumnWidth);
          let productName = products[j].name || `Product ${j + 1}`;
          const maxNameLength = Math.floor(productColumnWidth / 6);
          if (productName.length > maxNameLength) {
            productName = productName.substring(0, maxNameLength - 3) + '...';
          }
          currentPage.drawText(productName, {
            x: x + 5,
            y: y + 5,
            size: 11,
            font: boldFont,
            color: rgb(1, 1, 1)
          });
        }
        y -= 50; // More space after headers on new page
      }
      
      // Field name with proper formatting to match compare section
      let fieldName = fieldMappings[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      // Calculate dynamic row height first
      let maxRowHeight = 25; // Increased default row height
      const fontSize = 9;
      const lineHeight = fontSize + 4; // Increased line height for better spacing
      
      // Pre-calculate max row height for all products in this field
      for (let j = 0; j < products.length; j++) {
        const product = products[j];
        const value = product[field];
        let displayValue = 'N/A';
        
        if (value !== undefined && value !== null && value !== '') {
          displayValue = String(value);
        }
        
        const maxWidth = productColumnWidth - 10;
        const words = displayValue.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              lines.push(word.substring(0, Math.floor(maxWidth / (fontSize * 0.6)) - 3) + '...');
              currentLine = '';
            }
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        const cellHeight = Math.max(25, lines.length * lineHeight + 4); // Added extra padding
        maxRowHeight = Math.max(maxRowHeight, cellHeight);
      }
      
      // Clean row styling with subtle borders
      // Draw bottom border for each row to create clean separation
      currentPage.drawLine({
        start: { x: tableX, y: y - 7 },
        end: { x: tableX + tableWidth, y: y - 7 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9)
      });
      
      // Draw vertical separator between specification and product columns
      currentPage.drawLine({
        start: { x: tableX + specColumnWidth, y: y - 7 },
        end: { x: tableX + specColumnWidth, y: y - 7 + maxRowHeight },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9)
      });
      
      currentPage.drawText(fieldName, {
        x: tableX + 10,
        y: y,
        size: 11,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2)
      });
      
      // Product values in columns with dynamic height
      for (let j = 0; j < products.length; j++) {
        const product = products[j];
        const value = product[field];
        let displayValue = 'N/A';
        
        if (value !== undefined && value !== null && value !== '') {
          // Convert to string and handle different types
          const stringValue = String(value);
          displayValue = stringValue;
        }
        
        const x = tableX + specColumnWidth + (j * productColumnWidth);
        
        // Calculate text wrapping for this cell
        const maxWidth = productColumnWidth - 10; // Leave some padding
        const words = displayValue.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              // Single word is too long, truncate it
              lines.push(word.substring(0, Math.floor(maxWidth / (fontSize * 0.6)) - 3) + '...');
              currentLine = '';
            }
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Draw text lines with better spacing
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const lineY = y - (lineIndex * lineHeight) - 2; // Added top padding
          currentPage.drawText(lines[lineIndex], {
            x: x + 5,
            y: lineY,
            size: fontSize,
            font,
            color: rgb(0.2, 0.2, 0.2)
          });
        }
      }
      
      y -= maxRowHeight + 8; // Increased spacing between rows to prevent overlap
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