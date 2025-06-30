const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxLength: 500
  },
  image: {
    url: String,
    alt: String
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'color', 'image'],
      default: 'text'
    },
    options: [String], // For select/multiselect types
    required: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Virtual for getting subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for getting full path
categorySchema.virtual('path').get(function() {
  // This would need to be populated to work properly
  return this.parent ? `${this.parent.name} > ${this.name}` : this.name;
});

// Method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Static method to build category tree
categorySchema.statics.buildTree = async function(parentId = null) {
  const categories = await this.find({ parent: parentId, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
  
  for (const category of categories) {
    category.children = await this.buildTree(category._id);
  }
  
  return categories;
};

// Static method to get category hierarchy
categorySchema.statics.getHierarchy = async function(categoryId) {
  const hierarchy = [];
  let current = await this.findById(categoryId);
  
  while (current) {
    hierarchy.unshift(current);
    if (current.parent) {
      current = await this.findById(current.parent);
    } else {
      current = null;
    }
  }
  
  return hierarchy;
};

module.exports = mongoose.model('Category', categorySchema);