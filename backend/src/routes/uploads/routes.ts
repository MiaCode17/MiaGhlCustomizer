import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { attachCompany } from '../../middleware/company';
import { HttpError } from '../../middleware/errorHandler';
import { publicUrlForUpload, upload } from '../../middleware/upload';
import { buildRouter, RouteDef } from '../routeTable';

const routes: RouteDef[] = [
  {
    method: 'post',
    url: '/image',
    middlewares: [attachCompany, upload.single('file')],
    handler: asyncHandler(async (req, res) => {
      if (!req.file) {
        throw new HttpError(400, 'No file uploaded');
      }
      res.status(201).json({ url: publicUrlForUpload(req.file.filename) });
    }),
  },
];

export const uploadsRouter: Router = buildRouter(routes);
