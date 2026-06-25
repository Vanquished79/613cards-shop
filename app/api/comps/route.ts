import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // TODO: Replace this with actual eBay Finding API / Browse API call using the user's eBay Developer credentials.
    // Reference: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
    // 
    // Example implementation outline:
    // const token = await getEbayAccessToken(process.env.EBAY_CLIENT_ID, process.env.EBAY_CLIENT_SECRET);
    // const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&sort=-price&limit=5`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // const data = await res.json();
    // return data.itemSummaries.map(...)

    // Simulate eBay API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data based on query structure for demo purposes
    const basePrice = Math.floor(Math.random() * 200) + 50;
    const comps = Array.from({ length: 5 }).map((_, i) => {
      const soldDate = new Date();
      soldDate.setDate(soldDate.getDate() - Math.floor(Math.random() * 30));
      
      const priceVariation = basePrice + (Math.random() * 40 - 20); // +/- $20

      return {
        id: `ebay_mock_${Date.now()}_${i}`,
        title: `${query} - ${i % 2 === 0 ? 'PSA 9' : 'Raw'} - Exact Match`,
        price: parseFloat(priceVariation.toFixed(2)),
        currency: 'USD',
        soldDate: soldDate.toISOString().split('T')[0],
        condition: i % 2 === 0 ? 'Graded' : 'Ungraded',
        source: 'eBay',
        url: '#'
      };
    });

    // Sort by most recent
    comps.sort((a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime());

    // Calculate moving average trend
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
