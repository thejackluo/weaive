# Testing Story 0.9: AI-Powered Image Service

## Quick Start (5 minutes)

### 1. Start Backend (Terminal 1)

```bash
cd weave-api

# Add Google AI API Key (get from https://aistudio.google.com/app/apikey)
echo "GOOGLE_AI_API_KEY=your_key_here" >> .env

# OR edit .env manually:
# GOOGLE_AI_API_KEY=AIzaSyC...your_key

# Start server
uv run uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     ✅ Gemini provider initialized: gemini-3-flash-preview
```

### 2. Start Mobile App (Terminal 2)

```bash
cd weave-mobile
npm start
```

Then press `i` for iOS or `a` for Android.

### 3. Test the Flow

1. **Login** to the app (if not already)
2. **Go to Home screen** (first tab)
3. **Find the blue box** labeled "Story 0.9: Image Capture Test"
4. **Tap "📷 Capture & Upload Image"**
5. **Choose "Take Photo" or "Choose from Gallery"**
6. **Select/take an image**
7. **Watch the progress:**
   - "Opening camera..."
   - "Uploading..." (progress bar)
   - "Upload complete!"
   - "✅ AI Verified" (if AI analysis succeeds)

8. **Check the gallery** - Your image should appear in the grid
9. **Tap the image** - Opens full-screen detail view
10. **See AI insights:**
    - Verification score
    - Extracted text (OCR)
    - Categories with confidence bars
    - Quality star rating

11. **Tap delete** - Confirms and removes image

### 4. Test Rate Limiting

Upload 5 images in a row. On the 6th attempt, you should see:

```
📸 Daily Upload Limit Reached
You've uploaded 5 images today. Limit resets at midnight.
```

---

## Troubleshooting

### Backend won't start

**Error:** `GOOGLE_AI_API_KEY not configured`

**Fix:**
1. Get API key: https://aistudio.google.com/app/apikey
2. Add to `weave-api/.env` file
3. Restart server

**Check if key is loaded:**
```bash
cd weave-api
cat .env | grep GOOGLE_AI_API_KEY
```

### Mobile app errors

**Error:** `Cannot find module '@/components/ProofCaptureSheet'`

**Fix:**
```bash
cd weave-mobile
rm -rf node_modules/.cache
npm start -- --clear
```

**Error:** `expo-image-manipulator not found`

**Fix:**
```bash
cd weave-mobile
npx expo install expo-image-manipulator
```

### Images don't load

**Error:** Signed URL fails or images don't show

**Fix:**
```bash
# Check Supabase is running
npx supabase status

# If not running:
npx supabase start

# Verify captures bucket exists
# Visit: http://localhost:54323 (Supabase Studio)
# Go to Storage → Buckets → Should see "captures"
```

### AI analysis doesn't run

**Check backend logs:**
```
INFO: Image uploaded: proof_1234567890.jpg
INFO: AI analysis complete: validation_score=85
```

**If you see:** `GOOGLE_AI_API_KEY not configured`
- Backend is missing API key (see above)

**If you see:** `Rate limit exceeded`
- You've hit 5 AI analyses for the day
- Wait until midnight or use a different user

---

## What to Look For

### ✅ Success Indicators

**Backend Terminal:**
```
INFO: 127.0.0.1:54321 - "POST /api/captures/upload HTTP/1.1" 200 OK
INFO: ✅ Gemini provider initialized: gemini-3-flash-preview
INFO: Image uploaded: proof_1234567890.jpg
INFO: AI analysis complete: validation_score=85
```

**Mobile App:**
- Upload progress bar shows 0-100%
- "Upload complete!" success message
- Image appears in gallery grid
- AI verified badge (green checkmark) on image
- Detail view shows AI insights

**Database (optional check):**
```bash
cd weave-api
uv run python -c "
from app.core.deps import get_supabase_admin
supabase = get_supabase_admin()
result = supabase.table('captures').select('id, ai_verified, ai_quality_score').limit(5).execute()
for capture in result.data:
    print(f'ID: {capture[\"id\"]}, AI Verified: {capture[\"ai_verified\"]}, Quality: {capture[\"ai_quality_score\"]}')
"
```

