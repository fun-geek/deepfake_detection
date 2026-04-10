import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Setup file storage logic to temporarily host uploaded videos or high res images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({ storage: storage });

export default function(io) {
  const router = express.Router();

  /**
   * Endpoint for Media upload (Video / Image).
   * It returns a documentId immediately and starts background analysis.
   */
  router.post('/', upload.single('media'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No media file provided' });
      }

      // Generate a documentID to track the upload lifecycle
      const documentId = uuidv4();
      
      // Respond early with the document ID for the client to listen via WebSocket
      res.json({ documentId });

      // Start asynchronous background "AI Processing"
      setTimeout(() => {
        
        // Mock prediction result
        const isFake = Math.random() > 0.4;
        const confidence = 0.80 + (Math.random() * 0.19);
        
        const payload = {
          status: 'completed',
          result: {
            label: isFake ? 'FAKE' : 'REAL',
            confidence: confidence,
            error: null
          }
        };

        // Emit through socket.io using the specific documentId string that frontend listens to
        io.emit(`analysis_complete_${documentId}`, payload);
        console.log(`Finished background analysis for ${documentId}: `, payload);

      }, 4000); // Mock processing delay of 4 seconds

    } catch (error) {
      console.error('Error processing media upload:', error);
      res.status(500).json({ error: 'File upload processing failed' });
    }
  });

  return router;
}
