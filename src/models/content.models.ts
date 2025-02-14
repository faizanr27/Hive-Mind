import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: false,
  },
  tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
  type: String,
  embeddings:{type:[Number],required:true},
  content: {type: String, required:true },
  userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true },
});

export const content = mongoose.model('Content', contentSchema);