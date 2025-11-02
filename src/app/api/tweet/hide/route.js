import dbConnect from '@/lib/db';
import Tweets from '@/lib/models/tweets';
import Hiddens from '@/lib/models/hiddens';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminpwd = searchParams.get('adminpwd');
        const tweet_id = searchParams.get('tweet_id');
        const screen_name = searchParams.get('screen_name');

        if(!tweet_id && !screen_name){
            return Response.json({ success: false, error: 'Tweet ID or Screen Name is required' }, { status: 400 });
        }

        if(!adminpwd || adminpwd !== process.env.ADMIN_PASSWORD){
            return Response.json({ success: false, error: 'Invalid admin password' }, { status: 401 });
        }

        await dbConnect();

        if(tweet_id){
            await Tweets.findOneAndUpdate(
                { tweet_id: tweet_id },
                { 
                    $set: { 
                        is_hidden: 1
                    } 
                },
                { 
                    new: true,
                    runValidators: true,
                    strict: true
                }
            );
        }else if(screen_name){
            await Hiddens.create({
                screen_name: screen_name
            });
        }
        
        return Response.json({ 
            success: true
        });
  
    } catch (error) {
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
  }