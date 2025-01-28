const Banner = require("../models/site-settings/banner");
const Video = require("../models/site-settings/video");
const NewArrival = require("../models/site-settings/newArrival");
const MostPurchased = require("../models/site-settings/mostPurchasedProduct");
const Gallery = require("../models/site-settings/gallery");
const FeaturedProduct = require("../models/site-settings/featuredProduct");
const FlashSale = require("../models/site-settings/flashSale");
const { body, validationResult } = require("express-validator");

exports.createBanner = [
  body("title").notEmpty().withMessage("Title is required"),
  body("subtitle").notEmpty().withMessage("Subtitle is required"),
  body("image").notEmpty().withMessage("Image URL is required"),
  body("url").notEmpty().withMessage("URL is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const banner = new Banner(req.body);
      await banner.save();
      res.status(201).json({
        success: true,
        message: "Banner created successfully",
        banner,
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create banner",
        error: error.message,
      });
    }
  },
];

// GET all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
  }
};

// UPDATE a banner
exports.updateBanner = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("subtitle")
    .optional()
    .notEmpty()
    .withMessage("Subtitle cannot be empty"),
  body("image").optional().notEmpty().withMessage("Image URL cannot be empty"),
  body("url").optional().notEmpty().withMessage("URL cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updatedBanner = await Banner.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json({
        success: true,
        message: "Banner updated successfully",
        updatedBanner,
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update banner",
        error: error.message,
      });
    }
  },
];

// DELETE a banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};

//Get banner by id
exports.getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }
    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error.message,
    });
  }
};

exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Banner status updated successfully",
      updatedBanner,
    });
  } catch (err) {
    console.error("Error updating banner status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update banner status",
      error: err.message,
    });
  }
};

// Helpers
const validateOrderUniqueness = async (value, excludeId = null) => {
  const query = { order: value };
  if (excludeId) query._id = { $ne: excludeId };

  const exists = await MostPurchased.findOne(query);
  if (exists) throw new Error("Order position already occupied");
};

const validateProductUniqueness = async (value, excludeId = null) => {
  const query = { product: value };
  if (excludeId) query._id = { $ne: excludeId };

  const exists = await MostPurchased.findOne(query);
  if (exists) throw new Error("Product already exists in the list");
};

// Controller Methods
exports.addMostPurchased = [
  body("product").notEmpty().withMessage("Product is required"),
  body("order")
    .notEmpty()
    .withMessage("Order is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Order must be between 1-10"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const count = await MostPurchased.countDocuments();
      if (count >= 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum of 10 entries allowed",
        });
      }

      const entry = new MostPurchased({
        product: req.body.product,
        order: req.body.order,
        status: req.body.status || "active",
      });

      await entry.save();

      res.status(201).json({
        success: true,
        message: "Entry added successfully",
        data: entry,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
];

exports.updateMostPurchased = [
  body("product")
    .optional()
    .custom((value, { req }) =>
      validateProductUniqueness(value, req.params.id)
    ),
  body("order")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Order must be between 1-10")
    .custom((value, { req }) => validateOrderUniqueness(value, req.params.id)),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const entry = await MostPurchased.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Entry not found",
        });
      }

      res.json({
        success: true,
        message: "Entry updated successfully",
        data: entry,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
];
exports.getUsedOrders = async (req, res) => {
  try {
    const usedOrders = await MostPurchased.find().distinct("order").exec();
    res.status(200).json({ success: true, usedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all most purchased products
exports.getMostPurchased = async (req, res) => {
  try {
    const products = await MostPurchased.find()
      .populate("product")
      .sort({ order: 1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching most purchased products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch most purchased products",
      error: error.message,
    });
  }
};

//Get most purchased product by ID
exports.getMostPurchasedById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await MostPurchased.findById(id).populate("product");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Most purchased product not found",
      });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching most purchased product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch most purchased product",
      error: error.message,
    });
  }
};

//Update Most Purchased Product Status

exports.updateMostPurchasedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedProduct = await MostPurchased.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Most purchased product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Most purchased product status updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating most purchased product status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update most purchased product status",
      error: error.message,
    });
  }
};

// DELETE a most purchased product
exports.deleteMostPurchased = async (req, res) => {
  try {
    const { id } = req.params;
    await MostPurchased.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Most purchased product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting most purchased product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete most purchased product",
      error: error.message,
    });
  }
};

exports.updateNewArrival = async (req, res) => {
  try {
    // Validate images array
    if (!req.body.images ) {
      return res.status(400).json({
        success: false,
        message: "Exactly 4 images are required"
      });
    }

    // Upsert operation
    const newArrival = await NewArrival.findOneAndUpdate(
      {},
      {
        $set: {
          videoUrl: req.body.videoUrl,
          images: req.body.images
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "New arrival updated successfully",
      data: newArrival
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: "Failed to update new arrival",
      error: error.message
    });
  }
};

exports.getNewArrival = async (req, res) => {
  try {
    const newArrival = await NewArrival.findOne();
    res.status(200).json({ success: true, data: newArrival });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch new arrival",
      error: error.message
    });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      {},
      {
        videoUrl: req.body.videoUrl,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update video",
      error: error.message
    });
  }
};

exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findOne();
    res.status(200).json({ success: true, video });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch video",
      error: error.message
    });
  }
};

// Get All Flash Sales
exports.getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: flashSales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sales',
      error: error.message,
    });
  }
};

// Get Single Flash Sale
exports.getFlashSaleById = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale banner not found',
      });
    }
    res.status(200).json({
      success: true,
      data: flashSale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flash sale',
      error: error.message,
    });
  }
};

// Create Flash Sale Banner
exports.createFlashSale = [
  body('image')
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Invalid image URL format'),
  body('productUrl')
    .notEmpty()
    .withMessage('Product URL is required')
    .isURL()
    .withMessage('Invalid product URL format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const flashSale = new FlashSale({
        image: req.body.image,
        productUrl: req.body.productUrl,
        status: req.body.status || 'active',
      });

      await flashSale.save();
      res.status(201).json({
        success: true,
        message: 'Flash sale banner created successfully',
        data: flashSale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create flash sale banner',
        error: error.message,
      });
    }
  },
];

// Update Flash Sale Banner
exports.updateFlashSale = [
  body('image')
    .optional()
    .isURL()
    .withMessage('Invalid image URL format'),
  body('productUrl')
    .optional()
    .isURL()
    .withMessage('Invalid product URL format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const flashSale = await FlashSale.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            image: req.body.image,
            productUrl: req.body.productUrl,
            status: req.body.status,
          },
        },
        { new: true, runValidators: true }
      );

      if (!flashSale) {
        return res.status(404).json({
          success: false,
          message: 'Flash sale banner not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Flash sale banner updated successfully',
        data: flashSale,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update flash sale banner',
        error: error.message,
      });
    }
  },
];

// Update Banner Status
exports.updateFlashSaleStatus = async (req, res) => {
  try {
    console.log(req.body);
    
    const flashSale = await FlashSale.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale banner not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: flashSale,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

// Delete Flash Sale Banner
exports.deleteFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndDelete(req.params.id);

    if (!flashSale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale banner not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Flash sale banner deleted successfully',
      data: flashSale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete flash sale banner',
      error: error.message,
    });
  }
};
exports.getAllFeaturedProducts = async (req, res) => {
  try {
    const products = await FeaturedProduct.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message,
    });
  }
};

// Get Single Featured Product
exports.getFeaturedProductById = async (req, res) => {
  try {
    const product = await FeaturedProduct.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured product',
      error: error.message,
    });
  }
};

// Create Featured Product
exports.createFeaturedProduct = [
  body('image')
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Invalid image URL format'),
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .escape(),
  body('description')
    .notEmpty().withMessage('Description is required')
    .trim()
    .escape(),
  body('productUrl')
    .notEmpty().withMessage('Product URL is required')
    .isURL().withMessage('Invalid product URL format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const product = new FeaturedProduct({
        image: req.body.image,
        title: req.body.title,
        description: req.body.description,
        productUrl: req.body.productUrl,
        status: req.body.status || 'active',
      });

      await product.save();
      res.status(201).json({
        success: true,
        message: 'Featured product created successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create featured product',
        error: error.message,
      });
    }
  },
];

// Update Featured Product
exports.updateFeaturedProduct = [
  body('image')
    .optional()
    .isURL().withMessage('Invalid image URL format'),
  body('title')
    .optional()
    .trim()
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('productUrl')
    .optional()
    .isURL().withMessage('Invalid product URL format'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const product = await FeaturedProduct.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Featured product not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Featured product updated successfully',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update featured product',
        error: error.message,
      });
    }
  },
];

// Update Featured Product Status
exports.updateFeaturedProductStatus = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

// Delete Featured Product
exports.deleteFeaturedProduct = async (req, res) => {
  try {
    const product = await FeaturedProduct.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Featured product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Featured product deleted successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete featured product',
      error: error.message,
    });
  }
};

exports.getGallery = async (req, res) => {
  try {
    let gallery = await Gallery.findOne();
    
    if (!gallery) {
      return res.status(200).json({
        success: true,
        data: {
          title: "",
          largeImage: "",
          smallImages: Array(4).fill("")
        }
      });
    }

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateGallery = async (req, res) => {
  try {
    const { title, largeImage, smallImages } = req.body;
    
    if (smallImages.length !== 4) {
      throw new Error("Exactly 4 small images required");
    }

    let gallery = await Gallery.findOneAndUpdate(
      {},
      { title, largeImage, smallImages },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getWebsiteContent = async (req, res) => {
  try {
    const [
      banners,
      video,
      newArrival,
      mostPurchased,
      gallery,
      featuredProducts,
      flashSales,
    ] = await Promise.all([
      Banner.find(), 
      Video.findOne(), 
      NewArrival.findOne(),
      MostPurchased.find().populate("product").sort({ order: 1 }), 
      Gallery.findOne(),
      FeaturedProduct.find().sort({ createdAt: -1 }),
      FlashSale.find().sort({ order: 1 }),
    ]);

    const websiteContent = {
      banners,
      video,
      newArrival,
      mostPurchased,
      gallery,
      featuredProducts,
      flashSales,
    };

    res.status(200).json({
      success: true,
      data: websiteContent,
    });
  } catch (error) {
    console.error("Error fetching website content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch website content",
      error: error.message,
    });
  }
};