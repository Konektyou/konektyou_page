import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Provider from '@/models/Provider';

export async function GET() {
  try {
    await connectToDatabase();

    const providers = await Provider.find({
      isActive: true,
      isBanned: false,
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null }
    })
      .select('name email city province serviceType experience photoPath location')
      .sort({ createdAt: -1 })
      .lean();

    const list = providers.map((p) => {
      const id = p._id.toString();
      let photo = null;
      if (p.photoPath && typeof p.photoPath === 'string') {
        const path = p.photoPath.replace(/^src[/\\]images[/\\]/i, '').replace(/^images[/\\]/i, '').trim();
        if (path) photo = `/api/images/${path}`;
      }
      const lat = p.location?.latitude;
      const lng = p.location?.longitude;
      return {
        id,
        name: p.name,
        email: p.email,
        city: p.city || '',
        province: p.province || '',
        serviceType: p.serviceType || '',
        experience: p.experience || '',
        photo,
        position: lat != null && lng != null ? [lat, lng] : null
      };
    }).filter((p) => p.position && p.position.length === 2);

    return NextResponse.json({ success: true, providers: list });
  } catch (error) {
    console.error('Admin monitoring providers error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
