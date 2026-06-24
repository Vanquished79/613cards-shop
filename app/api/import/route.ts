import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Simple CSV parser that handles quotes
function parseCSV(text: string) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let val = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (i < text.length - 1 && text[i + 1] === '"') {
          val += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        val += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(val.trim());
        val = '';
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && i < text.length - 1 && text[i + 1] === '\n') {
          i++; // skip \n
        }
        row.push(val.trim());
        result.push(row);
        row = [];
        val = '';
      } else {
        val += char;
      }
    }
  }
  
  if (val || row.length > 0) {
    row.push(val.trim());
    result.push(row);
  }

  return result;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }

    const rows = parseCSV(body.csvData);
    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV must contain headers and at least one data row' }, { status: 400 });
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1).filter(r => r.length > 1);

    let successCount = 0;
    const errors: string[] = [];

    // Process rows sequentially to handle category creation safely
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const productData: any = {};
        
        headers.forEach((header, index) => {
          const val = row[index];
          if (val === undefined) return;

          switch (header) {
            case 'name':
              productData.name = val; break;
            case 'description':
              productData.description = val; break;
            case 'price':
              productData.price = parseFloat(val) || 0; break;
            case 'inventory':
              productData.inventory = parseInt(val) || 0; break;
            case 'isrookie':
              productData.isRookie = val.toLowerCase() === 'true'; break;
            case 'isautograph':
              productData.isAutograph = val.toLowerCase() === 'true'; break;
            case 'isnumbered':
              productData.isNumbered = val.toLowerCase() === 'true'; break;
            case 'cardnumber':
              productData.cardNumber = val; break;
            case 'cardseries':
              productData.cardSeries = val; break;
            case 'image':
              productData.image = val || null; break;
            case 'category':
              productData.categoryName = val; break; // Temporary hold
          }
        });

        if (!productData.name || !productData.price) {
          errors.push(`Row ${i + 2}: Missing required fields (name, price)`);
          continue;
        }

        // Handle category
        let categoryId = null;
        if (productData.categoryName) {
          let cat = await prisma.category.findFirst({
            where: { name: { equals: productData.categoryName, mode: 'insensitive' } }
          });
          
          if (!cat) {
            cat = await prisma.category.create({
              data: {
                name: productData.categoryName
              }
            });
          }
          categoryId = cat.id;
        }

        // Create product
        await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            inventory: productData.inventory,
            isRookie: productData.isRookie || false,
            isAutograph: productData.isAutograph || false,
            isNumbered: productData.isNumbered || false,
            cardNumber: productData.cardNumber || null,
            cardSeries: productData.cardSeries || null,
            image: productData.image || null,
            categoryId: categoryId
          }
        });

        successCount++;

      } catch (err: any) {
        errors.push(`Row ${i + 2} (${row[0]}): ${err.message}`);
      }
    }

    return NextResponse.json({ count: successCount, errors });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
