# Лабораторна робота №2: Компоненти та пропси

## 1. Дерево рендерингу (Rendering Tree)

```text
App
├── Header
└── main
    ├── Card (title="Тімлід")
    │   ├── Avatar (size={120})
    │   └── p ("Олена Коваль")
    └── Card (title="Команда")
        ├── Profile (key=1)
        │   ├── Avatar
        │   ├── h3 ("Олена Коваль")
        │   └── p ("Тімлідка, frontend")
        ├── Profile (key=2)
        │   ├── Avatar
        │   ├── h3 ("Андрій Мельник")
        │   └── p ("Backend")
        ├── Profile (key=3)
        │   ├── Avatar
        │   ├── h3 ("Ірина Бондар")
        │   └── p ("UI/UX-дизайн")
        └── Profile (key=4)
            ├── Avatar
            ├── h3 ("Максим Ткаченко")
            └── p ("Тестування (QA)")