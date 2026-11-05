# روشن

یک تخته کانبان فارسی با پنج ستون ثابت. Next.js، React و TypeScript؛ جابه‌جایی با dnd-kit و فرم دسترس‌پذیر با Radix Dialog.

```sh
npm ci
npm run dev
```

آدرس: http://localhost:3000

```sh
npm test
npm run typecheck
npm run build
npm start
```

برای جابه‌جایی با صفحه‌کلید، دستگیره کارت را انتخاب کنید، Space بزنید، با جهت‌های چپ و راست ستون را تغییر دهید و دوباره Space بزنید. Escape جابه‌جایی را لغو می‌کند. روی موبایل دستگیره را بکشید.

داده‌ها در حافظه‌اند و با بارگذاری مجدد بازنشانی می‌شوند. حساب کاربری و ذخیره‌سازی دائمی وجود ندارد.

آزمون مرورگر (پس از روشن کردن سرور):

```sh
npx playwright install chromium
npm run test:e2e
```
