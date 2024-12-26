import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  link: String,
  tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
  type: String,
  userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
});

export const content = mongoose.model('Content', contentSchema);