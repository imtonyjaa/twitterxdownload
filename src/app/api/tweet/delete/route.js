import dbConnect from '@/lib/db';
import Tweets from '@/lib/models/tweets';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminpwd = searchParams.get('adminpwd');
        const tweet_id = searchParams.get('tweet_id');

        if(!tweet_id){
            return Response.json({ success: false, error: 'Tweet ID is required' }, { status: 400 });
        }

        if(!adminpwd || adminpwd !== process.env.ADMIN_PASSWORD){
            return Response.json({ success: false, error: 'Invalid admin password' }, { status: 401 });
        }

        await dbConnect();

        await Tweets.deleteOne({ tweet_id: tweet_id });
        
        return Response.json({ 
            success: true,
            message: 'Tweet deleted from database'
        });
  
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
  }