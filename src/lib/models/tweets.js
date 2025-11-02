import mongoose from 'mongoose';

const tweetsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  screen_name: { type: String, required: true },
  profile_image: { type: String, required: true },
  tweet_id: { type: String, required: true, unique: true },
  tweet_text: { type: String },
  tweet_media: { type: String },
  tweet_threadscount: { type: Number },
  tweet_data: { type: String, required: true },
  is_hidden: { type: Number, default: 1 },
  post_at: { type: Date , default: Date.now },
  created_at: { type: Date, default: Date.now }
},{
    autoIndex: true
});

tweetsSchema.index({ screen_name: 1 });
tweetsSchema.index({ name: 1 });
tweetsSchema.index({ tweet_text: 1 });
tweetsSchema.index({ tweet_media: 1 });
tweetsSchema.index({ created_at: -1 });
tweetsSchema.index({ post_at: -1 });
tweetsSchema.index({ is_hidden: 1 });

export default mongoose.models.Tweets || mongoose.model('Tweets', tweetsSchema, 'txd_tweets');