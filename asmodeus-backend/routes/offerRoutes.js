import express from 'express';
import { getAllOffers, getPublicOffers, getPublicOfferById, getOfferById, createOffer, updateOffer, deleteOffer, getOfferStats, testDatabase } from '../controllers/offerController.js';
import { verifyToken, requireAdmin, requireModule } from '../middleware/auth.js';

const router = express.Router();

// Public route for candidates to view published offers
router.get('/public', getPublicOffers);

// Public route for individual offer details (for candidates)
router.get('/public/:offerId', getPublicOfferById);

// Test database connection and table structure
router.get('/test-db', testDatabase);

// Protected routes for offer management
router.use(verifyToken);
// Allow admins or users with gestion_offres module
router.use((req, res, next) => {
  // Admins have full access
  if (req.user.role_id === 1) {
    return next();
  }
  // For non-admins, check for gestion_offres module
  requireModule('gestion_offres')(req, res, next);
});

// Get all offers (for management)
router.get('/', getAllOffers);

// Get offer statistics
router.get('/stats', getOfferStats);

// Get single offer by ID
router.get('/:offerId', getOfferById);

// Create new offer
router.post('/', createOffer);

// Update offer
router.put('/:offerId', updateOffer);

// Delete offer
router.delete('/:offerId', deleteOffer);

export default router;
