import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  keywods: {
    type: [String],
    required: true,
    },
    date: {
    type: Date,
    default: Date.now,
    },
});

const Post = mongoose.model('Post', postSchema);