import mongoose from 'mongoose';

const hiddensSchema = new mongoose.Schema({
  screen_name: { type: String, required: true,unique: true },
  created_at: { type: Date, default: Date.now }
},{
    autoIndex: true
});

export default mongoose.models.Hiddens || mongoose.model('Hiddens', hiddensSchema, 'txd_hiddens');