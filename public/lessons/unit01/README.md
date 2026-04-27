# Unit 1 — Daily Routine images

The lesson tries to fetch real photos from **Pollinations.ai** (free, no API key needed). Generation can take 5–20s on the first hit per URL — they cache after that.

If Pollinations is slow or blocked on your network, **drop your own JPG/PNG/WebP files into this folder** using these filenames, then point each vocab item's `image:` field in [`src/data/private-lessons/unit01.ts`](../../../src/data/private-lessons/unit01.ts) at the local path:

```ts
{ en: 'I wake up at 7 a.m.', image: '/lessons/unit01/wake-up.jpg', … }
```

Suggested filenames (one per vocab item, square works best, 800×800 or larger):

```
wake-up.jpg
wash-face.jpg
brush-teeth.jpg
shower.jpg
get-dressed.jpg
breakfast.jpg
school.jpg
work.jpg
lunch.jpg
cook-dinner.jpg
dinner.jpg
wash-dishes.jpg
homework.jpg
friends.jpg
tv.jpg
go-to-bed.jpg
```

## Generating consistent characters

Use the same character/style across all 16 photos so the lesson feels like one set, not random stock. Suggested ChatGPT / Midjourney prompt:

> Photograph of a young person doing **[action]**, soft natural daylight,
> warm friendly mood, real-life scene at home or outdoors, square 1:1,
> consistent with previous images in the set.
