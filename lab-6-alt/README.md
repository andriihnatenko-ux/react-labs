# ЛР-6-alt. Та сама форма бронювання з Formik і Yup

Домашнє завдання до ЛР-6 (§4.8): копія `lab-6/`, у якій React Hook Form
замінено на **Formik**, а Zod для схеми бронювання — на **Yup**. Сторінка
поводиться так само, як `lab-6` після §4.6: ті самі правила й повідомлення
українською, `aria-invalid` і `aria-describedby`, курсор у першому
неправильному полі, «Надсилаємо…» під час очікування, відповідь сервера,
очищення після успіху й кнопка «Очистити».

Інструкція до роботи:
https://denysmatsevych.github.io/web-development-2026/react/labs/lab-6/

## Чим відрізняється від lab-6

- `src/components/BookingForm.jsx` — `useFormik` замість `useForm`;
- `src/bookingSchema.js` — схема Yup замість схеми Zod;
- `src/api.js` — імітований сервер перевіряє дані тією самою схемою Yup
  (`bookingSchema.validate`);
- `src/components/SubscribeForm.jsx` — без змін: їй бібліотека форм не
  потрібна, а email перевіряє `z.email()` із Zod, тому `zod` лишився в
  залежностях;
- `react-hook-form` і `@hookform/resolvers` з `package.json` видалені.

## Команди

`npm install` виконуйте в теці `lab-6-alt/` (у цьому репозиторії немає
кореневого `package.json` з робочими просторами), решту — так само:

- `npm run dev`: dev-сервер (за замовчуванням http://localhost:5173)
- `npm run lint`: ESLint
- `npm run format:check`: перевірка форматування Prettier
- `npm run build`: production-збірка в `dist/`

## Порівняння з React Hook Form і Zod

### Бібліотеки та версії

| Версія | Форми | Схема | Дата останнього релізу |
| --- | --- | --- | --- |
| `lab-6` | `react-hook-form` 7.92.0, `@hookform/resolvers` 7.0.6 | `zod` 4.6.7 | RHF — 11.11.2026, resolvers — 11.11.2026, Zod — 12.10.2026 |
| `lab-6-alt` | `formik` 2.4.9 | `yup` 1.7.1 (і `zod` 4.6.7 для форми підписки) | Formik — 10.11.2025, Yup — 21.09.2025, Zod — 12.10.2026 |

### Що чим замінено

| React Hook Form + Zod | Formik + Yup |
| --- | --- |
| `register('name')` — неконтрольоване поле, значення читає бібліотека через реф | `formik.getFieldProps('name')` — контрольоване поле: `value`, `onChange`, `onBlur` |
| `<Controller name="guests" control={control} render={({ field }) => …} />` | без окремого компонента: `value={formik.values.guests}` і `onChange={(value) => formik.setFieldValue('guests', value)}` |
| `useWatch({ control, name: 'comment' })` — підписка на одне поле | `formik.values.comment` — Formik рендерить форму на кожну зміну будь-якого поля |
| `handleSubmit(onValid)` — перевіряє й викликає `onValid` з даними схеми | власний `handleSubmit`: `await formik.validateForm()`, `formik.setTouched(…усі поля…)`, фокус на першій помилці, далі `formik.handleSubmit()` |
| `zodResolver(bookingSchema)` | `validationSchema: bookingSchema` (Formik сам викликає `schema.validate`) |
| `reset()` + `setFocus('name')` | `formik.resetForm()` + реф на поле «Ім'я» (`nameRef.current.focus()`): Formik не має `setFocus` |
| `trigger('time')` в `onChange` дати | не потрібно: `validateOnChange` перевіряє всю форму, тож зміна дати сама оновлює помилку часу |
| `mode: 'onTouched'` | `validateOnChange` + `validateOnBlur` і показ помилки лише для «торкнутого» поля (`formik.touched[name] && formik.errors[name]`) |
| помилки з `formState.errors`, перше повідомлення з `issues` | помилки з `formik.errors` (рядок на поле; Yup віддає перше повідомлення) |
| `z.coerce.number()` для гостей | `yup.number().typeError(…)` — Yup приводить тип сам |
| `.refine()` на об'єкті з `path: ['time']` | `.test('not-past-today', …)` на полі `time`, сусіднє поле з `this.parent.date` |

### Розмір збірки

`npm run build`, один і той самий застосунок (обидві версії містять Zod для
форми підписки):

| Версія | JS-файл | gzip |
| --- | --- | --- |
| `lab-6` | 353.69 kB | 109.37 kB |
| `lab-6-alt` | 359.17 kB | 111.51 kB |

Різниця — близько 5 kB (2 kB у gzip): Formik і Yup майже не поступаються
React Hook Form і Zod за розміром.

### Що рендериться під час введення в полі «Ім'я»

Виміряно в dev-режимі (React 19, StrictMode подвоює кожен рендер, тому
наведено кількість рендерів без подвоєння):

| Версія | `BookingForm` | `GuestsStepper` |
| --- | --- | --- |
| `lab-6` | 0 рендерів на кожен символ (один рендер лише на першому символі, коли `isDirty` стає `true`), поле неконтрольоване | 0 |
| `lab-6-alt` | 2 рендери на кожен символ (оновлення `values` і повторна перевірка схеми), поле контрольоване | 2 (перерендеровується разом із батьком) |

### Висновок

Для наступного проєкту я взяв би пару **React Hook Form + Zod**: вона дає
менше рендерів під час введення, бо поля неконтрольовані, і водночас менший
розмір збірки. Formik зручніший для новачка: у нього немає окремих
`register`, `Controller` і `useWatch`, усе лежить в одному об'єкті `formik`, і
саме тому код виходить коротшим і простішим для читання. Yup і Zod за
можливостями майже рівні, але в Zod зручніше описувати правило для двох полів
(`.refine` з `path`) і власні повідомлення. Головний мінус Formik —
останній реліз у листопаді 2025 року й контрольовані поля, тобто повний
перерендер форми на кожен символ; для маленької форми це непомітно, для
великої — уже ні.
