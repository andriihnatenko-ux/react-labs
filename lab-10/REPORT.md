# ЛР-10. Структури папок і Feature-Sliced Design

Тема листа: `[React] ЛР-10: структура папок і Feature-Sliced Design`

GitHub repository: https://github.com/andriihnatenko-ux/react-labs/tree/main/lab-10

Vercel: https://react-labs-hoku.vercel.app/ (Root Directory — `lab-10`)

## 1. Що зроблено

Кавова крамниця з трьох сторінок пройшла чотири структури папок: стартову за
типом файлів, за маршрутами, за функціональністю і Feature-Sliced Design.
Код компонентів не змінювався — переїжджали ті самі файли, змінювалися лише
рядки `import` (і, у FSD, з'явилися `index.js` як публічні API слайсів).
Після кожного кроку проходили 12 тестів з 12. Додатково (§4.9) кошик винесено
в локальний пакет `@coffee/cart`.

## 2. Перевірки

`npx vitest run` — 12 тестів з 12 після кожного кроку і після пакета:

```
 Test Files  3 passed (3)
      Tests  12 passed (12)
```

`npm run check:deps` — без порушень (51 модуль, 84 залежності після §4.9):

```
✔ no dependency violations found (51 modules, 84 dependencies cruised)
```

`npm run check:fsd` — Steiger без проблем:

```
✔ No problems found!
```

`npm run lint`, `npm run format:check` і `npm run build` — без помилок і
попереджень:

```
> lab-10@0.0.0 lint
> eslint .

> lab-10@0.0.0 format:check
> prettier . --check

Checking formatting...
All matched files use Prettier code style!

vite v8.3.8 building client environment for production...
✓ 62 modules transformed.
dist/assets/index-CV9kOl0P.js   236.75 kB │ gzip: 74.22 kB
✓ built in 125ms
```

Файли `tests/` і `.dependency-cruiser.cjs` не змінювалися: `git log --oneline --
lab-10/tests` показує лише `76cf644 chore: add lab 10 starter`.

На задеплоєній версії перевірено те саме, що в тестах: каталог із восьми
сортів, «Додати в кошик» збільшує лічильник у шапці, а сторінка кошика показує
рядок, кількість і суму.

## 3. Таблиці з STRUCTURES.md

### Де живе кошик

| Структура                  | Тек | Теки                                                                                                                                          |
| -------------------------- | --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| За типом файлів (§4.3)     | 4   | `src/store`, `src/hooks`, `src/components`, `src/pages`                                                                                       |
| За маршрутами (§4.4)       | 6   | `src/shared/store`, `src/shared/hooks`, `src/shared/components`, `src/routes/cart/components`, `src/routes/cart`, `src/app/components`        |
| За функціональністю (§4.5) | 6   | `src/shared/stores`, `src/shared/hooks`, `src/shared/components`, `src/features/cart/components`, `src/app/routes/cart`, `src/app/components` |
| FSD (§4.6)                 | 5   | `src/entities/cart/model`, `src/entities/cart/ui`, `src/features/add-to-cart/ui`, `src/pages/cart/ui`, `src/widgets/app-header/ui`            |
| Пакет (§4.9)               | 5   | `packages/cart/state`, `packages/cart/ui`, `src/features/add-to-cart/ui`, `src/pages/cart/ui`, `src/widgets/app-header/ui`                    |

### Вибір структури

| Проєкт                             | Структура             | Чому                                                                                                                                                                                                                     |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Прототип на хакатоні            | За типом файлів       | 24 години, п'ять екранів і троє людей: структура не має коштувати часу, а тек за типом досить для п'яти екранів. Якщо прототип виживе, його варто перевести на маршрути або функціональності.                            |
| 2. Блог і документація на Next.js  | За маршрутами         | 40 сторінок зі своєю розміткою майже нічого не ділять, крім шапки й підвалу; тека маршруту тримає сторінку та її блоки поруч, а спільне лежить у shared.                                                                 |
| 3. Адмінка для бариста             | За маршрутами         | 15 екранів самостійні, спільні лише кнопки й таблиця, тож кожен екран зі своїми формами зручно тримати в теці маршруту. Якщо з'являться спільні бізнес-блоки (замовлення, склад), їх варто винести у функціональності.   |
| 4. Інтернет-магазин кави           | Feature-Sliced Design | Три команди роками змінюють спільні бізнес-частини (кошик, картка товару) на багатьох сторінках; шари й публічні API дають кожній команді свої слайси й захищають межі.                                                  |
| 5. Три застосунки мережі кав'ярень | Пакети                | Три застосунки в одному репозиторії ділять дизайн-систему й кошик; пакети з власним package.json і полем exports дають спільний код і закривають внутрішні файли, а кожен застосунок усередині може мати свою структуру. |

## 4. Що було важко в кожній структурі

### За типом файлів (§4.3)

Переміщати нічого не треба було, але вимірювання вже показує межу підходу:
`useCart` лежить у `src/hooks` поруч із `useCountdown`, хоч це різні частини
застосунку, а `BeanCard` і `AddToCartButton` потрібні двом сторінкам і лежать
серед решти 17 компонентів. Питання «що відкрити, щоб змінити відгуки»
відповіді не має: відгуки розкидані між `components/`, `data/` і `pages/`.

### За маршрутами (§4.4)

Найважче було вирішити, куди подіти шапку й `useRoute`: ними користується лише
`App`, тому вони переїхали в `src/app/components` і `src/app/hooks`. Спільне для
двох маршрутів — `Button`, `Link`, `BeanCard`, `AddToCartButton`, а також
сховище кошика й `useCart` — пішло в `src/shared`. `CartLine` потрібен лише
сторінці кошика, тому лежить у `src/routes/cart/components`, поруч із
`CartPage`. Код не змінювався: оновилися тільки імпорти, `imports["#app"]` у
`package.json` і `<script>` в `index.html`.

### За функціональністю (§4.5)

Межа функціональності виявилася неочевидною. Я виділив `catalog` (картка сорту
й дані сортів), `bean` (сторінка сорту, помел, вкладки, таймер) і `cart`
(сховище й рядок кошика). `AddToCartButton` і `FavoriteButton` потрібні і
каталогу, і сторінці сорту, тому вони лишилися в `src/shared/components` —
інакше `features/bean` імпортував би `features/cart`, а це заборонено
(`features-are-independent`). `RelatedProducts` довелося перенести з
функціональності `bean` в `src/app/routes/bean`: він тягнув `BeanCard` з
`features/catalog`, тобто знову імпорт між функціональностями. Виправити це
переміщенням було можна й правильніше, ніж змінювати код: файл, який склеює дві
функціональності, — це вже рівень сторінки (app), а не функціональність.
Компоненти не змінювалися, тільки імпорти; `index.js` у цій структурі немає.

### FSD (§4.6)

Найскладніше — вирішити, що є сутністю, а що функціональністю. Кошик як стан і
`CartLine` стали сутністю `entities/cart`, а дія користувача «додати в кошик» —
функціональністю `features/add-to-cart`. Лічильник у шапці — це віджет
`widgets/app-header`, бо ним користується `app` на всіх сторінках. Steiger
двічі показав `fsd/insignificant-slice` на `entities/review` і
`features/brew-timer`: кожен слайс мав лише одне посилання з `pages/bean`, тому
їх об'єднано зі сторінкою сорту (`pages/bean/model` і `pages/bean/ui`). `Tabs`,
`ShowMore`, `useShowMore` і `formatTime` переїхали в `shared/ui` і `shared/lib`.
Кожен слайс отримав `index.js`, імпорти — відносні, як вимагає завдання.

### Пакет (§4.9)

У пакет переїхало ядро кошика: `state/cartStore.js` і `state/useCart.js`,
`ui/CartLine.jsx`, а доступ до `localStorage` винесено в шар `data/
cartStorage.js`. Пакет імпортує лише React і не знає про застосунок.
`AddToCartButton` лишився в `src/features/add-to-cart/ui`, бо йому потрібні
`Button` і `withAnalytics` застосунку; `CartPage` і `AppHeader` — теж у `src/` і
беруть кошик з пакета. Публічний API `packages/cart/index.js` експортує рівно
два імені — `useCart` і `CartLine`. У `lab-10/package.json` додано
`"@coffee/cart": "file:./packages/cart"`; кореневого `package.json` у
репозиторії немає, тому його не змінено.

Експеримент з глибоким імпортом (без коміту): імпорт
`@coffee/cart/ui/CartLine.jsx` валить збірку —

```
"./ui/CartLine.jsx" is not exported under the conditions
["module", "browser", "production", "import"] from package @coffee/cart
```

Той самий файл, імпортований відносним шляхом
`../../packages/cart/ui/CartLine.jsx`, збирається, але `check:deps` ловить
порушення:

```
error no-deep-imports-into-packages: src/app/App.jsx → packages/cart/ui/CartLine.jsx
```

Тобто межу пакета охороняє поле `exports`, а лінтер лише дублює її для
відносних шляхів. Після експерименту все повернуто як було.

## 5. Історія комітів

```
chore: add lab 10 starter
docs: measure the by-type structure
refactor: group files by route
refactor: group files by feature
refactor: move to feature-sliced design
docs: choose a structure for each project
refactor: move the cart into a local package
```

## 6. Використання AI

Використовував AI-агента OpenCode (модель DeepSeek V4.1 Flash Free) 18 листопада
2026 року. AI допомагав проходити всі чотири структури: переміщував файли й
оновлював імпорти, писав `index.js` публічних API слайсів і код пакета
`@coffee/cart`. Також з AI розбирав помилки: чому Steiger показує
`fsd/insignificant-slice` на `entities/review` і `features/brew-timer`, що
означає `fsd/segments-by-purpose`, чому `@coffee/cart/ui/CartLine.jsx` не
проходить збірку, а відносний шлях до того самого файлу ловить
`no-deep-imports-into-packages`. AI запускав `npx vitest run`, `npm run lint`,
`npm run check:deps`, `npm run check:fsd`, `npm run format:check` і
`npm run build`, перевіряв сторінку в браузері (додавання сорту в кошик,
лічильник у шапці, сторінка кошика), робив коміти й підготував чернетку цього
звіту.

## 7. Висновок

Найкорисніше в роботі — вимірювання «де живе кошик»: воно показує, що
структура не зменшує кількість тек (у FSD і пакеті кошик навіть у більшій
кількості тек, ніж у стартовій), а робить межі явними й захищеними правилами.
Найскладніше було визначити межу функціональності та слайса: `AddToCartButton`
довелося лишити спільним, `RelatedProducts` — підняти на рівень сторінки, а
`entities/review` і `features/brew-timer` — злити зі сторінкою сорту після
повідомлення Steiger. Після пакета стало видно різницю між домовленістю
(`index.js`) і механізмом платформи (`exports`): першу можна обійти відносним
шляхом, другу — ні.
