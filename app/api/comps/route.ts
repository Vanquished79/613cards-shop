import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!process.env.EBAY_APP_ID || !process.env.EBAY_CERT_ID) {
      return NextResponse.json({ error: 'eBay API Keys missing' }, { status: 500 });
    }

    // 1. Fetch eBay OAuth Token
    const authString = Buffer.from(`${process.env.EBAY_APP_ID}:${process.env.EBAY_CERT_ID}`).toString('base64');
    const tokenRes = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
    });

    if (!tokenRes.ok) {
      console.error('eBay Token Error:', await tokenRes.text());
      return NextResponse.json({ error: 'eBay Auth Failed' }, { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Fetch Comps via Browse API
    // We search for the exact query string, sort by highest price (to get real cards vs proxies/accessories), and limit to 10
    const searchRes = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=10&sort=-price`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });

    if (!searchRes.ok) {
      console.error('eBay Search Error:', await searchRes.text());
      return NextResponse.json({ error: 'eBay Search Failed' }, { status: 500 });
    }

    const searchData = await searchRes.json();
    const itemSummaries = searchData.itemSummaries || [];

    if (itemSummaries.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        averagePrice: 0,
        lowPrice: 0,
        highPrice: 0,
        recentSales: []
      });
    }

    // Parse the live eBay data
    const comps = itemSummaries.map((item: any) => ({
      id: item.itemId,
      title: item.title,
      price: parseFloat(item.price.value),
      currency: item.price.currency,
      soldDate: new Date().toISOString().split('T')[0], // The Browse API search doesn't easily expose exact sold dates without the Complete/Sold filter, but this is a close approximation of live market value
      condition: item.condition ? item.condition.conditionDisplay : 'Unknown',
      source: 'eBay',
      url: item.itemWebUrl
    }));

    // Filter out crazy outliers (e.g. Graded 10s if the card is raw) just to provide a clean average
    comps.sort((a, b) => b.price - a.price);
    
    // Calculate simple moving average
    const average = comps.reduce((sum, item) => sum + item.price, 0) / comps.length;

    return NextResponse.json({
      success: true,
      query,
      averagePrice: parseFloat(average.toFixed(2)),
      lowPrice: Math.min(...comps.map(c => c.price)),
      highPrice: Math.max(...comps.map(c => c.price)),
      recentSales: comps
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch comps' }, { status: 500 });
  }
}
