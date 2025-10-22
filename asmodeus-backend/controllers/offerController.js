import sql from 'mssql';
import { connectToDB } from '../config/database.js';

// Test endpoint to check database and table structure
export const testDatabase = async (req, res) => {
  try {
    const pool = await connectToDB();
    console.log('Testing database connection...');
    
    // Test basic connection
    const testResult = await pool.request().query('SELECT 1 as test');
    console.log('Basic query test:', testResult.recordset);
    
    // Check if offres table exists and get its structure
    const tableCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'offres'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('Table structure:', tableCheck.recordset);
    
    res.status(200).json({ 
      message: 'Database test successful',
      tableStructure: tableCheck.recordset
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database test failed', 
      error: error.message 
    });
  }
};

// Get all offers
export const getAllOffers = async (req, res) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          o.job_id,
          o.titre,
          o.description,
          o.competences_requises,
          o.lieu,
          o.entreprise,
          o.statut,
          o.date_creation,
          o.date_modification,
          o.salaire,
          o.langues,
          o.type_contrat,
          o.departement,
          o.experience,
          o.teletravail,
          o.date_fin,
          u.full_name as responsable_name,
          u2.full_name as created_by_name,
          u3.full_name as owner_name
        FROM offres o
        LEFT JOIN Users u ON o.responsable = u.user_id
        LEFT JOIN Users u2 ON o.createdBy = u2.user_id
        LEFT JOIN Users u3 ON o.owner = u3.user_id
        ORDER BY o.date_creation DESC
      `);
    
    res.status(200).json({ offers: result.recordset });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ message: 'Server error getting offers.' });
  }
};

// Get public offers (only published offers for candidates)
export const getPublicOffers = async (req, res) => {
  try {
    const pool = await connectToDB();
    const result = await pool.request().query(`
      SELECT
        o.job_id,
        o.titre,
        o.description,
        o.competences_requises,
        o.lieu,
        o.entreprise,
        o.statut,
        o.date_creation,
        o.salaire,
        o.langues,
        o.type_contrat,
        o.departement,
        o.experience,
        o.teletravail,
        o.date_fin
      FROM offres o
      WHERE o.statut = 'Publié'
      ORDER BY o.date_creation DESC
    `);
    console.log('Public offers found:', result.recordset.length);
    res.status(200).json({ offers: result.recordset });
  } catch (error) {
    console.error('Get public offers error:', error);
    res.status(500).json({ message: 'Server error getting public offers.' });
  }
};

// Get single offer by ID (public - only published offers)
export const getPublicOfferById = async (req, res) => {
  const { offerId } = req.params;
  
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .input('offerId', sql.Int, offerId)
      .query(`
        SELECT 
          o.job_id,
          o.titre,
          o.description,
          o.competences_requises,
          o.lieu,
          o.entreprise,
          o.statut,
          o.date_creation,
          o.salaire,
          o.langues,
          o.type_contrat,
          o.departement,
          o.experience,
          o.teletravail,
          o.date_fin
        FROM offres o
        WHERE o.job_id = @offerId AND o.statut = 'Publié'
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Offer not found or not published.' });
    }
    
    res.status(200).json({ offer: result.recordset[0] });
  } catch (error) {
    console.error('Get public offer error:', error);
    res.status(500).json({ message: 'Server error getting offer.' });
  }
};

