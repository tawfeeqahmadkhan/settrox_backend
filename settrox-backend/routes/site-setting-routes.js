const express = require("express");
const router = express.Router();
const siteManagementController = require("../controllers/site-setting-controller");

/* ------------------------- Banner Routes ------------------------- */
router.post("/banners", siteManagementController.createBanner);
router.get("/banners", siteManagementController.getBanners);
router.put("/banners/:id", siteManagementController.updateBanner);
router.delete("/banners/:id", siteManagementController.deleteBanner);
router.get("/banners/:id", siteManagementController.getBannerById);
router.put("/banners/status/:id", siteManagementController.updateBannerStatus);

/* -------------------- Most Purchased Products Routes -------------------- */
router.post("/most-purchased", siteManagementController.addMostPurchased);
router.get("/most-purchased", siteManagementController.getMostPurchased);
router.put("/most-purchased/:id", siteManagementController.updateMostPurchased);
router.delete("/most-purchased/:id", siteManagementController.deleteMostPurchased);
router.get("/most-purchased/used-orders",siteManagementController.getUsedOrders)
router.get("/most-purchased/:id", siteManagementController.getMostPurchasedById);
router.put("/most-purchased/status/:id", siteManagementController.updateMostPurchasedStatus);
/* ------------------------- Video Section Routes ------------------------- */
router.put("/video", siteManagementController.updateVideo);
router.get("/video", siteManagementController.getVideo);

/* ------------------------- Flash Sale Routes ------------------------- */
router.post("/flash-sales", siteManagementController.createFlashSale);
router.get("/flash-sales", siteManagementController.getAllFlashSales);
router.put("/flash-sales/:id", siteManagementController.updateFlashSale);
router.delete("/flash-sales/:id", siteManagementController.deleteFlashSale);
router.get("/flash-sales/:id", siteManagementController.getFlashSaleById);
router.put("/flash-sales/status/:id", siteManagementController.updateFlashSaleStatus);

/* -------------------- Featured Products Routes -------------------- */
router.post("/featured-products", siteManagementController.createFeaturedProduct);
router.get("/featured-products", siteManagementController.getAllFeaturedProducts);
router.delete("/featured-products/:id", siteManagementController.deleteFeaturedProduct);
router.get("/featured-products/:id", siteManagementController.getFeaturedProductById);
router.put("/featured-products/status/:id", siteManagementController.updateFeaturedProductStatus);
router.put("/featured-products/:id", siteManagementController.updateFeaturedProduct);


/* ------------------------- Gallery Routes ------------------------- */
router.put("/gallery", siteManagementController.updateGallery);
router.get("/gallery", siteManagementController.getGallery);

router.put("/new-arrival", siteManagementController.updateNewArrival);
router.get("/new-arrival", siteManagementController.getNewArrival);

router.get("/getWebsiteContent", siteManagementController.getWebsiteContent);

router

module.exports = router;
