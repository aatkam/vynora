import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  fileURLToPath
} from 'url';

import {
  protect
} from '../middleware/auth.js';

const router = Router();

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const uploadDir =
  process.env.UPLOAD_DIR ||
  path.join(
    __dirname,
    '../../uploads'
  );

fs.mkdirSync(
  uploadDir,
  {
    recursive: true
  }
);

const extensionByMimeType =
  new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif']
  ]);

const storage =
  multer.diskStorage({
    destination:
      (
        _req,
        _file,
        cb
      ) =>
        cb(
          null,
          uploadDir
        ),

    filename:
      (
        _req,
        file,
        cb
      ) => {
        const extension =
          extensionByMimeType.get(
            file.mimetype
          ) || '';

        cb(
          null,
          `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}${extension}`
        );
      }
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024
    },

    fileFilter:
      (
        _req,
        file,
        cb
      ) => {
        if (
          !extensionByMimeType.has(
            file.mimetype
          )
        ) {
          return cb(
            new Error(
              'Only JPG, PNG, WEBP and GIF images are allowed'
            )
          );
        }

        cb(null, true);
      }
  });

router.post(
  '/',
  protect,
  upload.single('image'),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({
          message:
            'Choose an image to upload'
        });
    }

    const requestBaseUrl =
      `${req.protocol}://${req.get(
        'host'
      )}`;

    const publicBaseUrl =
      (
        process.env
          .PUBLIC_API_URL ||
        requestBaseUrl
      ).replace(/\/$/, '');

    const url =
      `${publicBaseUrl}/uploads/${req.file.filename}`;

    res
      .status(201)
      .json({
        url
      });
  }
);

export default router;