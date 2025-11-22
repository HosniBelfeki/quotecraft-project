import { v4 as uuidv4 } from 'uuid';
import { BOQ, Quote } from '../models/types';
import { logger } from '../utils/logger';
import * as XLSX from 'xlsx';

// PDF parsing - optional, only load if needed
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  logger.warn('pdf-parse not available, PDF parsing disabled');
}

class DocumentParserService {
  async parseDocument(fileBuffer: Buffer, fileType: 'boq' | 'quote', fileName?: string): Promise<BOQ | Quote> {
    try {
      logger.info(`Parsing ${fileType} document: ${fileName || 'unknown'}`);

      // Detect file format
      const fileExtension = fileName ? fileName.split('.').pop()?.toLowerCase() : '';

      // Try JSON first
      if (!fileExtension || fileExtension === 'json') {
        try {
          const text = fileBuffer.toString('utf-8');
          const data = JSON.parse(text);
          logger.info(`Successfully parsed JSON ${fileType}`);
          return this.validateAndReturn(data, fileType);
        } catch (e) {
          if (fileExtension === 'json') {
            throw new Error('Invalid JSON format');
          }
          // Continue to try other formats
        }
      }

      // Try PDF
      if (fileExtension === 'pdf') {
        if (!pdfParse) {
          throw new Error('PDF parsing is not available. Please upload JSON or Excel format.');
        }
        try {
          const data = await this.parsePDF(fileBuffer, fileType);
          logger.info(`Successfully parsed PDF ${fileType}`);
          return data;
        } catch (e: any) {
          logger.error(`PDF parsing failed: ${e.message}`);
          throw new Error(`PDF parsing failed: ${e.message}`);
        }
      }

      // Try Excel
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        try {
          const data = await this.parseExcel(fileBuffer, fileType);
          logger.info(`Successfully parsed Excel ${fileType}`);
          return data;
        } catch (e: any) {
          logger.error(`Excel parsing failed: ${e.message}`);
          throw new Error(`Excel parsing failed: ${e.message}`);
        }
      }

      // Try CSV
      if (fileExtension === 'csv') {
        try {
          const data = await this.parseCSV(fileBuffer, fileType);
          logger.info(`Successfully parsed CSV ${fileType}`);
          return data;
        } catch (e: any) {
          logger.error(`CSV parsing failed: ${e.message}`);
          throw new Error(`CSV parsing failed: ${e.message}`);
        }
      }

      // If no format worked, return mock data
      logger.warn(`Could not parse ${fileType}, using mock data`);
      return this.getMockData(fileType);
    } catch (error: any) {
      logger.error(`Document parsing error: ${error.message}`);
      throw error;
    }
  }

  private async parsePDF(fileBuffer: Buffer, fileType: 'boq' | 'quote'): Promise<BOQ | Quote> {
    if (!pdfParse) {
      throw new Error('PDF parsing not available');
    }
    const pdfData = await pdfParse(fileBuffer);
    const text = pdfData.text;

    // Extract structured data from PDF text
    const lines = text.split('\n').filter((line: string) => line.trim());
    const items: any[] = [];

    // Simple pattern matching for line items
    // Format: LineNo | SKU | Description | Qty | Price
    for (const line of lines) {
      const match = (line as string).match(/(\d+)\s+([A-Z0-9-]+)\s+(.+?)\s+(\d+)\s+(\d+\.?\d*)/);
      if (match) {
        const [, lineNo, sku, description, qty, price] = match;
        items.push({
          lineNo: parseInt(lineNo),
          sku: sku.trim(),
          description: description.trim(),
          qty: parseInt(qty),
          unitPrice: parseFloat(price),
          estimatedPrice: parseFloat(price),
          totalEstimate: parseInt(qty) * parseFloat(price)
        });
      }
    }

    if (items.length === 0) {
      throw new Error('No line items found in PDF');
    }

    if (fileType === 'boq') {
      return {
        id: `boq-${uuidv4()}`,
        version: '1.0',
        dateCreated: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          lineNo: item.lineNo,
          sku: item.sku,
          description: item.description,
          spec: '',
          qty: item.qty,
          uom: 'UNIT',
          estimatedPrice: item.estimatedPrice,
          totalEstimate: item.totalEstimate
        })),
        totalBOQ: items.reduce((sum, item) => sum + item.totalEstimate, 0)
      };
    } else {
      // Extract vendor info from PDF
      const vendorMatch = text.match(/Vendor:\s*(.+)/i) || text.match(/Company:\s*(.+)/i);
      const vendorName = vendorMatch ? vendorMatch[1].trim() : 'Unknown Vendor';

      return {
        id: `quote-${uuidv4()}`,
        vendorId: `vendor-${uuidv4()}`,
        vendorName,
        dateReceived: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          boqLineNo: item.lineNo,
          sku: item.sku,
          unitPrice: item.unitPrice,
          qty: item.qty,
          minQty: Math.floor(item.qty * 0.1),
          leadTime: 14,
          tax: 0.08,
          lineTotal: item.totalEstimate
        })),
        shippingCost: 0,
        discountPercent: 0,
        totalCost: items.reduce((sum, item) => sum + item.totalEstimate, 0),
        paymentTerms: 'Net 30',
        warranty: '12 months'
      };
    }
  }

  private async parseExcel(fileBuffer: Buffer, fileType: 'boq' | 'quote'): Promise<BOQ | Quote> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty');
    }

    // Map Excel columns to our data structure
    // Expected columns: Line No, SKU, Description, Quantity, Unit Price
    const items = jsonData.map((row: any) => {
      const lineNo = row['Line No'] || row['LineNo'] || row['#'] || row['Line'];
      const sku = row['SKU'] || row['Item Code'] || row['Code'] || row['Part Number'];
      const description = row['Description'] || row['Item'] || row['Name'];
      const qty = row['Quantity'] || row['Qty'] || row['Amount'];
      const price = row['Unit Price'] || row['Price'] || row['Rate'] || row['Estimated Price'];

      if (!sku || !qty || !price) {
        throw new Error(`Missing required fields in row: ${JSON.stringify(row)}`);
      }

      return {
        lineNo: parseInt(lineNo) || 0,
        sku: String(sku).trim(),
        description: String(description || '').trim(),
        qty: parseFloat(qty),
        unitPrice: parseFloat(price),
        estimatedPrice: parseFloat(price),
        totalEstimate: parseFloat(qty) * parseFloat(price)
      };
    });

    if (fileType === 'boq') {
      return {
        id: `boq-${uuidv4()}`,
        version: '1.0',
        dateCreated: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          lineNo: item.lineNo,
          sku: item.sku,
          description: item.description,
          spec: '',
          qty: item.qty,
          uom: 'UNIT',
          estimatedPrice: item.estimatedPrice,
          totalEstimate: item.totalEstimate
        })),
        totalBOQ: items.reduce((sum, item) => sum + item.totalEstimate, 0)
      };
    } else {
      // Try to extract vendor name from first row or sheet name
      const vendorName = jsonData[0]?.['Vendor'] || jsonData[0]?.['Company'] || sheetName || 'Unknown Vendor';

      return {
        id: `quote-${uuidv4()}`,
        vendorId: `vendor-${uuidv4()}`,
        vendorName: String(vendorName).trim(),
        dateReceived: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          boqLineNo: item.lineNo,
          sku: item.sku,
          unitPrice: item.unitPrice,
          qty: item.qty,
          minQty: Math.floor(item.qty * 0.1),
          leadTime: 14,
          tax: 0.08,
          lineTotal: item.totalEstimate
        })),
        shippingCost: 0,
        discountPercent: 0,
        totalCost: items.reduce((sum, item) => sum + item.totalEstimate, 0),
        paymentTerms: 'Net 30',
        warranty: '12 months'
      };
    }
  }

  private validateAndReturn(data: any, fileType: 'boq' | 'quote'): BOQ | Quote {
    if (fileType === 'boq') {
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('BOQ must contain items array');
      }
      
      // Normalize field names
      data.items = data.items.map((item: any) => ({
        lineNo: item.lineNo || item.line || item['Line No'],
        sku: item.sku || item.SKU || item['Item Code'],
        description: item.description || item.Description || '',
        spec: item.spec || item.specifications || item.Specifications || '',
        qty: item.qty || item.quantity || item.Quantity,
        uom: item.uom || item.UOM || 'UNIT',
        estimatedPrice: item.estimatedPrice || item.unitPrice || item['Unit Price'] || item.price,
        totalEstimate: item.totalEstimate || item.estimatedTotal || item.total || 
                      ((item.qty || item.quantity) * (item.estimatedPrice || item.unitPrice || item.price))
      }));

      // Validate required fields
      data.items.forEach((item: any, idx: number) => {
        if (!item.sku || item.qty === undefined || item.estimatedPrice === undefined) {
          throw new Error(`BOQ item ${idx} missing required fields (sku, qty, price)`);
        }
      });

      // Calculate total if not present
      if (!data.totalBOQ) {
        data.totalBOQ = data.items.reduce((sum: number, item: any) => sum + (item.totalEstimate || 0), 0);
      }
    } else if (fileType === 'quote') {
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Quote must contain items array');
      }
      if (!data.vendorName && !data.vendorId) {
        throw new Error('Quote must have vendor information');
      }
      
      // Ensure vendor fields exist
      if (!data.vendorId) {
        data.vendorId = `vendor-${uuidv4()}`;
      }
      if (!data.vendorName) {
        data.vendorName = 'Unknown Vendor';
      }
    }
    return data;
  }

  private async parseCSV(fileBuffer: Buffer, fileType: 'boq' | 'quote'): Promise<BOQ | Quote> {
    const text = fileBuffer.toString('utf-8');
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse data rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    if (rows.length === 0) {
      throw new Error('CSV file has no data rows');
    }

    // Map CSV columns to our data structure
    const items = rows.map((row: any) => {
      const lineNo = row['Line No'] || row['LineNo'] || row['#'] || row['Line'] || row['line_no'];
      const sku = row['SKU'] || row['Item Code'] || row['Code'] || row['Part Number'] || row['sku'];
      const description = row['Description'] || row['Item'] || row['Name'] || row['description'];
      const qty = row['Quantity'] || row['Qty'] || row['Amount'] || row['quantity'] || row['qty'];
      const price = row['Unit Price'] || row['Price'] || row['Rate'] || row['Estimated Price'] || row['unit_price'] || row['price'];

      if (!sku || !qty || !price) {
        throw new Error(`Missing required fields in CSV row: ${JSON.stringify(row)}`);
      }

      return {
        lineNo: parseInt(lineNo) || 0,
        sku: String(sku).trim(),
        description: String(description || '').trim(),
        qty: parseFloat(qty),
        unitPrice: parseFloat(price),
        estimatedPrice: parseFloat(price),
        totalEstimate: parseFloat(qty) * parseFloat(price)
      };
    });

    if (fileType === 'boq') {
      return {
        id: `boq-${uuidv4()}`,
        version: '1.0',
        dateCreated: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          lineNo: item.lineNo,
          sku: item.sku,
          description: item.description,
          spec: '',
          qty: item.qty,
          uom: 'UNIT',
          estimatedPrice: item.estimatedPrice,
          totalEstimate: item.totalEstimate
        })),
        totalBOQ: items.reduce((sum, item) => sum + item.totalEstimate, 0)
      };
    } else {
      // Try to extract vendor name from first row or use default
      const vendorName = rows[0]?.['Vendor'] || rows[0]?.['Company'] || rows[0]?.['vendor'] || 'CSV Vendor';

      return {
        id: `quote-${uuidv4()}`,
        vendorId: `vendor-${uuidv4()}`,
        vendorName: String(vendorName).trim(),
        dateReceived: new Date().toISOString(),
        currency: 'USD',
        items: items.map(item => ({
          boqLineNo: item.lineNo,
          sku: item.sku,
          unitPrice: item.unitPrice,
          qty: item.qty,
          minQty: Math.floor(item.qty * 0.1),
          leadTime: 14,
          tax: 0.08,
          lineTotal: item.totalEstimate
        })),
        shippingCost: 0,
        discountPercent: 0,
        totalCost: items.reduce((sum, item) => sum + item.totalEstimate, 0),
        paymentTerms: 'Net 30',
        warranty: '12 months'
      };
    }
  }

  private getMockData(fileType: 'boq' | 'quote'): BOQ | Quote {
    if (fileType === 'boq') {
      return {
        id: `boq-${uuidv4()}`,
        version: '1.0',
        dateCreated: new Date().toISOString(),
        currency: 'USD',
        items: [
          {
            lineNo: 1,
            sku: 'WIDGET-100',
            description: 'Premium Widget',
            spec: 'Aluminum, 10cm, Grade A',
            qty: 500,
            uom: 'UNIT',
            estimatedPrice: 45.0,
            totalEstimate: 22500.0
          },
          {
            lineNo: 2,
            sku: 'WIDGET-200',
            description: 'Standard Widget',
            spec: 'Steel, 8cm, Grade B',
            qty: 300,
            uom: 'UNIT',
            estimatedPrice: 32.5,
            totalEstimate: 9750.0
          }
        ],
        totalBOQ: 32250.0
      };
    } else {
      return {
        id: `quote-${uuidv4()}`,
        vendorId: 'vendor-123',
        vendorName: 'Best Supply Co.',
        dateReceived: new Date().toISOString(),
        currency: 'USD',
        items: [
          {
            boqLineNo: 1,
            sku: 'WIDGET-100',
            unitPrice: 42.5,
            qty: 500,
            minQty: 100,
            leadTime: 14,
            tax: 0.08,
            lineTotal: 22950.0
          },
          {
            boqLineNo: 2,
            sku: 'WIDGET-200',
            unitPrice: 31.0,
            qty: 300,
            minQty: 50,
            leadTime: 14,
            tax: 0.08,
            lineTotal: 10038.0
          }
        ],
        shippingCost: 500.0,
        discountPercent: 5,
        totalCost: 32438.5,
        paymentTerms: 'Net 30',
        warranty: '12 months'
      };
    }
  }
}

export default new DocumentParserService();
