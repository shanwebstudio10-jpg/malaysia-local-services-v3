# Photo Upload

The customer form includes a photo input in V3 UI.

For production:
1. Upload the image from browser to a protected Worker endpoint.
2. Store image in Cloudflare R2.
3. Save the R2 object key/URL in `service_requests.photo_url`.
4. Restrict file type to JPG/PNG/WebP and enforce a size limit.
