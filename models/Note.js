const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    owner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    sharedWith: [{
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      canEdit: { type: Boolean, default: false },  
    }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