### 🎯 Test Scenarios

1. **Happy Path:**
   - Upload image → AI analysis runs → Image appears in gallery → Tap to see details → Delete works

2. **Without AI:**
   - (Can test by setting `run_ai_analysis=false` in code)
   - Image uploads but no AI insights

3. **Rate Limiting:**
   - Upload 5 images → 6th upload blocked
   - Check usage: Should show "5/5 images uploaded today"

4. **Large File:**
   - Try uploading a 15MB image
   - Should fail with "File too large (max 10MB)"

5. **Offline:**
   - Turn off wifi on device
   - Try uploading
   - Should show "No internet. Upload queued for later."
   - Turn wifi back on → Should auto-retry

---

## API Endpoints (Manual Testing with curl)

### Upload Image

```bash
# Get auth token first (from app)
TOKEN="your_jwt_token_here"

# Upload with AI analysis
curl -X POST http://localhost:8000/api/captures/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test.jpg" \
  -F "local_date=2025-12-21" \
  -F "bind_description=Workout at the gym" \
  -F "run_ai_analysis=true" \
  -F "goal_id=16111111-1111-1111-1111-111111111111"
```

### List Images

```bash
curl http://localhost:8000/api/captures/images \
  -H "Authorization: Bearer $TOKEN"
```

### Get Usage

```bash
curl http://localhost:8000/api/captures/usage \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Image

```bash
curl -X DELETE http://localhost:8000/api/captures/images/{image_id} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Expected Costs (with Google AI key)

**During Preview Period:**
- Gemini 3.0 Flash: **FREE**
- No charges during testing

**After Preview (future):**
- ~$0.02 per image with AI analysis
- 5 images/day × $0.02 = $0.10/day per user
- Free tier prevents abuse

---

## Quick Validation Checklist

Test these in order:

- [ ] Backend starts with Gemini initialized
- [ ] Mobile app builds and runs
- [ ] Can open capture sheet
- [ ] Can take photo with camera
- [ ] Can select from gallery
- [ ] Upload shows progress bar
- [ ] "Upload complete!" toast appears
- [ ] Image appears in gallery grid
- [ ] Gallery shows AI verified badge
- [ ] Tap image opens detail view
- [ ] Detail view shows AI insights (score, OCR, categories, quality)
- [ ] Can scroll through AI insight sections
- [ ] Delete button works with confirmation
- [ ] Image removed from gallery after delete
- [ ] 6th upload shows rate limit error
- [ ] Usage shows "5/5 images uploaded today"

---

## Demo Script (for showing off)

1. **Show the test UI:**
   "This is our new AI-powered image service. Let me show you how it works."

2. **Capture an image:**
   "I'll take a photo of this workout equipment..."

3. **Watch the magic:**
   "See the upload progress? Now it's analyzing with Google's Gemini AI..."

4. **Show the result:**
   "✅ AI Verified! It detected this is gym-related content."

5. **Open detail view:**
   "Here's the full analysis - it extracted text, classified the content, and rated the quality."

6. **Show rate limiting:**
   "We have smart rate limiting - users get 5 images per day for free."

7. **Cost control:**
   "This costs us about 2 cents per image, but it's FREE during Gemini's preview period!"

---

## Notes

- **Test user in seed data:** User ID `11111111-1111-1111-1111-111111111111` (Alex)
- **Test goal in seed data:** Goal ID `16111111-1111-1111-1111-111111111111` (Get promoted to Senior Engineer)
- **Storage bucket:** `captures` (private, RLS enforced)
- **Signed URLs:** 1-hour expiration, auto-generated on retrieval

---

## Support

If you get stuck:
1. Check backend logs (Terminal 1)
2. Check Metro logs (Terminal 2)
3. Check Supabase is running: `npx supabase status`
4. Clear caches: `cd weave-mobile && npm start -- --clear`
5. Check migrations applied: `npx supabase db push`