// Get single offer by ID (admin/management - all offers)
export const getOfferById = async (req, res) => {
  const { offerId } = req.params;
  
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .input('offerId', sql.Int, offerId)
      .query(`
        SELECT 
          o.*,
          u.full_name as responsable_name,
          u2.full_name as created_by_name,
          u3.full_name as owner_name
        FROM offres o
        LEFT JOIN Users u ON o.responsable = u.user_id
        LEFT JOIN Users u2 ON o.createdBy = u2.user_id
        LEFT JOIN Users u3 ON o.owner = u3.user_id
        WHERE o.job_id = @offerId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }
    
    res.status(200).json({ offer: result.recordset[0] });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ message: 'Server error getting offer.' });
  }
};

// Create new offer
export const createOffer = async (req, res) => {
  const {
    titre,
    description,
    competences_requises,
    lieu,
    entreprise,
    salaire,
    langues,
    type_contrat,
    departement,
    experience,
    teletravail,
    date_fin,
    responsable,
    private_keywords
  } = req.body;

  if (!titre || !description || !entreprise) {
    return res.status(400).json({ message: 'Title, description, and company are required.' });
  }

  try {
    const pool = await connectToDB();
    
    // Validate responsable user exists if provided
    if (responsable && responsable.trim() !== '') {
      const responsableId = parseInt(responsable);
      if (isNaN(responsableId)) {
        return res.status(400).json({ message: 'Responsable must be a valid user ID.' });
      }
      
      const userCheck = await pool.request()
        .input('userId', sql.Int, responsableId)
        .query('SELECT user_id FROM Users WHERE user_id = @userId');
      
      if (userCheck.recordset.length === 0) {
        return res.status(400).json({ message: 'Responsable user does not exist.' });
      }
    }
    
    const result = await pool.request()
      .input('titre', sql.NVarChar, titre)
      .input('description', sql.NVarChar, description)
      .input('competences_requises', sql.NVarChar, competences_requises)
      .input('lieu', sql.NVarChar, lieu)
      .input('entreprise', sql.NVarChar, entreprise)
      .input('salaire', sql.NVarChar, salaire)
      .input('langues', sql.NVarChar, langues)
      .input('type_contrat', sql.NVarChar, type_contrat)
      .input('departement', sql.NVarChar, departement)
      .input('experience', sql.NVarChar, experience)
      .input('teletravail', sql.Bit, teletravail || false)
      .input('date_fin', sql.DateTime2, date_fin)
      .input('responsable', sql.Int, (responsable && responsable.trim() !== '') ? parseInt(responsable) : null)
      .input('private_keywords', sql.NVarChar, private_keywords)
      .input('createdBy', sql.Int, req.user.id)
      .input('owner', sql.Int, req.user.id)
      .query(`
        INSERT INTO offres (
          titre, description, competences_requises, lieu, entreprise, statut,
          date_creation, date_modification, salaire, langues, responsable,
          type_contrat, departement, experience, teletravail, private_keywords,
          date_fin, createdBy, owner
        )
        OUTPUT INSERTED.job_id AS job_id
        VALUES (
          @titre, @description, @competences_requises, @lieu, @entreprise, 'Brouillon',
          GETDATE(), GETDATE(), @salaire, @langues, @responsable,
          @type_contrat, @departement, @experience, @teletravail, @private_keywords,
          @date_fin, @createdBy, @owner
        )
      `);
    
    const newOfferId = result.recordset[0].job_id;
    
    res.status(201).json({ 
      message: 'Offer created successfully.',
      offerId: newOfferId
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ message: 'Server error creating offer.' });
  }
};

// Update offer
export const updateOffer = async (req, res) => {
  const { offerId } = req.params;
  const {
    titre,
    description,
    competences_requises,
    lieu,
    entreprise,
    salaire,
    langues,
    type_contrat,
    departement,
    experience,
    teletravail,
    date_fin,
    responsable,
    statut,
    private_keywords
  } = req.body;

  if (!offerId) {
    return res.status(400).json({ message: 'Offer ID is required.' });
  }

  try {
    const pool = await connectToDB();
    
    // Validate responsable user exists if provided
    if (responsable !== undefined && responsable && responsable.toString().trim() !== '') {
      const responsableId = parseInt(responsable);
      if (isNaN(responsableId)) {
        return res.status(400).json({ message: 'Responsable must be a valid user ID.' });
      }
      
      const userCheck = await pool.request()
        .input('userId', sql.Int, responsableId)
        .query('SELECT user_id FROM Users WHERE user_id = @userId');
      
      if (userCheck.recordset.length === 0) {
        return res.status(400).json({ message: 'Responsable user does not exist.' });
      }
    }
    
    // Build dynamic update query
    const sets = [];
    if (titre !== undefined) sets.push("titre = @titre");
    if (description !== undefined) sets.push("description = @description");
    if (competences_requises !== undefined) sets.push("competences_requises = @competences_requises");
    if (lieu !== undefined) sets.push("lieu = @lieu");
    if (entreprise !== undefined) sets.push("entreprise = @entreprise");
    if (salaire !== undefined) sets.push("salaire = @salaire");
    if (langues !== undefined) sets.push("langues = @langues");
    if (type_contrat !== undefined) sets.push("type_contrat = @type_contrat");
    if (departement !== undefined) sets.push("departement = @departement");
    if (experience !== undefined) sets.push("experience = @experience");
    if (teletravail !== undefined) sets.push("teletravail = @teletravail");
    if (date_fin !== undefined) sets.push("date_fin = @date_fin");
    if (responsable !== undefined) sets.push("responsable = @responsable");
    if (statut !== undefined) sets.push("statut = @statut");
    if (private_keywords !== undefined) sets.push("private_keywords = @private_keywords");
    
    sets.push("date_modification = GETDATE()");

    if (sets.length === 1) { // Only date_modification
      return res.status(400).json({ message: 'No fields to update.' });
    }

    const query = `UPDATE offres SET ${sets.join(", ")} WHERE job_id = @offerId`;

    const reqDb = pool.request().input("offerId", sql.Int, offerId);
    if (titre !== undefined) reqDb.input("titre", sql.NVarChar, titre);
    if (description !== undefined) reqDb.input("description", sql.NVarChar, description);
    if (competences_requises !== undefined) reqDb.input("competences_requises", sql.NVarChar, competences_requises);
    if (lieu !== undefined) reqDb.input("lieu", sql.NVarChar, lieu);
    if (entreprise !== undefined) reqDb.input("entreprise", sql.NVarChar, entreprise);
    if (salaire !== undefined) reqDb.input("salaire", sql.NVarChar, salaire);
    if (langues !== undefined) reqDb.input("langues", sql.NVarChar, langues);
    if (type_contrat !== undefined) reqDb.input("type_contrat", sql.NVarChar, type_contrat);
    if (departement !== undefined) reqDb.input("departement", sql.NVarChar, departement);
    if (experience !== undefined) reqDb.input("experience", sql.NVarChar, experience);
    if (teletravail !== undefined) reqDb.input("teletravail", sql.Bit, teletravail);
    if (date_fin !== undefined) reqDb.input("date_fin", sql.DateTime2, date_fin);
    if (responsable !== undefined) reqDb.input("responsable", sql.Int, (responsable && responsable.toString().trim() !== '') ? parseInt(responsable) : null);
    if (statut !== undefined) reqDb.input("statut", sql.NVarChar, statut);
    if (private_keywords !== undefined) reqDb.input("private_keywords", sql.NVarChar, private_keywords);

    await reqDb.query(query);

    res.status(200).json({ message: 'Offer updated successfully.' });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ message: 'Server error updating offer.' });
  }
};

// Delete offer
export const deleteOffer = async (req, res) => {
  const { offerId } = req.params;

  if (!offerId) {
    return res.status(400).json({ message: 'Offer ID is required.' });
  }

  try {
    const pool = await connectToDB();
    
    // Check if offer exists
    const checkResult = await pool.request()
      .input('offerId', sql.Int, offerId)
      .query('SELECT job_id FROM offres WHERE job_id = @offerId');
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Offer not found.' });
    }

    // Delete the offer
    await pool.request()
      .input('offerId', sql.Int, offerId)
      .query('DELETE FROM offres WHERE job_id = @offerId');

    res.status(200).json({ message: 'Offer deleted successfully.' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ message: 'Server error deleting offer.' });
  }
};

// Get offer statistics
export const getOfferStats = async (req, res) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as total_offers,
          SUM(CASE WHEN statut = 'Publié' THEN 1 ELSE 0 END) as published_offers,
          SUM(CASE WHEN statut = 'Brouillon' THEN 1 ELSE 0 END) as draft_offers,
          SUM(CASE WHEN statut = 'Fermé' THEN 1 ELSE 0 END) as closed_offers,
          SUM(CASE WHEN teletravail = 1 THEN 1 ELSE 0 END) as remote_offers
        FROM offres
      `);
    
    res.status(200).json({ stats: result.recordset[0] });
  } catch (error) {
    console.error('Get offer stats error:', error);
    res.status(500).json({ message: 'Server error getting offer statistics.' });
  }
};
