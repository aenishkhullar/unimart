import Product from '../models/Product.js';

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, type, rentDuration, deposit } = req.body;

    // Validate common required fields
    if (!title || !description || !price || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, description, price, category, type)',
      });
    }

    // Validate type value explicitly
    if (!['sell', 'rent'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'sell' or 'rent'",
      });
    }

    // Rent-specific validation
    if (type === 'rent') {
      if (!rentDuration) {
        return res.status(400).json({
          success: false,
          message: 'rentDuration is required for rental listings (e.g. "1 month", "2 weeks")',
        });
      }
      if (deposit === undefined || deposit === null || deposit === '') {
        return res.status(400).json({
          success: false,
          message: 'deposit amount is required for rental listings',
        });
      }
    }

    const productData = {
      title,
      description,
      price,
      category,
      type,
      user: req.user._id,
    };

    // Attach rent-specific fields only when type is 'rent'
    if (type === 'rent') {
      productData.rentDuration = rentDuration;
      productData.deposit = Number(deposit);
    }

    const product = new Product(productData);
    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to create product',
      error: error.message,
    });
  }
};

// @desc    Fetch all products (with optional filtering and keyword search)
// @route   GET /api/products?type=rent&category=books&keyword=laptop
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { type, category, keyword } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (type) {
      filter.type = type; // e.g. 'rent' or 'sell'
    }

    if (category) {
      filter.category = category;
    }

    // Keyword search across title and description (case-insensitive)
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      filter.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }

    const products = await Product.find(filter).populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch products',
    });
  }
};

// @desc    Fetch logged-in user's products
// @route   GET /api/products/my-products
// @access  Private
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching user products:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch your products',
    });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'name email');

    if (product) {
      res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error.message);
    // If the ID isn't a valid mongoose ObjectId, it will throw a CastError
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to fetch product',
    });
  }
};

// @desc    Update a product (owner only)
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Ownership check
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only update your own products',
      });
    }

    const { title, description, price, category, type } = req.body;

    // Apply only the fields that were sent
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (type !== undefined) {
      if (!['sell', 'rent'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Must be 'sell' or 'rent'",
        });
      }
      product.type = type;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to update product',
      error: error.message,
    });
  }
};

// @desc    Delete a product (owner only)
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Ownership check
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only delete your own products',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to delete product',
      error: error.message,
    });
  }
};
