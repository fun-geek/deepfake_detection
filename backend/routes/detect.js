import express from 'express';
import multer from 'multer';

// Use memory storage for quick "live analysis", keeping chunks out of disk.
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * Endpoint for Live Stream & Real-time WebCam analysis.
 * Receives multipart form-data with a single 'chunk' field.
 */
router.post('/', upload.single('chunk'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image chunk provided' });
    }

    // --- Mock AI inference process ---
    // In a real application, you would send `req.file.buffer` to your Python backend/FastAPI.
    
    // Simulate slight inference delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock result: Randomly assign REAL or FAKE
    const isFake = Math.random() > 0.5;
    const confidence = 0.85 + (Math.random() * 0.14); // e.g. 0.85 to 0.99
    
    res.json({
      label: isFake ? 'FAKE' : 'REAL',
      confidence: confidence
    });
  } catch (error) {
    console.error('Error during live detection:', error);
    res.status(500).json({ error: 'Detection processing failed' });
  }
});

export default router;
