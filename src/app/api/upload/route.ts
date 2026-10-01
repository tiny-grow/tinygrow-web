import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  // 1. Verify Authentication if in production
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && isSupabaseServerConfigured()) {
    try {
      const supabase = await createClient();
      let user = null;

      // Check Bearer token from client header
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data } = await supabase.auth.getUser(token);
        user = data?.user;
      }

      // Fallback to cookie-based session
      if (!user) {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized: Please log in at /admin/login first.' },
          { status: 401 }
        );
      }
    } catch (authErr) {
      console.warn('Auth verification error:', authErr);
      return NextResponse.json(
        { error: 'Authentication failed. Please log in at /admin/login.' },
        { status: 401 }
      );
    }
  }

  // 2. Validate Cloudinary configuration
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          'Cloudinary is not configured yet. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file.',
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate signed Cloudinary upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'tinygrow';

    const crypto = await import('crypto');
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    // Convert file to base64 data URI for bulletproof Cloudinary upload in Node.js
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    const uploadFormData = new FormData();
    uploadFormData.append('file', base64Data);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok || data.error) {
      console.error('Cloudinary API upload error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Cloudinary upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
