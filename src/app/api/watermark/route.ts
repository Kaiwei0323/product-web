import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const { pdfUrl, productName, companyName } = await req.json();
    
    console.log('Watermark request:', { pdfUrl, productName, companyName });
    
    if (!pdfUrl) {
      return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 });
    }

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // Construct full URL if it's relative
    let fullPdfUrl = pdfUrl;
    if (pdfUrl.startsWith('/')) {
      fullPdfUrl = `${req.nextUrl.origin}${pdfUrl}`;
    }
    
    console.log('Full PDF URL:', fullPdfUrl);

    // Download the original PDF
    const pdfResponse = await fetch(fullPdfUrl);
    console.log('PDF response status:', pdfResponse.status);
    
    if (!pdfResponse.ok) {
      console.error('PDF fetch failed:', pdfResponse.status, pdfResponse.statusText);
      return NextResponse.json({ 
        error: `Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}` 
      }, { status: 404 });
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    console.log('PDF bytes length:', pdfBytes.byteLength);
    
    if (pdfBytes.byteLength === 0) {
      return NextResponse.json({ error: 'PDF file is empty' }, { status: 400 });
    }
    
    // Load the PDF document
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDF loaded successfully');
    } catch (pdfError) {
      console.error('PDF load error:', pdfError);
      return NextResponse.json({ 
        error: `Failed to load PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}` 
      }, { status: 400 });
    }
    
    const pages = pdfDoc.getPages();
    console.log('Number of pages:', pages.length);
    
    // Get the standard font
    let font;
    try {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      console.log('Font embedded successfully');
    } catch (fontError) {
      console.error('Font embedding error:', fontError);
      return NextResponse.json({ 
        error: `Failed to embed font: ${fontError instanceof Error ? fontError.message : 'Unknown error'}` 
      }, { status: 500 });
    }
    
    // Add organized watermarks to each page
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const currentDate = new Date().toLocaleDateString();
      
      // Define organized watermark layout
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
      const pageText = `${index + 1}`;
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
    });
    
    console.log('Watermarks added successfully');
    
    // Save the watermarked PDF
    let watermarkedPdfBytes;
    try {
      watermarkedPdfBytes = await pdfDoc.save();
      console.log('PDF saved successfully, size:', watermarkedPdfBytes.byteLength);
    } catch (saveError) {
      console.error('PDF save error:', saveError);
      return NextResponse.json({ 
        error: `Failed to save watermarked PDF: ${saveError instanceof Error ? saveError.message : 'Unknown error'}` 
      }, { status: 500 });
    }
    
    // Return the watermarked PDF as a response
    return new NextResponse(watermarkedPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${productName}_${companyName}_specs.pdf"`,
      },
    });

  } catch (error) {
    console.error('Watermark API error:', error);
    return NextResponse.json(
      { error: 'Failed to process watermark request' },
      { status: 500 }
    );
  }
} 